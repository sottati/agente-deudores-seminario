import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useCurrentFrame } from "remotion"

import { progress, rise } from "../lib/anim"

export const ACCENT = "#F27BA3"

type Chip = { label: string; at: number }

export function FeatureCaption({
  step,
  eyebrow,
  title,
  body,
  chips = [],
  width = 660,
}: {
  step: string
  eyebrow: string
  title: string
  body: string
  chips?: Chip[]
  width?: number
}) {
  const frame = useCurrentFrame()
  const line = progress(frame, 4, 30)

  return (
    <div style={{ width }} className="flex flex-col">
      <div className="flex items-center gap-4" style={rise(frame, 0)}>
        <span
          className="font-mono text-[26px] font-medium tabular-nums"
          style={{ color: ACCENT }}
        >
          {step}
        </span>
        <span className="h-px bg-white/30" style={{ width: 72 * line }} />
        <span className="text-[22px] font-medium tracking-[0.18em] text-white/60 uppercase">
          {eyebrow}
        </span>
      </div>
      <h2
        className="mt-7 text-[68px] leading-[1.02] font-semibold tracking-[-0.045em] text-balance text-white"
        style={rise(frame, 6, 36)}
      >
        {title}
      </h2>
      <p
        className="mt-7 text-[27px] leading-[1.45] text-pretty text-white/70"
        style={rise(frame, 14, 30)}
      >
        {body}
      </p>
      {chips.length > 0 && (
        <div className="mt-10 flex flex-col gap-3.5">
          {chips.map((chip) => {
            const p = progress(frame, chip.at, 16)
            return (
              <div
                key={chip.label}
                className="flex items-center gap-3 text-[24px] text-white/85"
                style={{
                  opacity: p,
                  transform: `translateX(${(1 - p) * -24}px)`,
                }}
              >
                <span
                  className="flex size-9 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "rgba(195,25,82,0.22)",
                    color: ACCENT,
                  }}
                >
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    size={22}
                    strokeWidth={2}
                  />
                </span>
                {chip.label}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
