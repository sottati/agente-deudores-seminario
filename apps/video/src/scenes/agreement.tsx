import { PrinterIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { easeInOut, pop, progress, rise, typed } from "../lib/anim"
import { fontMono } from "../lib/fonts"
import { FeatureCaption } from "../ui/feature-caption"
import { Backdrop, Glow, Stage, Zoom } from "../ui/stage"

const HASH = "9f2c4e81b07a3d6f5e19c2a84b7d0e63f1a95c2847be0d3a6c71f48e92b5d0a7"

const installments = [
  { n: 1, due: "20/11/2026", amount: "$ 60.400" },
  { n: 2, due: "20/12/2026", amount: "$ 60.300" },
  { n: 3, due: "20/01/2027", amount: "$ 60.300" },
]

export function AgreementScene() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enter = pop(frame, fps, 0, 18)
  // Paneo vertical por el acta, como si se recorriera el documento.
  const pan = interpolate(
    progress(frame, 40, 150, easeInOut),
    [0, 1],
    [70, -360]
  )
  const paid = frame >= 120
  const press = progress(frame, 114, 5) - progress(frame, 119, 8)

  return (
    <Stage>
      <Backdrop intensity={0.45} />
      <AbsoluteFill className="flex-row items-center justify-between px-[150px]">
        <div
          className="relative self-start"
          style={{
            opacity: enter,
            transform: `translateY(${pan + (1 - enter) * 80}px)`,
          }}
        >
          <Glow opacity={0.5} />
          <Zoom factor={1.6}>
            <article className="grid w-[600px] gap-5 rounded-xl bg-card p-6 text-sm shadow-2xl ring-1 ring-foreground/10">
              <header className="grid gap-1 border-b pb-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs tracking-wide text-muted-foreground uppercase">
                    Acta de acuerdo de pago · Consorcios del Sur
                  </p>
                  <Button size="sm">
                    <HugeiconsIcon
                      icon={PrinterIcon}
                      data-icon="inline-start"
                    />
                    Imprimir / PDF
                  </Button>
                </div>
                <h2 className="text-xl font-semibold">
                  3 cuotas por $ 181.000
                </h2>
                <p className="text-muted-foreground">
                  Aceptado el 20/11/2026 10:21
                </p>
              </header>

              <section
                className="grid grid-cols-2 gap-4"
                style={rise(frame, 14, 16)}
              >
                <div>
                  <h3 className="mb-1 font-medium">Acreedor</h3>
                  <p>Consorcios del Sur</p>
                </div>
                <div>
                  <h3 className="mb-1 font-medium">Deudor</h3>
                  <p>Responsable de pago</p>
                  <p className="text-muted-foreground">
                    Unidad 4B · Av. Rivadavia 2840
                  </p>
                </div>
              </section>

              <section className="grid gap-2" style={rise(frame, 24, 16)}>
                <h3 className="font-medium">Deuda regularizada</h3>
                <p>Expensas ordinarias (vencidas el 10/08/2026)</p>
                <dl className="grid max-w-sm gap-1">
                  <Amount label="Capital" value="$ 150.400" />
                  <Amount label="Intereses" value="$ 36.000" />
                  <Amount label="Deuda original" value="$ 186.400" />
                  <Amount label="Quita de intereses" value="- $ 5.400" />
                  <Amount label="Total acordado" value="$ 181.000" strong />
                </dl>
              </section>

              <section className="grid gap-2" style={rise(frame, 34, 16)}>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-medium">Cronograma de pagos</h3>
                  <p className="text-xs text-muted-foreground">
                    Cobrado: {paid ? "$ 60.400" : "$ 0"} de $ 181.000
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cuota</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead className="text-right">Importe</TableHead>
                      <TableHead className="text-right">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {installments.map((row, i) => {
                      const isPaid = row.n === 1 && paid
                      return (
                        <TableRow
                          key={row.n}
                          style={rise(frame, 44 + i * 8, 14, 16)}
                        >
                          <TableCell>{row.n}</TableCell>
                          <TableCell>{row.due}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {row.amount}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant={isPaid ? "secondary" : "outline"}
                              style={
                                row.n === 1
                                  ? { transform: `scale(${1 - press * 0.06})` }
                                  : undefined
                              }
                            >
                              {isPaid ? "Pagada 20/11/2026" : "Marcar pagada"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </section>

              <section
                className="grid gap-2 border-t pt-4 text-xs text-muted-foreground"
                style={rise(frame, 70, 16)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">
                    Evidencia de aceptación
                  </h3>
                  <Badge variant="secondary">Trazable</Badge>
                </div>
                <p>
                  El deudor aceptó expresamente los términos mediante el botón
                  "Acepto los términos del plan de pago" en el canal de
                  negociación de pacta.ai.
                </p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 break-all">
                  <dt>Fecha y hora</dt>
                  <dd>20/11/2026 10:21</dd>
                  <dt>Hash SHA-256 de la conversación</dt>
                  <dd
                    style={{ fontFamily: fontMono }}
                    className="text-foreground"
                  >
                    {typed(HASH, frame, 96, 70)}
                  </dd>
                  <dt>Versión de plantilla / motor</dt>
                  <dd>1.0.0 / 0.1.0</dd>
                </dl>
              </section>
            </article>
          </Zoom>
        </div>

        <FeatureCaption
          step="03"
          eyebrow="Registro"
          title="Cada acuerdo queda documentado."
          body="Un acta con cronograma, reglas aplicadas y evidencia de aceptación: fecha, hora y hash SHA-256 de la conversación."
          chips={[
            { label: "Cronograma de cuotas y cobros", at: 50 },
            { label: "Evidencia inalterable", at: 100 },
            { label: "Exportable a PDF", at: 130 },
          ]}
          width={640}
        />
      </AbsoluteFill>
    </Stage>
  )
}

function Amount({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={strong ? "font-semibold tabular-nums" : "tabular-nums"}>
        {value}
      </dd>
    </div>
  )
}
