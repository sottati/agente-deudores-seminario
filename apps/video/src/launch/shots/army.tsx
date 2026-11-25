import type { ReactNode } from "react"
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion"

import { Badge } from "@/components/ui/badge"

import { easeInOut, progress } from "../../lib/anim"
import { ChatBubble, TypingBubble } from "../../ui/product"
import { Isotipo } from "../../ui/stage"
import {
  C,
  Camera,
  Float,
  Ground,
  Headline,
  Iris,
  LaunchStage,
  Mono,
  Panel,
  TILE_COUNT,
  TileGrid,
  armyStatus,
  countStatuses,
  sentAt,
  tileCenter,
} from "../kit"
import { PORTFOLIO_GRID } from "./portfolio"

const GRID_A = { x: 300, y: 150, width: 1320, height: 780, gap: 14 }
const CENTER = { x: 960, y: 540 }
const BURSTS = [28, 48, 68, 88]

/** 4A · Desde el isotipo salen los agentes, en ráfagas, hacia cada deudor. */
export function ShotLaunch() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const t = frame
  const shake = BURSTS.reduce((acc, b) => {
    if (frame < b) return acc
    return acc + 16 * Math.exp(-(frame - b) / 5)
  }, 0)
  const sx = (random(`sx${frame}`) - 0.5) * shake
  const sy = (random(`sy${frame}`) - 0.5) * shake
  const sent = Array.from({ length: TILE_COUNT }, (_, i) => i).filter(
    (i) => t >= sentAt(i)
  ).length
  const isoPop = spring({ frame, fps, config: { damping: 12, mass: 0.7 } })
  const pulse = BURSTS.reduce(
    (acc, b) =>
      acc + (frame >= b - 16 ? 0.08 * Math.exp(-(frame - b + 16) / 6) : 0),
    0
  )

  return (
    <LaunchStage>
      <Ground kind="mag" />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <TileGrid
          {...GRID_A}
          on="mag"
          status={(i) => armyStatus(i, t)}
          style={{ opacity: progress(frame, 0, 12) }}
        />
        <svg
          width={1920}
          height={1080}
          style={{ position: "absolute", inset: 0 }}
        >
          {Array.from({ length: TILE_COUNT }, (_, i) => {
            const end = sentAt(i)
            const p = interpolate(t, [end - 16, end], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
            if (p <= 0 || p >= 1) return null
            const to = tileCenter(i, GRID_A)
            const mx = (CENTER.x + to.x) / 2 + (to.y - CENTER.y) * 0.35
            const my = (CENTER.y + to.y) / 2 - (to.x - CENTER.x) * 0.25
            const at = (q: number) => ({
              x: (1 - q) ** 2 * CENTER.x + 2 * (1 - q) * q * mx + q * q * to.x,
              y: (1 - q) ** 2 * CENTER.y + 2 * (1 - q) * q * my + q * q * to.y,
            })
            const e = easeInOut(p)
            const head = at(e)
            const tail = at(Math.max(0, e - 0.18))
            return (
              <g key={i}>
                <line
                  x1={tail.x}
                  y1={tail.y}
                  x2={head.x}
                  y2={head.y}
                  stroke="#FFFFFF"
                  strokeOpacity={0.55}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                <circle cx={head.x} cy={head.y} r={6} fill="#FFFFFF" />
              </g>
            )
          })}
        </svg>
        <AbsoluteFill className="items-center justify-center">
          <div
            style={{
              transform: `scale(${isoPop * (1 + pulse)})`,
              borderRadius: 40,
              boxShadow: `0 0 0 10px ${C.blush}, 0 0 0 26px rgba(195,25,82,.9), 0 30px 80px rgba(70,0,25,.6)`,
            }}
          >
            <Isotipo size={170} />
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <Float x={90} y={56} at={10} rot={-3}>
        <Panel on="mag" zoom={2} pad={12} radius={12}>
          <div className="flex items-baseline gap-3">
            <span className="size-2.5 rounded-sm bg-white" />
            <span className="text-sm text-muted-foreground">
              Agentes desplegados
            </span>
            <Mono style={{ fontSize: 26, fontWeight: 600 }}>{sent}</Mono>
          </div>
        </Panel>
      </Float>
    </LaunchStage>
  )
}

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

function clockText(step: number) {
  const total = 3 * 60 + 12 + step * 157
  const day = DAYS[(1 + Math.floor(total / 1440)) % 7]
  const m = total % 1440
  const hh = String(Math.floor(m / 60)).padStart(2, "0")
  const mm = String(m % 60).padStart(2, "0")
  return `${day} ${hh}:${mm}`
}

/** Reloj split-flap: cada carácter que cambia gira como un tablero de aeropuerto. */
function SplitFlap({ frame }: { frame: number }) {
  const step = Math.floor(frame / 6)
  const now = clockText(step)
  const prev = clockText(Math.max(0, step - 1))
  const angle = Math.max(0, 1 - (frame % 6) / 3) * 75
  return (
    <div className="flex gap-1">
      {now.split("").map((ch, i) =>
        ch === " " ? (
          <span key={i} className="w-2" />
        ) : (
          <span
            key={i}
            className="relative rounded-md px-1.5 py-1 text-base font-medium"
            style={{
              background: "#1A1A1A",
              color: "#FAFAFA",
              transform:
                ch !== prev[i] && step > 0 ? `rotateX(${angle}deg)` : undefined,
            }}
          >
            <Mono>{ch}</Mono>
            <span className="absolute inset-x-0 top-1/2 h-px bg-black/70" />
          </span>
        )
      )}
    </div>
  )
}

function Stat({
  dot,
  label,
  value,
  danger,
}: {
  dot: string
  label: string
  value: number
  danger?: boolean
}) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="size-2.5 rounded-sm" style={{ background: dot }} />
      <span
        className="text-sm"
        style={{ color: danger ? C.danger : undefined }}
      >
        {label}
      </span>
      <Mono style={{ fontSize: 24, fontWeight: 600 }}>{value}</Mono>
    </div>
  )
}

/** 4B · La cartera trabajando: estados reales, contadores y reloj en time-lapse. */
export function ShotWork() {
  const frame = useCurrentFrame()
  const t = 100 + frame * 2.1
  const c = countStatuses(t)
  const rz = interpolate(frame, [0, 150], [-12, 3])
  const rx = interpolate(frame, [0, 150], [42, 34])
  const dive = progress(frame, 128, 22, easeInOut)

  return (
    <LaunchStage>
      <Ground kind="dark" />
      <Camera scale={1 + dive * 0.4} oy={640}>
        <TileGrid
          {...PORTFOLIO_GRID}
          y={360}
          tilt={{ rx, rz }}
          status={(i) => armyStatus(i, t)}
        />
      </Camera>
      <Float x={80} y={60} rot={-4} at={2}>
        <Panel zoom={2} pad={10} radius={12}>
          <Stat dot="#3B3B3B" label="En conversación" value={c.talk} />
        </Panel>
      </Float>
      <Float x={560} y={150} rot={3} at={6} depth={1}>
        <Panel zoom={2} pad={10} radius={12}>
          <Stat dot="#8A2A4D" label="Ofertas" value={c.offer} />
        </Panel>
      </Float>
      <Float x={880} y={40} rot={-2} at={10}>
        <Panel tone="mag" zoom={2.3} pad={10} radius={12}>
          <Stat dot="#FFFFFF" label="Acordadas" value={c.ok} />
        </Panel>
      </Float>
      <Float x={1160} y={190} rot={5} at={14} depth={1}>
        <Panel zoom={2} pad={10} radius={12}>
          <Stat
            dot={C.danger}
            label="Requieren atención"
            value={c.alert}
            danger
          />
        </Panel>
      </Float>
      <Float x={1450} y={60} rot={2} at={18}>
        <Panel
          tone="light"
          zoom={1.7}
          pad={10}
          radius={12}
          style={{ perspective: 400 }}
        >
          <SplitFlap frame={frame} />
        </Panel>
      </Float>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 380,
          background:
            "linear-gradient(to top, rgba(22,21,22,.92), transparent)",
          opacity: 1 - dive,
        }}
      />
      <div style={{ position: "absolute", left: 110, top: 870, width: 1750 }}>
        <Headline
          text="Negocia con todos a la vez. A cualquier hora."
          at={24}
          size={80}
          out={124}
        />
      </div>
      <Iris
        p={progress(frame, 132, 18, easeInOut)}
        cx={960}
        cy={640}
        size0={36}
      >
        <Ground kind="mesh" />
      </Iris>
    </LaunchStage>
  )
}

function Bubble({
  children,
  width = 440,
}: {
  children: ReactNode
  width?: number
}) {
  return (
    <div
      className="dark text-foreground"
      style={{
        zoom: 2.3,
        width,
        filter: "drop-shadow(0 24px 30px rgba(0,0,0,.45))",
      }}
    >
      {children}
    </div>
  )
}

/** 4C · Dentro de un tile: la conversación, suelta, hasta el acuerdo. */
export function ShotChat() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const exit = progress(frame, 132, 18, easeInOut)
  const flip = progress(frame, 104, 10, easeInOut)
  const agreed = flip >= 0.5
  const popS = spring({
    frame: frame - 109,
    fps,
    config: { damping: 9, mass: 0.6 },
  })
  const badgeScale = agreed
    ? 1 + (1 - Math.min(1, popS)) * 0.4 + Math.max(0, popS - 1) * 0.6
    : 1

  return (
    <LaunchStage>
      <Ground kind="mesh" />
      <AbsoluteFill style={{ opacity: exit }}>
        <Ground kind="dark" />
      </AbsoluteFill>
      <Camera
        scale={interpolate(frame, [0, 130], [1, 1.06]) * (1 - exit * 0.85)}
      >
        <AbsoluteFill style={{ opacity: 1 - exit }}>
          <Float x={640} y={40} depth={2} at={2}>
            <Panel zoom={2} pad={8} radius={10} on="mesh">
              <span className="text-sm">Marta Gómez · Unidad 4B</span>
            </Panel>
          </Float>
          <Float x={130} y={130} rot={-2} at={6} from={[-90, 0]}>
            <Bubble width={460}>
              <ChatBubble from="agent" time="10:42">
                Hola Marta, soy el asistente virtual de la administración. Vi
                que hay $ 181.000 pendientes de expensas. ¿Lo charlamos?
              </ChatBubble>
            </Bubble>
          </Float>
          <Float x={830} y={380} rot={2} at={34} from={[90, 0]}>
            <Bubble width={420}>
              <ChatBubble from="debtor" time="10:44">
                Este mes no llego. ¿Se puede en cuotas?
              </ChatBubble>
            </Bubble>
          </Float>
          {frame >= 46 && frame < 62 && (
            <div style={{ position: "absolute", left: 130, top: 560 }}>
              <Bubble width={200}>
                <TypingBubble frame={frame} />
              </Bubble>
            </div>
          )}
          <Float x={200} y={540} rot={-3} at={62} pop>
            <Panel
              tone="light"
              on="mesh"
              zoom={2.4}
              pad={14}
              style={{ width: 300, border: `2px solid ${C.primary}` }}
            >
              <div className="text-xs text-muted-foreground">
                Propuesta formal
              </div>
              <div className="mt-0.5 text-2xl font-semibold tracking-tight tabular-nums">
                3 cuotas de $ 60.333
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Primera cuota en 10 días · válida 48 h
              </div>
            </Panel>
          </Float>
          <Float x={1120} y={720} rot={-1} at={94} from={[90, 0]}>
            <Bubble width={300}>
              <ChatBubble from="debtor" time="10:47">
                Dale, acepto.
              </ChatBubble>
            </Bubble>
          </Float>
          <Float x={1380} y={110} rot={6} at={20}>
            <div
              style={{
                zoom: 3,
                transform: `perspective(300px) rotateX(${flip < 0.5 ? flip * 180 : (flip - 1) * 180}deg) scale(${badgeScale})`,
                filter: "drop-shadow(0 16px 20px rgba(0,0,0,.4))",
              }}
            >
              {agreed ? (
                <Badge style={{ ["--primary" as string]: C.primary }}>
                  ✓ Acordada
                </Badge>
              ) : (
                <span className="dark">
                  <Badge variant="secondary">Oferta enviada</Badge>
                </span>
              )}
            </div>
          </Float>
        </AbsoluteFill>
      </Camera>
    </LaunchStage>
  )
}

const FINAL_T = 460
const ALERTS = Array.from({ length: TILE_COUNT }, (_, i) => i).filter(
  (i) => armyStatus(i, FINAL_T) === "alert"
)

/** 4D · Plano general: casi todo acordado; los casos fuera de política van a una persona. */
export function ShotHandoff() {
  const frame = useCurrentFrame()
  const back = progress(frame, 0, 30, easeInOut)
  const card = { x: 1500, y: 150 }
  const arrived = ALERTS.filter((_, k) => frame >= 62 + k * 5).length
  const lastArrival = 62 + (arrived - 1) * 5
  const wob =
    arrived > 0
      ? Math.sin((frame - lastArrival) * 0.9) *
        4 *
        Math.exp(-(frame - lastArrival) / 6)
      : 0

  return (
    <LaunchStage>
      <Ground kind="dark" />
      <TileGrid
        {...PORTFOLIO_GRID}
        y={330}
        tilt={{ rx: 36, rz: 3, scale: 1.8 - back * 0.8 }}
        status={(i) => armyStatus(i, FINAL_T)}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top right, rgba(22,21,22,.95) 10%, transparent 55%)",
        }}
      />
      {ALERTS.map((i, k) => {
        const start = 34 + k * 5
        const end = 62 + k * 5
        if (frame < start || frame >= end + 4) return null
        const from = tileCenter(i, { ...PORTFOLIO_GRID, y: 330 })
        const p = progress(frame, start + 6, end - start - 6, easeInOut)
        const x = interpolate(p, [0, 1], [from.x, card.x + 120])
        const y =
          interpolate(p, [0, 1], [from.y, card.y + 60]) -
          Math.sin(p * Math.PI) * 160
        const s = Math.min(1, progress(frame, start, 6)) * (1 - p * 0.5)
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 140,
              top: y - 24,
              transform: `scale(${s})`,
              zIndex: 5,
            }}
          >
            <span
              className="dark"
              style={{ zoom: 2.2, display: "inline-block" }}
            >
              <Badge variant="destructive">Requiere atención</Badge>
            </span>
          </div>
        )
      })}
      <Float x={card.x} y={card.y} at={26} rot={3}>
        <div style={{ transform: `rotate(${wob}deg)` }}>
          <Panel tone="light" zoom={2.1} pad={14} style={{ width: 170 }}>
            <div className="text-sm font-semibold">Requieren atención</div>
            <div className="mt-1 text-xs text-muted-foreground">
              <Mono>{arrived}</Mono> casos fuera de política
            </div>
            <div className="text-xs text-muted-foreground">
              Pidieron más de 6 cuotas.
            </div>
          </Panel>
        </div>
      </Float>
      <div style={{ position: "absolute", left: 110, top: 760, width: 1300 }}>
        <Headline text="128 negociaciones en paralelo." at={12} size={92} />
        <div
          style={{
            marginTop: 18,
            fontSize: 38,
            color: "rgba(250,250,250,.7)",
            opacity: progress(frame, 34, 18),
            transform: `translateY(${(1 - progress(frame, 34, 18)) * 20}px)`,
          }}
        >
          Los casos fuera de política pasan a una persona.
        </div>
      </div>
    </LaunchStage>
  )
}
