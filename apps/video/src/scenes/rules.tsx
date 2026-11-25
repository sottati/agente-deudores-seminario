import { CalculatorIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { easeInOut, formatARS, pop, progress, typed } from "../lib/anim"
import { FeatureCaption } from "../ui/feature-caption"
import { Slider } from "../ui/product"
import { Backdrop, Glow, Stage, Zoom } from "../ui/stage"

export function RulesScene() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const enter = pop(frame, fps, 6, 18)
  const installments = Math.round(1 + progress(frame, 40, 34, easeInOut) * 2)
  const waiver = Math.round(progress(frame, 58, 34, easeInOut) * 15)
  const downPayment = Math.round(progress(frame, 76, 34, easeInOut) * 30)
  const threshold = progress(frame, 96, 18)
  const pressed = progress(frame, 146, 5) - progress(frame, 151, 8)
  const active = frame >= 150
  const margin = pop(frame, fps, 158, 16)

  return (
    <Stage>
      <Backdrop intensity={0.45} />
      <AbsoluteFill className="flex-row items-center justify-between pr-[150px] pl-[150px]">
        <div className="flex flex-col">
          <FeatureCaption
            step="01"
            eyebrow="Reglas del agente"
            title="Definís la política. El agente la respeta."
            body="Cuotas, anticipo, quitas y umbral de derivación. Un motor de reglas determinístico calcula cada oferta: el modelo no puede salirse de ese margen."
          />
          <div
            className="mt-12 self-start"
            style={{
              opacity: margin,
              transform: `translateY(${(1 - margin) * 40}px) scale(${0.92 + margin * 0.08})`,
            }}
          >
            <Zoom factor={1.6}>
              <Card size="sm" className="w-[280px] shadow-2xl ring-primary/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <span className="flex size-6 items-center justify-center rounded-md bg-primary/15 text-primary">
                      <HugeiconsIcon
                        icon={CalculatorIcon}
                        className="size-3.5"
                        strokeWidth={2}
                      />
                    </span>
                    Margen de negociación
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-1 text-xs">
                  <Row label="Plan máximo" value="3 cuotas" />
                  <Row label="Anticipo" value="$ 60.400" />
                  <Row label="Quita de intereses" value="- $ 5.400" good />
                  <Row label="Total mínimo" value="$ 181.000" strong />
                </CardContent>
              </Card>
            </Zoom>
          </div>
        </div>

        <div
          className="relative"
          style={{
            opacity: enter,
            transform: `translateY(${(1 - enter) * 60}px) perspective(1600px) rotateY(${(1 - enter) * -14}deg)`,
          }}
        >
          <Glow opacity={0.6} />
          <Zoom factor={1.95}>
            <Card size="sm" className="w-[420px] shadow-2xl">
              <CardHeader className="border-b pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm">Reglas del agente</CardTitle>
                    <CardDescription className="text-xs">
                      Consorcios del Sur · Unidad 4B
                    </CardDescription>
                  </div>
                  <Badge
                    variant={active ? "secondary" : "outline"}
                    className="shrink-0"
                  >
                    {active ? "Política activa" : "Sin activar"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 pt-1">
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    Saldo adeudado
                  </span>
                  <Input
                    readOnly
                    value={typed("$ 186.400", frame, 18, 22) || " "}
                    className="h-8 text-sm font-medium tabular-nums"
                  />
                </div>
                <Slider
                  label="Cantidad máxima de cuotas"
                  display={`${installments} ${installments === 1 ? "cuota" : "cuotas"}`}
                  percent={((installments - 1) / 5) * 100}
                />
                <Slider
                  label="Quita de intereses en cuotas"
                  display={`${waiver} %`}
                  percent={(waiver / 30) * 100}
                />
                <Slider
                  label="Anticipo mínimo"
                  display={`${downPayment} %`}
                  percent={(downPayment / 50) * 100}
                />
                <div
                  className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-xs"
                  style={{ opacity: 0.35 + threshold * 0.65 }}
                >
                  <span className="text-muted-foreground">
                    Derivar a una persona desde
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatARS(500_000 * threshold)}
                  </span>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  variant={active ? "secondary" : "default"}
                  style={{ transform: `scale(${1 - pressed * 0.04})` }}
                >
                  {active ? "Pausar agente" : "Activar agente"}
                </Button>
              </CardContent>
            </Card>
          </Zoom>
        </div>
      </AbsoluteFill>
    </Stage>
  )
}

function Row({
  label,
  value,
  good,
  strong,
}: {
  label: string
  value: string
  good?: boolean
  strong?: boolean
}) {
  return (
    <div
      className={
        strong
          ? "mt-1 flex justify-between border-t pt-1.5 font-semibold"
          : "flex justify-between"
      }
    >
      <span className={strong ? "" : "text-muted-foreground"}>{label}</span>
      <span className={good ? "text-emerald-400 tabular-nums" : "tabular-nums"}>
        {value}
      </span>
    </div>
  )
}
