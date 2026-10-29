import { createServerFn } from "@tanstack/react-start"
import { notFound } from "@tanstack/react-router"
import { z } from "zod"

import { throwIfError } from "./db/audit"
import { authMiddleware } from "./middleware"
import { installmentPaidSchema } from "./schemas"

export const getAgreement = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ context, data: { id } }) => {
    const { data, error } = await context.supabase
      .from("agreements")
      .select(
        `id, accepted_at, acceptance_ip, user_agent, transcript_sha256, template_version,
         installments(id, number, due_date, amount_cents, paid_at),
         offers(id, installments, down_payment_cents, waived_interest_cents, total_cents, engine_version,
           negotiations(id, policy_snapshot,
             debts(id, concept, principal_cents, interest_cents, due_date, status,
               debtors(id, alias, full_name, group_label, email, phone)),
             organizations(name, display_name_for_debtors)))`
      )
      .eq("id", id)
      .order("number", { referencedTable: "installments" })
      .maybeSingle()
    throwIfError(error)

    if (!data) {
      throw notFound()
    }
    const negotiation = data.offers.negotiations
    const debt = negotiation.debts
    const debtor = debt.debtors
    return {
      id: data.id,
      acceptedAt: data.accepted_at,
      acceptanceIp: data.acceptance_ip,
      userAgent: data.user_agent,
      transcriptSha256: data.transcript_sha256,
      templateVersion: data.template_version,
      installments: data.installments,
      offer: data.offers,
      negotiationId: negotiation.id,
      debt,
      debtor,
      organization: negotiation.organizations,
    }
  })

export const setInstallmentPaid = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(installmentPaidSchema)
  .handler(async ({ context, data }) => {
    const { supabase } = context
    const { data: installment, error } = await supabase
      .from("installments")
      .update({ paid_at: data.paid ? new Date().toISOString() : null })
      .eq("id", data.id)
      .select("agreement_id")
      .maybeSingle()
    throwIfError(error)
    if (!installment) throw notFound()

    // La deuda pasa a "pagada" cuando se cobran todas las cuotas del acuerdo.
    const { data: agreement, error: agreementError } = await supabase
      .from("agreements")
      .select("installments(paid_at), offers(negotiations(debt_id))")
      .eq("id", installment.agreement_id)
      .single()
    throwIfError(agreementError)

    if (!agreement) return
    const debtId = agreement.offers.negotiations.debt_id
    const allPaid = agreement.installments.every(
      (item) => item.paid_at !== null
    )
    const { error: debtError } = await supabase
      .from("debts")
      .update({ status: allPaid ? "paid" : "agreed" })
      .eq("id", debtId)
    throwIfError(debtError)
  })
