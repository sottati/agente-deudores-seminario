/**
 * S4 página de respuesta · S5 tarjeta · S6 dos tarjetas con títulos de vidrio
 * · S7 disco del logo · S8 placa final.
 */
import {
  blur,
  CoverArt,
  CX,
  CY,
  Cursor,
  font,
  H,
  inCubic,
  inOut,
  inQuad,
  kf,
  LogoDisc,
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

export function S4({ f }: { f: number }) {
  const s = scrollAt(f)
  const smear = kf(f, [
    [159, 24],
    [162, 7],
    [165, 1.5],
    [168, 0],
  ])
  const flash = 1 - prog(f, 159, 165, outCubic)
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
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${s}px)` }}>
          <AnswerPage />
        </div>
        <Cursor x={curX} y={curY} rot={45} />
      </Smear>
      {flash > 0 && (
        <div style={{ position: "absolute", inset: 0, background: "#FBE2EC", opacity: flash }} />
      )}
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

export function S5({ f }: { f: number }) {
  const coverTop =
    f <= 205
      ? kf(f, [
          [187, 642],
          [191, 456],
          [196, 395],
          [200, 369],
          [205, 348],
        ])
      : 348 - (f - 205) * 4 - prog(f, 207, 214, inCubic) * 60
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
  const exitScale = 1 - 0.05 * prog(f, 207, 214, inQuad)
  const frameBlur = kf(f, [
    [207, 0],
    [208, 1],
    [214, 7],
  ], inQuad)
  const s = scrollAt(186) - (f - 186) * 0.8

  return (
    <div style={{ position: "absolute", inset: 0, background: P.page, filter: blur(frameBlur) }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${s}px)`, filter: blur(pageBlur) }}>
        <AnswerPage />
      </div>
      <div
        style={{
          position: "absolute",
          left: CX - CARD_W / 2,
          top: coverTop - 24 - 22,
          width: CARD_W,
          height: 1000,
          borderRadius: 64,
          background: "#fff",
          boxShadow: "0 -10px 60px rgba(110,12,48,.10), 0 0 0 1px rgba(110,12,48,.04)",
          transform: `scale(${exitScale})`,
          transformOrigin: "50% 30%",
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
      </div>
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
const GAP = 36
const TOP_FINAL = (H - CH * 2 - GAP) / 2 + 10

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

export function S6({ f }: { f: number }) {
  const exit = f < 238 ? 0 : 0.9 * Math.pow(f - 238, 2.2)
  const drift = Math.max(0, Math.min(f, 238) - 230) * 3 + exit
  const exitBlur = kf(f, [
    [238, 0],
    [244, 12],
  ], inQuad)
  const topY =
    kf(f, [
      [215, TOP_FINAL + 96],
      [230, TOP_FINAL],
    ], outExpo) - drift
  const topScale = kf(f, [
    [215, 1.08],
    [230, 1],
  ], outExpo)
  const botY =
    kf(f, [
      [216, 927],
      [232, TOP_FINAL + CH + GAP],
    ], outExpo) - drift
  const inBlur = kf(f, [
    [215, 12],
    [224, 0],
  ], outCubic)
  const botBlur = kf(f, [
    [216, 12],
    [226, 0],
  ], outCubic)
  const opTop = prog(f, 215, 218)
  const opBot = prog(f, 216, 220)
  return (
    <div style={{ position: "absolute", inset: 0, background: P.page }}>
      <Smear id="s6" y={exitBlur} x={exitBlur * 0.15}>
        <div
          style={{
            position: "absolute",
            left: CX - CW / 2,
            top: botY,
            filter: blur(botBlur),
            opacity: opBot,
          }}
        >
          <GlassCard kind="deals" title="Actas" pill="El agente cierra" uid="c2" />
        </div>
        <div
          style={{
            position: "absolute",
            left: CX - CW / 2,
            top: topY,
            transform: `scale(${topScale})`,
            filter: blur(inBlur),
            opacity: opTop,
          }}
        >
          <GlassCard kind="rules" title="Reglas" pill="Vos definís" uid="c1" />
        </div>
      </Smear>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* S7 · f245–300                                                        */
/* ------------------------------------------------------------------ */

export function S7({ f }: { f: number }) {
  const top = kf(f, [
    [245, 569],
    [250, 491],
    [255, 468],
    [262, 459],
    [269, 456],
  ])
  const size = f <= 287 ? 168 : kf(f, [
    [287, 168],
    [300, 123],
  ], inCubic)
  const smear = kf(f, [
    [245, 14],
    [248, 5],
    [252, 0],
  ])
  const cy = top + 84
  return (
    <div style={{ position: "absolute", inset: 0, background: P.page }}>
      <Smear id="s7" y={smear}>
        <div style={{ position: "absolute", left: CX - size / 2, top: cy - size / 2 }}>
          <LogoDisc size={size} fill="#F7F4F5" rim="#ECE6E9" />
        </div>
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

export function S8({ f }: { f: number }) {
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
        background: "radial-gradient(42% 46% at 50% 50%, #2A2729 0%, #121012 55%, #020204 100%)",
        overflow: "hidden",
      }}
    >
      {/* Halo amplio */}
      <div
        style={{
          position: "absolute",
          left: CX - width * 0.9,
          top: CY - width * 0.45,
          width: width * 1.8,
          height: width * 0.9,
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(255,235,242,.16), rgba(255,235,242,0))",
          opacity: glow,
        }}
      />
      <div style={{ position: "absolute", inset: 0, filter: blur(endBlur) }}>
        {smear > 0 &&
          Array.from({ length: 24 }, (_, i) => {
            const k = (i + 1) / 24
            return word(0.09 * smear * (1 - k * 0.6), scale * (1 + k * 0.9 * smear), i)
          })}
        <Smear id="s8" x={smear * 22}>
          {word(1, scale)}
        </Smear>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: CY + 96,
            textAlign: "center",
            fontSize: 34,
            fontWeight: 500,
            color: "#B9B4B7",
            letterSpacing: -0.2,
            opacity: tag,
            transform: `translateY(${(1 - tag) * 18}px)`,
            filter: blur((1 - tag) * 10 + tagOut * 6),
            fontFamily: font,
          }}
        >
          El agente que negocia las expensas por vos.
        </div>
      </div>
    </div>
  )
}

export { inOut, mix, outCubic, W }
