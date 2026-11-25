import { linearTiming, TransitionSeries } from "@remotion/transitions"
import { fade } from "@remotion/transitions/fade"
import { slide } from "@remotion/transitions/slide"
import type { ComponentType } from "react"

import { TRANSITION } from "./lib/constants"
import { AgreementScene } from "./scenes/agreement"
import { ConversationScene } from "./scenes/conversation"
import { DashboardScene } from "./scenes/dashboard"
import { HandoffScene } from "./scenes/handoff"
import { HeroScene } from "./scenes/hero"
import { IntroScene } from "./scenes/intro"
import { OutroScene } from "./scenes/outro"
import { ProblemScene } from "./scenes/problem"
import { RulesScene } from "./scenes/rules"

type Scene = {
  component: ComponentType
  duration: number
  /** Transición con la que entra la escena. */
  enter?: "fade" | "slide"
}

const scenes: Scene[] = [
  { component: IntroScene, duration: 120 },
  { component: ProblemScene, duration: 170, enter: "fade" },
  { component: HeroScene, duration: 140, enter: "fade" },
  { component: RulesScene, duration: 225, enter: "slide" },
  { component: ConversationScene, duration: 320, enter: "slide" },
  { component: AgreementScene, duration: 225, enter: "slide" },
  { component: HandoffScene, duration: 215, enter: "slide" },
  { component: DashboardScene, duration: 270, enter: "fade" },
  { component: OutroScene, duration: 170, enter: "fade" },
]

export const PITCH_DURATION =
  scenes.reduce((total, scene) => total + scene.duration, 0) -
  (scenes.length - 1) * TRANSITION

export function PactaPitch() {
  return (
    <TransitionSeries>
      {scenes.flatMap((scene, i) => {
        const Component = scene.component
        const items = []
        if (i > 0) {
          items.push(
            <TransitionSeries.Transition
              key={`t-${i}`}
              presentation={
                scene.enter === "slide"
                  ? slide({ direction: "from-right" })
                  : fade()
              }
              timing={linearTiming({ durationInFrames: TRANSITION })}
            />
          )
        }
        items.push(
          <TransitionSeries.Sequence
            key={`s-${i}`}
            durationInFrames={scene.duration}
          >
            <Component />
          </TransitionSeries.Sequence>
        )
        return items
      })}
    </TransitionSeries>
  )
}
