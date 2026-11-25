import {
  Alert02Icon,
  Clock03Icon,
  MessageMultiple02Icon,
  SentIcon,
} from "@hugeicons/core-free-icons"
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

import { pop, progress, rise, typed } from "../lib/anim"
import { FeatureCaption } from "../ui/feature-caption"
import { ChatBubble, Grow } from "../ui/product"
import { Backdrop, Glow, Stage, Zoom } from "../ui/stage"

const REPLY = "Hola, te escribe la administración. Veamos juntos una opción."

export function HandoffScene() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const attention = pop(frame, fps, 4, 18)
  // La tarjeta de alertas pasa a segundo plano cuando se abre la conversación.
  const back = progress(frame, 50, 24)
  const convo = pop(frame, fps, 56, 18)
  const draft = typed(REPLY, frame, 118, 34)
  const sent = frame >= 172

  return (
    <Stage>
      <Backdrop intensity={0.45} />
      <AbsoluteFill className="flex-row items-center justify-between px-[150px]">
        <FeatureCaption
          step="04"
          eyebrow="Derivación"
          title="Vos intervenís cuando hace falta."
          body="Si el deudor pide algo fuera de política o la deuda supera tu umbral, el agente pausa y la conversación pasa a tu equipo con todo el contexto."
          width={640}
        />

        <div className="relative h-[880px] w-[960px]">
          <div
            className="absolute top-[250px] left-[200px]"
            style={{
              opacity: attention * (1 - back * 0.6),
              filter: `blur(${back * 3}px)`,
              transformOrigin: "0% 0%",
              transform: `translate(${back * -200}px, ${(1 - attention) * 50 + back * -210}px) scale(${1 - back * 0.12})`,
            }}
          >
            <Zoom factor={1.6}>
              <Card size="sm" className="w-[330px] shadow-2xl">
                <CardHeader>
                  <CardTitle>Requieren atención</CardTitle>
                  <CardDescription>
                    Conversaciones que necesitan una decisión.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <AttentionItem
                    icon={Clock03Icon}
                    title="6 respuestas pendientes"
                    detail="La más antigua espera hace 18 horas."
                    style={rise(frame, 16, 16)}
                  />
                  <AttentionItem
                    icon={MessageMultiple02Icon}
                    title="2 casos fuera de política"
                    detail="Solicitaron un plan que supera las 3 cuotas."
                    style={rise(frame, 26, 16)}
                    highlight={progress(frame, 40, 12)}
                  />
                </CardContent>
              </Card>
            </Zoom>
          </div>

          <div
            className="absolute right-0 bottom-0"
            style={{
              opacity: convo,
              transform: `translate(${(1 - convo) * 60}px, ${(1 - convo) * 30}px)`,
            }}
          >
            <Glow opacity={0.55} />
            <Zoom factor={1.6}>
              <Card size="sm" className="w-[400px] shadow-2xl">
                <CardHeader className="border-b pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm">
                        Unidad 7A · Sarmiento 912
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Conversación con la administración
                      </CardDescription>
                    </div>
                    <Badge variant="destructive">Derivada</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col pt-3">
                  <ChatBubble from="debtor" time="09:42">
                    ¿Puedo pagarlo en 12 cuotas?
                  </ChatBubble>
                  <div
                    className="mt-3 flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300"
                    style={rise(frame, 70, 10)}
                  >
                    <HugeiconsIcon
                      icon={Alert02Icon}
                      className="mt-px size-3.5 shrink-0"
                      strokeWidth={2}
                    />
                    Pidió un plan fuera de política. El agente derivó el caso a
                    la administración.
                  </div>
                  <div className="mt-3">
                    <Grow p={progress(frame, 172, 14)}>
                      <div className="flex justify-start">
                        <div className="max-w-[82%] rounded-2xl rounded-tl-sm border border-primary/30 bg-primary/10 px-3 py-2 text-xs leading-relaxed">
                          <p className="mb-0.5 text-[0.6rem] font-medium tracking-wide text-primary uppercase">
                            Administración
                          </p>
                          {REPLY}
                        </div>
                      </div>
                    </Grow>
                  </div>
                  <p
                    className="mt-1 rounded-lg bg-muted/60 px-3 py-2 text-[0.7rem] text-muted-foreground"
                    style={rise(frame, 86, 10)}
                  >
                    El agente está en pausa: respondé desde acá o devolvé la
                    conversación al agente.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Input
                      readOnly
                      value={sent ? "" : draft}
                      placeholder="Escribí como administración…"
                      className="h-8 min-w-0 flex-1 text-xs"
                    />
                    <Button size="icon-sm" aria-label="Enviar">
                      <HugeiconsIcon icon={SentIcon} strokeWidth={2} />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    Devolver al agente
                  </Button>
                </CardContent>
              </Card>
            </Zoom>
          </div>
        </div>
      </AbsoluteFill>
    </Stage>
  )
}

function AttentionItem({
  icon,
  title,
  detail,
  style,
  highlight = 0,
}: {
  icon: typeof Clock03Icon
  title: string
  detail: string
  style?: React.CSSProperties
  highlight?: number
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-lg bg-muted/60 p-3 ring-primary/60"
      style={{
        ...style,
        boxShadow: `0 0 0 ${highlight * 1.5}px rgba(195,25,82,${highlight * 0.8})`,
      }}
    >
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-primary ring-1 ring-border">
        <HugeiconsIcon icon={icon} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  )
}
