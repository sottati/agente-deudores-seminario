import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { easeInOut, pop, progress } from "../../lib/anim"
import { Isotipo } from "../../ui/stage"
import {
  C,
  Camera,
  Float,
  Ground,
  Iris,
  IsoTrace,
  LaunchStage,
  Panel,
} from "../kit"
import { FieldCard } from "./rules"

const ISO = 300

/** 1A · El isotipo se dibuja trazo a trazo y se rellena (outline to fill). */
export function ShotTrace() {
  const frame = useCurrentFrame()
  const draw = progress(frame, 2, 42, easeInOut)
  const fill = progress(frame, 40, 14)
  const glow = progress(frame, 34, 22)
  return (
    <LaunchStage>
      <AbsoluteFill style={{ opacity: progress(frame, 0, 24) }}>
        <Ground kind="dark" />
      </AbsoluteFill>
      <AbsoluteFill className="items-center justify-center">
        <div
          style={{
            position: "absolute",
            width: ISO * 1.6,
            height: ISO * 1.6,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(195,25,82,${0.55 * glow}) 0%, transparent 65%)`,
            filter: "blur(30px)",
          }}
        />
        <div style={{ position: "relative", width: ISO, height: ISO }}>
          <IsoTrace size={ISO} draw={draw} fill={fill} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: progress(frame, 46, 10),
            }}
          >
            <Isotipo size={ISO} />
          </div>
        </div>
      </AbsoluteFill>
    </LaunchStage>
  )
}

/** Logo + wordmark sobre magenta. Lo reusa el cierre. */
export function MagLockup({
  at = 0,
  size = 190,
}: {
  at?: number
  size?: number
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = pop(frame, fps, at, 13)
  const word = "pacta.ai"
  return (
    <div className="flex items-center" style={{ gap: size * 0.26 }}>
      <div
        style={{
          transform: `scale(${0.6 + s * 0.4})`,
          opacity: Math.min(1, s * 1.5),
          borderRadius: size * 0.22,
          boxShadow: `0 0 0 ${size * 0.03}px ${C.blush}, 0 30px 60px rgba(70,0,25,.45)`,
        }}
      >
        <Isotipo size={size} />
      </div>
      <div
        style={{
          fontSize: size * 0.98,
          fontWeight: 600,
          letterSpacing: "-0.045em",
          lineHeight: 1,
          color: "#FFFFFF",
          display: "flex",
        }}
      >
        {word.split("").map((ch, i) => {
          const p = progress(frame, at + 6 + i * 2, 16)
          return (
            <span
              key={i}
              style={{
                overflow: "hidden",
                display: "inline-block",
                paddingBottom: size * 0.16,
                marginBottom: -size * 0.16,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  transform: `translateY(${(1 - p) * 105}%)`,
                }}
              >
                {ch}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

/** 1B · El cuadrado del isotipo se expande (iris) y queda el fondo magenta. */
export function ShotIris() {
  const frame = useCurrentFrame()
  const iris = progress(frame, 0, 18, easeInOut)
  const tagline = progress(frame, 34, 30)
  return (
    <LaunchStage>
      <Ground kind="dark" />
      <AbsoluteFill className="items-center justify-center">
        <Isotipo size={ISO} />
      </AbsoluteFill>
      <Iris p={iris} size0={ISO}>
        <Ground kind="mag" />
        <AbsoluteFill
          className="items-center justify-center"
          style={{ gap: 56 }}
        >
          <MagLockup at={12} />
          <p
            style={{
              fontSize: 40,
              fontWeight: 500,
              color: "rgba(252,240,244,.85)",
              letterSpacing: `${-0.06 + tagline * 0.06}em`,
              opacity: tagline,
            }}
          >
            Recuperá deuda sin convertir cada cobro en una pelea.
          </p>
        </AbsoluteFill>
      </Iris>
    </LaunchStage>
  )
}

/** 1C · Pull back: el logo se aleja y llegan piezas sueltas de la UI. */
export function ShotArrive() {
  const frame = useCurrentFrame()
  const back = progress(frame, 0, 22, easeInOut)
  const push = interpolate(frame, [0, 45], [1, 1.12])
  return (
    <LaunchStage>
      <Ground kind="mag" />
      <AbsoluteFill
        className="items-center justify-center"
        style={{
          opacity: 1 - back * 0.85,
          transform: `scale(${1 - back * 0.55})`,
          filter: `blur(${back * 6}px)`,
        }}
      >
        <MagLockup at={-60} />
      </AbsoluteFill>
      <Camera scale={push} x={-frame * 2} y={-frame}>
        <Float x={150} y={150} depth={2} rot={-6} at={4}>
          <FieldCard
            on="mag"
            label="Cuota mínima ($)"
            value="25.000"
            width={240}
          />
        </Float>
        <Float x={1400} y={760} depth={2} rot={5} at={8}>
          <Panel on="mag" pad={8} radius={999}>
            <Badge variant="secondary">En conversación</Badge>
          </Panel>
        </Float>
        <Float x={1300} y={170} depth={1} rot={4} at={10}>
          <FieldCard
            on="mag"
            label="Tono"
            value="Empático y formal"
            select
            width={250}
          />
        </Float>
        <Float x={380} y={600} depth={0} rot={-3} at={14} focusAt={22}>
          <FieldCard
            on="mag"
            label="Cantidad máxima de cuotas"
            value="3"
            stepper
            width={280}
          />
        </Float>
        <Float x={1000} y={520} depth={0} rot={2} at={18}>
          <Panel tone="light" on="mag" pad={8}>
            <Button>Guardar reglas</Button>
          </Panel>
        </Float>
      </Camera>
    </LaunchStage>
  )
}
