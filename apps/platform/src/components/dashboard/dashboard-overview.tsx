import { Link } from "@tanstack/react-router"
import {
  ArrowUpRight01Icon,
  CheckmarkCircle02Icon,
  Clock03Icon,
  MessageMultiple02Icon,
  MoneyReceiveCircleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"

import { ButtonLink } from "@/components/button-link"
import {
  AgreementPlansChart,
  DEMO_AGREEMENT_PLANS_DATA,
} from "@/components/dashboard/agreement-plans-chart"
import type { AgreementPlanSlice } from "@/components/dashboard/agreement-plans-chart"
import {
  DEMO_RECOVERY_TREND_DATA,
  RecoveryTrendChart,
} from "@/components/dashboard/recovery-trend-chart"
import type { RecoveryTrendItem } from "@/components/dashboard/recovery-trend-chart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatARS, formatCompactARS, formatRelative } from "@/lib/format"
import { installmentsLabel } from "@/lib/labels"
import { cn } from "@/lib/utils"
import type {
  AgreementsByPlanPoint,
  AttentionItem,
  DashboardKpis,
  MonthlyRecoveryPoint,
  RecentAgreementItem,
} from "@/server/metrics"

export type DashboardMetricCardItem = {
  label: string
  value: string
  detail: string
  icon: IconSvgElement
}

export type DashboardRecentAgreementHref =
  | {
      to: "/acuerdos/$agreementId"
      params: { agreementId: string }
    }
  | {
      to: "/conversaciones/$negotiationId"
      params: { negotiationId: string }
    }

export type DashboardRecentAgreementRow = {
  id: string
  debtor: string
  building: string
  amount: string
  plan: string
  status: "Acordado" | "Pendiente"
  href?: DashboardRecentAgreementHref
}

export type DashboardAttentionCardItem = {
  id: string
  title: string
  description: string
  icon: IconSvgElement
  negotiationId?: string
}

export type DashboardViewData = {
  metrics: DashboardMetricCardItem[]
  recoveryTrend: {
    data: RecoveryTrendItem[]
    description?: string
    seriesLabel?: string
  }
  agreementPlans: {
    data: AgreementPlanSlice[]
    description?: string
  }
  recentAgreements: DashboardRecentAgreementRow[]
  attentionItems: DashboardAttentionCardItem[]
}

export const DEMO_DASHBOARD_VIEW_DATA: DashboardViewData = {
  metrics: [
    {
      label: "Monto recuperado",
      value: "$ 8,4 M",
      detail: "+12,5% vs. agosto",
      icon: MoneyReceiveCircleIcon,
    },
    {
      label: "Acuerdos cerrados",
      value: "42",
      detail: "9 esta semana",
      icon: CheckmarkCircle02Icon,
    },
    {
      label: "Conversaciones activas",
      value: "18",
      detail: "6 esperan respuesta",
      icon: MessageMultiple02Icon,
    },
  ],
  recoveryTrend: {
    data: DEMO_RECOVERY_TREND_DATA,
    description: "Monto recuperado por mes en los últimos 6 meses.",
    seriesLabel: "Monto recuperado",
  },
  agreementPlans: {
    data: DEMO_AGREEMENT_PLANS_DATA,
    description: "Distribución de los 42 acuerdos cerrados este mes.",
  },
  recentAgreements: [
    {
      id: "demo-1",
      debtor: "Unidad 4B",
      building: "Av. Rivadavia 2840",
      amount: "$ 186.400",
      plan: "3 cuotas",
      status: "Acordado",
    },
    {
      id: "demo-2",
      debtor: "Unidad 7A",
      building: "Sarmiento 912",
      amount: "$ 94.250",
      plan: "Pago único",
      status: "Pendiente",
    },
    {
      id: "demo-3",
      debtor: "Unidad 2C",
      building: "México 1456",
      amount: "$ 231.800",
      plan: "2 cuotas",
      status: "Acordado",
    },
  ],
  attentionItems: [
    {
      id: "demo-att-1",
      title: "6 respuestas pendientes",
      description: "La más antigua espera hace 18 horas.",
      icon: Clock03Icon,
    },
    {
      id: "demo-att-2",
      title: "2 casos fuera de política",
      description: "Solicitaron un plan que supera las 3 cuotas.",
      icon: MessageMultiple02Icon,
    },
  ],
}

function formatRecoveryDetail(kpis: DashboardKpis) {
  const parts: string[] = []
  if (kpis.agreedCents > 0) {
    parts.push(`${formatCompactARS(kpis.agreedCents)} comprometido en actas`)
  }
  if (kpis.deltaVsPrevMonthPct !== null) {
    const sign = kpis.deltaVsPrevMonthPct >= 0 ? "+" : ""
    const formatted = kpis.deltaVsPrevMonthPct.toLocaleString("es-AR", {
      maximumFractionDigits: 1,
    })
    parts.push(`${sign}${formatted}% vs. mes anterior`)
  }
  if (parts.length === 0) {
    return "Sin cobros registrados todavía"
  }
  return parts.join(" · ")
}

function formatAttentionItem(item: AttentionItem): DashboardAttentionCardItem {
  const location = item.groupLabel
    ? `${item.debtorAlias} · ${item.groupLabel}`
    : item.debtorAlias
  const relative = formatRelative(item.occurredAt)

  if (item.kind === "escalated") {
    return {
      id: `escalated-${item.negotiationId}`,
      title: `${location} pidió hablar con una persona`,
      description: `${item.concept} · Derivada ${relative}.`,
      icon: Clock03Icon,
      negotiationId: item.negotiationId,
    }
  }

  if (item.kind === "unanswered_offer") {
    return {
      id: `unanswered-${item.negotiationId}`,
      title: `${location} tiene una oferta sin respuesta`,
      description: `Enviada ${relative} · ${item.concept}.`,
      icon: Clock03Icon,
      negotiationId: item.negotiationId,
    }
  }

  const detailObj =
    item.detail &&
    typeof item.detail === "object" &&
    !Array.isArray(item.detail)
      ? item.detail
      : {}
  const requested =
    typeof detailObj.requested_installments === "number"
      ? detailObj.requested_installments
      : typeof detailObj.requestedInstallments === "number"
        ? detailObj.requestedInstallments
        : null
  const maxAllowed =
    typeof detailObj.max_installments === "number"
      ? detailObj.max_installments
      : typeof detailObj.maxInstallments === "number"
        ? detailObj.maxInstallments
        : null

  const policyExplanation =
    requested && maxAllowed
      ? `Solicitó ${requested} cuotas (máximo ${maxAllowed}).`
      : requested
        ? `Solicitó un plan en ${requested} cuotas fuera de política.`
        : "Solicitó condiciones fuera de las reglas del agente."

  return {
    id: `policy-${item.negotiationId}-${item.occurredAt}`,
    title: `${location} pidió condiciones fuera de política`,
    description: `${policyExplanation} (${relative})`,
    icon: MessageMultiple02Icon,
    negotiationId: item.negotiationId,
  }
}

export function buildDashboardViewData(input: {
  kpis: DashboardKpis
  monthlyRecovery: MonthlyRecoveryPoint[]
  agreementsByPlan: AgreementsByPlanPoint[]
  recentAgreements: RecentAgreementItem[]
  attentionItems: AttentionItem[]
}): DashboardViewData {
  const {
    kpis,
    monthlyRecovery,
    agreementsByPlan,
    recentAgreements,
    attentionItems,
  } = input

  const hasPaidRecovery = monthlyRecovery.some(
    (point) => point.recoveredCents > 0
  )
  const recoveryTrendData: RecoveryTrendItem[] = monthlyRecovery.map(
    (point) => ({
      month: point.month,
      amountCents: hasPaidRecovery ? point.recoveredCents : point.agreedCents,
    })
  )

  const totalPlanAgreements = agreementsByPlan.reduce(
    (sum, item) => sum + item.count,
    0
  )

  return {
    metrics: [
      {
        label: "Monto recuperado",
        value: formatCompactARS(kpis.recoveredCents),
        detail: formatRecoveryDetail(kpis),
        icon: MoneyReceiveCircleIcon,
      },
      {
        label: "Acuerdos cerrados",
        value: String(kpis.agreementsCount),
        detail:
          kpis.agreementsThisWeek === 1
            ? "1 esta semana"
            : `${kpis.agreementsThisWeek} esta semana`,
        icon: CheckmarkCircle02Icon,
      },
      {
        label: "Conversaciones activas",
        value: String(kpis.activeConversations),
        detail:
          kpis.awaitingReply === 1
            ? "1 espera respuesta"
            : `${kpis.awaitingReply} esperan respuesta`,
        icon: MessageMultiple02Icon,
      },
    ],
    recoveryTrend: {
      data: recoveryTrendData,
      description: hasPaidRecovery
        ? "Monto cobrado por mes en los últimos 6 meses."
        : "Monto acordado por mes en los últimos 6 meses (sin cuotas marcadas como cobradas).",
      seriesLabel: hasPaidRecovery ? "Monto recuperado" : "Monto acordado",
    },
    agreementPlans: {
      data: agreementsByPlan,
      description:
        totalPlanAgreements > 0
          ? `Distribución de los ${totalPlanAgreements} acuerdos cerrados.`
          : "Sin acuerdos cerrados registrados todavía.",
    },
    recentAgreements: recentAgreements.map((item) => ({
      id: item.agreementId ?? item.negotiationId,
      debtor: item.debtorAlias,
      building: item.groupLabel ?? item.concept,
      amount: formatARS(item.amountCents),
      plan: installmentsLabel(item.installments),
      status: item.status === "agreed" ? "Acordado" : "Pendiente",
      href: item.agreementId
        ? {
            to: "/acuerdos/$agreementId",
            params: { agreementId: item.agreementId },
          }
        : {
            to: "/conversaciones/$negotiationId",
            params: { negotiationId: item.negotiationId },
          },
    })),
    attentionItems: attentionItems.map(formatAttentionItem),
  }
}

type DashboardOverviewProps = {
  data?: DashboardViewData
  compact?: boolean
  interactive?: boolean
  className?: string
}

export function DashboardOverview({
  data = DEMO_DASHBOARD_VIEW_DATA,
  compact = false,
  interactive = false,
  className,
}: DashboardOverviewProps) {
  return (
    <section
      aria-label="Contenido del dashboard"
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
        compact && "gap-3",
        className
      )}
    >
      {data.metrics.map((metric) => (
        <Card key={metric.label} size={compact ? "sm" : "default"}>
          <CardHeader>
            <CardDescription>{metric.label}</CardDescription>
            <CardAction className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HugeiconsIcon icon={metric.icon} strokeWidth={2} />
            </CardAction>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "font-semibold tracking-tight tabular-nums",
                compact ? "text-xl" : "text-2xl"
              )}
            >
              {metric.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {metric.detail}
            </p>
          </CardContent>
        </Card>
      ))}

      <RecoveryTrendChart
        data={data.recoveryTrend.data}
        description={data.recoveryTrend.description}
        seriesLabel={data.recoveryTrend.seriesLabel}
        compact={compact}
        className="md:col-span-2 lg:col-span-2"
      />
      <AgreementPlansChart
        data={data.agreementPlans.data}
        description={data.agreementPlans.description}
        compact={compact}
        className="md:col-span-2 lg:col-span-1"
      />

      <Card
        size={compact ? "sm" : "default"}
        className="md:col-span-2 lg:col-span-2"
      >
        <CardHeader className="border-b">
          <CardTitle>Acuerdos recientes</CardTitle>
          <CardDescription>
            Últimas negociaciones registradas por el agente.
          </CardDescription>
          <CardAction>
            {interactive ? (
              <ButtonLink
                variant="ghost"
                size="sm"
                to="/conversaciones"
                search={{ estado: "acordadas" }}
              >
                Ver todos
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  data-icon="inline-end"
                />
              </ButtonLink>
            ) : (
              <Button variant="ghost" size="sm">
                Ver todos
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  data-icon="inline-end"
                />
              </Button>
            )}
          </CardAction>
        </CardHeader>
        <CardContent className="px-0">
          {data.recentAgreements.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Todavía no se cerraron acuerdos ni hay propuestas pendientes.
            </p>
          ) : (
            <div className="divide-y">
              {data.recentAgreements.map((agreement) => {
                const rowContent = (
                  <>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{agreement.debtor}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {agreement.building}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="font-medium tabular-nums">
                        {agreement.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {agreement.plan}
                      </p>
                    </div>
                    <Badge
                      variant={
                        agreement.status === "Acordado"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {agreement.status}
                    </Badge>
                  </>
                )

                if (interactive && agreement.href) {
                  if (agreement.href.to === "/acuerdos/$agreementId") {
                    return (
                      <Link
                        key={agreement.id}
                        to="/acuerdos/$agreementId"
                        params={agreement.href.params}
                        className="grid gap-3 px-4 py-3 transition-colors hover:bg-muted/50 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
                      >
                        {rowContent}
                      </Link>
                    )
                  }
                  return (
                    <Link
                      key={agreement.id}
                      to="/conversaciones/$negotiationId"
                      params={agreement.href.params}
                      className="grid gap-3 px-4 py-3 transition-colors hover:bg-muted/50 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
                    >
                      {rowContent}
                    </Link>
                  )
                }

                return (
                  <div
                    key={agreement.id}
                    className="grid gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
                  >
                    {rowContent}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card
        size={compact ? "sm" : "default"}
        className="md:col-span-2 lg:col-span-1"
      >
        <CardHeader>
          <CardTitle>Requieren atención</CardTitle>
          <CardDescription>
            Conversaciones que necesitan una decisión.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.attentionItems.length === 0 ? (
            <p className="rounded-lg bg-muted/40 px-3 py-6 text-center text-sm text-muted-foreground">
              No hay conversaciones escaladas ni pedidos fuera de política
              pendientes.
            </p>
          ) : (
            data.attentionItems.map((item) => {
              const itemBody = (
                <>
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-primary ring-1 ring-border">
                    <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{item.title}</p>
                    <p
                      className="mt-0.5 text-xs text-muted-foreground"
                      suppressHydrationWarning
                    >
                      {item.description}
                    </p>
                  </div>
                </>
              )

              if (interactive && item.negotiationId) {
                return (
                  <Link
                    key={item.id}
                    to="/conversaciones/$negotiationId"
                    params={{ negotiationId: item.negotiationId }}
                    className="flex items-start gap-3 rounded-lg bg-muted/60 p-3 transition-colors hover:bg-muted"
                  >
                    {itemBody}
                  </Link>
                )
              }

              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg bg-muted/60 p-3"
                >
                  {itemBody}
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </section>
  )
}

export function DashboardOverviewSkeleton({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  return (
    <section
      aria-label="Cargando contenido del dashboard"
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
        compact && "gap-3",
        className
      )}
    >
      {[0, 1, 2].map((index) => (
        <Card key={index} size={compact ? "sm" : "default"}>
          <CardHeader>
            <Skeleton className="h-4 w-32" />
            <CardAction>
              <Skeleton className="size-8 rounded-lg" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <Skeleton className={cn("w-28", compact ? "h-6" : "h-8")} />
            <Skeleton className="mt-2 h-3 w-44" />
          </CardContent>
        </Card>
      ))}

      <Card
        size={compact ? "sm" : "default"}
        className="md:col-span-2 lg:col-span-2"
      >
        <CardHeader>
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton
            className={cn("w-full", compact ? "h-[140px]" : "h-[220px]")}
          />
        </CardContent>
      </Card>

      <Card
        size={compact ? "sm" : "default"}
        className="md:col-span-2 lg:col-span-1"
      >
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-52" />
        </CardHeader>
        <CardContent>
          <Skeleton
            className={cn(
              "mx-auto aspect-square rounded-full",
              compact ? "h-[140px]" : "h-[180px]"
            )}
          />
        </CardContent>
      </Card>

      <Card
        size={compact ? "sm" : "default"}
        className="md:col-span-2 lg:col-span-2"
      >
        <CardHeader className="border-b">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-3 py-4">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>

      <Card
        size={compact ? "sm" : "default"}
        className="md:col-span-2 lg:col-span-1"
      >
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-52" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </CardContent>
      </Card>
    </section>
  )
}
