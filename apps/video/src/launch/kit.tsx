/**
 * Piezas compartidas de PactaLaunch: fondos, componentes flotantes, cámara,
 * cursor, titulares y la grilla de deudores. Todo depende solo del frame, así
 * que cada render es determinístico.
 */
import { createContext, useContext } from "react"
import type { CSSProperties, ReactNode } from "react"
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion"

import { cn } from "@/lib/utils"

import { easeInOut, progress } from "../lib/anim"
import { fontMono, fontSans } from "../lib/fonts"
import { Backdrop } from "../ui/stage"

export const W = 1920
export const H = 1080

export const C = {
  ink: "#161516",
  primary: "#C31952",
  deep: "#A21245",
  blush: "#FCF0F4",
  white: "#FAFAFA",
  danger: "#F06050",
  card: "#1C1B1C",
}

export type GroundKind = "dark" | "mag" | "light" | "mesh"

/* ------------------------------------------------------------------ */
/* Escenario y fondos                                                  */
/* ------------------------------------------------------------------ */

export function LaunchStage({ children }: { children: ReactNode }) {
  return (
    <AbsoluteFill
      className="overflow-hidden antialiased"
      style={{ fontFamily: fontSans, backgroundColor: C.ink }}
    >
      {children}
    </AbsoluteFill>
  )
}

/** Grano animado (grainy gradient): evita el banding al comprimir. */
export function Grain({ opacity = 0.18 }: { opacity?: number }) {
  const frame = useCurrentFrame()
  const id = `grain-${Math.floor(frame / 2) % 6}`
  return (
    <AbsoluteFill
      style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}
    >
      <svg width="100%" height="100%">
        <filter id={id}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            seed={Math.floor(frame / 2) % 6}
            stitchTiles="stitch"
          />
          <feColorMatrix values="0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  )
}

export function Ground({ kind }: { kind: GroundKind }) {
  const frame = useCurrentFrame()
  const t = frame / 30

  if (kind === "mesh") return <Backdrop />

  if (kind === "mag") {
    return (
      <AbsoluteFill style={{ backgroundColor: C.primary }}>
        <AbsoluteFill
          style={{
            background: `radial-gradient(60% 80% at ${28 + Math.sin(t * 0.4) * 8}% ${8 + Math.cos(t * 0.3) * 6}%, #DA3A72 0%, transparent 70%), radial-gradient(55% 75% at ${88 + Math.cos(t * 0.35) * 6}% ${100 + Math.sin(t * 0.3) * 6}%, ${C.deep} 0%, transparent 70%)`,
          }}
        />
        <Grain opacity={0.22} />
      </AbsoluteFill>
    )
  }

  if (kind === "light") {
    return (
      <AbsoluteFill style={{ backgroundColor: C.blush }}>
        <AbsoluteFill
          style={{
            background: `radial-gradient(50% 60% at ${82 + Math.sin(t * 0.3) * 5}% 12%, #F1C9D7 0%, transparent 70%), radial-gradient(40% 50% at 10% 100%, #F6DCE5 0%, transparent 70%)`,
          }}
        />
        <AbsoluteFill
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(26,26,26,.09) 1.4px, transparent 1.6px)",
            backgroundSize: "34px 34px",
          }}
        />
        <Grain opacity={0.16} />
      </AbsoluteFill>
    )
  }

  const breathe = 0.4 + Math.sin(t * 0.8) * 0.06
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(45% 60% at 50% 55%, rgba(121,36,64,${breathe}) 0%, transparent 75%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,.08) 1.4px, transparent 1.6px)",
          backgroundSize: "34px 34px",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(8,8,8,.7) 100%)",
        }}
      />
      <Grain opacity={0.08} />
    </AbsoluteFill>
  )
}

/** Barrido de un fondo a otro (wipe). */
export function GroundWipe({
  from,
  to,
  p,
  dir = "right",
}: {
  from: GroundKind
  to: GroundKind
  p: number
  dir?: "right" | "up" | "down"
}) {
  const r = (1 - p) * 100
  const clip =
    dir === "right"
      ? `inset(0 ${r}% 0 0)`
      : dir === "up"
        ? `inset(${r}% 0 0 0)`
        : `inset(0 0 ${r}% 0)`
  return (
    <>
      {p < 1 && <Ground kind={from} />}
      <AbsoluteFill style={{ clipPath: clip }}>
        <Ground kind={to} />
      </AbsoluteFill>
    </>
  )
}

/** Revela su contenido a través de un cuadrado redondeado o un círculo que crece (iris). */
export function Iris({
  p,
  cx = W / 2,
  cy = H / 2,
  size0,
  shape = "square",
  children,
}: {
  p: number
  cx?: number
  cy?: number
  size0: number
  shape?: "square" | "circle"
  children: ReactNode
}) {
  if (p <= 0) return null
  const far = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) + 40
  const half = interpolate(p, [0, 1], [size0 / 2, far])
  const clip =
    shape === "circle"
      ? `circle(${half}px at ${cx}px ${cy}px)`
      : `inset(${cy - half}px ${W - cx - half}px ${H - cy - half}px ${cx - half}px round ${interpolate(p, [0, 1], [size0 * 0.22, 0])}px)`
  return <AbsoluteFill style={{ clipPath: clip }}>{children}</AbsoluteFill>
}

/* ------------------------------------------------------------------ */
/* Cámara y componentes flotantes                                      */
/* ------------------------------------------------------------------ */

type CamState = { x: number; y: number }
const Cam = createContext<CamState>({ x: 0, y: 0 })

/**
 * Cámara virtual: `scale` hace push-in o pull-back alrededor de (ox, oy) y
 * `x`/`y` desplazan cada capa según su profundidad (parallax).
 */
export function Camera({
  x = 0,
  y = 0,
  scale = 1,
  ox = W / 2,
  oy = H / 2,
  rotate = 0,
  children,
}: {
  x?: number
  y?: number
  scale?: number
  ox?: number
  oy?: number
  rotate?: number
  children: ReactNode
}) {
  return (
    <Cam.Provider value={{ x, y }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) rotate(${rotate}deg)`,
          transformOrigin: `${ox}px ${oy}px`,
        }}
      >
        {children}
      </AbsoluteFill>
    </Cam.Provider>
  )
}

export type Depth = 0 | 1 | 2

const DEPTH = {
  parallax: [1, 0.55, 0.28],
  blur: [0, 1.4, 4],
  opacity: [1, 0.88, 0.55],
  scale: [1, 0.92, 0.8],
}

/**
 * Componente suelto en el espacio. Entra con un spring sin rebote desde
 * `from`, flota levemente y se mueve con la cámara según su profundidad.
 */
export function Float({
  x,
  y,
  depth = 0,
  rot = 0,
  at = 0,
  from = [0, 70],
  out,
  outTo = [0, -80],
  focusAt,
  bob = 1,
  pop = false,
  className,
  style,
  children,
}: {
  x: number
  y: number
  depth?: Depth
  rot?: number
  at?: number
  from?: [number, number]
  out?: number
  outTo?: [number, number]
  /** Rack focus: arranca desenfocado y se enfoca en este frame. */
  focusAt?: number
  bob?: number
  pop?: boolean
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const cam = useContext(Cam)
  const s = spring({
    frame: frame - at,
    fps,
    config: pop ? { damping: 11, mass: 0.7 } : { damping: 200, mass: 0.9 },
  })
  const e = out === undefined ? 0 : progress(frame, out, 18, easeInOut)
  const k = DEPTH.parallax[depth]
  const focus =
    focusAt === undefined ? 0 : (1 - progress(frame, focusAt, 16)) * 6
  const wobble = Math.sin((frame + x * 0.13) / 38) * 7 * bob * k
  const tx = cam.x * k + (1 - Math.min(s, 1)) * from[0] + e * outTo[0]
  const ty = cam.y * k + (1 - Math.min(s, 1)) * from[1] + wobble + e * outTo[1]
  const scale = DEPTH.scale[depth] * (pop ? s : 0.9 + 0.1 * s)
  const straighten = 1 - progress(frame, at + 6, 30) * 0.35

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(${tx}px, ${ty}px) rotate(${rot * straighten}deg) scale(${scale})`,
        transformOrigin: "center",
        opacity: Math.min(1, s * 1.2) * DEPTH.opacity[depth] * (1 - e),
        filter: `blur(${DEPTH.blur[depth] + (1 - Math.min(s, 1)) * 10 + focus}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export type Tone = "dark" | "light" | "mag"

const SHADOW: Record<GroundKind, string> = {
  dark: "0 50px 90px -24px rgba(0,0,0,.7), 0 10px 24px rgba(0,0,0,.3)",
  mag: "0 50px 90px -24px rgba(70,0,25,.55), 0 10px 24px rgba(70,0,25,.25)",
  light:
    "0 50px 90px -24px rgba(162,18,69,.22), 0 10px 24px rgba(26,26,26,.06)",
  mesh: "0 50px 90px -24px rgba(0,0,0,.6), 0 10px 24px rgba(0,0,0,.25)",
}

/** En fondo magenta el primario de las piezas se invierte a blanco/negro. */
export const INVERT: CSSProperties = {
  ["--primary" as string]: "#FAFAFA",
  ["--primary-foreground" as string]: "#1A1A1A",
  ["--ring" as string]: "#FAFAFA",
}

/** Tarjeta flotante con los tokens de la plataforma (`dark` para modo oscuro). */
export function Panel({
  tone = "dark",
  on = "dark",
  zoom = 2,
  pad = 16,
  radius = 16,
  className,
  style,
  children,
}: {
  tone?: Tone
  on?: GroundKind
  zoom?: number
  pad?: number
  radius?: number
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const magTone: CSSProperties =
    tone === "mag"
      ? {
          backgroundColor: C.primary,
          color: "#FCF0F4",
          ["--muted-foreground" as string]: "rgba(252,240,244,.75)",
          ["--foreground" as string]: "#FCF0F4",
          ["--border" as string]: "rgba(255,255,255,.2)",
          ...INVERT,
        }
      : {}
  return (
    <div
      className={cn(
        tone === "dark" && "dark",
        "bg-card text-card-foreground ring-1 ring-foreground/10",
        className
      )}
      style={{
        zoom,
        padding: pad,
        borderRadius: radius,
        boxShadow: SHADOW[on],
        ...(tone === "dark" && on === "mag"
          ? { backgroundColor: C.card, ...INVERT }
          : {}),
        ...magTone,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Tipografía                                                          */
/* ------------------------------------------------------------------ */

/** Titular que entra palabra por palabra desde una máscara. */
export function Headline({
  text,
  at = 0,
  size = 96,
  color = "#FAFAFA",
  stagger = 3,
  out,
  style,
}: {
  text: string
  at?: number
  size?: number
  color?: string
  stagger?: number
  out?: number
  style?: CSSProperties
}) {
  const frame = useCurrentFrame()
  const e = out === undefined ? 0 : progress(frame, out, 14, easeInOut)
  return (
    <div
      style={{
        fontSize: size,
        lineHeight: 1.04,
        fontWeight: 600,
        letterSpacing: "-0.045em",
        color,
        display: "flex",
        flexWrap: "wrap",
        columnGap: size * 0.24,
        opacity: 1 - e,
        transform: `translateY(${-e * 30}px)`,
        ...style,
      }}
    >
      {text.split(" ").map((word, i) => {
        const p = progress(frame, at + i * stagger, 18)
        return (
          <span
            key={`${word}-${i}`}
            style={{
              overflow: "hidden",
              display: "inline-block",
              paddingBottom: size * 0.1,
              marginBottom: -size * 0.1,
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${(1 - p) * 110}%)`,
              }}
            >
              {word}
            </span>
          </span>
        )
      })}
    </div>
  )
}

export function Kicker({
  children,
  at = 0,
  color = "rgba(255,255,255,.62)",
  style,
}: {
  children: ReactNode
  at?: number
  color?: string
  style?: CSSProperties
}) {
  const frame = useCurrentFrame()
  const p = progress(frame, at, 18)
  return (
    <div
      style={{
        fontSize: 24,
        fontWeight: 500,
        letterSpacing: `${0.1 + p * 0.08}em`,
        textTransform: "uppercase",
        color,
        opacity: p,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** Dígito que rueda al cambiar (UI number ticker). */
export function Roll({
  steps,
  height = 1.2,
}: {
  steps: { f: number; v: string }[]
  height?: number
}) {
  const frame = useCurrentFrame()
  let k = 0
  for (let i = 0; i < steps.length; i++) if (frame >= steps[i].f) k = i
  const p = k === 0 ? 1 : progress(frame, steps[k].f, 7)
  const prev = k === 0 ? steps[0].v : steps[k - 1].v
  return (
    <span
      style={{
        display: "inline-block",
        position: "relative",
        overflow: "hidden",
        height: `${height}em`,
        lineHeight: `${height}em`,
        verticalAlign: "bottom",
      }}
    >
      <span style={{ visibility: "hidden" }}>{steps[k].v}</span>
      {p < 1 && (
        <span
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: `translateY(${-p * 100}%)`,
          }}
        >
          {prev}
        </span>
      )}
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: `translateY(${(1 - p) * 100}%)`,
        }}
      >
        {steps[k].v}
      </span>
    </span>
  )
}

export function Mono({
  children,
  style,
}: {
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <span
      style={{
        fontFamily: fontMono,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Cursor                                                              */
/* ------------------------------------------------------------------ */

/** Cursor que recorre `path` ([frame, x, y]) y deja un anillo en cada clic. */
export function Cursor({
  path,
  clicks = [],
  ring = "#FAFAFA",
}: {
  path: [number, number, number][]
  clicks?: number[]
  ring?: string
}) {
  const frame = useCurrentFrame()
  const fs = path.map((p) => p[0])
  const x = interpolate(
    frame,
    fs,
    path.map((p) => p[1]),
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeInOut,
    }
  )
  const y = interpolate(
    frame,
    fs,
    path.map((p) => p[2]),
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeInOut,
    }
  )
  const appear = progress(frame, path[0][0], 8)
  const press = clicks.reduce(
    (acc, c) =>
      Math.max(acc, progress(frame, c - 3, 3) - progress(frame, c, 5)),
    0
  )

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 50 }}>
      {clicks.map((c) => {
        const p = progress(frame, c, 20)
        if (frame < c || p >= 1) return null
        const cx = interpolate(
          c,
          fs,
          path.map((q) => q[1]),
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: easeInOut,
          }
        )
        const cy = interpolate(
          c,
          fs,
          path.map((q) => q[2]),
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: easeInOut,
          }
        )
        const r = 10 + p * 60
        return (
          <div
            key={c}
            style={{
              position: "absolute",
              left: cx - r,
              top: cy - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              border: `3px solid ${ring}`,
              opacity: 1 - p,
            }}
          />
        )
      })}
      <svg
        width={52}
        height={52}
        viewBox="0 0 24 24"
        style={{
          position: "absolute",
          left: x - 6,
          top: y - 4,
          opacity: appear,
          transform: `scale(${1 - press * 0.15})`,
          transformOrigin: "6px 4px",
          filter: "drop-shadow(0 6px 10px rgba(0,0,0,.35))",
        }}
      >
        <path
          d="M4 2l16 9-7 2-3 7z"
          fill="#FFFFFF"
          stroke="#1A1A1A"
          strokeWidth={1.3}
          strokeLinejoin="round"
        />
      </svg>
    </AbsoluteFill>
  )
}

/* ------------------------------------------------------------------ */
/* Cartera: tiles y estados de negociación                             */
/* ------------------------------------------------------------------ */

export type TileStatus = "idle" | "sent" | "talk" | "offer" | "ok" | "alert"

export const COLS = 16
export const ROWS = 8
export const TILE_COUNT = COLS * ROWS

/** Orden de despliegue: del centro hacia afuera. */
const RANK: number[] = (() => {
  const idx = Array.from({ length: TILE_COUNT }, (_, i) => i)
  const d = (i: number) =>
    Math.hypot(
      (i % COLS) - (COLS - 1) / 2,
      (Math.floor(i / COLS) - (ROWS - 1) / 2) * 1.6
    ) +
    random(`r${i}`) * 0.6
  const sorted = [...idx].sort((a, b) => d(a) - d(b))
  const rank = new Array<number>(TILE_COUNT)
  sorted.forEach((tile, r) => (rank[tile] = r))
  return rank
})()

export function rankOf(i: number) {
  return RANK[i]
}

/** Frame (reloj del ejército) en que el agente llega al tile `i`. */
export function sentAt(i: number) {
  const r = RANK[i]
  return 12 + Math.floor(r / 32) * 20 + 16 + (r % 32) * 0.45
}

/**
 * Estado del tile `i` en el reloj del ejército `t`. Recorre los estados
 * reales de una negociación; un 5 % termina en "Requiere atención".
 */
export function armyStatus(i: number, t: number): TileStatus {
  const sent = sentAt(i)
  const talk = sent + 30 + random(`a${i}`) * 60
  const offer = talk + 30 + random(`b${i}`) * 90
  const ok = offer + 20 + random(`c${i}`) * 80
  const alert = random(`d${i}`) < 0.055
  if (t < sent) return "idle"
  if (t < talk) return "sent"
  if (alert && t >= talk + 45) return "alert"
  if (t < offer) return "talk"
  if (t < ok) return alert ? "talk" : "offer"
  return alert ? "alert" : "ok"
}

export function countStatuses(t: number) {
  const c: Record<TileStatus, number> = {
    idle: 0,
    sent: 0,
    talk: 0,
    offer: 0,
    ok: 0,
    alert: 0,
  }
  for (let i = 0; i < TILE_COUNT; i++) c[armyStatus(i, t)]++
  return c
}

function tileStyle(
  status: TileStatus,
  on: "dark" | "mag",
  lit: number
): CSSProperties {
  if (on === "mag") {
    switch (status) {
      case "sent":
        return { background: "rgba(255,255,255,.16)", borderColor: "#FFFFFF" }
      case "ok":
        return {
          background: "#FFFFFF",
          borderColor: "#FFFFFF",
          boxShadow: "0 0 18px rgba(255,255,255,.55)",
        }
      default:
        return {
          background: "rgba(60,0,20,.3)",
          borderColor: "rgba(255,255,255,.18)",
        }
    }
  }
  switch (status) {
    case "sent":
      return { background: "#2A1A20", borderColor: C.primary }
    case "talk":
      return { background: "#3B3B3B", borderColor: "#3B3B3B" }
    case "offer":
      return { background: "#5A1F35", borderColor: "#8A2A4D" }
    case "ok":
      return {
        background: C.primary,
        borderColor: C.primary,
        boxShadow: "0 0 18px rgba(195,25,82,.5)",
      }
    case "alert":
      return { background: "rgba(240,96,80,.25)", borderColor: C.danger }
    default:
      return {
        background: lit > 0 ? `rgba(195,25,82,${0.12 * lit})` : "#222122",
        borderColor:
          lit > 0
            ? `rgba(195,25,82,${0.4 + lit * 0.6})`
            : "rgba(255,255,255,.14)",
      }
  }
}

/** Grilla de 16×8 deudores. `status` y `lit` son funciones por tile. */
export function TileGrid({
  x,
  y,
  width,
  height,
  status,
  lit,
  on = "dark",
  gap = 10,
  tilt,
  style,
}: {
  x: number
  y: number
  width: number
  height: number
  status: (i: number) => TileStatus
  lit?: (i: number) => number
  on?: "dark" | "mag"
  gap?: number
  tilt?: { rx: number; rz: number; scale?: number }
  style?: CSSProperties
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        display: "grid",
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        gap,
        transform: tilt
          ? `perspective(1800px) rotateX(${tilt.rx}deg) rotateZ(${tilt.rz}deg) scale(${tilt.scale ?? 1})`
          : undefined,
        transformOrigin: "50% 55%",
        ...style,
      }}
    >
      {Array.from({ length: TILE_COUNT }, (_, i) => (
        <div
          key={i}
          style={{
            borderRadius: 7,
            border: "2px solid",
            ...tileStyle(status(i), on, lit ? lit(i) : 0),
          }}
        />
      ))}
    </div>
  )
}

/** Centro de un tile en una grilla plana. */
export function tileCenter(
  i: number,
  grid: { x: number; y: number; width: number; height: number; gap: number }
) {
  const cw = (grid.width - grid.gap * (COLS - 1)) / COLS
  const ch = (grid.height - grid.gap * (ROWS - 1)) / ROWS
  const c = i % COLS
  const r = Math.floor(i / COLS)
  return {
    x: grid.x + c * (cw + grid.gap) + cw / 2,
    y: grid.y + r * (ch + grid.gap) + ch / 2,
  }
}

/* ------------------------------------------------------------------ */
/* Isotipo dibujado (outline to fill)                                  */
/* ------------------------------------------------------------------ */

const ISO_LINES = [
  "M40 60V25l16-6v41",
  "M56 31l11 5v18",
  "M40 38l-8 4v12",
  "M20 45l13 9",
  "M80 45l-13 9",
  "M22 63l15 12 9-3",
  "M78 61L58 76l-8-2-7 5",
  "M37 75l6 6 7-2 6 3 6-5",
]

export function IsoTrace({
  size,
  draw,
  fill,
}: {
  size: number
  draw: number
  fill: number
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect
        x="3"
        y="3"
        width="94"
        height="94"
        rx="21"
        fill={C.primary}
        fillOpacity={fill}
        stroke={C.primary}
        strokeWidth={2.4}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - Math.min(1, draw * 1.4)}
      />
      {ISO_LINES.map((d, i) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={
            1 -
            interpolate(draw, [0.15 + i * 0.06, 0.6 + i * 0.05], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      ))}
    </svg>
  )
}
