/**
 * Piezas de PactaSting. Todo es función pura del frame `f`, medido en
 * "frames de guion" a 30 fps; la composición corre a 60 fps y pasa f = frame / 2,
 * así que los valores tienen que ser continuos (nada de Math.floor en el movimiento).
 */
import type { CSSProperties, ReactNode } from "react"
import { Easing } from "remotion"

import { fontSans } from "../lib/fonts"
import { Isotipo } from "../ui/stage"

export const W = 1920
export const H = 1080
export const CX = W / 2
export const CY = H / 2

export const P = {
  page: "#FDFBFC",
  haze: "#EEC5D4",
  floor: "#FADDE8",
  ice: "#FBE3EC",
  flash: "#FCE7EF",
  primary: "#C31952",
  deep: "#A21245",
  wine: "#6E0C30",
  pink: "#F27BA3",
  ink: "#161516",
  bar: "#1B1618",
  grey: "#BDBBBC",
  white: "#FFFFFF",
  halo: "#ECE8E9",
}

export const font = fontSans

/* ------------------------------------------------------------------ */
/* Tiempo                                                              */
/* ------------------------------------------------------------------ */

export type Ease = (t: number) => number

export const linear: Ease = (t) => t
export const inOut: Ease = Easing.bezier(0.65, 0, 0.35, 1)
export const outExpo: Ease = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))
export const inQuad: Ease = (t) => t * t
export const inCubic: Ease = (t) => t * t * t
export const outCubic: Ease = (t) => 1 - Math.pow(1 - t, 3)

/** Tabla de keyframes [[frame, valor], ...] con interpolación entre pares. */
export function kf(f: number, table: [number, number][], ease: Ease = linear) {
  if (f <= table[0][0]) return table[0][1]
  for (let i = 0; i < table.length - 1; i++) {
    const [a, va] = table[i]
    const [b, vb] = table[i + 1]
    if (f <= b) return va + (vb - va) * ease((f - a) / (b - a))
  }
  return table[table.length - 1][1]
}

/** 0 → 1 entre f0 y f1 con easing, recortado. */
export function prog(f: number, f0: number, f1: number, ease: Ease = linear) {
  if (f <= f0) return 0
  if (f >= f1) return 1
  return ease((f - f0) / (f1 - f0))
}

export function mix(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/** Hash determinístico en [0, 1). */
export function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

/* ------------------------------------------------------------------ */
/* Desenfoque direccional                                              */
/* ------------------------------------------------------------------ */

/** Envuelve en un filtro SVG con desenfoque x/y separado (smear). */
export function Smear({
  id,
  x = 0,
  y = 0,
  style,
  children,
}: {
  id: string
  x?: number
  y?: number
  style?: CSSProperties
  children: ReactNode
}) {
  const on = x > 0.05 || y > 0.05
  return (
    <div style={{ position: "absolute", inset: 0, ...style }}>
      {on && (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter
            id={id}
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation={`${x} ${y}`} />
          </filter>
        </svg>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: on ? `url(#${id})` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export function blur(px: number) {
  return px > 0.05 ? `blur(${px}px)` : undefined
}

/* ------------------------------------------------------------------ */
/* Marca                                                               */
/* ------------------------------------------------------------------ */

/**
 * Isotipo de pacta: el mismo PNG que usan la landing y la sidebar de la
 * plataforma (versión HD en public/).
 */
export { Isotipo }

/** Ícono de app: el isotipo con sombra, para cuando flota sobre el fondo. */
export function AppIcon({ size }: { size: number }) {
  return (
    <Isotipo
      size={size}
      style={{
        display: "block",
        boxShadow: `0 ${size * 0.06}px ${size * 0.16}px rgba(110,12,48,.28)`,
      }}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Cursor                                                              */
/* ------------------------------------------------------------------ */

/**
 * Flecha de macOS. (x, y) es la punta; `rot` gira alrededor de la punta
 * (0 = apunta arriba a la izquierda, 45 = apunta arriba).
 */
export function Cursor({
  x,
  y,
  rot = 0,
  scale = 1,
  opacity = 1,
  blurPx = 0,
}: {
  x: number
  y: number
  rot?: number
  scale?: number
  opacity?: number
  blurPx?: number
}) {
  const w = 34
  const h = 42
  return (
    <svg
      width={w}
      height={h}
      viewBox="-2 -2 24 30"
      style={{
        position: "absolute",
        left: x,
        top: y,
        marginLeft: -w * (2 / 24),
        marginTop: -h * (2 / 30),
        transformOrigin: `${w * (2 / 24)}px ${h * (2 / 30)}px`,
        transform: `rotate(${rot}deg) scale(${scale})`,
        opacity,
        overflow: "visible",
        filter: `drop-shadow(0 3px 4px rgba(0,0,0,.28))${blurPx > 0.05 ? ` blur(${blurPx}px)` : ""}`,
        zIndex: 40,
      }}
    >
      <path
        d="M0 0V21.5L5.2 16.6L8.6 24.4L12 22.9L8.7 15.3H15.6Z"
        fill="#000"
        stroke="#fff"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Arte de las tapas (sin texto, para que el título de vidrio no se duplique) */
/* ------------------------------------------------------------------ */

export type CoverKind = "rules" | "deals" | "chat"

/** Contenido SVG de una tapa en un viewBox de w × h. */
export function CoverArt({
  kind,
  w,
  h,
  uid,
}: {
  kind: CoverKind
  w: number
  h: number
  uid: string
}) {
  const g = `${uid}-g`
  const r = `${uid}-r`
  const stops =
    kind === "rules"
      ? ["#F4A3BF", "#D9366E", "#8E1040"]
      : kind === "deals"
        ? ["#FFD6E3", "#E05A88", "#A21245"]
        : ["#F7B5CB", "#C31952", "#6E0C30"]
  return (
    <>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor={stops[0]} />
          <stop offset="0.55" stopColor={stops[1]} />
          <stop offset="1" stopColor={stops[2]} />
        </linearGradient>
        <radialGradient id={r} cx="0.82" cy="0.12" r="0.6">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#${g})`} />
      <rect width={w} height={h} fill={`url(#${r})`} />
      {kind === "rules" &&
        [0, 1, 2].map((i) => {
          const y = h * (0.2 + i * 0.13)
          const k = [0.62, 0.38, 0.8][i]
          return (
            <g key={i} opacity={0.9}>
              <line
                x1={w * 0.1}
                x2={w * 0.9}
                y1={y}
                y2={y}
                stroke="#fff"
                strokeOpacity={0.35}
                strokeWidth={6}
                strokeLinecap="round"
              />
              <line
                x1={w * 0.1}
                x2={w * (0.1 + 0.8 * k)}
                y1={y}
                y2={y}
                stroke="#fff"
                strokeWidth={6}
                strokeLinecap="round"
              />
              <circle cx={w * (0.1 + 0.8 * k)} cy={y} r={15} fill="#fff" />
            </g>
          )
        })}
      {kind === "deals" && (
        <g fill="none" stroke="#fff" strokeWidth={3}>
          <circle cx={w * 0.72} cy={h * 0.32} r={h * 0.36} strokeOpacity={0.5} />
          <circle cx={w * 0.72} cy={h * 0.32} r={h * 0.22} strokeOpacity={0.7} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={w * 0.08 + i * w * 0.075}
              y={h * 0.18}
              width={w * 0.055}
              height={w * 0.055}
              rx={8}
              fill="#fff"
              fillOpacity={i < 4 ? 0.85 : 0.15}
              stroke="none"
            />
          ))}
        </g>
      )}
      {kind === "chat" && (
        <g>
          <circle cx={w * 0.78} cy={h * 0.2} r={h * 0.3} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={2} />
          <line x1={0} x2={w} y1={h * 0.78} y2={h * 0.78} stroke="#fff" strokeOpacity={0.3} strokeWidth={2} />
        </g>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Cámara, rótulos y clics                                             */
/* ------------------------------------------------------------------ */

export type Cam = { x: number; y: number; s: number }

/** Transform que encuadra el punto (x, y) del contenido en el centro, con escala s. */
export function camStyle(c: Cam): CSSProperties {
  return {
    position: "absolute",
    left: 0,
    top: 0,
    width: W,
    height: H,
    transformOrigin: "0 0",
    transform: `translate(${CX - c.x * c.s}px, ${CY - c.y * c.s}px) scale(${c.s})`,
  }
}

/** Interpola una cámara entre keyframes [frame, x, y, s] con ease in-out. */
export function camAt(l: number, keys: [number, number, number, number][]): Cam {
  const pick = (i: number) => keys.map((k) => [k[0], k[i]] as [number, number])
  return { x: kf(l, pick(1), inOut), y: kf(l, pick(2), inOut), s: kf(l, pick(3), inOut) }
}

/** Velocidad de la cámara en px de pantalla por frame (para el desenfoque). */
export function camSpeed(l: number, keys: [number, number, number, number][]) {
  const a = camAt(l, keys)
  const b = camAt(l - 0.5, keys)
  return {
    vx: Math.abs(a.x * a.s - b.x * b.s) * 2 + Math.abs(a.s - b.s) * 900,
    vy: Math.abs(a.y * a.s - b.y * b.s) * 2 + Math.abs(a.s - b.s) * 500,
  }
}

/** Rótulo de sección en pantalla: "01 · Vos definís las reglas". */
export function Kicker({ n, text, l, at = 4 }: { n: string; text: string; l: number; at?: number }) {
  const p = prog(l, at, at + 12, outExpo)
  if (p <= 0) return null
  return (
    <div
      style={{
        position: "absolute",
        left: 72,
        top: 60,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 26px 14px 18px",
        borderRadius: 999,
        background: "rgba(255,255,255,.92)",
        boxShadow: "0 10px 30px rgba(110,12,48,.12), inset 0 0 0 1px rgba(195,25,82,.10)",
        fontFamily: fontSans,
        fontSize: 27,
        fontWeight: 600,
        color: P.ink,
        opacity: p,
        transform: `translateX(${(1 - p) * -24}px)`,
        filter: blur((1 - p) * 10),
        zIndex: 60,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          minWidth: 44,
          height: 44,
          borderRadius: 22,
          background: P.primary,
          color: "#fff",
          fontSize: 20,
          display: "grid",
          placeItems: "center",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {n}
      </span>
      {text}
    </div>
  )
}

/** 0 → 1 → 0 alrededor de un clic (presión del cursor). */
export function pressAt(l: number, clicks: number[]) {
  return clicks.reduce(
    (acc, c) => Math.max(acc, prog(l, c - 2, c) - prog(l, c, c + 4)),
    0
  )
}
