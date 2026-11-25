import { AbsoluteFill, useCurrentFrame } from "remotion"

import { rise } from "../lib/anim"
import { ACCENT } from "../ui/feature-caption"
import { Backdrop, Stage } from "../ui/stage"
import { Lockup } from "./intro"

const pillars = ["Reglas claras", "Acuerdos trazables", "Menos trabajo manual"]

export function OutroScene() {
  const frame = useCurrentFrame()
  return (
    <Stage>
      <Backdrop />
      <AbsoluteFill className="items-center justify-center text-center">
        <Lockup size={150} />
        <p
          className="mt-14 max-w-[1100px] text-[40px] leading-[1.3] font-medium tracking-[-0.02em] text-balance text-white/85"
          style={rise(frame, 56, 24)}
        >
          Negociá deuda vencida sin desgastar la relación con tus vecinos.
        </p>
        <div className="mt-12 flex items-center gap-4">
          {pillars.map((pillar, i) => (
            <span
              key={pillar}
              className="rounded-full border border-white/20 bg-white/8 px-6 py-2.5 text-[24px] text-white/85 backdrop-blur"
              style={rise(frame, 76 + i * 7, 16)}
            >
              <span style={{ color: ACCENT }}>●</span> {pillar}
            </span>
          ))}
        </div>
      </AbsoluteFill>
    </Stage>
  )
}
