import {
  Alert02Icon,
  Call02Icon,
  File01Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AbsoluteFill, useCurrentFrame } from "remotion"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card"

import { progress, rise } from "../lib/anim"
import { ACCENT } from "../ui/feature-caption"
import { Backdrop, Stage, Zoom } from "../ui/stage"

const pains = [
  { text: "Expensas vencidas.", at: 8 },
  { text: "Llamados incómodos.", at: 26 },
  { text: "Planillas a mano.", at: 44 },
]

const notices = [
  {
    icon: Alert02Icon,
    title: "Unidad 7A · Sarmiento 912",
    detail: "3 meses de expensas impagas",
    badge: { label: "En mora", variant: "destructive" as const },
    x: 40,
    y: 0,
    rot: -3,
    at: 14,
  },
  {
    icon: Mail01Icon,
    title: "Recordatorio enviado",
    detail: "Sin respuesta hace 12 días",
    badge: { label: "Pendiente", variant: "outline" as const },
    x: 0,
    y: 118,
    rot: 2,
    at: 30,
  },
  {
    icon: Call02Icon,
    title: "Llamar al responsable de pago",
    detail: "No atiende · reintentar el lunes",
    badge: { label: "3er intento", variant: "outline" as const },
    x: 70,
    y: 236,
    rot: -1.5,
    at: 46,
  },
  {
    icon: File01Icon,
    title: "morosos_final_v3.xlsx",
    detail: "Actualizada a mano · hace 9 días",
    badge: { label: "Desactualizada", variant: "secondary" as const },
    x: 20,
    y: 354,
    rot: 2.5,
    at: 62,
  },
]

export function ProblemScene() {
  const frame = useCurrentFrame()
  const dim = progress(frame, 88, 18)
  const punch = progress(frame, 92, 24)

  return (
    <Stage>
      <Backdrop intensity={0.55} />
      <AbsoluteFill className="flex-row items-center justify-between px-[150px]">
        <div className="flex flex-col">
          <p
            className="mb-8 text-[22px] font-medium tracking-[0.18em] text-white/55 uppercase"
            style={rise(frame, 0)}
          >
            El problema
          </p>
          {pains.map((pain) => (
            <p
              key={pain.text}
              className="text-[86px] leading-[1.08] font-semibold tracking-[-0.045em] text-white"
              style={{
                ...rise(frame, pain.at, 36),
                opacity: progress(frame, pain.at, 22) * (1 - dim * 0.7),
              }}
            >
              {pain.text}
            </p>
          ))}
          <p
            className="mt-6 text-[86px] leading-[1.08] font-semibold tracking-[-0.045em]"
            style={{ ...rise(frame, 92, 40), color: ACCENT }}
          >
            Cada cobro, una pelea.
          </p>
          <p
            className="mt-6 max-w-[760px] text-[28px] leading-snug text-white/60"
            style={{
              opacity: punch,
              transform: `translateY(${(1 - punch) * 16}px)`,
            }}
          >
            Y la relación con los vecinos del consorcio se desgasta.
          </p>
        </div>

        <div className="relative h-[560px] w-[620px]">
          {notices.map((n, i) => {
            const p = progress(frame, n.at, 24)
            const drift = Math.sin((frame + i * 20) / 22) * 4
            return (
              <div
                key={n.title}
                className="absolute"
                style={{
                  left: n.x,
                  top: n.y + drift,
                  opacity: p * (1 - dim * 0.55),
                  transform: `translateX(${(1 - p) * 80}px) rotate(${n.rot}deg) scale(${1 - dim * 0.04})`,
                  filter: `blur(${dim * 2}px)`,
                }}
              >
                <Zoom factor={1.7}>
                  <Card size="sm" className="w-[320px] shadow-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <HugeiconsIcon
                            icon={n.icon}
                            className="size-4"
                            strokeWidth={2}
                          />
                        </span>
                        <span className="truncate">{n.title}</span>
                      </CardTitle>
                      <CardDescription className="pl-9 text-xs">
                        {n.detail}
                      </CardDescription>
                      <CardAction>
                        <Badge variant={n.badge.variant}>{n.badge.label}</Badge>
                      </CardAction>
                    </CardHeader>
                  </Card>
                </Zoom>
              </div>
            )
          })}
        </div>
      </AbsoluteFill>
    </Stage>
  )
}
