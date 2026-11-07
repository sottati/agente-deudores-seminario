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
  ScheduleItem,
} from "@agente/negotiation-engine"

import { debtorVerificationHash, sha256Hex } from "./crypto"
import { AGENT_ANSWERABLE_STATUSES } from "@/lib/debtor-chat"
import {
  AGREEMENT_TEMPLATE_VERSION,
  renderAgreementDocumentHtml,
} from "../agreement-document"
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
    fullName: string
    alias: string
    groupLabel: string | null
    verificationHash: string | null
  }
  organization: {
    name: string
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
         debtors!inner(id, full_name, alias, group_label, verification_hash)),
       organizations!inner(name, display_name_for_debtors, kind)`
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
      fullName: debtor.full_name,
      alias: debtor.alias,
      groupLabel: debtor.group_label,
      verificationHash: debtor.verification_hash,
    },
    organization: {
      name: organization.name,
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

export type PersistedDebtorOffer = {
  id: string
  installments: number
  downPaymentCents: number
  waivedInterestCents: number
  totalCents: number
  schedule: ScheduleItem[]
  status: Database["public"]["Enums"]["offer_status"]
  validUntil: string
  engineVersion: string
  createdAt: string
}

export type PersistedDebtorAgreement = {
  id: string
  offerId: string
  acceptedAt: string
  acceptanceIp: string | null
  userAgent: string | null
  transcriptSha256: string
  templateVersion: string
  documentHtml: string | null
  installments: number
  downPaymentCents: number
  waivedInterestCents: number
  totalCents: number
  schedule: ScheduleItem[]
  engineVersion: string
}

function parseOfferSchedule(raw: unknown): ScheduleItem[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (item): item is ScheduleItem =>
      !!item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      typeof (item as ScheduleItem).number === "number" &&
      typeof (item as ScheduleItem).due_date === "string" &&
      typeof (item as ScheduleItem).amount_cents === "number"
  )
}

/**
 * Obtiene la oferta propuesta vigente o la oferta aceptada de la negociación
 * desde la base de datos (nunca desde el texto del modelo, PLAN_BACKEND D7).
 */
export async function getNegotiationOffersForDebtor(
  negotiation: Pick<ResolvedNegotiation, "id" | "organizationId">
): Promise<{
  proposedOffer: PersistedDebtorOffer | null
  acceptedAgreement: PersistedDebtorAgreement | null
}> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("offers")
    .select(
      `id, installments, down_payment_cents, waived_interest_cents, total_cents,
       schedule, status, valid_until, engine_version, created_at,
       agreements(id, accepted_at, acceptance_ip, user_agent, transcript_sha256, template_version, document_html)`
    )
    .eq("negotiation_id", negotiation.id)
    .eq("organization_id", negotiation.organizationId)
    .in("status", ["proposed", "accepted"])
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)

  let proposedOffer: PersistedDebtorOffer | null = null
  let acceptedAgreement: PersistedDebtorAgreement | null = null

  for (const row of data) {
    const schedule = parseOfferSchedule(row.schedule)
    if (row.status === "proposed" && !proposedOffer) {
      proposedOffer = {
        id: row.id,
        installments: row.installments,
        downPaymentCents: row.down_payment_cents,
        waivedInterestCents: row.waived_interest_cents,
        totalCents: row.total_cents,
        schedule,
        status: row.status,
        validUntil: row.valid_until,
        engineVersion: row.engine_version,
        createdAt: row.created_at,
      }
    }
    if (row.status === "accepted" && !acceptedAgreement) {
      const agreement = row.agreements.at(0)
      if (agreement) {
        acceptedAgreement = {
          id: agreement.id,
          offerId: row.id,
          acceptedAt: agreement.accepted_at,
          acceptanceIp: agreement.acceptance_ip,
          userAgent: agreement.user_agent,
          transcriptSha256: agreement.transcript_sha256,
          templateVersion: agreement.template_version,
          documentHtml: agreement.document_html,
          installments: row.installments,
          downPaymentCents: row.down_payment_cents,
          waivedInterestCents: row.waived_interest_cents,
          totalCents: row.total_cents,
          schedule,
          engineVersion: row.engine_version,
        }
      }
    }
  }

  return { proposedOffer, acceptedAgreement }
}

/**
 * Calcula el SHA-256 determinístico del transcript de la negociación a partir
 * de los mensajes almacenados en DB ordenados cronológicamente (PLAN_BACKEND D11).
 */
export function computeTranscriptSha256(
  messages: ReadonlyArray<
    Pick<Tables<"messages">, "id" | "role" | "parts" | "created_at">
  >
): string {
  const canonical = JSON.stringify(
    messages.map((m) => ({
      id: m.id,
      role: m.role,
      created_at: m.created_at,
      parts: m.parts,
    }))
  )
  return sha256Hex(canonical)
}

/**
 * Revalida determinísticamente que una oferta persistida respete los límites
 * numéricos del `policy_snapshot` de la negociación (PLAN_BACKEND §3.3-6).
 */
export function isOfferWithinPolicySnapshot(
  negotiation: Pick<ResolvedNegotiation, "debt" | "policySnapshot">,
  offer: Pick<
    PersistedDebtorOffer,
    | "installments"
    | "downPaymentCents"
    | "waivedInterestCents"
    | "totalCents"
    | "schedule"
  >
): boolean {
  const policy = snapshotToPolicy(negotiation.policySnapshot)
  const principalCents = Math.max(
    0,
    Math.trunc(negotiation.debt.principalCents)
  )
  const interestCents = Math.max(0, Math.trunc(negotiation.debt.interestCents))

  if (principalCents <= 0 || interestCents < 0) return false
  if (
    policy.escalateAboveAmountCents !== null &&
    policy.escalateAboveAmountCents > 0 &&
    principalCents + interestCents >= policy.escalateAboveAmountCents
  ) {
    return false
  }

  const maxInstallments = Math.max(
    1,
    Math.min(24, Math.trunc(policy.maxInstallments))
  )
  if (
    !Number.isInteger(offer.installments) ||
    offer.installments < 1 ||
    offer.installments > maxInstallments
  ) {
    return false
  }

  const maxWaiverPct =
    offer.installments === 1
      ? policy.singlePaymentInterestWaiverPct
      : policy.maxInterestWaiverPct
  const maxWaivedInterestCents = Math.floor(
    (interestCents * Math.min(100, Math.max(0, Math.trunc(maxWaiverPct)))) / 100
  )
  if (
    offer.waivedInterestCents < 0 ||
    offer.waivedInterestCents > maxWaivedInterestCents
  ) {
    return false
  }

  const maxPrincipalDiscountCents = Math.floor(
    (principalCents *
      Math.min(100, Math.max(0, Math.trunc(policy.maxPrincipalDiscountPct)))) /
      100
  )
  const minAllowedTotalCents =
    principalCents -
    maxPrincipalDiscountCents +
    (interestCents - offer.waivedInterestCents)
  const maxAllowedTotalCents = principalCents + interestCents
  if (
    offer.totalCents <= 0 ||
    offer.totalCents < minAllowedTotalCents ||
    offer.totalCents > maxAllowedTotalCents
  ) {
    return false
  }

  if (offer.schedule.length !== offer.installments) return false
  const scheduleSum = offer.schedule.reduce(
    (sum, item) => sum + item.amount_cents,
    0
  )
  if (scheduleSum !== offer.totalCents) return false

  const minInstallmentCents = Math.max(
    0,
    Math.trunc(policy.minInstallmentAmountCents)
  )
  for (let i = 0; i < offer.schedule.length; i++) {
    const item = offer.schedule[i]
    if (item.number !== i + 1 || item.amount_cents <= 0) return false
    if (offer.installments > 1 && item.amount_cents < minInstallmentCents) {
      return false
    }
  }

  if (offer.installments === 1) {
    return offer.downPaymentCents === offer.totalCents
  }

  const minDownPctCents = Math.ceil(
    (offer.totalCents *
      Math.min(100, Math.max(0, Math.trunc(policy.minDownPaymentPct)))) /
      100
  )
  const minDownPayment = Math.max(1, minDownPctCents, minInstallmentCents)
  if (
    offer.downPaymentCents < minDownPayment ||
    offer.downPaymentCents !== offer.schedule[0]?.amount_cents
  ) {
    return false
  }

  return true
}

export type AcceptNegotiationOfferResult =
  | {
      ok: true
      agreementId: string
      acceptedAt: string
      transcriptSha256: string
      documentHtml: string
    }
  | {
      ok: false
      status: number
      error: string
    }

/**
 * Acepta una oferta propuesta por el agente en una negociación verificada:
 * 1. Obtiene la oferta de la DB, verifica estado (`proposed`), vigencia (`valid_until`)
 *    y la revalida contra `policy_snapshot` (§3.3-6).
 * 2. Calcula `transcript_sha256` sobre el historial de `messages`.
 * 3. Genera el acta HTML imprimible desde la plantilla versionada (D11).
 * 4. Ejecuta el RPC transaccional `accept_offer`.
 */
export async function acceptNegotiationOffer({
  negotiation,
  offerId,
  acceptanceIp,
  userAgent,
}: {
  negotiation: ResolvedNegotiation
  offerId?: string
  acceptanceIp: string | null
  userAgent: string | null
}): Promise<AcceptNegotiationOfferResult> {
  if (
    negotiation.status !== "offer_pending" &&
    negotiation.status !== "active"
  ) {
    return {
      ok: false,
      status: 409,
      error:
        negotiation.status === "agreed"
          ? "Esta negociación ya cuenta con un acuerdo confirmado."
          : "La negociación no admite aceptar ofertas en su estado actual.",
    }
  }

  const supabase = createServiceClient()
  let query = supabase
    .from("offers")
    .select(
      "id, installments, down_payment_cents, waived_interest_cents, total_cents, schedule, status, valid_until, engine_version, created_at"
    )
    .eq("negotiation_id", negotiation.id)
    .eq("organization_id", negotiation.organizationId)

  if (offerId) {
    query = query.eq("id", offerId)
  } else {
    query = query
      .eq("status", "proposed")
      .order("created_at", { ascending: false })
      .limit(1)
  }

  const { data: rows, error: offerError } = await query
  if (offerError) throw new Error(offerError.message)
  const offerRow = rows.at(0)
  if (!offerRow) {
    return {
      ok: false,
      status: 404,
      error: "No encontramos una oferta activa para aceptar.",
    }
  }

  if (offerRow.status !== "proposed") {
    return {
      ok: false,
      status: 409,
      error: "Esta oferta ya fue reemplazada o aceptada.",
    }
  }

  const validUntilMs = Date.parse(offerRow.valid_until)
  if (!Number.isFinite(validUntilMs) || validUntilMs <= Date.now()) {
    return {
      ok: false,
      status: 410,
      error:
        "La vigencia de esta oferta venció. Pedile una nueva propuesta al asistente.",
    }
  }

  const schedule = parseOfferSchedule(offerRow.schedule)
  const offer: PersistedDebtorOffer = {
    id: offerRow.id,
    installments: offerRow.installments,
    downPaymentCents: offerRow.down_payment_cents,
    waivedInterestCents: offerRow.waived_interest_cents,
    totalCents: offerRow.total_cents,
    schedule,
    status: offerRow.status,
    validUntil: offerRow.valid_until,
    engineVersion: offerRow.engine_version,
    createdAt: offerRow.created_at,
  }

  if (!isOfferWithinPolicySnapshot(negotiation, offer)) {
    return {
      ok: false,
      status: 422,
      error:
        "La oferta no supera la validación contra la política de la organización.",
    }
  }

  const history = await getConversationHistory(negotiation.id)
  const transcriptSha256 = computeTranscriptSha256(history)
  const acceptedAtPreview = new Date().toISOString()

  const documentHtml = renderAgreementDocumentHtml({
    organization: {
      name: negotiation.organization.name,
      displayNameForDebtors: negotiation.organization.displayNameForDebtors,
    },
    debtor: {
      fullName: negotiation.debtor.fullName,
      alias: negotiation.debtor.alias,
      groupLabel: negotiation.debtor.groupLabel,
    },
    debt: negotiation.debt,
    offer: {
      id: offer.id,
      installments: offer.installments,
      downPaymentCents: offer.downPaymentCents,
      waivedInterestCents: offer.waivedInterestCents,
      totalCents: offer.totalCents,
      schedule: offer.schedule,
      engineVersion: offer.engineVersion,
    },
    evidence: {
      acceptedAt: acceptedAtPreview,
      acceptanceIp,
      userAgent,
      transcriptSha256,
      templateVersion: AGREEMENT_TEMPLATE_VERSION,
    },
    policySnapshot: negotiation.policySnapshot,
  })

  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    "accept_offer",
    {
      p_organization_id: negotiation.organizationId,
      p_negotiation_id: negotiation.id,
      p_offer_id: offer.id,
      p_acceptance_ip: acceptanceIp,
      p_user_agent: userAgent,
      p_transcript_sha256: transcriptSha256,
      p_document_html: documentHtml,
      p_template_version: AGREEMENT_TEMPLATE_VERSION,
    }
  )

  if (rpcError) {
    return {
      ok: false,
      status: 409,
      error:
        rpcError.message || "No se pudo registrar la aceptación del acuerdo.",
    }
  }

  const parsed = z
    .object({ agreement_id: z.uuid(), accepted_at: z.string() })
    .parse(rpcResult)

  return {
    ok: true,
    agreementId: parsed.agreement_id,
    acceptedAt: parsed.accepted_at,
    transcriptSha256,
    documentHtml,
  }
}

/**
 * Obtiene los mensajes posteriores a un cursor (`created_at`) junto con el
 * estado actual de la negociación y la oferta/acuerdo vigente (PLAN_BACKEND D9, §5).
 */
export async function getMessagesSinceForDebtor(
  negotiation: Pick<ResolvedNegotiation, "id" | "organizationId">,
  cursor?: string
): Promise<{
  messages: Pick<Tables<"messages">, "id" | "role" | "parts" | "created_at">[]
  nextCursor: string | null
}> {
  const supabase = createServiceClient()
  let query = supabase
    .from("messages")
    .select("id, role, parts, created_at")
    .eq("negotiation_id", negotiation.id)
    .eq("organization_id", negotiation.organizationId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })

  if (cursor) {
    query = query.gt("created_at", cursor)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  const nextCursor = data.at(-1)?.created_at ?? cursor ?? null
  return { messages: data, nextCursor }
}
