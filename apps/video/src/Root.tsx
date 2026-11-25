import { Composition } from "remotion"

import "./styles.css"
import { LAUNCH_DURATION, PactaLaunch } from "./launch/PactaLaunch"
import { PactaPitch, PITCH_DURATION } from "./PactaPitch"
import { FPS, HEIGHT, WIDTH } from "./lib/constants"
import { PactaSting, STING_DURATION, STING_FPS } from "./sting/PactaSting"
import { PactaStingEditable } from "./sting-editable/PactaStingEditable"

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="PactaPitch"
        component={PactaPitch}
        durationInFrames={PITCH_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="PactaLaunch"
        component={PactaLaunch}
        durationInFrames={LAUNCH_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="PactaSting"
        component={PactaSting}
        durationInFrames={STING_DURATION}
        fps={STING_FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* Copia de PactaSting editable desde el Studio (valores en línea a propósito). */}
      <Composition
        id="PactaStingEditable"
        component={PactaStingEditable}
        durationInFrames={2167}
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  )
}
