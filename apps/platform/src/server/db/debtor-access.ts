import "@tanstack/react-start/server-only"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"
import type { SupabaseClient } from "@supabase/supabase-js"

import type {
  AgentAuditEventType,
  AgentNegotiationContext,
  AgentPersistence,
  SavedOfferRecord,
} from "@agente/agent"
import type {
  EvaluatedOffer,
  NegotiationPolicy,
  PolicySnapshotRow,
} from "@agente/negotiation-engine"

import { debtorVerificationHash, sha256Hex } from "./crypto"
import { AGENT_ANSWERABLE_STATUSES } from "@/lib/debtor-chat"
import type { Database, Json, Tables } from "./types.gen"

type JsonObject = NonNullable<Json>

// ---------------------------------------------------------------------------
// ÚNICO módulo que usa la service role key (PLAN_BACKEND §3.3-7).
//
// La service role saltea RLS, por eso todo el acceso queda acotado a UNA
// negociación: se resuelve el `negotiation_id` a partir del token (por hash)
// y nunca de un parámetro arbitrario del cliente. Las funciones de este módulo
// solo tocan filas de esa negociación (y de su organización).
// ---------------------------------------------------------------------------

type ServiceClient = SupabaseClient<Database>

function getServiceEnv() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. Revisá apps/platform/.env.local (ver .env.example)."
    )
  }
  return { url, serviceRoleKey }
}

function createServiceClient(): ServiceClient {
  const { url, serviceRoleKey } = getServiceEnv()
  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export const MAX_VERIFICATION_ATTEMPTS = 5

// Negociación resuelta por token, con todo lo necesario para ejecutar un turno
// del agente sin volver a tocar la DB para datos de contexto.
export type ResolvedNegotiation = {
  id: string
  organizationId: string
  status: Database["public"]["Enums"]["negotiation_status"]
  verifiedAt: string | null
  verificationAttempts: number
  expiresAt: string
  updatedAt: string
  turnId?: string
  policySnapshot: PolicySnapshotRow
  debtId: string
  debt: {
    concept: string
    dueDate: string
    principalCents: number
    interestCents: number
  }
  debtor: {
    id: string
    alias: string
    groupLabel: string | null
    verificationHash: string | null
  }
  organization: {
    displayNameForDebtors: string
    kind: Database["public"]["Enums"]["organization_kind"]
  }
}

// snake_case (DB) → camelCase (motor/agente).
function snapshotToPolicy(snapshot: PolicySnapshotRow): NegotiationPolicy {
  return {
    maxInstallments: snapshot.max_installments,
    minDownPaymentPct: snapshot.min_down_payment_pct,
    minInstallmentAmountCents: snapshot.min_installment_amount_cents,
    maxInterestWaiverPct: snapshot.max_interest_waiver_pct,
    singlePaymentInterestWaiverPct: snapshot.single_payment_interest_waiver_pct,
    maxPrincipalDiscountPct: snapshot.max_principal_discount_pct,
    maxFirstDueDays: snapshot.max_first_due_days,
    offerValidityHours: snapshot.offer_validity_hours,
    escalateAboveAmountCents: snapshot.escalate_above_amount_cents,
    tone: snapshot.tone,
    customInstructions: snapshot.custom_instructions ?? null,
  }
}

/**
 * Resuelve una negociación a partir del token en claro (se compara por hash).
 * Devuelve `null` si el token no corresponde a ninguna negociación.
 */
export async function resolveNegotiationByToken(
  token: string
): Promise<ResolvedNegotiation | null> {
  const supabase = createServiceClient()
  const tokenHash = sha256Hex(token)

  const { data, error } = await supabase
    .from("negotiations")
    .select(
      `id, organization_id, status, verified_at, verification_attempts, expires_at, updated_at, policy_snapshot, debt_id,
       debts!inner(concept, due_date, principal_cents, interest_cents,
         debtors!inner(id, alias, group_label, verification_hash)),
       organizations!inner(display_name_for_debtors, kind)`
    )
    .eq("token_hash", tokenHash)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  const debt = data.debts
  const debtor = debt.debtors
  const organization = data.organizations

  return {
    id: data.id,
    organizationId: data.organization_id,
    status: data.status,
    verifiedAt: data.verified_at,
    verificationAttempts: data.verification_attempts,
    expiresAt: data.expires_at,
    updatedAt: data.updated_at,
    policySnapshot: data.policy_snapshot as unknown as PolicySnapshotRow,
    debtId: data.debt_id,
    debt: {
      concept: debt.concept,
      dueDate: debt.due_date,
      principalCents: debt.principal_cents,
      interestCents: debt.interest_cents,
    },
    debtor: {
      id: debtor.id,
      alias: debtor.alias,
      groupLabel: debtor.group_label,
      verificationHash: debtor.verification_hash,
    },
    organization: {
      displayNameForDebtors: organization.display_name_for_debtors,
      kind: organization.kind,
    },
  }
}

/** Construye el contexto que espera `runNegotiationTurn` del paquete agente. */
export function toAgentContext(
  negotiation: ResolvedNegotiation
): AgentNegotiationContext {
  return {
    id: negotiation.id,
    organization: {
      displayNameForDebtors: negotiation.organization.displayNameForDebtors,
      kind: negotiation.organization.kind,
    },
    debtor: {
      alias: negotiation.debtor.alias,
      groupLabel: negotiation.debtor.groupLabel,
    },
    debt: {
      concept: negotiation.debt.concept,
      dueDate: negotiation.debt.dueDate,
      principalCents: negotiation.debt.principalCents,
      interestCents: negotiation.debt.interestCents,
    },
    policy: snapshotToPolicy(negotiation.policySnapshot),
  }
}

/**
 * Historial de la conversación reconstruido desde la DB (NUNCA desde el
 * cliente, PLAN_BACKEND §3.3-2). Devuelve los mensajes en orden cronológico.
 */
export async function getConversationHistory(
  negotiationId: string
): Promise<Pick<Tables<"messages">, "id" | "role" | "parts" | "created_at">[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("messages")
    .select("id, role, parts, created_at")
    .eq("negotiation_id", negotiationId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export type NegotiationAccessState = {
  status: ResolvedNegotiation["status"]
  expiresAt: string
  updatedAt: string
}

export async function getNegotiationAccessState(
  negotiation: ResolvedNegotiation
): Promise<NegotiationAccessState> {
  const { data, error } = await createServiceClient()
    .from("negotiations")
    .select("status, expires_at, updated_at")
    .eq("id", negotiation.id)
    .eq("organization_id", negotiation.organizationId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
    ? {
        status: data.status,
        expiresAt: data.expires_at,
        updatedAt: data.updated_at,
      }
    : { status: "expired", expiresAt: negotiation.expiresAt, updatedAt: "" }
}

const persistedResponseSchema = z.object({
  status: z.enum([
    "pending",
    "verifying",
    "active",
    "offer_pending",
    "escalated",
    "agreed",
    "expired",
    "locked",
  ]),
  persisted: z.boolean(),
})

export async function claimNegotiationTurn(
  negotiation: ResolvedNegotiation,
  messageId: string,
  parts: JsonObject,
  humanRequested: boolean
) {
  const turnId = crypto.randomUUID()
  const { data, error } = await createServiceClient().rpc(
    "claim_negotiation_turn",
    {
      p_organization_id: negotiation.organizationId,
      p_negotiation_id: negotiation.id,
      p_expected_updated_at: negotiation.updatedAt,
      p_turn_id: turnId,
      p_message_id: messageId,
      p_parts: parts,
      p_human_requested: humanRequested,
    }
  )
  if (error) throw new Error(error.message)
  if (!data) return false
  const claimed = z
    .object({
      status: persistedResponseSchema.shape.status,
      updated_at: z.string(),
    })
    .parse(data)
  negotiation.status = claimed.status
  negotiation.updatedAt = claimed.updated_at
  negotiation.turnId = turnId
  return true
}

export async function releaseNegotiationTurn(negotiation: ResolvedNegotiation) {
  if (!negotiation.turnId) return
  const { error } = await createServiceClient().rpc(
    "release_negotiation_turn",
    {
      p_organization_id: negotiation.organizationId,
      p_negotiation_id: negotiation.id,
      p_turn_id: negotiation.turnId,
    }
  )
  // El lease libera un turno si el proceso o la conexión a DB se interrumpen.
  if (error)
    console.error("No se pudo liberar el turno de negociación", error.code)
}

export async function persistAgentResponse(
  negotiation: ResolvedNegotiation,
  id: string,
  parts: JsonObject
) {
  const { data, error } = await createServiceClient().rpc(
    "persist_negotiation_response",
    {
      p_organization_id: negotiation.organizationId,
      p_negotiation_id: negotiation.id,
      p_expected_updated_at: negotiation.updatedAt,
      p_allow_escalated: negotiation.status === "escalated",
      p_turn_id: negotiation.turnId!,
      p_message_id: id,
      p_parts: parts,
    }
  )
  if (error) throw new Error(error.message)
  return persistedResponseSchema.parse(data)
}

/**
 * Crea las funciones de persistencia que el agente usa para `propose_offer`,
 * `escalate_to_human` y los eventos de auditoría. Todo queda acotado a la
 * negociación resuelta por token.
 */
export function createNegotiationPersistence(
  negotiation: ResolvedNegotiation
): AgentPersistence {
  const supabase = createServiceClient()
  const scope = {
    id: negotiation.id,
    organizationId: negotiation.organizationId,
  }

  return {
    async saveOffer(offer: EvaluatedOffer): Promise<SavedOfferRecord> {
      const { data, error } = await supabase.rpc("save_negotiation_offer", {
        p_organization_id: scope.organizationId,
        p_negotiation_id: scope.id,
        p_expected_updated_at: negotiation.updatedAt,
        p_offer: offer as unknown as JsonObject,
      })
      if (error) throw new Error(error.message)
      const saved = z
        .object({ id: z.uuid(), updated_at: z.string() })
        .parse(data)
      negotiation.status = "offer_pending"
      negotiation.updatedAt = saved.updated_at
      return { id: saved.id }
    },

    async escalate(reason: string): Promise<void> {
      const { data: updated, error } = await supabase
        .from("negotiations")
        .update({ status: "escalated" })
        .eq("id", scope.id)
        .eq("organization_id", scope.organizationId)
        .eq("updated_at", negotiation.updatedAt)
        .in("status", AGENT_ANSWERABLE_STATUSES)
        .gt("expires_at", new Date().toISOString())
        .select("status, updated_at")
        .maybeSingle()
      if (error) throw new Error(error.message)
      if (!updated)
        throw new Error("La negociación ya no permite derivaciones.")
      negotiation.status = updated.status
      negotiation.updatedAt = updated.updated_at
      void reason
    },

    async logEvent(
      type: AgentAuditEventType,
      payload: Record<string, unknown>
    ): Promise<void> {
      const { error } = await supabase.from("audit_events").insert({
        organization_id: scope.organizationId,
        negotiation_id: scope.id,
        type,
        payload: payload as JsonObject,
      })
      if (error) throw new Error(error.message)
    },
  }
}

export type VerifyDebtorIdentityResult =
  | { ok: true }
  | {
      ok: false
      locked: boolean
      remainingAttempts: number
      message: string
    }

/**
 * Si la negociación está en `pending` (link recién creado), pasa a `verifying`
 * cuando el deudor abre el enlace por primera vez (PLAN_BACKEND §3.4).
 */
export async function markNegotiationVerifying(
  negotiation: Pick<ResolvedNegotiation, "id" | "organizationId" | "status">
): Promise<Database["public"]["Enums"]["negotiation_status"]> {
  if (negotiation.status !== "pending") return negotiation.status
  const supabase = createServiceClient()
  const { error } = await supabase
    .from("negotiations")
    .update({ status: "verifying" })
    .eq("id", negotiation.id)
    .eq("organization_id", negotiation.organizationId)
    .eq("status", "pending")
  if (error) throw new Error(error.message)
  return "verifying"
}

/**
 * Verifica los últimos 3 dígitos del DNI contra `debtors.verification_hash`.
 * - Si el deudor no tiene `verification_hash` configurado, permite el acceso.
 * - Si coincide: actualiza `verified_at` (si era null) y pasa `pending`/`verifying` a `active`.
 * - Si no coincide: incrementa `verification_attempts`; al llegar a
 *   `MAX_VERIFICATION_ATTEMPTS` bloquea la negociación (`status = 'locked'`),
 *   libera la deuda (`status = 'open'`) y registra el evento en `audit_events`.
 */
export async function verifyDebtorIdentity(
  negotiation: ResolvedNegotiation,
  dniLast3: string
): Promise<VerifyDebtorIdentityResult> {
  if (negotiation.status === "locked") {
    return {
      ok: false,
      locked: true,
      remainingAttempts: 0,
      message:
        "El acceso a este enlace fue bloqueado por superar el límite de intentos de verificación.",
    }
  }

  const supabase = createServiceClient()
  const normalized = dniLast3.replace(/\D/g, "").slice(-3)

  const expectedHash = negotiation.debtor.verificationHash
  const isValid =
    expectedHash === null ||
    (normalized.length === 3 &&
      debtorVerificationHash(negotiation.debtor.id, normalized) ===
        expectedHash)

  if (isValid) {
    const nextStatus =
      negotiation.status === "pending" || negotiation.status === "verifying"
        ? "active"
        : negotiation.status

    const { error } = await supabase
      .from("negotiations")
      .update({
        status: nextStatus,
        verified_at: negotiation.verifiedAt ?? new Date().toISOString(),
      })
      .eq("id", negotiation.id)
      .eq("organization_id", negotiation.organizationId)
    if (error) throw new Error(error.message)

    return { ok: true }
  }

  const nextAttempts = negotiation.verificationAttempts + 1
  const shouldLock = nextAttempts >= MAX_VERIFICATION_ATTEMPTS
  const remainingAttempts = Math.max(
    0,
    MAX_VERIFICATION_ATTEMPTS - nextAttempts
  )

  const { error: updateError } = await supabase
    .from("negotiations")
    .update({
      verification_attempts: nextAttempts,
      status: shouldLock
        ? "locked"
        : negotiation.status === "pending"
          ? "verifying"
          : negotiation.status,
    })
    .eq("id", negotiation.id)
    .eq("organization_id", negotiation.organizationId)
  if (updateError) throw new Error(updateError.message)

  if (shouldLock) {
    await supabase
      .from("debts")
      .update({ status: "open" })
      .eq("id", negotiation.debtId)
      .eq("organization_id", negotiation.organizationId)
      .eq("status", "in_negotiation")

    await supabase.from("audit_events").insert({
      organization_id: negotiation.organizationId,
      negotiation_id: negotiation.id,
      type: "verification_locked",
      payload: { attempts: nextAttempts },
    })

    return {
      ok: false,
      locked: true,
      remainingAttempts: 0,
      message:
        "Superaste el máximo de intentos permitidos. Por seguridad bloqueamos este enlace.",
    }
  }

  return {
    ok: false,
    locked: false,
    remainingAttempts,
    message:
      remainingAttempts === 1
        ? "Los dígitos ingresados no coinciden. Te queda 1 intento."
        : `Los dígitos ingresados no coinciden. Te quedan ${remainingAttempts} intentos.`,
  }
}
