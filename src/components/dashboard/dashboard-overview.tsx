import {
  ArrowUpRight01Icon,
  CheckmarkCircle02Icon,
  Clock03Icon,
  MessageMultiple02Icon,
  MoneyReceiveCircleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { AgreementPlansChart } from "@/components/dashboard/agreement-plans-chart"
import { RecoveryTrendChart } from "@/components/dashboard/recovery-trend-chart"
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
import { cn } from "@/lib/utils"

const metrics = [
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
]

const recentAgreements = [
  {
    debtor: "Unidad 4B",
    building: "Av. Rivadavia 2840",
    amount: "$ 186.400",
    plan: "3 cuotas",
    status: "Acordado",
  },
  {
    debtor: "Unidad 7A",
    building: "Sarmiento 912",
    amount: "$ 94.250",
    plan: "Pago único",
    status: "Pendiente",
  },
  {
    debtor: "Unidad 2C",
    building: "México 1456",
    amount: "$ 231.800",
    plan: "2 cuotas",
    status: "Acordado",
  },
]

type DashboardOverviewProps = {
  compact?: boolean
  className?: string
}

export function DashboardOverview({
  compact = false,
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
      {metrics.map((metric) => (
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
                "font-semibold tracking-tight",
                compact ? "text-xl" : "text-2xl"
              )}
            >
              {metric.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
          </CardContent>
        </Card>
      ))}

      <RecoveryTrendChart
        compact={compact}
        className="md:col-span-2 lg:col-span-2"
      />
      <AgreementPlansChart
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
            <Button variant="ghost" size="sm">
              Ver todos
              <HugeiconsIcon icon={ArrowUpRight01Icon} data-icon="inline-end" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0">
          <div className="divide-y">
            {recentAgreements.map((agreement) => (
              <div
                key={`${agreement.debtor}-${agreement.building}`}
                className="grid gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{agreement.debtor}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {agreement.building}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="font-medium tabular-nums">{agreement.amount}</p>
                  <p className="text-xs text-muted-foreground">
                    {agreement.plan}
                  </p>
                </div>
                <Badge
                  variant={
                    agreement.status === "Acordado" ? "secondary" : "outline"
                  }
                >
                  {agreement.status}
                </Badge>
              </div>
            ))}
          </div>
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
          <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-primary ring-1 ring-border">
              <HugeiconsIcon icon={Clock03Icon} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="font-medium">6 respuestas pendientes</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                La más antigua espera hace 18 horas.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-primary ring-1 ring-border">
              <HugeiconsIcon icon={MessageMultiple02Icon} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="font-medium">2 casos fuera de política</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Solicitaron un plan que supera las 3 cuotas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
