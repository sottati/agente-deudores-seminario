import type { CSSProperties, ReactNode } from "react"
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion"

import { cn } from "@/lib/utils"

import { fontSans } from "../lib/fonts"

/** Contenedor de escena: tema oscuro de la plataforma y tipografía Geist. */
export function Stage({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <AbsoluteFill
      className={cn(
        "dark bg-background text-foreground antialiased",
        className
      )}
      style={{ fontFamily: fontSans }}
    >
      {children}
    </AbsoluteFill>
  )
}

/**
 * Fondo animado con los colores del gradiente del hero (modo oscuro):
 * #792440 · #501F38 · #322523 · #2C2B41.
 */
export function Backdrop({ intensity = 1 }: { intensity?: number }) {
  const frame = useCurrentFrame()
  const t = frame / 30

  const blobs = [
    {
      color: "#792440",
      x: 22 + Math.sin(t * 0.35) * 8,
      y: 30 + Math.cos(t * 0.3) * 10,
      r: 62,
    },
    {
      color: "#501F38",
      x: 78 + Math.cos(t * 0.28) * 10,
      y: 24 + Math.sin(t * 0.4) * 8,
      r: 58,
    },
    {
      color: "#2C2B41",
      x: 70 + Math.sin(t * 0.25) * 9,
      y: 82 + Math.cos(t * 0.33) * 7,
      r: 64,
    },
    {
      color: "#322523",
      x: 18 + Math.cos(t * 0.31) * 7,
      y: 86 + Math.sin(t * 0.27) * 9,
      r: 52,
    },
    {
      color: "#A21245",
      x: 50 + Math.sin(t * 0.22) * 14,
      y: 52 + Math.cos(t * 0.26) * 10,
      r: 30,
    },
  ]

  return (
    <AbsoluteFill style={{ backgroundColor: "#141414" }}>
      <AbsoluteFill style={{ opacity: intensity, filter: "blur(60px)" }}>
        {blobs.map((b) => (
          <div
            key={b.color}
            style={{
              position: "absolute",
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.r}vw`,
              height: `${b.r}vw`,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${b.color} 0%, ${b.color}00 68%)`,
            }}
          />
        ))}
      </AbsoluteFill>
      <Grain />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(10,10,10,0.75) 100%)",
        }}
      />
    </AbsoluteFill>
  )
}

function Grain() {
  return (
    <AbsoluteFill style={{ opacity: 0.09, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  )
}

export function Isotipo({
  size,
  style,
}: {
  size: number
  style?: CSSProperties
}) {
  return (
    <Img
      src={staticFile("pacta-isotipo-hd.png")}
      style={{ width: size, height: size, borderRadius: size * 0.22, ...style }}
    />
  )
}

/**
 * Escala la UI de la plataforma (diseñada a 14 px) para que se lea en 1080p
 * sin perder nitidez: `zoom` re-maqueta en vez de escalar un bitmap.
 */
export function Zoom({
  factor,
  children,
  className,
  style,
}: {
  factor: number
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={className} style={{ zoom: factor, ...style }}>
      {children}
    </div>
  )
}

/** Halo rosa detrás de las ventanas de producto, como en la landing. */
export function Glow({
  className,
  opacity = 1,
}: {
  className?: string
  opacity?: number
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute -inset-10 -z-10 rounded-[3rem] bg-primary/25 blur-3xl",
        className
      )}
      style={{ opacity }}
    />
  )
}
