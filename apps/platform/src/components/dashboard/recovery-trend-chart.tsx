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
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

const recoveryTrendData = [
  { month: "Abr", amount: 4.2 },
  { month: "May", amount: 5.1 },
  { month: "Jun", amount: 5.8 },
  { month: "Jul", amount: 6.5 },
  { month: "Ago", amount: 7.4 },
  { month: "Sep", amount: 8.4 },
]

const chartConfig = {
  amount: {
    label: "Monto recuperado",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function formatMillions(value: number) {
  return `$ ${value.toLocaleString("es-AR", { maximumFractionDigits: 1 })} M`
}

type RecoveryTrendChartProps = {
  className?: string
  compact?: boolean
}

export function RecoveryTrendChart({
  className,
  compact = false,
}: RecoveryTrendChartProps) {
  return (
    <Card className={cn(className)} size={compact ? "sm" : "default"}>
      <CardHeader>
        <CardTitle>Evolución del recupero</CardTitle>
        <CardDescription>
          Monto recuperado por mes en los últimos 6 meses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className={cn("w-full", compact ? "h-[140px]" : "h-[220px]")}
        >
          <AreaChart
            data={recoveryTrendData}
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
              width={48}
              tickFormatter={(value) => `${value}M`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatMillions(Number(value))}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="var(--color-amount)"
              fill="var(--color-amount)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
