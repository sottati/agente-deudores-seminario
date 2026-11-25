import { Easing, interpolate, spring } from "remotion"
import type { CSSProperties } from "react"

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1)
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1)

/** 0 → 1 entre `start` y `start + duration`, con easing y sin salirse del rango. */
export function progress(
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = easeOut
) {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  })
}

export function pop(frame: number, fps: number, delay = 0, damping = 14) {
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.8 } })
}

/** Entrada estándar: sube, se enfoca y aparece. */
export function rise(
  frame: number,
  delay = 0,
  distance = 28,
  duration = 22
): CSSProperties {
  const p = progress(frame, delay, duration)
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * distance}px)`,
    filter: `blur(${(1 - p) * 8}px)`,
  }
}

/** Texto que se escribe letra por letra. */
export function typed(text: string, frame: number, start: number, cps = 40) {
  const fps = 30
  const chars = Math.max(0, Math.floor(((frame - start) / fps) * cps))
  return text.slice(0, chars)
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function formatARS(value: number) {
  return `$ ${Math.round(value).toLocaleString("es-AR")}`
}
