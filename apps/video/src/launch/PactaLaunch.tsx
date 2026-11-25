import type { ComponentType } from "react"
import { Series } from "remotion"

import { ShotChat, ShotHandoff, ShotLaunch, ShotWork } from "./shots/army"
import { ShotConverge, ShotEndCard } from "./shots/closing"
import { ShotArrive, ShotIris, ShotTrace } from "./shots/opening"
import { ShotRows, ShotSelect } from "./shots/portfolio"
import { ShotChart, ShotKpis } from "./shots/results"
import { ShotFields, ShotStepper, ShotTone } from "./shots/rules"

/**
 * Versión "launch film" del pitch: componentes flotantes y fondos que
 * alternan oscuro, magenta y claro. Sigue el storyboard v3, plano por plano.
 * Los cortes son secos; las transiciones (iris, wipe, zoom a través de un
 * tile) viven dentro de cada plano.
 */
const shots: { id: string; component: ComponentType; duration: number }[] = [
  { id: "1A", component: ShotTrace, duration: 60 },
  { id: "1B", component: ShotIris, duration: 75 },
  { id: "1C", component: ShotArrive, duration: 45 },
  { id: "2A", component: ShotFields, duration: 120 },
  { id: "2B", component: ShotStepper, duration: 150 },
  { id: "2C", component: ShotTone, duration: 150 },
  { id: "3A", component: ShotRows, duration: 120 },
  { id: "3B", component: ShotSelect, duration: 90 },
  { id: "4A", component: ShotLaunch, duration: 120 },
  { id: "4B", component: ShotWork, duration: 150 },
  { id: "4C", component: ShotChat, duration: 150 },
  { id: "4D", component: ShotHandoff, duration: 120 },
  { id: "5A", component: ShotChart, duration: 180 },
  { id: "5B", component: ShotKpis, duration: 210 },
  { id: "6t", component: ShotConverge, duration: 60 },
  { id: "6A", component: ShotEndCard, duration: 150 },
]

export const LAUNCH_DURATION = shots.reduce((t, s) => t + s.duration, 0)

/** Frame de inicio de cada plano, para exportar stills por id. */
export const SHOT_START = shots.reduce<Record<string, number>>((acc, s, i) => {
  acc[s.id] = i === 0 ? 0 : acc[shots[i - 1].id] + shots[i - 1].duration
  return acc
}, {})

export function PactaLaunch() {
  return (
    <Series>
      {shots.map((s) => {
        const Component = s.component
        return (
          <Series.Sequence key={s.id} name={s.id} durationInFrames={s.duration}>
            <Component />
          </Series.Sequence>
        )
      })}
    </Series>
  )
}
