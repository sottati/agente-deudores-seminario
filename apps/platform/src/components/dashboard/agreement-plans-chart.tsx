import { Cell, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export type AgreementPlanSlice = {
  installments: number
  count: number
}

export const DEMO_AGREEMENT_PLANS_DATA: AgreementPlanSlice[] = [
  { installments: 1, count: 14 },
  { installments: 2, count: 18 },
  { installments: 3, count: 10 },
]

const chartConfig = {
  pagoUnico: {
    label: "Pago único",
    color: "var(--chart-1)",
  },
  dosCuotas: {
    label: "2 cuotas",
    color: "var(--chart-3)",
  },
  tresCuotas: {
    label: "3 cuotas",
    color: "var(--primary)",
  },
  masCuotas: {
    label: "4+ cuotas",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

type PlanBucketKey = keyof typeof chartConfig

function toPlanBucket(installments: number): PlanBucketKey {
  if (installments <= 1) return "pagoUnico"
  if (installments === 2) return "dosCuotas"
  if (installments === 3) return "tresCuotas"
  return "masCuotas"
}

type AgreementPlansChartProps = {
  data?: AgreementPlanSlice[]
  description?: string
  className?: string
  compact?: boolean
}

export function AgreementPlansChart({
  data = DEMO_AGREEMENT_PLANS_DATA,
  description,
  className,
  compact = false,
}: AgreementPlansChartProps) {
  const bucketTotals = new Map<PlanBucketKey, number>()
  for (const item of data) {
    if (item.count <= 0) continue
    const key = toPlanBucket(item.installments)
    bucketTotals.set(key, (bucketTotals.get(key) ?? 0) + item.count)
  }

  const chartData = (
    ["pagoUnico", "dosCuotas", "tresCuotas", "masCuotas"] as PlanBucketKey[]
  )
    .filter((key) => (bucketTotals.get(key) ?? 0) > 0)
    .map((plan) => ({
      plan,
      count: bucketTotals.get(plan) ?? 0,
    }))

  const totalCount = chartData.reduce((sum, item) => sum + item.count, 0)
  const resolvedDescription =
    description ??
    (totalCount > 0
      ? `Distribución de los ${totalCount} acuerdos cerrados.`
      : "Sin acuerdos cerrados registrados todavía.")

  return (
    <Card className={cn(className)} size={compact ? "sm" : "default"}>
      <CardHeader>
        <CardTitle>Acuerdos por plan</CardTitle>
        <CardDescription>{resolvedDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {totalCount === 0 ? (
          <div
            className={cn(
              "flex items-center justify-center text-center text-sm text-muted-foreground",
              compact ? "h-[140px]" : "h-[220px]"
            )}
          >
            Todavía no hay acuerdos cerrados para distribuir por plan.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className={cn(
              "mx-auto aspect-square w-full",
              compact ? "max-h-[140px]" : "max-h-[220px]"
            )}
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="plan" hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="plan"
                innerRadius={52}
                outerRadius={80}
                strokeWidth={2}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.plan} fill={`var(--color-${entry.plan})`} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="plan" />}
                className="-translate-y-2 flex-wrap gap-2 *:basis-1/3 *:justify-center"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
