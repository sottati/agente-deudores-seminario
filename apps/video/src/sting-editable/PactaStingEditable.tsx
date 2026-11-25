/**
 * PactaStingEditable: copia de PactaSting armada para editarse desde Remotion
 * Studio. Cada plano es una <Sequence> escrita a mano con `from` y
 * `durationInFrames` literales (frames de 60 fps), así que los cortes se pueden
 * mover y recortar desde el timeline.
 *
 * Los valores salen de Math.ceil(cut(n) * 2), con cut(n) = 96 + 14.516 * n - 2
 * (frames de guion a 30 fps, 124 BPM, drop en el beat 0). Cada corte cae 2
 * frames de guion (4 frames de composición) antes de su beat.
 *
 * Dentro de cada plano, `useCurrentFrame()` es el frame local de la Sequence a
 * 60 fps. Las animaciones principales están como interpolate(frame, ...) en
 * línea; lo que sigue siendo cálculo recibe `f`, el frame "viejo" del guion.
 */
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion"

import { font } from "./kit"
import { S1, S2, S3 } from "./shots-a"
import { S4, S5, S6, S7, S8 } from "./shots-b"
import { Chat, Config, Fanout } from "./shots-product"

/**
 * `finalRosa`: la pantalla final (S8) va sobre el rosa Pacta en vez del fondo oscuro.
 * `orbitaIconos`: en S2 orbitan insignias con íconos (chat, pago, acuerdo, acta)
 * en vez de los cuadrados lisos.
 */
export function PactaStingEditable({
  finalRosa = false,
  orbitaIconos = false,
}: {
  finalRosa?: boolean
  orbitaIconos?: boolean
}) {
  return (
    <AbsoluteFill
      className="antialiased"
      style={{
        fontFamily: font,
        background: "#FDFBFC",
        overflow: "hidden",
        color: "#000000"
      }}
    >
      {/* Intro, antes del drop */}
      <Sequence name="S1" from={0} durationInFrames={188} layout="none">
        <S1 />
      </Sequence>
      {/* cut(0): drop, beat 0 en el frame 192 */}
      <Sequence name="S2" from={188} durationInFrames={117} layout="none">
        <S2 orbita={orbitaIconos ? "iconos" : "cuadrados"} />
      </Sequence>
      {/* cut(4): beat 4 en el frame 308.13 */}
      <Sequence name="Config" from={299} durationInFrames={464} layout="none">
        <Config />
      </Sequence>
      {/* cut(20): beat 20 en el frame 772.65 */}
      {/* cut(26): beat 26 en el frame 946.84 */}
      <Sequence name="Fanout" from={769} durationInFrames={233} layout="none">
        <Fanout />
      </Sequence>
      {/* cut(34): beat 34 en el frame 1179.10 */}
      <Sequence name="Chat" from={1002} durationInFrames={348} layout="none">
        <Chat />
      </Sequence>
      {/* cut(46): beat 46 en el frame 1527.48 */}
      <Sequence name="S4" from={1350} durationInFrames={145} layout="none">
        <S4 />
      </Sequence>
      {/* cut(51): beat 51 en el frame 1672.65 */}
      <Sequence name="S5" from={1495} durationInFrames={145} layout="none">
        <S5 />
      </Sequence>
      {/* cut(56): beat 56 en el frame 1817.81 */}
      <Sequence name="S6" from={1640} durationInFrames={116} layout="none">
        <S6 />
      </Sequence>
      {/* cut(60): beat 60 en el frame 1933.94 */}
      <Sequence name={"S7"} from={1756} durationInFrames={149} layout="none">
        <S8 rosa={finalRosa} />
      </Sequence>
      <Sequence name={"S8"} from={1905} durationInFrames={88} layout="none">
        <S7 />
      </Sequence>
      {/* cut(63): beat 63 en el frame 2021.03; termina en beat(68), frame 2167 */}
      <Audio name="Música" src={staticFile("audio/pacta-sting.wav")} />
    </AbsoluteFill>
  )
}
