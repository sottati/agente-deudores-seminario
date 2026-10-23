import { createServerFn } from "@tanstack/react-start"

import { throwIfError } from "./db/audit"
import { authMiddleware } from "./middleware"
import { organizationSchema, policySchema } from "./schemas"

export const getPolicy = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("negotiation_policies")
      .select("*")
      .eq("organization_id", context.organizationId)
      .maybeSingle()
    throwIfError(error)
    return data
  })

export const updatePolicy = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(policySchema)
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("negotiation_policies").upsert({
      organization_id: context.organizationId,
      max_installments: data.maxInstallments,
      min_down_payment_pct: data.minDownPaymentPct,
      min_installment_amount_cents: data.minInstallmentAmount,
      max_interest_waiver_pct: data.maxInterestWaiverPct,
      single_payment_interest_waiver_pct: data.singlePaymentInterestWaiverPct,
      max_principal_discount_pct: data.maxPrincipalDiscountPct,
      max_first_due_days: data.maxFirstDueDays,
      offer_validity_hours: data.offerValidityHours,
      escalate_above_amount_cents: data.escalateAboveAmount,
      tone: data.tone,
      custom_instructions: data.customInstructions,
    })
    throwIfError(error)
  })

export const getOrganization = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("organizations")
      .select("id, name, kind, display_name_for_debtors, updated_at")
      .eq("id", context.organizationId)
      .single()
    throwIfError(error)
    return data!
  })

export const updateOrganization = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(organizationSchema)
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("organizations")
      .update({
        name: data.name,
        kind: data.kind,
        display_name_for_debtors: data.displayNameForDebtors,
      })
      .eq("id", context.organizationId)
    throwIfError(error)
  })
