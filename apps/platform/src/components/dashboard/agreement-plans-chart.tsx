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
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

const agreementPlansData = [
  { plan: "pagoUnico", count: 14 },
  { plan: "dosCuotas", count: 18 },
  { plan: "tresCuotas", count: 10 },
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
} satisfies ChartConfig

type AgreementPlansChartProps = {
  className?: string
  compact?: boolean
}

export function AgreementPlansChart({
  className,
  compact = false,
}: AgreementPlansChartProps) {
  return (
    <Card className={cn(className)} size={compact ? "sm" : "default"}>
      <CardHeader>
        <CardTitle>Acuerdos por plan</CardTitle>
        <CardDescription>
          Distribución de los 42 acuerdos cerrados este mes.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              data={agreementPlansData}
              dataKey="count"
              nameKey="plan"
              innerRadius={52}
              outerRadius={80}
              strokeWidth={2}
            >
              {agreementPlansData.map((entry) => (
                <Cell
                  key={entry.plan}
                  fill={`var(--color-${entry.plan})`}
                />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="plan" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/3 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
