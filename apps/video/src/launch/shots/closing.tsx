import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion"

import { Badge } from "@/components/ui/badge"

import { easeInOut, progress } from "../../lib/anim"
import { Isotipo } from "../../ui/stage"
import {
  C,
  Float,
  Ground,
  INVERT,
  Iris,
  LaunchStage,
  TILE_COUNT,
  armyStatus,
  rankOf,
  tileCenter,
} from "../kit"
import { MagLockup } from "./opening"

const GRID = { x: 360, y: 110, width: 1200, height: 440, gap: 10 }
const TARGET = { x: 960, y: 760 }

/** 6·t · Los tiles acordados vuelven al isotipo; el cuadrado se expande otra vez. */
export function ShotConverge() {
  const frame = useCurrentFrame()
  const glow = progress(frame, 10, 34)
  const pulse = frame >= 44 ? Math.exp(-(frame - 44) / 5) * 0.12 : 0
  const cw = (GRID.width - GRID.gap * 15) / 16
  const ch = (GRID.height - GRID.gap * 7) / 8

  return (
    <LaunchStage>
      <Ground kind="dark" />
      {Array.from({ length: TILE_COUNT }, (_, i) => {
        const from = tileCenter(i, GRID)
        const p = progress(frame, rankOf(i) * 0.2, 20, easeInOut)
        if (p >= 1) return null
        const mx = (from.x + TARGET.x) / 2 + (from.x - TARGET.x) * 0.4
        const my = Math.min(from.y, TARGET.y) - 80
        const x =
          (1 - p) ** 2 * from.x + 2 * (1 - p) * p * mx + p * p * TARGET.x
        const y =
          (1 - p) ** 2 * from.y + 2 * (1 - p) * p * my + p * p * TARGET.y
        const s = 1 - p * 0.8
        const ok = armyStatus(i, 460) === "ok"
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - (cw * s) / 2,
              top: y - (ch * s) / 2,
              width: cw * s,
              height: ch * s,
              borderRadius: 7,
              background: ok ? C.primary : "#3B3B3B",
              boxShadow: ok ? "0 0 18px rgba(195,25,82,.5)" : undefined,
              opacity: 1 - p * 0.3,
            }}
          />
        )
      })}
      <div
        style={{
          position: "absolute",
          left: TARGET.x - 75,
          top: TARGET.y - 75,
          transform: `scale(${progress(frame, 0, 16) * (1 + pulse)})`,
          borderRadius: 34,
          boxShadow: `0 0 ${40 + glow * 80}px rgba(195,25,82,${0.4 + glow * 0.5})`,
        }}
      >
        <Isotipo size={150} />
      </div>
      <Iris
        p={progress(frame, 44, 16, easeInOut)}
        cx={TARGET.x}
        cy={TARGET.y}
        size0={150}
      >
        <Ground kind="mag" />
      </Iris>
    </LaunchStage>
  )
}

/** 6A · Cierre sobre magenta, rima con la apertura. */
export function ShotEndCard() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const punch = spring({
    frame: frame - 26,
    fps,
    config: { damping: 10, mass: 0.6 },
  })
  const drift = interpolate(frame, [0, 150], [0, -40])

  return (
    <LaunchStage>
      <Ground kind="mag" />
      <Float x={260} y={180 + drift} depth={2} rot={-8} at={30}>
        <span style={{ zoom: 2.4, display: "inline-block", ...INVERT }}>
          <Badge>Acordada</Badge>
        </span>
      </Float>
      <Float x={1480} y={820 + drift} depth={2} rot={6} at={40}>
        <span style={{ zoom: 2.4, display: "inline-block", ...INVERT }}>
          <Badge>Acordada</Badge>
        </span>
      </Float>
      <AbsoluteFill className="items-center justify-center" style={{ gap: 44 }}>
        <MagLockup at={0} size={170} />
        <div
          style={{
            fontSize: 76,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            color: "rgba(252,240,244,.92)",
            opacity: Math.min(1, punch * 1.5),
            transform: `scale(${1.35 - 0.35 * punch})`,
          }}
        >
          Cobrar sin pelear.
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(252,240,244,.7)",
            opacity: progress(frame, 50, 20),
          }}
        >
          Seminario de Integración Profesional · UADE
        </div>
      </AbsoluteFill>
    </LaunchStage>
  )
}
