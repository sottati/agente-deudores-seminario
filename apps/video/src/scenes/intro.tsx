import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion"

import { pop, progress, rise } from "../lib/anim"
import { Backdrop, Isotipo, Stage } from "../ui/stage"

/** Logo + wordmark. Reutilizado por el cierre. */
export function Lockup({
  delay = 0,
  size = 168,
}: {
  delay?: number
  size?: number
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = pop(frame, fps, delay + 4, 12)
  const reveal = progress(frame, delay + 30, 30)
  const glow = interpolate(Math.sin(frame / 14), [-1, 1], [0.55, 0.9])

  return (
    <div className="flex items-center justify-center">
      <div
        className="relative"
        style={{
          transform: `scale(${0.4 + s * 0.6}) rotate(${(1 - s) * -12}deg)`,
          opacity: Math.min(1, s * 1.4),
        }}
      >
        <div
          className="absolute inset-0 rounded-[40px] blur-3xl"
          style={{ backgroundColor: "#C31952", opacity: glow * s }}
        />
        <Isotipo size={size} style={{ position: "relative" }} />
      </div>
      <div style={{ maxWidth: reveal * 760, overflow: "hidden" }}>
        <span
          className="block pl-10 font-semibold tracking-[-0.035em] whitespace-nowrap text-white lowercase"
          style={{
            fontSize: size * 0.95,
            lineHeight: 1,
            opacity: reveal,
            transform: `translateX(${(1 - reveal) * -40}px)`,
          }}
        >
          pacta.ai
        </span>
      </div>
    </div>
  )
}

export function IntroScene() {
  const frame = useCurrentFrame()
  const exit = progress(frame, 100, 20)

  return (
    <Stage>
      <Backdrop intensity={progress(frame, 0, 30)} />
      <AbsoluteFill
        className="items-center justify-center"
        style={{ transform: `scale(${1 + exit * 0.06})` }}
      >
        <Lockup />
        <p
          className="mt-14 text-[30px] font-medium tracking-[0.32em] text-white/65 uppercase"
          style={rise(frame, 62)}
        >
          Cobranzas B2B con IA
        </p>
      </AbsoluteFill>
    </Stage>
  )
}
