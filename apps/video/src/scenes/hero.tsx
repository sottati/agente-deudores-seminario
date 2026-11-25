import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AbsoluteFill, useCurrentFrame } from "remotion"

import { Button } from "@/components/ui/button"

import { progress, rise } from "../lib/anim"
import { Backdrop, Stage, Zoom } from "../ui/stage"

const HEADLINE = "Recuperá deuda sin convertir cada cobro en una pelea."

export function HeroScene() {
  const frame = useCurrentFrame()
  const words = HEADLINE.split(" ")
  const press = progress(frame, 108, 6) - progress(frame, 114, 8)

  return (
    <Stage>
      <Backdrop />
      <AbsoluteFill className="items-center justify-center px-40 text-center">
        <p
          className="mb-10 text-[22px] font-medium tracking-[0.18em] text-white/60 uppercase"
          style={rise(frame, 0)}
        >
          La solución
        </p>
        <h1 className="max-w-[1380px] text-[104px] leading-[1.02] font-semibold tracking-[-0.05em] text-balance text-white">
          {words.map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="inline-block"
              style={{
                ...rise(frame, 6 + i * 3.2, 30, 20),
                marginRight: "0.24em",
              }}
            >
              {word}
            </span>
          ))}
        </h1>
        <p
          className="mt-10 max-w-[1080px] text-[32px] leading-[1.45] text-white/78"
          style={rise(frame, 44, 24)}
        >
          pacta.ai conversa con cada deudor, propone planes dentro de tu
          política y registra el acuerdo. Vos intervenís cuando hace falta.
        </p>
        <Zoom
          factor={2}
          className="mt-7 flex items-center gap-3"
          style={rise(frame, 62, 20)}
        >
          <Button
            size="lg"
            className="h-11 px-4"
            style={{ transform: `scale(${1 - press * 0.05})` }}
          >
            Probar el dashboard
            <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 border-white/30 bg-white/10 px-4 text-white backdrop-blur"
          >
            Ver cómo funciona
          </Button>
        </Zoom>
      </AbsoluteFill>
    </Stage>
  )
}
