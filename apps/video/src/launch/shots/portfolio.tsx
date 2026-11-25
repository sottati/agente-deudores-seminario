import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { easeInOut, progress } from "../../lib/anim"
import {
  Cursor,
  Float,
  Ground,
  Iris,
  Kicker,
  LaunchStage,
  Mono,
  Panel,
  TileGrid,
  rankOf,
} from "../kit"

const DEBTORS = [
  ["Marta Gómez", "Unidad 4B", "Av. Rivadavia 2840", "$ 181.000"],
  ["Jorge Ferreyra", "Unidad 7A", "Sarmiento 912", "$ 94.250"],
  ["Lucía Benítez", "Unidad 2C", "Mármol 1456", "$ 231.800"],
  ["Raúl Medina", "Unidad 11D", "Av. Rivadavia 2840", "$ 312.400"],
  ["Silvia Ortiz", "Unidad 3A", "Yatay 210", "$ 76.900"],
  ["Pablo Herrera", "Unidad 9F", "Sarmiento 912", "$ 148.600"],
  ["Carla Ruiz", "Unidad 1B", "Mármol 1456", "$ 205.300"],
  ["Hernán Paz", "Unidad 6C", "Yatay 210", "$ 88.700"],
  ["Inés Molina", "Unidad 12A", "Av. Rivadavia 2840", "$ 263.100"],
  ["Diego Sosa", "Unidad 5E", "Sarmiento 912", "$ 119.400"],
  ["Laura Vidal", "Unidad 8D", "Mármol 1456", "$ 97.800"],
  ["Tomás Acosta", "Unidad 3F", "Yatay 210", "$ 174.500"],
] as const

export const PORTFOLIO_TILT = { rx: 38, rz: -8 }
export const PORTFOLIO_GRID = {
  x: 260,
  y: 300,
  width: 1400,
  height: 640,
  gap: 12,
}

const ROW_H = 120

/** 3A · Las filas de Deudores, como tarjetas sueltas, pasan cada vez más rápido. */
export function ShotRows() {
  const frame = useCurrentFrame()
  const offset = 2.5 * frame + 0.22 * frame * frame
  const speed = 2.5 + 0.44 * frame
  const blur = Math.min(7, speed * 0.12)
  const collapse = progress(frame, 94, 22, easeInOut)
  const first = Math.floor(offset / ROW_H) - 6

  return (
    <LaunchStage>
      <Ground kind="dark" />
      <AbsoluteFill
        style={{
          transform: `perspective(1600px) rotateX(${26 + collapse * 12}deg) rotateZ(-6deg) scaleY(${1 - collapse * 0.7})`,
          transformOrigin: "50% 40%",
          opacity: progress(frame, 0, 12) * (1 - collapse),
          filter: `blur(${blur}px)`,
        }}
      >
        {Array.from({ length: 18 }, (_, k) => {
          const v = first + k
          const d =
            DEBTORS[((v % DEBTORS.length) + DEBTORS.length) % DEBTORS.length]
          const y = v * ROW_H - offset + 80
          return (
            <div key={v} style={{ position: "absolute", left: 360, top: y }}>
              <Panel zoom={2} pad={0} radius={12} style={{ width: 600 }}>
                <div className="flex items-center gap-4 px-4 py-2.5 text-sm">
                  <div className="w-44">
                    <div className="font-medium">{d[0]}</div>
                    <div className="text-xs text-muted-foreground">{d[1]}</div>
                  </div>
                  <div className="flex-1 text-muted-foreground">{d[2]}</div>
                  <div className="font-medium tabular-nums">{d[3]}</div>
                  <Badge variant="outline">Impaga</Badge>
                </div>
              </Panel>
            </div>
          )
        })}
      </AbsoluteFill>
      <TileGrid
        {...PORTFOLIO_GRID}
        tilt={PORTFOLIO_TILT}
        status={() => "idle"}
        style={{ opacity: progress(frame, 104, 16) }}
      />
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 90,
          opacity: 1 - collapse,
        }}
      >
        <Kicker at={6}>Deudores</Kicker>
      </div>
    </LaunchStage>
  )
}

/** 3B · La cartera como 128 tiles. Seleccionar todas y lanzar las negociaciones. */
export function ShotSelect() {
  const frame = useCurrentFrame()
  const count = Math.round(
    interpolate(frame, [0, 28], [0, 128], {
      extrapolateRight: "clamp",
      easing: easeInOut,
    })
  )
  const checked = frame >= 34
  const cb = { x: 1138, y: 250 }
  const btn = { x: 1490, y: 392 }

  return (
    <LaunchStage>
      <Ground kind="dark" />
      <TileGrid
        {...PORTFOLIO_GRID}
        tilt={PORTFOLIO_TILT}
        status={() => "idle"}
        lit={(i) => progress(frame, 36 + rankOf(i) * 0.22, 10)}
      />
      <div style={{ position: "absolute", left: 110, top: 70 }}>
        <Kicker at={0}>Cartera morosa</Kicker>
        <div
          style={{
            marginTop: 10,
            fontSize: 92,
            fontWeight: 600,
            letterSpacing: "-0.045em",
            color: "#FAFAFA",
            lineHeight: 1.05,
          }}
        >
          <Mono style={{ letterSpacing: "-0.04em" }}>{count}</Mono> unidades con
          deuda
        </div>
      </div>
      <Float x={1100} y={210} at={16}>
        <Panel zoom={2} pad={10} radius={12}>
          <div className="flex items-center gap-2 text-sm">
            <span
              className="flex size-4 items-center justify-center rounded border border-input text-[0.6rem]"
              style={
                checked
                  ? {
                      background: "var(--primary)",
                      borderColor: "var(--primary)",
                      color: "#fff",
                    }
                  : undefined
              }
            >
              {checked ? "✓" : ""}
            </span>
            Seleccionar todas
          </div>
        </Panel>
      </Float>
      <Float x={1240} y={330} at={24}>
        <Panel tone="light" zoom={2.4} pad={8} radius={14}>
          <Button
            style={{
              transform: `scale(${1 - (progress(frame, 67, 3) - progress(frame, 70, 6)) * 0.06})`,
            }}
          >
            Nueva negociación · 128
          </Button>
        </Panel>
      </Float>
      <Cursor
        path={[
          [18, 1700, 1000],
          [32, cb.x, cb.y],
          [44, cb.x, cb.y],
          [64, btn.x, btn.y],
          [90, btn.x, btn.y],
        ]}
        clicks={[34, 70]}
      />
      <Iris
        p={progress(frame, 72, 18, easeInOut)}
        cx={btn.x}
        cy={btn.y}
        size0={30}
        shape="circle"
      >
        <Ground kind="mag" />
      </Iris>
    </LaunchStage>
  )
}
