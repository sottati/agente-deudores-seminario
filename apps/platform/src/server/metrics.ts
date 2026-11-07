import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { formatShortMonth } from "@/lib/format"
import { throwIfError } from "./db/audit"
import type { Json } from "./db/types.gen"
import { authMiddleware } from "./middleware"

export type DashboardKpis = {
  recoveredCents: number
  agreedCents: number
  deltaVsPrevMonthPct: number | null
  agreementsCount: number
  agreementsThisWeek: number
  activeConversations: number
  awaitingReply: number
}

export type MonthlyRecoveryPoint = {
  month: string
  period: string
  amountCents: number
  recoveredCents: number
  agreedCents: number
}

export type AgreementsByPlanPoint = {
  installments: number
  count: number
  totalCents: number
}

export type RecentAgreementItem = {
  agreementId: string | null
  negotiationId: string
  debtorId: string
  debtorAlias: string
  debtorFullName: string
  groupLabel: string | null
  concept: string
  amountCents: number
  installments: number
  status: "agreed" | "offer_pending"
  activityAt: string
}

export type AttentionItemKind =
  "escalated" | "unanswered_offer" | "out_of_policy_request"

export type AttentionItem = {
  negotiationId: string
  kind: AttentionItemKind
  debtorAlias: string
  groupLabel: string | null
  concept: string
  occurredAt: string
  detail: Json
}

const monthlyRecoverySchema = z
  .object({
    months: z.coerce.number().int().min(1).max(12).default(6),
  })
  .default({ months: 6 })

const agreementsByPlanSchema = z
  .object({
    period: z
      .union([
        z.literal("all"),
        z.literal("month"),
        z.string().regex(/^\d{4}-\d{2}$/),
      ])
      .default("all"),
  })
  .default({ period: "all" })

const recentAgreementsSchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(20).default(3),
  })
  .default({ limit: 3 })

function currentYearMonthAR() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  })
    .format(new Date())
    .slice(0, 7)
}

export const getDashboardKpis = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DashboardKpis> => {
    const { data, error } = await context.supabase
      .from("v_dashboard_kpis")
      .select(
        "recovered_cents, agreed_cents, delta_vs_prev_month_pct, agreements_count, agreements_this_week, active_conversations, awaiting_reply"
      )
      .eq("organization_id", context.organizationId)
      .maybeSingle()
    throwIfError(error)

    return {
      recoveredCents: data?.recovered_cents ?? 0,
      agreedCents: data?.agreed_cents ?? 0,
      deltaVsPrevMonthPct:
        data?.delta_vs_prev_month_pct != null
          ? Number(data.delta_vs_prev_month_pct)
          : null,
      agreementsCount: data?.agreements_count ?? 0,
      agreementsThisWeek: data?.agreements_this_week ?? 0,
      activeConversations: data?.active_conversations ?? 0,
      awaitingReply: data?.awaiting_reply ?? 0,
    }
  })

export const getMonthlyRecovery = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(monthlyRecoverySchema)
  .handler(async ({ context, data }): Promise<MonthlyRecoveryPoint[]> => {
    const { data: rows, error } = await context.supabase
      .from("v_monthly_recovery")
      .select(
        "month_start, period, amount_cents, recovered_cents, agreed_cents"
      )
      .eq("organization_id", context.organizationId)
      .order("month_start", { ascending: false })
      .limit(data.months)
    throwIfError(error)

    return [...(rows ?? [])].reverse().map((row) => {
      const period = row.period ?? row.month_start?.slice(0, 7) ?? ""
      return {
        month: formatShortMonth(row.month_start ?? period),
        period,
        amountCents: row.amount_cents ?? 0,
        recoveredCents: row.recovered_cents ?? 0,
        agreedCents: row.agreed_cents ?? 0,
      }
    })
  })

export const getAgreementsByPlan = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(agreementsByPlanSchema)
  .handler(async ({ context, data }): Promise<AgreementsByPlanPoint[]> => {
    let query = context.supabase
      .from("v_agreements_by_plan")
      .select("installments, count, total_cents, period")
      .eq("organization_id", context.organizationId)

    if (data.period === "month") {
      query = query.eq("period", currentYearMonthAR())
    } else if (data.period !== "all") {
      query = query.eq("period", data.period)
    }

    const { data: rows, error } = await query
    throwIfError(error)

    const grouped = new Map<
      number,
      { installments: number; count: number; totalCents: number }
    >()
    for (const row of rows ?? []) {
      const installments = row.installments ?? 1
      const current = grouped.get(installments) ?? {
        installments,
        count: 0,
        totalCents: 0,
      }
      current.count += row.count
      current.totalCents += row.total_cents ?? 0
      grouped.set(installments, current)
    }

    return [...grouped.values()].sort((a, b) => a.installments - b.installments)
  })

export const listRecentAgreements = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(recentAgreementsSchema)
  .handler(async ({ context, data }): Promise<RecentAgreementItem[]> => {
    const { data: rows, error } = await context.supabase
      .from("v_recent_agreements")
      .select(
        "agreement_id, negotiation_id, debtor_id, debtor_alias, debtor_full_name, group_label, concept, amount_cents, installments, status, activity_at"
      )
      .eq("organization_id", context.organizationId)
      .order("activity_at", { ascending: false })
      .limit(data.limit)
    throwIfError(error)

    return (rows ?? []).map((row) => ({
      agreementId: row.agreement_id,
      negotiationId: row.negotiation_id ?? "",
      debtorId: row.debtor_id ?? "",
      debtorAlias: row.debtor_alias ?? "Deudor",
      debtorFullName: row.debtor_full_name ?? "",
      groupLabel: row.group_label,
      concept: row.concept ?? "",
      amountCents: row.amount_cents ?? 0,
      installments: row.installments ?? 1,
      status: row.status === "offer_pending" ? "offer_pending" : "agreed",
      activityAt: row.activity_at ?? new Date().toISOString(),
    }))
  })

export const getAttentionItems = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<AttentionItem[]> => {
    const { data: rows, error } = await context.supabase
      .from("v_attention_items")
      .select(
        "negotiation_id, kind, debtor_alias, group_label, concept, occurred_at, detail"
      )
      .eq("organization_id", context.organizationId)
      .order("occurred_at", { ascending: true })
    throwIfError(error)

    return (rows ?? []).map((row) => ({
      negotiationId: row.negotiation_id ?? "",
      kind:
        row.kind === "unanswered_offer" || row.kind === "out_of_policy_request"
          ? row.kind
          : "escalated",
      debtorAlias: row.debtor_alias ?? "Deudor",
      groupLabel: row.group_label,
      concept: row.concept ?? "",
      occurredAt: row.occurred_at ?? new Date().toISOString(),
      detail: row.detail ?? {},
    }))
  })
