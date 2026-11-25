/**
 * S4 página de respuesta · S5 tarjeta · S6 dos tarjetas con títulos de vidrio
 * · S7 disco del logo · S8 placa final.
 *
 * Versión editable: ver la nota de shots-a.tsx. `frame` es el frame local de la
 * Sequence (60 fps) y `f` el frame de guion viejo para lo que sigue calculado.
 */
import { Easing, interpolate, Interactive, useCurrentFrame } from "remotion"

import {
  blur,
  CoverArt,
  CX,
  CY,
  Cursor,
  font,
  inOut,
  inQuad,
  kf,
  Isotipo,
  mix,
  outCubic,
  outExpo,
  P,
  prog,
  Smear,
  W,
} from "./kit"
import type { CoverKind } from "./kit"
import { Kicker } from "./kit"

/* ------------------------------------------------------------------ */
/* S4 · f159–186 (y fondo de S5)                                        */
/* ------------------------------------------------------------------ */

const COL_X = 420
const LINE = 64
const PAGE_TOP = 70

/** Página del acta: breadcrumb, título y cuerpo con una frase clave. */
function AnswerPage() {
  const grey = "#B4B0B2"
  const body: React.CSSProperties = {
    fontSize: 50,
    lineHeight: `${LINE}px`,
    color: grey,
    fontWeight: 400,
    letterSpacing: -0.6,
    width: 1120,
  }
  return (
    <div style={{ position: "absolute", left: COL_X, top: PAGE_TOP, fontFamily: font }}>
      <div style={{ position: "absolute", top: 70, fontSize: 30, color: "#A39CA0", whiteSpace: "nowrap" }}>
        Consorcios del Sur&nbsp;&nbsp;›&nbsp;&nbsp;Unidad 4B
      </div>
      <div style={{ position: "absolute", top: 140, fontSize: 64, fontWeight: 600, color: P.ink, letterSpacing: -1.5, whiteSpace: "nowrap" }}>
        Acta de acuerdo
      </div>
      <div style={{ position: "absolute", top: 222, fontSize: 30, color: "#A39CA0", whiteSpace: "nowrap" }}>
        Marta Gómez · Firmada el 22/06 a las 9:47 · hash 9f3a…c21e
      </div>
      <div style={{ position: "absolute", top: 320, ...body }}>
        Marta aceptó un anticipo de $ 31.000 y
        <br />
        <span style={{ color: P.ink, fontWeight: 600 }}>5 cuotas de $ 31.080</span>,
        dentro de las reglas que configuraste. El acuerdo quedó registrado.
      </div>
      <div style={{ position: "absolute", top: 320 + LINE * 3 + 50, fontSize: 40, fontWeight: 600, color: "#8E868A", whiteSpace: "nowrap" }}>
        Qué sigue
      </div>
      <div style={{ position: "absolute", top: 320 + LINE * 4 + 60, ...body }}>
        · Recordatorio antes de cada vencimiento
        <br />· Derivación a la administración con el acta
        <br />· Seguimiento de cada pago en el panel
      </div>
    </div>
  )
}

/** Posición de la frase clave (debajo, centrada) en coordenadas de página. */
const KEY = { x: COL_X + 250, y: PAGE_TOP + 320 + LINE * 2 + 4 }

function scrollAt(f: number) {
  // Llega 420 px abajo y frena.
  const s = kf(f, [
    [159, 420],
    [160, 315],
    [161, 210],
    [162, 170],
    [163, 140],
    [164, 116],
    [165, 96],
    [166, 81],
    [168, 58],
    [171, 34],
    [175, 14],
    [180, 0],
    [186, -6],
  ])
  return s
}

export function S4() {
  const frame = useCurrentFrame()
  // Frame de guion viejo (159 → 186).
  const f = kf(frame, [
    [-0.52, 159],
    [79.48, 180],
    [144.65, 186],
  ])
  // El scroll está en línea en "Página"; acá queda para el cursor.
  const s = scrollAt(f)
  const smear = kf(f, [
    [159, 24],
    [162, 7],
    [165, 1.5],
    [168, 0],
  ])
  const curX = KEY.x + kf(f, [
    [180, 0],
    [186, 26],
  ], inQuad)
  const curY = KEY.y + 70 + s + kf(f, [
    [159, 160],
    [170, 40],
    [180, 0],
  ], outCubic)
  return (
    <div style={{ position: "absolute", inset: 0, background: P.page }}>
      <Smear id="s4" y={smear} x={smear * 0.12}>
        <Interactive.Div
          name="Página"
          style={{
            position: "absolute",
            inset: 0,
            translate: interpolate(frame, [-0.52, 3.29, 7.1, 10.91, 14.72, 18.53, 22.34, 26.15, 33.77, 45.2, 60.44, 79.48, 144.65], ["0px 420px", "0px 315px", "0px 210px", "0px 170px", "0px 140px", "0px 116px", "0px 96px", "0px 81px", "0px 58px", "0px 34px", "0px 14px", "0px 0px", "0px -6px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <AnswerPage />
        </Interactive.Div>
        <Cursor x={curX} y={curY} rot={45} />
      </Smear>
      <Interactive.Div
        name="Destello"
        style={{
          position: "absolute",
          inset: 0,
          background: "#FBE2EC",
          opacity: interpolate(frame, [-0.52, 22.34], [1, 0], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      />
      <Kicker n="04" text="Queda el acta firmada" l={f - 159} at={3} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* S5 · f187–214                                                        */
/* ------------------------------------------------------------------ */

const CARD_W = 676
const COVER_W = 628
const COVER_H = 536

export function S5() {
  const frame = useCurrentFrame()
  // Frame de guion viejo (187 → 214).
  const f = kf(frame, [
    [-0.35, 187],
    [59.65, 203],
    [124.81, 207],
    [144.81, 214],
  ])
  // Subida de la tarjeta, deriva, salida y escala: en línea en "Tarjeta" y "Salida tarjeta".
  const cardBlur = kf(f, [
    [187, 2],
    [189, 3.8],
    [195, 1.2],
    [201, 0],
  ])
  const pageBlur = kf(f, [
    [187, 0],
    [192, 2.5],
  ], outCubic)
  const frameBlur = kf(f, [
    [207, 0],
    [208, 1],
    [214, 7],
  ], inQuad)

  return (
    <div style={{ position: "absolute", inset: 0, background: P.page, filter: blur(frameBlur) }}>
      {/* La página sigue el scroll de S4: -6 px y 0,8 px por frame de guion */}
      <Interactive.Div
        name="Página"
        style={{
          position: "absolute",
          inset: 0,
          translate: interpolate(frame, [-0.35, 59.65, 124.81, 144.81], ["0px -6.8px", "0px -19.6px", "0px -22.8px", "0px -28.4px"], { extrapolateLeft: "clamp", extrapolateRight: "extend" }),
          filter: blur(pageBlur),
        }}
      >
        <AnswerPage />
      </Interactive.Div>
      {/* Salida: 60 px extra hacia arriba, acelerando */}
      <Interactive.Div
        name="Salida tarjeta"
        style={{
          position: "absolute",
          inset: 0,
          translate: interpolate(frame, [124.81, 144.81], ["0px 0px", "0px -60px"], { easing: Easing.cubic, extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
      <Interactive.Div
        name="Tarjeta"
        style={{
          position: "absolute",
          left: 622,
          top: 302,
          width: 676,
          height: 1000,
          borderRadius: 64,
          background: "#fff",
          boxShadow: "0 -10px 60px rgba(110,12,48,.10), 0 0 0 1px rgba(110,12,48,.04)",
          transformOrigin: "50% 30%",
          translate: interpolate(frame, [-0.35, 14.65, 33.4, 48.4, 59.65, 92.23, 124.81, 144.81], ["0px 294px", "0px 108px", "0px 47px", "0px 21px", "0px 8.4px", "0px 0px", "0px -8px", "0px -36px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          scale: interpolate(frame, [124.81, 144.81], [1, 0.95], { easing: Easing.quad, extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          filter: blur(cardBlur),
        }}
      >
        <div style={{ position: "absolute", left: CARD_W / 2 - 40, top: 14, width: 80, height: 8, borderRadius: 4, background: "#E6DFE2" }} />
        <div
          style={{
            position: "absolute",
            left: 24,
            top: 46,
            width: COVER_W,
            height: COVER_H,
            borderRadius: 44,
            overflow: "hidden",
          }}
        >
          <svg width={COVER_W} height={COVER_H} viewBox={`0 0 ${COVER_W} ${COVER_H}`} style={{ position: "absolute" }}>
            <CoverArt kind="chat" w={COVER_W} h={COVER_H} uid="s5" />
          </svg>
          <ActaMock />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 46 + COVER_H + 30, textAlign: "center" }}>
          <div style={{ fontSize: 40, fontWeight: 600, color: P.ink, letterSpacing: -0.6 }}>Acta enviada a la administración</div>
          <div style={{ fontSize: 25, color: "#9D9599", marginTop: 6 }}>Consorcios del Sur · Unidad 4B · Marta Gómez</div>
        </div>
      </Interactive.Div>
      </Interactive.Div>
      <Kicker n="04" text="Queda el acta firmada" l={99} />
    </div>
  )
}

function ActaMock() {
  const rows: [string, string, string][] = [
    ["Anticipo", "25/06", "$ 31.000"],
    ["Cuota 1", "05/07", "$ 31.080"],
    ["Cuota 2", "05/08", "$ 31.080"],
    ["Cuota 3", "05/09", "$ 31.080"],
    ["Cuota 4", "05/10", "$ 31.080"],
    ["Cuota 5", "05/11", "$ 31.080"],
  ]
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        top: 34,
        width: 488,
        height: 470,
        borderRadius: 24,
        background: "#fff",
        boxShadow: "0 24px 60px rgba(60,6,26,.35)",
        padding: "30px 34px",
        boxSizing: "border-box",
        fontFamily: font,
        transform: "rotate(-2deg)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: 1.4, color: "#A39CA0" }}>ACTA DE ACUERDO</div>
        <div style={{ fontSize: 15, color: "#A39CA0" }}>#0412</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, color: P.ink, marginTop: 8 }}>Marta Gómez · Unidad 4B</div>
      <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
        {rows.map((r, i) => (
          <div key={r[0]} style={{ display: "flex", fontSize: 19, color: i === 0 ? P.ink : "#6F686B", fontVariantNumeric: "tabular-nums" }}>
            <span style={{ width: 130 }}>{r[0]}</span>
            <span style={{ width: 120, color: "#A39CA0" }}>{r[1]}</span>
            <span style={{ marginLeft: "auto", fontWeight: 500, color: P.ink }}>{r[2]}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #F1E6EA", display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 600, color: P.ink }}>
        <span>Total</span>
        <span>$ 186.400</span>
      </div>
      <div style={{ position: "absolute", left: 34, bottom: 26, fontSize: 14, color: "#B3AAAE", fontFamily: "ui-monospace, monospace" }}>
        sha256 9f3a6b…e41c21e
      </div>
      <div
        style={{
          position: "absolute",
          right: 22,
          bottom: 12,
          width: 80,
          height: 80,
          borderRadius: "50%",
          boxShadow: `inset 0 0 0 3px ${P.primary}`,
          color: P.primary,
          display: "grid",
          placeItems: "center",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: 1,
          transform: "rotate(-14deg)",
          textAlign: "center",
          lineHeight: "17px",
        }}
      >
        FIRMADA
        <br />
        22/06
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* S6 · f215–244                                                        */
/* ------------------------------------------------------------------ */

const CW = 620
const CH = 400

function GlassCard({
  kind,
  title,
  pill,
  uid,
}: {
  kind: CoverKind
  title: string
  pill: string
  uid: string
}) {
  const clip = `${uid}-clip`
  const fb = `${uid}-fb`
  const fs = 190
  const baseY = CH + fs * 0.2
  return (
    <div style={{ position: "relative", width: CW, height: CH, borderRadius: 60, overflow: "hidden", boxShadow: "0 20px 50px rgba(110,12,48,.16)" }}>
      <svg width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`} style={{ position: "absolute", inset: 0 }}>
        <CoverArt kind={kind} w={CW} h={CH} uid={uid} />
        <defs>
          <clipPath id={clip}>
            <text x={28} y={baseY} fontFamily={font} fontWeight={700} fontSize={fs} letterSpacing={-8}>
              {title}
            </text>
          </clipPath>
          <filter id={fb} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={10} />
            <feComponentTransfer>
              <feFuncR type="linear" slope={0.7} intercept={0.36} />
              <feFuncG type="linear" slope={0.7} intercept={0.36} />
              <feFuncB type="linear" slope={0.7} intercept={0.36} />
            </feComponentTransfer>
          </filter>
        </defs>
        <g clipPath={`url(#${clip})`}>
          <g filter={`url(#${fb})`}>
            <CoverArt kind={kind} w={CW} h={CH} uid={`${uid}-b`} />
          </g>
          <rect width={CW} height={CH} fill="#fff" fillOpacity={0.12} />
        </g>
        <text
          x={28}
          y={baseY}
          fontFamily={font}
          fontWeight={700}
          fontSize={fs}
          letterSpacing={-8}
          fill="none"
          stroke="#fff"
          strokeOpacity={0.6}
          strokeWidth={1.4}
        >
          {title}
        </text>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 26,
          top: 26,
          padding: "10px 20px",
          borderRadius: 999,
          background: "rgba(255,255,255,.26)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.6), inset 0 0 0 1px rgba(255,255,255,.25)",
          color: "#fff",
          fontSize: 22,
          fontWeight: 600,
          fontFamily: font,
        }}
      >
        {pill}
      </div>
      <div
        style={{
          position: "absolute",
          right: 26,
          top: 26,
          width: 50,
          height: 50,
          borderRadius: "50%",
          background: "rgba(255,255,255,.26)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: "#fff" }} />
        ))}
      </div>
    </div>
  )
}

export function S6() {
  const frame = useCurrentFrame()
  // Frame de guion viejo (215 → 244).
  const f = kf(frame, [
    [-0.19, 215],
    [55.81, 230],
    [95.94, 238],
    [115.94, 244],
  ])
  // Salida: latigazo con potencia 2,2 (calculado). Entradas, deriva, escala y
  // opacidad de las tarjetas: en línea en "Reglas" y "Actas".
  const exit = f < 238 ? 0 : 0.9 * Math.pow(f - 238, 2.2)
  const exitBlur = kf(f, [
    [238, 0],
    [244, 12],
  ], inQuad)
  const inBlur = kf(f, [
    [215, 12],
    [224, 0],
  ], outCubic)
  const botBlur = kf(f, [
    [216, 12],
    [226, 0],
  ], outCubic)
  return (
    <div style={{ position: "absolute", inset: 0, background: P.page }}>
      <Smear id="s6" y={exitBlur} x={exitBlur * 0.15}>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${-exit}px)` }}>
        {/* La curva del primer tramo es outExpo recortado al 87,5 %: el corte de
            f230 cae en medio de su llegada. */}
        <Interactive.Div
          name="Actas"
          style={{
            position: "absolute",
            left: 650,
            top: 568,
            width: 620,
            height: 400,
            translate: interpolate(
              frame,
              [3.54, 24, 55.81, 65.84, 95.94],
              ["0px 359px", "0px 33.9px", "0px 0.84px", "0px -6px", "0px -24px"],
              {
                easing: [
                  Easing.bezier(0.163, 0.968, 0.364, 0.991),
                  Easing.bezier(0.163, 0.968, 0.364, 0.991),
                  Easing.linear,
                  Easing.linear
                ],
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                outputType: "translate"
              }
            ),
            opacity: interpolate(frame, [3.54, 18.47], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp"
            }),
            filter: blur(botBlur)
          }}
        >
          <GlassCard kind="deals" title="Actas" pill="El agente cierra" uid="c2" />
        </Interactive.Div>
        <Interactive.Div
          name="Reglas"
          style={{
            position: "absolute",
            left: 650,
            top: 132,
            width: 620,
            height: 400,
            translate: interpolate(frame, [-0.19, 55.81, 95.94], ["0px 96px", "0px 0px", "0px -24px"], { easing: [Easing.bezier(0.154, 1.04, 0.347, 0.985), Easing.linear], extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            scale: interpolate(frame, [-0.19, 55.81], [1.08, 1], { easing: Easing.bezier(0.154, 1.04, 0.347, 0.985), extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            opacity: interpolate(frame, [-0.19, 11.01], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            filter: blur(inBlur),
          }}
        >
          <GlassCard kind="rules" title="Reglas" pill="Vos definís" uid="c1" />
        </Interactive.Div>
        </div>
      </Smear>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* S7 · f245–300                                                        */
/* ------------------------------------------------------------------ */

export function S7() {
  const frame = useCurrentFrame()
  // Frame de guion viejo (245 → 300).
  const f = kf(frame, [
    [-0.06, 245],
    [35.94, 262],
    [59.94, 287],
    [87.03, 300],
  ])
  // Subida (top 569 → 456) y achique (168 → 123 px): en línea en "Disco".
  const smear = kf(f, [
    [245, 14],
    [248, 5],
    [252, 0],
  ])
  return (
    <div style={{ position: "absolute", inset: 0, background: P.page }}>
      <Smear id="s7" y={smear}>
        <Interactive.Div
          name="Disco"
          style={{
            position: "absolute",
            left: 876,
            top: 456,
            width: 168,
            height: 168,
            translate: interpolate(frame, [-0.06, 10.52, 21.11, 35.94, 42.66], ["0px 113px", "0px 35px", "0px 12px", "0px 3px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            opacity: interpolate(frame, [-0.06, 18.47], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            scale: interpolate(frame, [59.94, 87.03], [1, 0.7321], { easing: Easing.cubic, extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <Isotipo size={168} />
        </Interactive.Div>
      </Smear>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* S8 · f301–359                                                        */
/* ------------------------------------------------------------------ */

const WORD = "pacta"
/** Ancho de referencia de la palabra a escala 1. */
const WORD_W = 560

/** Fondo de S8: oscuro (original) o rosa Pacta (`rosa`). */
const S8_BG = {
  dark: "radial-gradient(42% 46% at 50% 50%, #2A2729 0%, #121012 55%, #020204 100%)",
  rosa: `radial-gradient(42% 46% at 50% 50%, #D42A63 0%, ${P.primary} 55%, ${P.deep} 100%)`,
}

export function S8({ rosa = false }: { rosa?: boolean } = {}) {
  const frame = useCurrentFrame()
  // Frame de guion viejo (301 → 359).
  const f = kf(frame, [
    [-0.97, 301],
    [39.03, 318],
    [120.19, 348],
    [148.19, 359],
  ])
  // Ancho de la palabra: en línea como escala en "Palabra" y "Halo". Acá queda
  // para las 24 copias del barrido.
  const width =
    f <= 350
      ? kf(f, [
          [301, 1900],
          [302, 1500],
          [303, 1230],
          [304, 1160],
          [309, 810],
          [311, 748],
          [320, 620],
          [342, 568],
          [350, 542],
        ])
      : kf(f, [
          [350, 542],
          [355, 496],
          [359, 294],
          [360, 260],
        ], inQuad)
  const scale = width / WORD_W
  const endBlur = kf(f, [
    [352, 0],
    [359, 3.5],
  ], inQuad)
  const smear = kf(f, [
    [301, 1],
    [304, 0.35],
    [307, 0],
  ])
  const glow = kf(f, [
    [301, 0.6],
    [310, 1],
  ])
  const tagOut = prog(f, 350, 357, inQuad)
  const tag = prog(f, 316, 332, outExpo) * (1 - tagOut)
  // Escala de la palabra = ancho / 560, con los keyframes del guion (más f318 y
  // f348, donde cambia el remapeo). Los dos últimos tramos son inQuad.
  const word = (opacity: number, s: number, key?: number) => (
    <div
      key={key}
      style={{
        position: "absolute",
        left: CX,
        top: CY,
        transform: `translate(-50%, -54%) scale(${s})`,
        fontSize: 190,
        fontWeight: 600,
        letterSpacing: -6,
        color: "#F3F3F5",
        whiteSpace: "nowrap",
        opacity,
        textShadow: key === undefined ? `0 0 10px rgba(255,255,255,${0.55 * glow}), 0 0 40px rgba(255,220,232,${0.35 * glow})` : undefined,
        fontFamily: font,
      }}
    >
      {WORD}
    </div>
  )
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: rosa ? S8_BG.rosa : S8_BG.dark,
        overflow: "hidden",
      }}
    >
      {/* Halo amplio: elipse de 1,8 × 0,9 veces el ancho de la palabra */}
      <Interactive.Div
        name="Halo"
        style={{
          position: "absolute",
          left: 456,
          top: 288,
          width: 1008,
          height: 504,
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(255,235,242,.16), rgba(255,235,242,0))",
          scale: interpolate(frame, [-0.97, 1.38, 3.74, 6.09, 17.85, 22.56, 39.03, 44.44, 103.96, 120.19, 125.28, 138.01, 148.19], [3.3929, 2.6786, 2.1964, 2.0714, 1.4464, 1.3357, 1.1579, 1.1071, 1.0143, 0.9795, 0.9679, 0.8857, 0.525], { easing: [Easing.linear, Easing.linear, Easing.linear, Easing.linear, Easing.linear, Easing.linear, Easing.linear, Easing.linear, Easing.linear, Easing.linear, Easing.quad, Easing.quad], extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          opacity: interpolate(frame, [-0.97, 20.21], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      />
      <div style={{ position: "absolute", inset: 0, filter: blur(endBlur) }}>
        {/* Barrido de entrada: 24 copias con escala calculada */}
        {smear > 0 &&
          Array.from({ length: 24 }, (_, i) => {
            const k = (i + 1) / 24
            return word(0.09 * smear * (1 - k * 0.6), scale * (1 + k * 0.9 * smear), i)
          })}
        <Smear id="s8" x={smear * 22}>
          <Interactive.Div
            name="Palabra"
            style={{
              position: "absolute",
              left: 960,
              top: 540,
              translate: "-50% -54%",
              fontSize: 190,
              fontWeight: 600,
              letterSpacing: -6,
              color: "#F3F3F5",
              whiteSpace: "nowrap",
              textShadow: `0 0 10px rgba(255,255,255,${0.55 * glow}), 0 0 40px rgba(255,220,232,${0.35 * glow})`,
              fontFamily: font,
              scale: interpolate(frame, [-0.97, 1.38, 3.74, 6.09, 17.85, 22.56, 39.03, 44.44, 103.96, 120.19, 125.28, 138.01, 148.19], [3.3929, 2.6786, 2.1964, 2.0714, 1.4464, 1.3357, 1.1579, 1.1071, 1.0143, 0.9795, 0.9679, 0.8857, 0.525], { easing: [Easing.linear, Easing.linear, Easing.linear, Easing.linear, Easing.linear, Easing.linear, Easing.linear, Easing.linear, Easing.linear, Easing.linear, Easing.quad, Easing.quad], extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >pacta.ai</Interactive.Div>
        </Smear>
        <Interactive.Div
          name="Lema"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 636,
            textAlign: "center",
            fontSize: 34,
            fontWeight: 500,
            color: rosa ? "#F7CFDD" : "#B9B4B7",
            letterSpacing: -0.2,
            translate: interpolate(frame, [34.33, 76.91, 125.28, 143.1], ["0px 18px", "0px 0px", "0px 0px", "0px 18px"], { easing: [Easing.bezier(0.154, 1.04, 0.347, 0.985), Easing.linear, Easing.quad], extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            opacity: interpolate(frame, [34.33, 76.91, 125.28, 143.1], [0, 1, 1, 0], { easing: [Easing.bezier(0.154, 1.04, 0.347, 0.985), Easing.linear, Easing.quad], extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            filter: blur((1 - tag) * 10 + tagOut * 6),
            fontFamily: font,
          }}
        >El agente que negocia las deudas por vos.</Interactive.Div>
      </div>
    </div>
  )
}

export { inOut, mix, outCubic, W }
