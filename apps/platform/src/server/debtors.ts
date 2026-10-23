import { createServerFn } from "@tanstack/react-start"
import { notFound } from "@tanstack/react-router"
import { z } from "zod"

import { throwIfError } from "./db/audit"
import { debtorVerificationHash } from "./db/crypto"
import { authMiddleware } from "./middleware"
import {
  createDebtSchema,
  createDebtorSchema,
  updateDebtStatusSchema,
  updateDebtorSchema,
} from "./schemas"

export const listDebtors = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("debtors")
      .select(
        "id, full_name, alias, group_label, email, phone, debts(id, principal_cents, interest_cents, status)"
      )
      .is("archived_at", null)
      .order("group_label")
      .order("alias")
    throwIfError(error)
    return data ?? []
  })

export const getDebtor = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ context, data: { id } }) => {
    const { data, error } = await context.supabase
      .from("debtors")
      .select(
        `id, full_name, alias, group_label, email, phone, verification_hash, created_at,
         debts(id, concept, principal_cents, interest_cents, due_date, status, created_at,
           negotiations(id, status, created_at))`
      )
      .eq("id", id)
      .maybeSingle()
    throwIfError(error)
    if (!data) throw notFound()

    const { verification_hash, ...debtor } = data
    return {
      ...debtor,
      hasVerification: verification_hash !== null,
      debts: [...debtor.debts].sort((a, b) =>
        b.due_date.localeCompare(a.due_date)
      ),
    }
  })

export const createDebtor = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createDebtorSchema)
  .handler(async ({ context, data }) => {
    const id = crypto.randomUUID()
    const { error } = await context.supabase.from("debtors").insert({
      id,
      organization_id: context.organizationId,
      full_name: data.fullName,
      alias: data.alias,
      group_label: data.groupLabel,
      email: data.email,
      phone: data.phone,
      verification_hash: data.dni ? debtorVerificationHash(id, data.dni) : null,
    })
    throwIfError(error)

    if (data.debt) {
      const { error: debtError } = await context.supabase.from("debts").insert({
        organization_id: context.organizationId,
        debtor_id: id,
        concept: data.debt.concept,
        principal_cents: data.debt.principal,
        interest_cents: data.debt.interest,
        due_date: data.debt.dueDate,
      })
      throwIfError(debtError)
    }
    return { id }
  })

export const updateDebtor = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(updateDebtorSchema)
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("debtors")
      .update({
        full_name: data.fullName,
        alias: data.alias,
        group_label: data.groupLabel,
        email: data.email,
        phone: data.phone,
        // Si no se carga un DNI nuevo se conserva la verificación actual.
        ...(data.dni
          ? { verification_hash: debtorVerificationHash(data.id, data.dni) }
          : {}),
      })
      .eq("id", data.id)
    throwIfError(error)
  })

export const createDebt = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createDebtSchema)
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("debts").insert({
      organization_id: context.organizationId,
      debtor_id: data.debtorId,
      concept: data.concept,
      principal_cents: data.principal,
      interest_cents: data.interest,
      due_date: data.dueDate,
    })
    throwIfError(error)
  })

export const updateDebtStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(updateDebtStatusSchema)
  .handler(async ({ context, data }) => {
    const { data: debt, error } = await context.supabase
      .from("debts")
      .select("status")
      .eq("id", data.id)
      .maybeSingle()
    throwIfError(error)
    if (!debt) throw notFound()
    if (debt.status === "in_negotiation") {
      throw new Error(
        "La deuda tiene una negociación abierta. Cancelá el link antes de cambiar su estado."
      )
    }

    const { error: updateError } = await context.supabase
      .from("debts")
      .update({ status: data.status })
      .eq("id", data.id)
    throwIfError(updateError)
  })
