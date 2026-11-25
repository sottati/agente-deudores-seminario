/**
 * PactaSting: launch film de ~36 s en 16:9, a 60 fps. El guion está escrito en
 * frames de 30 fps y se renderiza al doble (f = frame / 2).
 *
 * Música: "Rising Forest" (Diego Nava, Mixkit) desde el segundo 43.265, a
 * 124 BPM. El drop cae en f96 y cada corte seco cae 2 frames antes de un beat.
 * Los planos heredados del sting corto reciben un frame "viejo" remapeado
 * (tabla nuevo → viejo); los planos de producto reciben su frame local.
 */
import type { ReactNode } from "react"
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion"

import { font, kf, P } from "./kit"
import { S1, S2, S3 } from "./shots-a"
import { S4, S5, S6, S7, S8 } from "./shots-b"
import { Chat, Config, Fanout } from "./shots-product"

export const STING_FPS = 60
export const BEAT = 30 * (60 / 124) // 14.516 frames de guion
/** Frame de guion del beat j (j = 0 es el drop). */
export const beat = (j: number) => 96 + BEAT * j
/** Corte seco: 2 frames antes del beat. */
export const cut = (j: number) => beat(j) - 2
export const END = beat(68)
export const STING_DURATION = Math.ceil(END * 2)

type Shot = { name: string; from: number; render: (f: number) => ReactNode }

const remap = (table: [number, number][]) => (f: number) => kf(f, table)

export const SHOTS: Shot[] = [
  { name: "S1", from: 0, render: (f) => <S1 f={remap([[0, 0], [cut(0), 72]])(f)} /> },
  {
    name: "S2",
    from: cut(0),
    render: (f) => (
      <S2 f={remap([[cut(0), 72], [cut(0) + 28, 86], [cut(4) - 12, 92], [cut(4), 100]])(f)} />
    ),
  },
  { name: "Config", from: cut(4), render: (f) => <Config l={f - cut(4)} /> },
  { name: "S3", from: cut(20), render: (f) => <S3 f={remap([[cut(20), 101], [cut(26), 158]])(f)} /> },
  { name: "Fanout", from: cut(26), render: (f) => <Fanout l={f - cut(26)} /> },
  { name: "Chat", from: cut(34), render: (f) => <Chat l={f - cut(34)} /> },
  {
    name: "S4",
    from: cut(46),
    render: (f) => <S4 f={remap([[cut(46), 159], [cut(46) + 40, 180], [cut(51), 186]])(f)} />,
  },
  {
    name: "S5",
    from: cut(51),
    render: (f) => (
      <S5 f={remap([[cut(51), 187], [cut(51) + 30, 203], [cut(56) - 10, 207], [cut(56), 214]])(f)} />
    ),
  },
  {
    name: "S6",
    from: cut(56),
    render: (f) => (
      <S6 f={remap([[cut(56), 215], [cut(56) + 28, 230], [cut(60) - 10, 238], [cut(60), 244]])(f)} />
    ),
  },
  {
    name: "S7",
    from: cut(60),
    render: (f) => (
      <S7 f={remap([[cut(60), 245], [cut(60) + 18, 262], [cut(60) + 30, 287], [cut(63), 300]])(f)} />
    ),
  },
  {
    name: "S8",
    from: cut(63),
    render: (f) => (
      <S8 f={remap([[cut(63), 301], [cut(63) + 20, 318], [END - 14, 348], [END, 359]])(f)} />
    ),
  },
]

/** Primer frame de composición (60 fps) en el que se ve cada plano. */
const starts = SHOTS.map((s) => Math.ceil(s.from * 2))

/** Pasa el frame local de la Sequence al frame de guion global. */
function ShotFrame({ shot, start }: { shot: Shot; start: number }) {
  const local = useCurrentFrame()
  return <>{shot.render((local + start) / 2)}</>
}

export function PactaSting() {
  return (
    <AbsoluteFill
      className="antialiased"
      style={{ fontFamily: font, background: P.page, overflow: "hidden" }}
    >
      {SHOTS.map((shot, i) => {
        const start = starts[i]
        const end = i + 1 < SHOTS.length ? starts[i + 1] : STING_DURATION
        return (
          <Sequence
            key={shot.name}
            name={shot.name}
            from={start}
            durationInFrames={end - start}
            layout="none"
          >
            <ShotFrame shot={shot} start={start} />
          </Sequence>
        )
      })}
      <Audio name="Música" src={staticFile("audio/pacta-sting.wav")} />
    </AbsoluteFill>
  )
}
