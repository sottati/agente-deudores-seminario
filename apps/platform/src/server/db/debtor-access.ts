import "@tanstack/react-start/server-only"
import { createClient } from "@supabase/supabase-js"
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

import { sha256Hex } from "./crypto"
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

// Negociación resuelta por token, con todo lo necesario para ejecutar un turno
// del agente sin volver a tocar la DB para datos de contexto.
export type ResolvedNegotiation = {
  id: string
  organizationId: string
  status: Database["public"]["Enums"]["negotiation_status"]
  verifiedAt: string | null
  expiresAt: string
  policySnapshot: PolicySnapshotRow
  debtId: string
  debt: {
    concept: string
    dueDate: string
    principalCents: number
    interestCents: number
  }
  debtor: {
    alias: string
    groupLabel: string | null
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
      `id, organization_id, status, verified_at, expires_at, policy_snapshot, debt_id,
       debts!inner(concept, due_date, principal_cents, interest_cents,
         debtors!inner(alias, group_label)),
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
    expiresAt: data.expires_at,
    policySnapshot: data.policy_snapshot as unknown as PolicySnapshotRow,
    debtId: data.debt_id,
    debt: {
      concept: debt.concept,
      dueDate: debt.due_date,
      principalCents: debt.principal_cents,
      interestCents: debt.interest_cents,
    },
    debtor: {
      alias: debtor.alias,
      groupLabel: debtor.group_label,
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
): Promise<Pick<Tables<"messages">, "role" | "parts" | "created_at">[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("messages")
    .select("role, parts, created_at")
    .eq("negotiation_id", negotiationId)
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

type StoredRole = Database["public"]["Enums"]["message_role"]

/** Persiste un mensaje dentro del alcance de la negociación resuelta. */
export async function appendMessage(
  negotiation: Pick<ResolvedNegotiation, "id" | "organizationId">,
  role: StoredRole,
  parts: JsonObject
): Promise<void> {
  const supabase = createServiceClient()
  const { error } = await supabase.from("messages").insert({
    organization_id: negotiation.organizationId,
    negotiation_id: negotiation.id,
    role,
    parts,
  })
  if (error) throw new Error(error.message)
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
  const scope = { id: negotiation.id, organizationId: negotiation.organizationId }

  return {
    async saveOffer(offer: EvaluatedOffer): Promise<SavedOfferRecord> {
      // La nueva oferta reemplaza (supersede) cualquier oferta propuesta previa.
      const { error: supersedeError } = await supabase
        .from("offers")
        .update({ status: "superseded" })
        .eq("negotiation_id", scope.id)
        .eq("status", "proposed")
      if (supersedeError) throw new Error(supersedeError.message)

      const { data, error } = await supabase
        .from("offers")
        .insert({
          organization_id: scope.organizationId,
          negotiation_id: scope.id,
          installments: offer.installments,
          down_payment_cents: offer.downPaymentCents,
          waived_interest_cents: offer.waivedInterestCents,
          total_cents: offer.totalCents,
          schedule: offer.schedule as unknown as JsonObject,
          status: "proposed",
          valid_until: offer.validUntil,
          engine_version: offer.engineVersion,
        })
        .select("id")
        .single()
      if (error) throw new Error(error.message)

      // El estado pasa a "oferta enviada" salvo que ya esté escalada/cerrada.
      await supabase
        .from("negotiations")
        .update({ status: "offer_pending" })
        .eq("id", scope.id)
        .in("status", ["active", "offer_pending"])

      return { id: data.id }
    },

    async escalate(reason: string): Promise<void> {
      const { error } = await supabase
        .from("negotiations")
        .update({ status: "escalated" })
        .eq("id", scope.id)
        .in("status", ["active", "offer_pending", "verifying"])
      if (error) throw new Error(error.message)
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
