import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { formatCompactARS } from "@/lib/format"
import { cn } from "@/lib/utils"

export type RecoveryTrendItem = {
  month: string
  amountCents: number
}

export const DEMO_RECOVERY_TREND_DATA: RecoveryTrendItem[] = [
  { month: "Abr", amountCents: 420_000_000 },
  { month: "May", amountCents: 510_000_000 },
  { month: "Jun", amountCents: 580_000_000 },
  { month: "Jul", amountCents: 650_000_000 },
  { month: "Ago", amountCents: 740_000_000 },
  { month: "Sep", amountCents: 840_000_000 },
]

const chartConfig = {
  amountCents: {
    label: "Monto recuperado",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function formatAxisCents(cents: number) {
  const pesos = cents / 100
  if (pesos === 0) return "$ 0"
  if (Math.abs(pesos) >= 1_000_000) {
    return `${(pesos / 1_000_000).toLocaleString("es-AR", {
      maximumFractionDigits: 1,
    })}M`
  }
  if (Math.abs(pesos) >= 1_000) {
    return `${Math.round(pesos / 1_000)}k`
  }
  return `$ ${Math.round(pesos)}`
}

type RecoveryTrendChartProps = {
  data?: RecoveryTrendItem[]
  description?: string
  seriesLabel?: string
  className?: string
  compact?: boolean
}

export function RecoveryTrendChart({
  data = DEMO_RECOVERY_TREND_DATA,
  description = "Monto recuperado por mes en los últimos 6 meses.",
  seriesLabel = "Monto recuperado",
  className,
  compact = false,
}: RecoveryTrendChartProps) {
  const hasActivity = data.some((point) => point.amountCents > 0)
  const config: ChartConfig = {
    amountCents: {
      ...chartConfig.amountCents,
      label: seriesLabel,
    },
  }

  return (
    <Card className={cn(className)} size={compact ? "sm" : "default"}>
      <CardHeader>
        <CardTitle>Evolución del recupero</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasActivity ? (
          <div
            className={cn(
              "flex items-center justify-center text-center text-sm text-muted-foreground",
              compact ? "h-[140px]" : "h-[220px]"
            )}
          >
            Todavía no hay cobros ni acuerdos registrados en este período.
          </div>
        ) : (
          <ChartContainer
            config={config}
            className={cn("w-full", compact ? "h-[140px]" : "h-[220px]")}
          >
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={52}
                tickFormatter={(value) => formatAxisCents(Number(value))}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCompactARS(Number(value))}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="amountCents"
                stroke="var(--color-amountCents)"
                fill="var(--color-amountCents)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
