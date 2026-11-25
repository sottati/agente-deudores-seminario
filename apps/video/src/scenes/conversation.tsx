import { CheckmarkCircle02Icon, SentIcon } from "@hugeicons/core-free-icons"
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
import { cn } from "@/lib/utils"

import { pop, progress } from "../lib/anim"
import { FeatureCaption } from "../ui/feature-caption"
import { ChatBubble, Grow, TypingBubble } from "../ui/product"
import { Backdrop, Glow, Isotipo, Stage, Zoom } from "../ui/stage"

// Tiempos (frames locales) de cada evento de la conversación.
const T = {
  greeting: 14,
  debtor: 62,
  typingFrom: 84,
  offerText: 120,
  offerCard: 158,
  accept: 236,
  confirmed: 248,
}

export function ConversationScene() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enter = pop(frame, fps, 0, 18)

  const g = (at: number) => progress(frame, at, 16)
  const typing = frame >= T.typingFrom && frame < T.offerText
  const typingP =
    progress(frame, T.typingFrom, 10) *
    (1 - progress(frame, T.offerText - 4, 4))
  const pressed =
    progress(frame, T.accept - 6, 5) - progress(frame, T.accept, 8)
  const accepted = frame >= T.accept
  const closed = frame >= T.confirmed

  return (
    <Stage>
      <Backdrop intensity={0.45} />
      <AbsoluteFill className="flex-row items-center justify-between px-[150px]">
        <FeatureCaption
          step="02"
          eyebrow="Negociación"
          title="El agente negocia por vos, a cualquier hora."
          body="Conversa con cada deudor por un link seguro, verifica su identidad y propone planes dentro de tu política."
          chips={[
            { label: "Aviso de bot y de privacidad", at: 24 },
            { label: "Identidad verificada con el DNI", at: 44 },
            {
              label: "Cifras validadas por el motor de reglas",
              at: T.offerCard + 6,
            },
            { label: "Aceptación expresa del deudor", at: T.confirmed },
          ]}
        />

        <div
          className="relative"
          style={{
            opacity: enter,
            transform: `translateY(${(1 - enter) * 60}px)`,
          }}
        >
          <Glow opacity={0.55} />
          <Zoom factor={1.8}>
            <Card
              size="sm"
              className="flex h-[560px] w-[440px] flex-col shadow-2xl"
            >
              <CardHeader className="shrink-0 border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <Isotipo size={28} style={{ borderRadius: 7 }} />
                  <div className="min-w-0">
                    <CardTitle className="text-sm">
                      Consorcios del Sur
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {closed
                        ? "Acuerdo registrado"
                        : typing
                          ? "Agente escribiendo…"
                          : "Agente negociando · en curso"}
                    </CardDescription>
                  </div>
                  <span
                    className={cn(
                      "ml-auto size-2 shrink-0 rounded-full",
                      typing ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{
                      opacity: typing ? 0.5 + Math.sin(frame / 4) * 0.5 : 1,
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-1 flex-col pt-3">
                <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden">
                  <Grow p={g(T.greeting)}>
                    <ChatBubble from="agent" time="10:14">
                      Hola, soy el asistente virtual de Consorcios del Sur. Te
                      escribo por un saldo de $ 186.400 en expensas vencidas de
                      la Unidad 4B.
                    </ChatBubble>
                  </Grow>
                  <Grow p={g(T.debtor)}>
                    <ChatBubble from="debtor" time="10:18">
                      Sí, pero no puedo pagar todo junto este mes.
                    </ChatBubble>
                  </Grow>
                  {frame < T.offerText + 2 && (
                    <Grow p={typingP}>
                      <TypingBubble frame={frame} />
                    </Grow>
                  )}
                  <Grow p={g(T.offerText)}>
                    <ChatBubble from="agent" time="10:18">
                      Te entiendo. Puedo ofrecerte 3 cuotas con 15 % de quita
                      sobre los intereses: un anticipo de $ 60.400 y 2 cuotas de
                      $ 60.300.
                    </ChatBubble>
                  </Grow>
                  <Grow p={g(T.offerCard)}>
                    <OfferCard accepted={accepted} pressed={pressed} />
                  </Grow>
                  <Grow p={g(T.confirmed)}>
                    <div className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400">
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        className="size-4"
                        strokeWidth={2}
                      />
                      Acuerdo de pago confirmado.
                    </div>
                  </Grow>
                </div>

                <div className="shrink-0 border-t pt-3">
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      placeholder="Escribí tu mensaje…"
                      className="h-8 min-w-0 flex-1 text-xs"
                    />
                    <Button size="icon-sm" disabled aria-label="Enviar mensaje">
                      <HugeiconsIcon icon={SentIcon} strokeWidth={2} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Zoom>
        </div>
      </AbsoluteFill>
    </Stage>
  )
}

/** Réplica compacta de la "Propuesta formal de pago" de debtor-chat.tsx. */
function OfferCard({
  accepted,
  pressed,
}: {
  accepted: boolean
  pressed: number
}) {
  return (
    <section className="rounded-xl border border-primary/25 bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2 border-b pb-2">
        <div>
          <p className="text-[0.6rem] font-medium tracking-wide text-muted-foreground uppercase">
            Propuesta formal de pago
          </p>
          <h2 className="mt-0.5 text-sm font-semibold">
            3 cuotas · <span className="tabular-nums">$ 181.000</span>
          </h2>
        </div>
        <Badge variant="secondary" className="text-[0.6rem]">
          Vigente hasta 21/11 10:18
        </Badge>
      </div>
      <dl className="mt-2 grid gap-1 text-xs">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Anticipo (cuota 1)</dt>
          <dd className="tabular-nums">$ 60.400</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Quita de intereses</dt>
          <dd className="font-medium text-emerald-400 tabular-nums">
            - $ 5.400
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-t pt-1 font-semibold">
          <dt>Total a pagar</dt>
          <dd className="tabular-nums">$ 181.000</dd>
        </div>
      </dl>
      <Button
        size="sm"
        className="mt-2.5 w-full"
        variant={accepted ? "secondary" : "default"}
        style={{ transform: `scale(${1 - pressed * 0.04})` }}
      >
        {accepted
          ? "Términos aceptados"
          : "Acepto los términos del plan de pago"}
      </Button>
    </section>
  )
}
