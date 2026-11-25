/**
 * Planos de producto: configuración de reglas, envío a toda la cartera y
 * negociación por chat. Reciben `l`, el frame local del plano (a 30 fps).
 */
import type { CSSProperties, ReactNode } from "react"

import {
  AppIcon,
  blur,
  camAt,
  camSpeed,
  camStyle,
  Cursor,
  CX,
  CY,
  hash,
  inCubic,
  inOut,
  inQuad,
  Kicker,
  kf,
  LogoDisc,
  Mark,
  mix,
  outCubic,
  outExpo,
  P,
  pressAt,
  prog,
  Smear,
  W,
} from "./kit"

const ars = (v: number) => `$ ${Math.round(v).toLocaleString("es-AR")}`

/* ================================================================== */
/* CONFIG · 16 beats (~232 frames)                                     */
/* ================================================================== */

export const CONFIG_LEN = 232.3

// Geometría en coordenadas de contenido.
const PANEL = { x: 170, y: 80, w: 1580, h: 920 }
const STEP_PLUS = { x: 1068, y: 355 }
const SLIDER = { x0: 266, x1: 986, y: 560 }
const TONE = { x: 266, y: 698, w: 270, gap: 12 }
const TEXTAREA = { x: 266, y: 852 }
const SAVE = { x: 1564, y: 164 }

const CLICKS_PLUS = [46, 58, 70]
const CLICK_TONE = 142
const CLICK_TEXT = 160
const CLICK_SAVE = 212
export const CONFIG_CLICKS = [...CLICKS_PLUS, CLICK_TONE, CLICK_TEXT, CLICK_SAVE]
const NOTE = "Atendemos de lunes a viernes de 9 a 17."
export const CONFIG_TYPE = { from: 164, to: 196 }

const CAM: [number, number, number, number][] = [
  [0, CX, 500, 0.9],
  [22, CX, 500, 0.92],
  [38, 900, 372, 1.55],
  [74, 910, 372, 1.56],
  [90, 700, 556, 1.55],
  [122, 712, 556, 1.56],
  [136, 690, 712, 1.55],
  [150, 700, 712, 1.56],
  [164, 690, 876, 1.5],
  [196, 700, 872, 1.52],
  [212, CX, 500, 0.9],
  [232.3, CX, 496, 0.9],
]

const CUR: [number, number, number][] = [
  [16, 1320, 720],
  [40, STEP_PLUS.x - 4, STEP_PLUS.y + 6],
  [76, STEP_PLUS.x - 4, STEP_PLUS.y + 6],
  [94, 410, SLIDER.y + 4],
  [98, 410, SLIDER.y + 4],
  [122, 698, SLIDER.y + 4],
  [126, 698, SLIDER.y + 4],
  [140, 683, TONE.y + 26],
  [148, 683, TONE.y + 26],
  [160, 930, TEXTAREA.y + 50],
  [198, 930, TEXTAREA.y + 50],
  [211, SAVE.x - 20, SAVE.y + 8],
]

function cursorAt(l: number) {
  const fs = CUR.map((c) => c[0])
  const xs: [number, number][] = CUR.map((c, i) => [fs[i], c[1]])
  const ys: [number, number][] = CUR.map((c, i) => [fs[i], c[2]])
  return { x: kf(l, xs, inOut), y: kf(l, ys, inOut) }
}

function Card({
  x,
  y,
  w,
  h,
  children,
  glow = 0,
}: {
  x: number
  y: number
  w: number
  h: number
  children: ReactNode
  glow?: number
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 28,
        background: "#fff",
        boxShadow: `inset 0 0 0 ${1 + glow}px rgba(195,25,82,${0.08 + glow * 0.25}), 0 8px 24px rgba(110,12,48,${0.04 + glow * 0.05})`,
      }}
    >
      {children}
    </div>
  )
}

const label: CSSProperties = { fontSize: 26, fontWeight: 600, color: P.ink }
const hint: CSSProperties = { fontSize: 20, color: "#9D9599", marginTop: 6 }

export function Config({ l }: { l: number }) {
  const cam = camAt(l, CAM)
  const { vx, vy } = camSpeed(l, CAM)
  // Entra desde el zoom a través del ícono: llega grande y desenfocado.
  const enter = prog(l, 0, 14, outExpo)
  const enterScale = mix(1.14, 1, enter)
  const enterBlur = (1 - enter) * 14
  // Salida: latigazo hacia arriba.
  const exitY = l < 214 ? 0 : 0.6 * Math.pow(l - 214, 2.3)
  const exitBlur = kf(l, [
    [216, 0],
    [232.3, 12],
  ], inQuad)

  const steps = 3 + CLICKS_PLUS.filter((c) => l >= c + 1).length
  const stepPop = CLICKS_PLUS.reduce(
    (a, c) => Math.max(a, prog(l, c + 1, c + 3) - prog(l, c + 3, c + 9)),
    0
  )
  const quita = kf(l, [
    [98, 10],
    [122, 30],
  ], inOut)
  const tone = prog(l, CLICK_TONE, CLICK_TONE + 9, outExpo)
  const typed = Math.min(
    NOTE.length,
    Math.max(0, Math.round((l - CONFIG_TYPE.from) * (NOTE.length / (CONFIG_TYPE.to - CONFIG_TYPE.from))))
  )
  const textFocus = l >= CLICK_TEXT
  const saved = prog(l, CLICK_SAVE + 1, CLICK_SAVE + 10, outExpo)
  const cur = cursorAt(l)
  const press = pressAt(l, CONFIG_CLICKS)
  const curOn = prog(l, 16, 20)
  const debt = 186400
  const interest = 56400
  const minimum = debt - interest * (quita / 100)
  const focusA = prog(l, 30, 40) - prog(l, 78, 88)
  const focusB = prog(l, 84, 92) - prog(l, 124, 134)
  const focusC = prog(l, 128, 138) - prog(l, 150, 160)
  const focusD = prog(l, 156, 164) - prog(l, 198, 208)

  return (
    <div style={{ position: "absolute", inset: 0, background: P.page, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(60% 50% at 80% 0%, #FBE3EC 0%, rgba(253,251,252,0) 70%), radial-gradient(50% 50% at 0% 100%, ${P.floor} 0%, rgba(253,251,252,0) 70%)`,
        }}
      />
      <Smear id="cfg" x={Math.min(10, vx * 0.12) + enterBlur * 0.3} y={Math.min(10, vy * 0.12) + exitBlur}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateY(${-exitY}px) scale(${enterScale})`,
            transformOrigin: `${CX}px ${CY}px`,
            filter: blur(enterBlur),
          }}
        >
          <div style={camStyle(cam)}>
            {/* Panel */}
            <div
              style={{
                position: "absolute",
                left: PANEL.x,
                top: PANEL.y,
                width: PANEL.w,
                height: PANEL.h,
                borderRadius: 48,
                background: "#FFFDFE",
                boxShadow: "0 0 0 1px #F1E3E9, 0 40px 90px rgba(110,12,48,.10)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 56,
                  top: 48,
                  width: 68,
                  height: 68,
                  borderRadius: 20,
                  background: P.primary,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Mark size={44} color="#fff" weight={4.4} />
              </div>
              <div style={{ position: "absolute", left: 148, top: 42, fontSize: 46, fontWeight: 600, letterSpacing: -1, color: P.ink }}>
                Reglas del agente
              </div>
              <div style={{ position: "absolute", left: 148, top: 100, fontSize: 24, color: "#9D9599" }}>
                El agente negocia solo dentro de estos límites.
              </div>
              <div
                style={{
                  position: "absolute",
                  left: PANEL.w - 56 - 260,
                  top: 52,
                  width: 260,
                  height: 64,
                  borderRadius: 18,
                  background: saved > 0 ? "#2E2A2C" : P.primary,
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: 600,
                  display: "grid",
                  placeItems: "center",
                  transform: `scale(${1 - 0.05 * pressAt(l, [CLICK_SAVE])})`,
                  boxShadow: "0 8px 20px rgba(195,25,82,.25)",
                }}
              >
                {saved > 0 ? "Guardado ✓" : "Guardar reglas"}
              </div>
              <div style={{ position: "absolute", left: 56, right: 56, top: 168, height: 1, background: "#F1E6EA" }} />
            </div>

            {/* A · Máximo de cuotas */}
            <Card x={226} y={280} w={930} h={150} glow={focusA}>
              <div style={{ position: "absolute", left: 40, top: 36 }}>
                <div style={label}>Máximo de cuotas</div>
                <div style={hint}>Sobre el total del plan en cuotas.</div>
              </div>
              <div style={{ position: "absolute", left: 632, top: 43, display: "flex", alignItems: "center", gap: 12 }}>
                <StepBtn sign="−" />
                <div
                  style={{
                    width: 90,
                    textAlign: "center",
                    fontSize: 50,
                    fontWeight: 600,
                    color: P.ink,
                    fontVariantNumeric: "tabular-nums",
                    transform: `translateY(${-stepPop * 6}px) scale(${1 + stepPop * 0.12})`,
                  }}
                >
                  {steps}
                </div>
                <StepBtn sign="+" pressed={pressAt(l, CLICKS_PLUS)} />
              </div>
            </Card>

            {/* B · Quita máxima de intereses */}
            <Card x={226} y={454} w={930} h={150} glow={focusB}>
              <div style={{ position: "absolute", left: 40, top: 30, ...label }}>Quita máxima de intereses</div>
              <div
                style={{
                  position: "absolute",
                  right: 40,
                  top: 24,
                  fontSize: 40,
                  fontWeight: 600,
                  color: P.primary,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {Math.round(quita)} %
              </div>
              <div style={{ position: "absolute", left: 40, top: SLIDER.y - 454 - 4, width: SLIDER.x1 - SLIDER.x0 - 80, height: 8, borderRadius: 4, background: "#F3E6EB" }} />
              <div
                style={{
                  position: "absolute",
                  left: 40,
                  top: SLIDER.y - 454 - 4,
                  width: ((SLIDER.x1 - SLIDER.x0 - 80) * quita) / 50,
                  height: 8,
                  borderRadius: 4,
                  background: P.primary,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 40 + ((SLIDER.x1 - SLIDER.x0 - 80) * quita) / 50 - 18,
                  top: SLIDER.y - 454 - 18,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  background: "#fff",
                  boxShadow: "0 0 0 3px #C31952, 0 4px 10px rgba(110,12,48,.2)",
                }}
              />
            </Card>

            {/* C · Tono */}
            <Card x={226} y={628} w={930} h={130} glow={focusC}>
              <div style={{ position: "absolute", left: 40, top: 22, ...label }}>Tono de la conversación</div>
              <div
                style={{
                  position: "absolute",
                  left: 34,
                  top: 64,
                  width: 3 * TONE.w + 2 * TONE.gap + 12,
                  height: 52,
                  borderRadius: 16,
                  background: "#F7F1F3",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 40 + tone * (TONE.w + TONE.gap),
                  top: 68,
                  width: TONE.w,
                  height: 44,
                  borderRadius: 12,
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(110,12,48,.12)",
                }}
              />
              {["Formal", "Empático y cercano", "Neutral"].map((t, i) => {
                const on = i === 0 ? 1 - tone : i === 1 ? tone : 0
                return (
                  <div
                    key={t}
                    style={{
                      position: "absolute",
                      left: 40 + i * (TONE.w + TONE.gap),
                      top: 68,
                      width: TONE.w,
                      height: 44,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 22,
                      fontWeight: 600,
                      color: on > 0.5 ? P.ink : "#A39CA0",
                    }}
                  >
                    {t}
                  </div>
                )
              })}
            </Card>

            {/* D · Indicaciones */}
            <Card x={226} y={782} w={930} h={180} glow={focusD}>
              <div style={{ position: "absolute", left: 40, top: 24, ...label }}>Indicaciones adicionales</div>
              <div
                style={{
                  position: "absolute",
                  left: 40,
                  top: 70,
                  width: 850,
                  height: 86,
                  borderRadius: 16,
                  boxShadow: textFocus ? "inset 0 0 0 2px #C31952, 0 0 0 5px rgba(195,25,82,.12)" : "inset 0 0 0 1px #EADDE3",
                  padding: "26px 24px",
                  fontSize: 26,
                  color: typed ? P.ink : "#B7AEB2",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  boxSizing: "border-box",
                }}
              >
                {typed ? NOTE.slice(0, typed) : "Por ejemplo: horarios, medios de pago…"}
                {textFocus && <span style={{ width: 2.5, height: 32, background: P.ink, marginLeft: 2, order: typed ? 1 : -1 }} />}
              </div>
            </Card>

            {/* E · Margen de negociación (se actualiza en vivo) */}
            <Card x={1206} y={280} w={488} h={420}>
              <div style={{ position: "absolute", left: 36, top: 32, ...label }}>Margen de negociación</div>
              <div style={{ position: "absolute", left: 36, top: 92, display: "flex", gap: 10, alignItems: "flex-end", height: 96 }}>
                {Array.from({ length: 6 }, (_, i) => {
                  const on = i < steps ? 1 : 0
                  const pop = i === steps - 1 ? stepPop : 0
                  return (
                    <div
                      key={i}
                      style={{
                        width: 58,
                        height: 96 * (0.55 + 0.45 * on) * (1 + pop * 0.08),
                        borderRadius: 12,
                        background: on ? (i === 0 ? P.primary : "#F27BA3") : "#F4ECEF",
                        opacity: on ? 1 : 0.9,
                      }}
                    />
                  )
                })}
              </div>
              <div style={{ position: "absolute", left: 36, right: 36, top: 214, fontSize: 21, color: "#9D9599", display: "grid", gap: 14 }}>
                <Row k="Deuda original" v={ars(debt)} />
                <Row k="Mínimo que puede cobrar" v={ars(minimum)} strong />
                <Row k="Plan más largo" v={`${steps} pagos`} strong />
              </div>
            </Card>

            {/* F · Derivación */}
            <Card x={1206} y={724} w={488} h={238}>
              <div style={{ position: "absolute", left: 36, top: 30, ...label }}>Derivar a una persona desde</div>
              <div
                style={{
                  position: "absolute",
                  left: 36,
                  top: 84,
                  width: 416,
                  height: 64,
                  borderRadius: 16,
                  boxShadow: "inset 0 0 0 1px #EADDE3",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 22px",
                  fontSize: 28,
                  fontWeight: 500,
                  color: P.ink,
                  boxSizing: "border-box",
                }}
              >
                $ 500.000
              </div>
              <div style={{ position: "absolute", left: 36, top: 168, ...hint }}>Montos mayores van a la administración.</div>
            </Card>

            {/* Aviso de guardado */}
            {saved > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: CX - 330,
                  top: 20 + (1 - saved) * -30,
                  width: 660,
                  height: 66,
                  borderRadius: 33,
                  background: "#2E2A2C",
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  opacity: saved,
                  filter: blur((1 - saved) * 8),
                  boxShadow: "0 16px 40px rgba(22,21,22,.25)",
                }}
              >
                <CheckDot />
                Reglas guardadas · el agente ya negocia con ellas
              </div>
            )}

            {l >= 16 && (
              <Cursor x={cur.x} y={cur.y} opacity={curOn} scale={1 - press * 0.15} />
            )}
          </div>
        </div>
      </Smear>
      <Kicker n="01" text="Vos definís las reglas" l={l} at={10} />
    </div>
  )
}

function StepBtn({ sign, pressed = 0 }: { sign: string; pressed?: number }) {
  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 18,
        boxShadow: `inset 0 0 0 1px #EADDE3`,
        background: pressed > 0 ? `rgba(195,25,82,${0.1 * pressed})` : "#fff",
        display: "grid",
        placeItems: "center",
        fontSize: 34,
        fontWeight: 500,
        color: P.ink,
        transform: `scale(${1 - pressed * 0.06})`,
      }}
    >
      {sign}
    </div>
  )
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>{k}</span>
      <span style={{ color: P.ink, fontWeight: strong ? 600 : 500, fontVariantNumeric: "tabular-nums" }}>{v}</span>
    </div>
  )
}

function CheckDot({ size = 30, bg = P.primary }: { size?: number; bg?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: "none" }}>
      <circle cx={12} cy={12} r={12} fill={bg} />
      <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ================================================================== */
/* FANOUT · 8 beats (~116 frames)                                      */
/* ================================================================== */

export const FANOUT_LEN = 116.1

const DEBTORS: [string, string, string, number][] = [
  ["Marta Gómez", "Unidad 4B", "Av. Rivadavia 2840", 186400],
  ["Jorge Ferreyra", "Unidad 7A", "Sarmiento 912", 94250],
  ["Lucía Benítez", "Unidad 2C", "Mármol 1456", 231800],
  ["Raúl Medina", "Unidad 11D", "Av. Rivadavia 2840", 312400],
  ["Silvia Ortiz", "Unidad 3A", "Yatay 210", 76900],
  ["Pablo Herrera", "Unidad 9F", "Sarmiento 912", 148600],
  ["Carla Ruiz", "Unidad 1B", "Mármol 1456", 205300],
  ["Hernán Paz", "Unidad 6C", "Yatay 210", 88700],
  ["Inés Castro", "Unidad 5D", "Av. Rivadavia 2840", 132100],
  ["Diego Sosa", "Unidad 8B", "Sarmiento 912", 59800],
  ["Ana Romero", "Unidad 10A", "Mármol 1456", 274500],
  ["Tomás Vega", "Unidad 2F", "Yatay 210", 101300],
]

type Status = "pending" | "sent" | "talk" | "offer" | "agreed"

const STATUS: Record<Status, { label: string; bg: string; fg: string; ring?: string }> = {
  pending: { label: "Pendiente", bg: "#F6F2F4", fg: "#A39CA0" },
  sent: { label: "Link enviado", bg: "#fff", fg: P.primary, ring: "rgba(195,25,82,.35)" },
  talk: { label: "En conversación", bg: "#FBE7EE", fg: P.primary },
  offer: { label: "Oferta enviada", bg: "#F7CFDD", fg: P.deep },
  agreed: { label: "Acordada", bg: P.primary, fg: "#fff" },
}

const AGENT = { x: 380, y: 560 }
const LIST = { x: 700, y: 120, w: 1060 }
const ROW0 = 250
const ROW_H = 90

export function sentAt(i: number) {
  return 16 + i * 3.4
}

function statusAt(i: number, l: number): { s: Status; since: number } {
  const h = hash(i + 3)
  const sent = sentAt(i)
  if (i === 0) {
    if (l >= 84) return { s: "agreed", since: 84 }
    if (l >= 68) return { s: "offer", since: 68 }
    if (l >= 46) return { s: "talk", since: 46 }
  } else {
    const talk = 46 + i * 2.6 + h * 8
    const offer = 66 + i * 2.2 + h * 10
    const agreed = 86 + i * 1.5
    if (h > 0.8 && l >= agreed) return { s: "agreed", since: agreed }
    if (h > 0.5 && l >= offer) return { s: "offer", since: offer }
    if (h > 0.25 && l >= talk) return { s: "talk", since: talk }
  }
  if (l >= sent) return { s: "sent", since: sent }
  return { s: "pending", since: 0 }
}

function Pill({ s, pop }: { s: Status; pop: number }) {
  const m = STATUS[s]
  return (
    <div
      style={{
        height: 44,
        padding: "0 18px",
        borderRadius: 22,
        background: m.bg,
        color: m.fg,
        boxShadow: m.ring ? `inset 0 0 0 1.5px ${m.ring}` : undefined,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 20,
        fontWeight: 600,
        whiteSpace: "nowrap",
        transform: `scale(${1 + pop * 0.12})`,
      }}
    >
      {s === "sent" && (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <path d="M3 11l18-8-8 18-2-8z" stroke={m.fg} strokeWidth={2} strokeLinejoin="round" />
        </svg>
      )}
      {s === "agreed" && (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {m.label}
    </div>
  )
}

export function Fanout({ l }: { l: number }) {
  // Entra desde el latigazo: viene de abajo, corrido y desenfocado.
  const enterOff = kf(l, [
    [0, 380],
    [1, 280],
    [2, 200],
    [4, 110],
    [7, 48],
    [11, 14],
    [16, 0],
  ])
  const enterSmear = kf(l, [
    [0, 20],
    [3, 7],
    [7, 1.5],
    [10, 0],
  ])
  const flash = 1 - prog(l, 0, 7, outCubic)
  const scroll = -Math.max(0, l - 30) * 1.1
  // Salida: empuje hacia la fila de Marta.
  const push = prog(l, 98, FANOUT_LEN, inCubic)
  const row0y = LIST.y + ROW0 + scroll + ROW_H / 2
  const pushS = mix(1, 3.2, push)
  const pushBlur = push * 10
  const sent = Math.min(128, Math.floor(128 * prog(l, 16, 74, (t) => t * t * (3 - 2 * t))))
  const talking = Math.floor(57 * prog(l, 46, 108, outCubic))
  const agreed = l >= 84 ? 1 + Math.floor(11 * prog(l, 86, 112, outCubic)) : 0

  return (
    <div style={{ position: "absolute", inset: 0, background: P.page, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(45% 60% at 18% 55%, #FBE3EC 0%, rgba(253,251,252,0) 70%)` }} />
      <Smear id="fan" y={enterSmear} x={pushBlur * 0.4}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateY(${enterOff}px) scale(${pushS})`,
            transformOrigin: `${LIST.x + 300}px ${row0y}px`,
            filter: blur(pushBlur * 0.6),
          }}
        >
          {/* Agente */}
          {[0, 1, 2].map((k) => {
            const period = 14.516
            const t = ((l + k * (period / 1.5)) % (period * 2)) / (period * 2)
            return (
              <div
                key={k}
                style={{
                  position: "absolute",
                  left: AGENT.x - 75 - t * 120,
                  top: AGENT.y - 75 - t * 120,
                  width: 150 + t * 240,
                  height: 150 + t * 240,
                  borderRadius: "50%",
                  boxShadow: `inset 0 0 0 2px rgba(195,25,82,${0.35 * (1 - t)})`,
                }}
              />
            )
          })}
          <div style={{ position: "absolute", left: AGENT.x - 75, top: AGENT.y - 75 }}>
            <AppIcon size={150} />
          </div>
          <div style={{ position: "absolute", left: AGENT.x - 200, width: 400, top: AGENT.y + 104, textAlign: "center" }}>
            <div style={{ fontSize: 30, fontWeight: 600, color: P.ink }}>Agente de pacta</div>
            <div style={{ fontSize: 22, color: "#9D9599", marginTop: 6 }}>Escribe a cada deudor por WhatsApp</div>
          </div>

          {/* Lista de deudores */}
          <div
            style={{
              position: "absolute",
              left: LIST.x,
              top: LIST.y,
              width: LIST.w,
              height: 1400,
              borderRadius: 44,
              background: "#fff",
              boxShadow: "0 0 0 1px #F1E3E9, 0 40px 90px rgba(110,12,48,.10)",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", left: 44, top: 36 }}>
              <div style={{ fontSize: 36, fontWeight: 600, color: P.ink, letterSpacing: -0.6 }}>Cartera de marzo</div>
              <div style={{ fontSize: 22, color: "#9D9599", marginTop: 4 }}>Consorcios del Sur · 128 deudores</div>
            </div>
            <div style={{ position: "absolute", right: 44, top: 40, display: "flex", gap: 14 }}>
              <Stat k="Enviados" v={sent} />
              <Stat k="En conversación" v={talking} />
              <Stat k="Acordadas" v={agreed} hot />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: ROW0 - 24, height: 1, background: "#F3E9ED" }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: ROW0 + scroll }}>
              {Array.from({ length: 16 }, (_, i) => {
                const d = DEBTORS[i % DEBTORS.length]
                const st = statusAt(i, l)
                const pop = st.since ? prog(l, st.since, st.since + 2) - prog(l, st.since + 2, st.since + 8) : 0
                const initials = d[0]
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: i * ROW_H,
                      height: ROW_H,
                      display: "flex",
                      alignItems: "center",
                      padding: "0 44px",
                      gap: 22,
                      background: i === 0 && l >= 84 ? `rgba(195,25,82,${0.05 * prog(l, 84, 90)})` : undefined,
                      borderBottom: "1px solid #F6EEF1",
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        background: "#FBE7EE",
                        color: P.primary,
                        fontSize: 20,
                        fontWeight: 600,
                        display: "grid",
                        placeItems: "center",
                        flex: "none",
                      }}
                    >
                      {initials}
                    </div>
                    <div style={{ width: 380 }}>
                      <div style={{ fontSize: 25, fontWeight: 600, color: P.ink }}>{d[0]}</div>
                      <div style={{ fontSize: 19, color: "#A39CA0", marginTop: 2 }}>
                        {d[1]} · {d[2]}
                      </div>
                    </div>
                    <div style={{ width: 170, textAlign: "right", fontSize: 25, fontWeight: 500, color: P.ink, fontVariantNumeric: "tabular-nums" }}>
                      {ars(d[3])}
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                      <Pill s={st.s} pop={pop} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mensajes que salen del agente hacia cada fila */}
          {Array.from({ length: 14 }, (_, i) => {
            const t1 = sentAt(i)
            const p = prog(l, t1 - 11, t1, inOut)
            if (p <= 0 || p >= 1) return null
            const tx = LIST.x + LIST.w - 150
            const ty = LIST.y + ROW0 + scroll + i * ROW_H + ROW_H / 2
            const sx = AGENT.x + 60
            const sy = AGENT.y - 30
            const mx = (sx + tx) / 2
            const my = Math.min(sy, ty) - 140
            const x = (1 - p) * (1 - p) * sx + 2 * (1 - p) * p * mx + p * p * tx
            const y = (1 - p) * (1 - p) * sy + 2 * (1 - p) * p * my + p * p * ty
            const s = Math.sin(p * Math.PI)
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x - 24,
                  top: y - 18,
                  width: 48,
                  height: 36,
                  borderRadius: 12,
                  borderBottomLeftRadius: 4,
                  background: P.primary,
                  boxShadow: "0 6px 14px rgba(195,25,82,.35)",
                  transform: `scale(${0.6 + s * 0.6})`,
                  filter: blur(s * 1.2),
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <div style={{ width: 24, height: 3, borderRadius: 2, background: "#fff", boxShadow: "0 7px 0 #fff" }} />
              </div>
            )
          })}
        </div>
      </Smear>
      {flash > 0 && <div style={{ position: "absolute", inset: 0, background: "#FBE2EC", opacity: flash }} />}
      <Kicker n="02" text="Le escribe a cada deudor" l={l} at={8} />
    </div>
  )
}

function Stat({ k, v, hot }: { k: string; v: number; hot?: boolean }) {
  return (
    <div
      style={{
        padding: "10px 18px",
        borderRadius: 18,
        background: hot ? P.primary : "#F8F2F4",
        color: hot ? "#fff" : P.ink,
        minWidth: 120,
      }}
    >
      <div style={{ fontSize: 18, opacity: 0.75 }}>{k}</div>
      <div style={{ fontSize: 34, fontWeight: 600, fontVariantNumeric: "tabular-nums", lineHeight: "40px" }}>{v}</div>
    </div>
  )
}

/* ================================================================== */
/* CHAT · 12 beats (~174 frames)                                       */
/* ================================================================== */

export const CHAT_LEN = 174.2

const CHAT = { x: 500, y: 70, w: 660, h: 940 }
export const CHAT_EVENTS = {
  a1: 6,
  verified: 28,
  d1: 44,
  typing: 56,
  a2: 70,
  offer: 80,
  click: 112,
  d2: 118,
  agreed: 132,
}
const E = CHAT_EVENTS

function Appear({ l, at, out, children, align = "left" }: { l: number; at: number; out?: number; children: ReactNode; align?: "left" | "right" | "center" }) {
  const p = prog(l, at, at + 10, outExpo) * (out === undefined ? 1 : 1 - prog(l, out, out + 6, outCubic))
  if (p <= 0.001) return null
  return (
    <div style={{ display: "grid", gridTemplateRows: `${p}fr`, flex: "none" }}>
      <div style={{ minHeight: 0, overflow: "visible" }}>
        <div
          style={{
            display: "flex",
            justifyContent: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
            paddingTop: 14,
            opacity: Math.min(1, p * 1.4),
            transform: `translateY(${(1 - p) * 26}px) scale(${0.94 + p * 0.06})`,
            transformOrigin: align === "right" ? "100% 100%" : "0% 100%",
            filter: blur((1 - p) * 6),
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function Bubble({ mine, children }: { mine?: boolean; children: ReactNode }) {
  return (
    <div
      style={{
        maxWidth: 470,
        padding: "16px 22px",
        borderRadius: 26,
        borderBottomLeftRadius: mine ? 26 : 8,
        borderBottomRightRadius: mine ? 8 : 26,
        background: mine ? P.primary : "#F5F0F2",
        color: mine ? "#fff" : P.ink,
        fontSize: 24,
        lineHeight: "33px",
      }}
    >
      {children}
    </div>
  )
}

function SysPill({ children, solid }: { children: ReactNode; solid?: boolean }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 18px",
        borderRadius: 999,
        background: solid ? P.primary : "#FBE7EE",
        color: solid ? "#fff" : P.primary,
        fontSize: 19,
        fontWeight: 600,
      }}
    >
      <CheckDot size={22} bg={solid ? "rgba(255,255,255,.25)" : P.primary} />
      {children}
    </div>
  )
}

const NOTES: { at: number; title: string; sub: string }[] = [
  { at: E.verified + 2, title: "Identidad verificada", sub: "Valida el DNI antes de hablar de la deuda" },
  { at: E.offer + 6, title: "Cifras validadas", sub: "Cada oferta pasa por tus reglas" },
  { at: E.agreed + 2, title: "Aceptación expresa", sub: "El deudor acepta y queda registrado" },
]

export function Chat({ l }: { l: number }) {
  const enter = prog(l, 0, 12, outExpo)
  const enterS = mix(1.18, 1, enter)
  const enterBlur = (1 - enter) * 12
  const exitY = l < 160 ? 0 : 0.7 * Math.pow(l - 160, 2.3)
  const exitBlur = kf(l, [
    [162, 0],
    [CHAT_LEN, 12],
  ], inQuad)
  const drift = mix(1, 1.04, prog(l, 0, CHAT_LEN, inOut))
  const accept = prog(l, E.click, E.click + 6)
  const curX = kf(l, [
    [96, 1200],
    [110, CHAT.x + 300],
  ], outExpo)
  const curY = kf(l, [
    [96, 1060],
    [110, 820],
  ], outExpo)
  const press = pressAt(l, [E.click])

  return (
    <div style={{ position: "absolute", inset: 0, background: P.page, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(50% 60% at 30% 40%, #FBE3EC 0%, rgba(253,251,252,0) 70%)` }} />
      <Smear id="chat" y={exitBlur}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateY(${-exitY}px) scale(${enterS * drift})`,
            transformOrigin: `${CX - 120}px ${CY + 120}px`,
            filter: blur(enterBlur),
          }}
        >
          {/* Ventana de chat */}
          <div
            style={{
              position: "absolute",
              left: CHAT.x,
              top: CHAT.y,
              width: CHAT.w,
              height: CHAT.h,
              borderRadius: 48,
              background: "#fff",
              boxShadow: "0 0 0 1px #F1E3E9, 0 40px 90px rgba(110,12,48,.14)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ height: 112, flex: "none", display: "flex", alignItems: "center", gap: 18, padding: "0 32px", borderBottom: "1px solid #F3E9ED" }}>
              <LogoDisc size={60} />
              <div>
                <div style={{ fontSize: 26, fontWeight: 600, color: P.ink }}>Consorcios del Sur</div>
                <div style={{ fontSize: 19, color: "#9D9599", display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 5, background: "#2BA56A" }} />
                  Asistente virtual · en línea
                </div>
              </div>
            </div>
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 30px 18px", overflow: "hidden" }}>
              <Appear l={l} at={E.a1}>
                <Bubble>
                  Hola Marta, soy el asistente virtual de Consorcios del Sur. Te escribo por un saldo de{" "}
                  <b>$ 186.400</b> en expensas de la Unidad 4B.
                </Bubble>
              </Appear>
              <Appear l={l} at={E.verified} align="center">
                <SysPill>Identidad verificada con DNI</SysPill>
              </Appear>
              <Appear l={l} at={E.d1} align="right">
                <Bubble mine>Hola. Este mes no llego a pagar todo junto.</Bubble>
              </Appear>
              <Appear l={l} at={E.typing} out={E.a2 - 4}>
                <Bubble>
                  <TypingDots l={l} />
                </Bubble>
              </Appear>
              <Appear l={l} at={E.a2}>
                <Bubble>Te entiendo. Te propongo un plan dentro de las reglas del consorcio:</Bubble>
              </Appear>
              <Appear l={l} at={E.offer}>
                <OfferCard accept={accept} press={press} />
              </Appear>
              <Appear l={l} at={E.d2} align="right">
                <Bubble mine>Acepto la propuesta.</Bubble>
              </Appear>
              <Appear l={l} at={E.agreed} align="center">
                <SysPill solid>Acuerdo registrado · acta generada</SysPill>
              </Appear>
            </div>
            <div style={{ height: 96, flex: "none", borderTop: "1px solid #F3E9ED", display: "flex", alignItems: "center", gap: 14, padding: "0 28px" }}>
              <div style={{ flex: 1, height: 56, borderRadius: 28, background: "#F7F2F4", display: "flex", alignItems: "center", padding: "0 24px", fontSize: 21, color: "#B3AAAE" }}>
                Escribí tu mensaje…
              </div>
              <div style={{ width: 56, height: 56, borderRadius: 28, background: P.primary, display: "grid", placeItems: "center" }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <path d="M12 19V5M6 11l6-6 6 6" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Notas al costado */}
          {NOTES.map((n, i) => {
            const p = prog(l, n.at, n.at + 12, outExpo)
            if (p <= 0) return null
            const next = NOTES[i + 1]
            const dim = next ? prog(l, next.at, next.at + 8) : 0
            return (
              <div
                key={n.title}
                style={{
                  position: "absolute",
                  left: 1250 + (1 - p) * 40,
                  top: 300 + i * 150,
                  width: 520,
                  padding: "22px 26px",
                  borderRadius: 28,
                  background: "#fff",
                  boxShadow: `0 16px 40px rgba(110,12,48,${0.1 * (1 - dim * 0.6)}), inset 0 0 0 1px rgba(195,25,82,${0.12 * (1 - dim)})`,
                  display: "flex",
                  gap: 18,
                  alignItems: "flex-start",
                  opacity: p * (1 - dim * 0.45),
                  filter: blur((1 - p) * 8),
                }}
              >
                <CheckDot size={40} />
                <div>
                  <div style={{ fontSize: 27, fontWeight: 600, color: P.ink }}>{n.title}</div>
                  <div style={{ fontSize: 21, color: "#9D9599", marginTop: 4 }}>{n.sub}</div>
                </div>
              </div>
            )
          })}

          {l >= 96 && l < 150 && (
            <Cursor x={curX} y={curY} scale={1 - press * 0.15} opacity={prog(l, 96, 99) * (1 - prog(l, 140, 148))} />
          )}
        </div>
      </Smear>
      <Kicker n="03" text="Negocia y cierra el acuerdo" l={l} at={6} />
    </div>
  )
}

function TypingDots({ l }: { l: number }) {
  return (
    <div style={{ display: "flex", gap: 8, height: 33, alignItems: "center" }}>
      {[0, 1, 2].map((i) => {
        const t = Math.sin((l / 30) * Math.PI * 4 - i * 0.9)
        return <div key={i} style={{ width: 11, height: 11, borderRadius: 6, background: "#A39CA0", transform: `translateY(${-Math.max(0, t) * 5}px)`, opacity: 0.5 + Math.max(0, t) * 0.5 }} />
      })}
    </div>
  )
}

function OfferCard({ accept, press }: { accept: number; press: number }) {
  const row = (k: string, v: string, strong?: boolean) => (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: strong ? P.ink : "#6F686B", fontWeight: strong ? 600 : 400 }}>
      <span>{k}</span>
      <span style={{ fontVariantNumeric: "tabular-nums", color: P.ink, fontWeight: strong ? 700 : 500 }}>{v}</span>
    </div>
  )
  return (
    <div
      style={{
        width: 500,
        borderRadius: 26,
        background: "#fff",
        boxShadow: "inset 0 0 0 1.5px rgba(195,25,82,.28), 0 10px 26px rgba(110,12,48,.10)",
        padding: "20px 24px 22px",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: 1.4, color: "#A39CA0" }}>PROPUESTA FORMAL DE PAGO</div>
      <div style={{ fontSize: 28, fontWeight: 600, color: P.ink, marginTop: 4, marginBottom: 14 }}>Plan en 6 pagos</div>
      <div style={{ display: "grid", gap: 8, paddingBottom: 14, borderBottom: "1px solid #F3E9ED" }}>
        {row("Anticipo", "$ 31.000")}
        {row("5 cuotas de", "$ 31.080")}
        {row("Primera cuota", "5 de julio")}
        {row("Total", "$ 186.400", true)}
      </div>
      <div
        style={{
          marginTop: 16,
          height: 56,
          borderRadius: 16,
          background: accept > 0 ? mixColor(accept) : P.primary,
          color: "#fff",
          fontSize: 22,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          transform: `scale(${1 - press * 0.04})`,
        }}
      >
        {accept > 0.5 ? "Propuesta aceptada" : "Aceptar propuesta"}
      </div>
    </div>
  )
}

function mixColor(t: number) {
  // primario → tinta
  const a = [0xc3, 0x19, 0x52]
  const b = [0x2e, 0x2a, 0x2c]
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t))
  return `rgb(${c.join(",")})`
}

export { inCubic, W }
