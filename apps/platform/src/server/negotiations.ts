import { createServerFn } from "@tanstack/react-start"
import { notFound } from "@tanstack/react-router"
import { z } from "zod"

import {
  canCancel,
  canReturnToAgent,
  canSendAdminMessage,
  canTakeOver,
  negotiationFilters,
  type NegotiationStatus,
} from "@/lib/labels"
import { logAuditEvent, throwIfError } from "./db/audit"
import { generateNegotiationToken } from "./db/crypto"
import type { ServerSupabase } from "./db/supabase-server"
import { authMiddleware } from "./middleware"
import {
  adminMessageSchema,
  createNegotiationSchema,
  negotiationIdSchema,
} from "./schemas"

const filterSchema = z.object({
  filter: z
    .enum(Object.keys(negotiationFilters) as [keyof typeof negotiationFilters])
    .default("todas"),
})

export const listNegotiations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(filterSchema)
  .handler(async ({ context, data }) => {
    let query = context.supabase
      .from("negotiations")
      .select(
        `id, status, created_at, updated_at, expires_at,
         debts(id, concept, principal_cents, interest_cents, debtors(id, alias, full_name, group_label)),
         messages(created_at)`
      )
      .order("updated_at", { ascending: false })
      .order("created_at", { referencedTable: "messages", ascending: false })
      .limit(1, { referencedTable: "messages" })

    const statuses = negotiationFilters[data.filter].statuses
    if (statuses) query = query.in("status", statuses)

    const { data: rows, error } = await query
    throwIfError(error)
    return (rows ?? []).map(({ messages, ...row }) => ({
      ...row,
      lastActivityAt: messages[0]?.created_at ?? row.created_at,
    }))
  })

export const getNegotiation = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(negotiationIdSchema)
  .handler(async ({ context, data: { id } }) => {
    const { data, error } = await context.supabase
      .from("negotiations")
      .select(
        `id, status, policy_snapshot, verified_at, verification_attempts, expires_at, channel, created_at,
         debts(id, concept, principal_cents, interest_cents, due_date, status,
           debtors(id, alias, full_name, group_label, email, phone)),
         messages(id, role, parts, created_at),
         offers(id, installments, down_payment_cents, waived_interest_cents, total_cents, schedule, status, valid_until, created_at,
           agreements(id, accepted_at)),
         audit_events(id, type, payload, created_at)`
      )
      .eq("id", id)
      .order("created_at", { referencedTable: "messages", ascending: true })
      .order("created_at", { referencedTable: "offers", ascending: false })
      .order("created_at", { referencedTable: "audit_events", ascending: false })
      .maybeSingle()
    throwIfError(error)
    if (!data?.debts) throw notFound()
    return { ...data, debt: data.debts }
  })

/** Deudas impagas sin negociación abierta, para el diálogo "Nueva negociación". */
export const listNegotiableDebts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("debts")
      .select(
        "id, concept, principal_cents, interest_cents, debtors!inner(alias, full_name, archived_at)"
      )
      .eq("status", "open")
      .is("debtors.archived_at", null)
      .order("due_date")
    throwIfError(error)
    return data ?? []
  })

export const createNegotiation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createNegotiationSchema)
  .handler(async ({ context, data }) => {
    const { supabase, organizationId } = context

    const { data: debt, error: debtError } = await supabase
      .from("debts")
      .select("id, status")
      .eq("id", data.debtId)
      .maybeSingle()
    throwIfError(debtError)
    if (!debt) throw notFound()
    if (debt.status !== "open") {
      throw new Error("Solo se puede negociar una deuda impaga sin negociación abierta.")
    }

    const { data: policy, error: policyError } = await supabase
      .from("negotiation_policies")
      .select("*")
      .eq("organization_id", organizationId)
      .maybeSingle()
    throwIfError(policyError)
    if (!policy) {
      throw new Error("Configurá las reglas del agente antes de iniciar una negociación.")
    }
    // Snapshot inmutable: cambios posteriores de la política no afectan esta negociación.
    const { organization_id: _org, updated_at: _updated, ...policySnapshot } = policy

    const { token, tokenHash } = generateNegotiationToken()
    const expiresAt = new Date(Date.now() + data.expiresInDays * 86_400_000)

    const { data: negotiation, error } = await supabase
      .from("negotiations")
      .insert({
        organization_id: organizationId,
        debt_id: debt.id,
        policy_snapshot: policySnapshot,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        created_by: context.user.id,
      })
      .select("id")
      .single()
    throwIfError(error)

    const { error: updateError } = await supabase
      .from("debts")
      .update({ status: "in_negotiation" })
      .eq("id", debt.id)
    throwIfError(updateError)

    await logAuditEvent(context, "negotiation_created", negotiation!.id, {
      expires_at: expiresAt.toISOString(),
    })
    return { negotiationId: negotiation!.id, token }
  })

async function getStatus(supabase: ServerSupabase, id: string) {
  const { data, error } = await supabase
    .from("negotiations")
    .select("status, verified_at, debt_id")
    .eq("id", id)
    .maybeSingle()
  throwIfError(error)
  if (!data) throw notFound()
  return data
}

async function setStatus(
  supabase: ServerSupabase,
  id: string,
  status: NegotiationStatus,
  extra: { expires_at?: string } = {}
) {
  const { error } = await supabase
    .from("negotiations")
    .update({ status, ...extra })
    .eq("id", id)
  throwIfError(error)
}

export const takeOverNegotiation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(negotiationIdSchema)
  .handler(async ({ context, data: { id } }) => {
    const current = await getStatus(context.supabase, id)
    if (!canTakeOver(current.status)) {
      throw new Error("Esta negociación no admite tomar el control en su estado actual.")
    }
    await setStatus(context.supabase, id, "escalated")
    await logAuditEvent(context, "admin_takeover", id, { from: current.status })
  })

export const returnToAgent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(negotiationIdSchema)
  .handler(async ({ context, data: { id } }) => {
    const current = await getStatus(context.supabase, id)
    if (!canReturnToAgent(current.status)) {
      throw new Error("Solo se puede devolver al agente una negociación derivada.")
    }
    const next = current.verified_at ? "active" : "pending"
    await setStatus(context.supabase, id, next)
    await logAuditEvent(context, "returned_to_agent", id, { to: next })
  })

export const cancelNegotiation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(negotiationIdSchema)
  .handler(async ({ context, data: { id } }) => {
    const current = await getStatus(context.supabase, id)
    if (!canCancel(current.status)) {
      throw new Error("Esta negociación ya está cerrada.")
    }
    await setStatus(context.supabase, id, "expired", {
      expires_at: new Date().toISOString(),
    })
    const { error } = await context.supabase
      .from("debts")
      .update({ status: "open" })
      .eq("id", current.debt_id)
      .eq("status", "in_negotiation")
    throwIfError(error)
    await logAuditEvent(context, "negotiation_cancelled", id, {
      from: current.status,
    })
  })

export const sendAdminMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(adminMessageSchema)
  .handler(async ({ context, data }) => {
    const current = await getStatus(context.supabase, data.negotiationId)
    if (!canSendAdminMessage(current.status)) {
      throw new Error("Tomá el control de la conversación antes de escribir.")
    }
    const { error } = await context.supabase.from("messages").insert({
      organization_id: context.organizationId,
      negotiation_id: data.negotiationId,
      role: "admin",
      parts: [{ type: "text", text: data.text }],
    })
    throwIfError(error)
  })
