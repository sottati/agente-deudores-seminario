/**
 * S1 header + ventana + clic · S2 ícono + órbita · S3 barra de menú + prompt.
 *
 * Versión editable: cada plano lee `frame` (frame local de su Sequence, 60 fps).
 * Las animaciones principales son interpolate(frame, ...) en línea, con los
 * keyframes ya pasados a frames locales. `f` es el frame de guion viejo
 * (30 fps, remapeado como en PactaSting) y alimenta solo lo que sigue calculado.
 *
 * Easings: inOut = Easing.bezier(0.65, 0, 0.35, 1) (exacto); outExpo se
 * aproxima con Easing.bezier(0.154, 1.04, 0.347, 0.985) (error máx. 0,2 %).
 */
import { Easing, interpolate, Interactive, spring, useCurrentFrame } from "remotion"

import {
  AppIcon,
  blur,
  CX,
  CY,
  Cursor,
  CoverArt,
  font,
  H,
  inCubic,
  inOut,
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

/** Centro del disco en S1: corrido a la izquierda para que el encabezado quede centrado en 16:9. */
const DISC_X = CX - 250
const DX = DISC_X - 540 // del escenario cuadrado de 1080 al ancho de 1920

/* ------------------------------------------------------------------ */
/* S1 · f0–71                                                           */
/* ------------------------------------------------------------------ */

export function S1() {
  const frame = useCurrentFrame()
  // Frame de guion viejo: 0 → 72 a lo largo de los 188 frames del plano.
  const f = kf(frame, [
    [0, 0],
    [188, 72],
  ])
  // Centro vertical del encabezado: sube rápido y frena en el frame 96.61.
  // En línea: translate de "Encabezado" y "Ventana". Acá queda para el anillo y el cursor.
  const lockY = lockYAt(f)
  const lockBlurY = kf(f, [
    [0, 14],
    [3, 9],
    [8, 4],
    [14, 1],
    [20, 0],
  ])

  const nameP = prog(f, 2, 13, outExpo)
  const pillP = prog(f, 4, 17, outExpo)

  // Cursor (coordenadas de escenario, dentro de la cámara).
  const discY = lockY
  const [cx, cy] = cursorS1(f)
  const [px, py] = cursorS1(f - 0.5)
  const curSpeed = Math.hypot(cx - px, cy - py) * 2
  const rot = kf(
    f,
    [
      [46, 0],
      [51, -62],
      [55, -55],
      [61, -6],
      [66, 0],
    ],
    inOut
  )
  const curScale =
    mix(1, 1.55, prog(f, 56, 61, outCubic)) * (1 - 0.15 * prog(f, 69, 71, inOut))

  return (
    <div style={{ position: "absolute", inset: 0, background: P.page }}>
      {/* Bruma y piso de color */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(70% 45% at 50% 108%, ${P.floor} 0%, rgba(250,221,232,0) 70%)`,
        }}
      />
      <Interactive.Div
        name="Bruma"
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, #EEC5D4 0%, #F5D8E3 70%, #FADDE8 100%)",
          opacity: interpolate(frame, [0, 73.11], [1, 0], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      />

      {/* Cámara: zoom 1 → 1.2 (f46–60), pausa, y sale acelerando a 1.04 en f71.
          Escala × 1.25: el escenario cuadrado agrandado para llenar el 16:9. */}
      <Interactive.Div
        name="Cámara"
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "51.1458% 50%",
          scale: interpolate(frame, [120.11, 156.67, 159.28, 185.39], [1.25, 1.5, 1.5, 1.3], { easing: [Easing.bezier(0.65, 0, 0.35, 1), Easing.linear, Easing.quad], extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        {/* Ventana de la app: sigue al encabezado al 35 % */}
        <Interactive.Div
          name="Ventana"
          style={{
            position: "absolute",
            left: 578,
            top: 405,
            width: 1900,
            height: 900,
            borderRadius: 93,
            background: "#FFFDFE",
            overflow: "hidden",
            boxShadow: "0 0 0 1px rgba(195,25,82,.06), 0 30px 80px rgba(110,12,48,.08)",
            translate: interpolate(frame, [0, 96.61], ["0px 138.6px", "0px 0px"], { easing: Easing.bezier(0.077, 0.581, 0.084, 0.965), extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            opacity: interpolate(frame, [0, 36.56, 62.67], [0, 0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp"
            })
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(180deg, #FCEFF4 0px, #FFFDFE 230px), radial-gradient(60% 50% at 40% 100%, ${P.floor}, transparent)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 420,
              background: `radial-gradient(70% 90% at 45% 110%, #F9D2E0 0%, rgba(255,253,254,0) 70%)`,
            }}
          />
          {/* Buscador */}
          <div
            style={{
              position: "absolute",
              left: 560,
              top: 34,
              width: 520,
              height: 54,
              borderRadius: 27,
              background: "rgba(255,255,255,.85)",
              boxShadow: "inset 0 0 0 1px #F0DCE4",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "0 22px",
              color: "#B7A9AF",
              fontSize: 22,
            }}
          >
            <svg width={20} height={20} viewBox="0 0 20 20">
              <circle cx={8.5} cy={8.5} r={6} fill="none" stroke="#B7A9AF" strokeWidth={2} />
              <path d="M13 13l5 5" stroke="#B7A9AF" strokeWidth={2} strokeLinecap="round" />
            </svg>
            Buscar deudores, actas o casos
          </div>
          {/* Columna de íconos */}
          <SideIcon x={129} y={334} active />
          <SideIcon x={129} y={495} chat />
          {/* Tarjeta de cartera */}
          <div
            style={{
              position: "absolute",
              left: 356,
              top: 295,
              width: 560,
              height: 700,
              borderRadius: 40,
              background: "#fff",
              boxShadow: "0 0 0 1px #F1E3E9, 0 20px 50px rgba(110,12,48,.07)",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "26px 28px" }}>
              <Isotipo size={54} />
              <div>
                <div style={{ fontSize: 27, fontWeight: 600, color: P.ink }}>
                  Cartera de marzo
                </div>
                <div style={{ fontSize: 20, color: "#9B9397", marginTop: 2 }}>
                  Cartera · 128 deudores
                </div>
              </div>
            </div>
            <svg
              width={504}
              height={560}
              viewBox="0 0 504 560"
              style={{ marginLeft: 28, borderRadius: 26 }}
            >
              <CoverArt kind="chat" w={504} h={560} uid="s1cover" />
            </svg>
          </div>
          <div
            style={{
              position: "absolute",
              left: 950,
              top: 295,
              width: 560,
              height: 700,
              borderRadius: 40,
              background: "#fff",
              boxShadow: "0 0 0 1px #F1E3E9",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "30px 28px", fontSize: 27, fontWeight: 600, color: P.ink }}>
              Acuerdos de la semana
            </div>
            <svg width={504} height={560} viewBox="0 0 504 560" style={{ marginLeft: 28 }}>
              <CoverArt kind="deals" w={504} h={560} uid="s1cover2" />
            </svg>
          </div>
        </Interactive.Div>

        {/* Anillo de hover alrededor del disco. La altura sigue al encabezado (calculada). */}
        <Interactive.Div
          name="Anillo"
          style={{
            position: "absolute",
            left: 623,
            top: discY - 87,
            width: 174,
            height: 174,
            borderRadius: "50%",
            background: "radial-gradient(circle, #FFF6F9 58%, #FBE3EC 68%, #F8CFDE 76%, rgba(248,207,222,0) 77%)",
            opacity: interpolate(frame, [138.39, 156.67], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            scale: interpolate(frame, [138.39, 156.67], [0.85, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        />

        {/* Encabezado: disco + nombre + píldora. Coordenadas con el encabezado
            en su altura final (536); el translate lo trae desde abajo. */}
        <Smear id="s1lock" y={lockBlurY} x={lockBlurY * 0.2}>
          <Interactive.Div
            name="Encabezado"
            style={{
              position: "absolute",
              inset: 0,
              translate: interpolate(frame, [0, 96.61], ["0px 396px", "0px 0px"], { easing: Easing.bezier(0.077, 0.581, 0.084, 0.965), extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            <div style={{ position: "absolute", left: 644, top: 470 }}>
              <Isotipo size={132} />
            </div>
            <Interactive.Div
              name="Nombre"
              style={{
                position: "absolute",
                left: 806,
                top: 536,
                translate: "0px -52%",
                fontSize: 76,
                fontWeight: 500,
                letterSpacing: -2,
                color: "#161516",
                opacity: interpolate(frame, [5.22, 33.94], [0, 1], { easing: Easing.bezier(0.154, 1.04, 0.347, 0.985), extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                filter: blur((1 - nameP) * 14),
              }}
            >pacta.ai</Interactive.Div>
            <Interactive.Div
              name="Píldora"
              style={{
                position: "absolute",
                left: 1040,
                top: 508,
                height: 56,
                padding: "0 26px",
                borderRadius: 28,
                background: "#2E2A2C",
                color: "#fff",
                fontSize: 25,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                whiteSpace: "nowrap",
                translate: interpolate(
                  frame,
                  [29.439999999999998, 63.39, 142],
                  ["50px 0px", "40px 0px", "61px 2px"],
                  {
                    easing: [Easing.bezier(0.154, 1.04, 0.347, 0.985), Easing.linear],
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    outputType: "translate"
                  }
                ),
                opacity: interpolate(frame, [29.439999999999998, 55.25], [0, 1], {
                  easing: [Easing.bezier(0.344, 0.548, 0.741, 0.851)],
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp"
                }),
                filter: blur((1 - pillP) * 22),
                transformOrigin: "60% 50%"
              }}
            >
              Agente de cobranzas
            </Interactive.Div>
          </Interactive.Div>
        </Smear>

        {f >= 27 && (
          <Cursor
            x={cx}
            y={cy}
            rot={rot}
            scale={curScale}
            opacity={prog(f, 27, 29)}
            blurPx={Math.min(3, curSpeed * 0.12)}
          />
        )}
      </Interactive.Div>
    </div>
  )
}

/**
 * Altura del encabezado en frames de guion (f37 = frame local 96.61). Misma
 * curva que el translate de "Encabezado"; la usan el anillo y el cursor.
 * Si cambiás los keyframes del Encabezado en el Studio, actualizá esto también.
 */
function lockYAt(f: number) {
  return interpolate(f, [0, 37], [932, 536], { easing: Easing.bezier(0.077, 0.581, 0.084, 0.965), extrapolateLeft: "clamp", extrapolateRight: "clamp" })
}

function cursorS1(f: number): [number, number] {
  const dy = lockYAt(f)
  if (f < 44) {
    return [
      kf(f, [
        [27, 891 + DX],
        [44, 770 + DX],
      ], outExpo),
      kf(f, [
        [27, 393],
        [44, 383],
      ], outExpo),
    ]
  }
  return [
    kf(f, [
      [44, 770 + DX],
      [56, DISC_X + 89],
      [59, DISC_X + 47],
      [71, DISC_X + 15],
    ], inOut),
    kf(f, [
      [44, 383],
      [56, dy + 28],
      [59, dy + 10],
      [71, dy - 5],
    ], inOut),
  ]
}

function SideIcon({
  x,
  y,
  active,
  chat,
}: {
  x: number
  y: number
  active?: boolean
  chat?: boolean
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x - 36,
        top: y - 36,
        width: 72,
        height: 72,
        borderRadius: 22,
        background: active ? "#FBE7EE" : "transparent",
        display: "grid",
        placeItems: "center",
        opacity: chat ? 0.45 : 1,
      }}
    >
      <svg width={34} height={34} viewBox="0 0 24 24" fill="none">
        {chat ? (
          <path
            d="M4 5h16v11H9l-5 4z"
            stroke={P.ink}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
        ) : (
          <>
            <rect x={3} y={4} width={18} height={16} rx={3} stroke={P.primary} strokeWidth={1.8} />
            <path d="M3 9h18M8 13h5M8 16h8" stroke={P.primary} strokeWidth={1.8} strokeLinecap="round" />
          </>
        )}
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* S2 · f72–100                                                         */
/* ------------------------------------------------------------------ */

const SQUARES = [
  { color: "#FFFFFF", angle: 180, edge: true, row: 0 }, // izquierda
  { color: P.primary, angle: 270, row: 1 }, // arriba
  { color: P.pink, angle: 0, row: 2 }, // derecha
  { color: "#2E2A2C", angle: 90, row: 3 }, // abajo
]

/** Insignias que orbitan en el modo "iconos": lo que hace el agente. */
const BADGES = [
  { bg: "#FFFFFF", fg: P.primary, angle: 180, edge: true, icon: "chat" }, // negocia
  { bg: P.primary, fg: "#FFFFFF", angle: 270, icon: "pago" }, // cobra
  { bg: P.pink, fg: "#FFFFFF", angle: 0, icon: "ok" }, // acuerda
  { bg: "#2E2A2C", fg: "#FFFFFF", angle: 90, icon: "acta" }, // documenta
] as const

function BadgeIcon({ kind, color }: { kind: (typeof BADGES)[number]["icon"]; color: string }) {
  const s = { fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const
  return (
    <svg width={40} height={40} viewBox="0 0 24 24">
      {kind === "chat" && (
        <>
          <path d="M4 5.5h16v10.5H10l-4.5 3.5V16H4z" {...s} />
          <path d="M8.5 10.8h.01M12 10.8h.01M15.5 10.8h.01" {...s} strokeWidth={2.6} />
        </>
      )}
      {kind === "pago" && (
        <path d="M12 3.5v17M16 8c0-1.7-1.8-2.8-4-2.8S8 6.3 8 8s1.8 2.5 4 3 4 1.4 4 3.2-1.8 2.9-4 2.9-4-1.2-4-2.9" {...s} />
      )}
      {kind === "ok" && <path d="M5.5 12.5l4.2 4.2L18.5 7.8" {...s} strokeWidth={2.6} />}
      {kind === "acta" && (
        <>
          <path d="M6 3.5h8.5L18 7v13.5H6z" {...s} />
          <path d="M9 11h6M9 14.5h6M9 18h3.5" {...s} />
        </>
      )}
    </svg>
  )
}

export function S2({ orbita = "cuadrados" }: { orbita?: "cuadrados" | "iconos" } = {}) {
  const cuadrados = orbita === "cuadrados"
  const frame = useCurrentFrame()
  // Frame de guion viejo (72 → 100), con los mismos tramos que PactaSting.
  const f = kf(frame, [
    [0, 72],
    [56, 86],
    [92.13, 92],
    [116.13, 100],
  ])
  const settle = prog(f, 72, 86, outExpo)
  // Después de trabar la cruz sigue girando muy despacio: nunca queda quieto.
  const spin = (1 - settle) * 220 - prog(f, 86, 100) * 10
  const orbit = mix(360, 216, settle) + prog(f, 86, 92, outCubic) * 8
  const row = 0
  // Salida: zoom a través del ícono, acelerando, con desenfoque creciente.
  // La escala está en línea en "Zoom a través"; el desenfoque sigue calculado.
  const through = prog(f, 92, 100, inCubic)
  const blurThrough = mix(0, 16, through)
  const gy = CY
  const gx = CX
  const sq = 92

  return (
    <div style={{ position: "absolute", inset: 0, background: P.page }}>
      <Interactive.Div
        name="Zoom a través"
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "50% 50%",
          scale: interpolate(frame, [92.13, 116.13], [1, 7], { easing: Easing.cubic, extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          filter: blur(blurThrough),
        }}
      >
        {/* Halo: 180 → 334 px de diámetro, como escala de un disco de 334 px */}
        <Interactive.Div
          name="Halo"
          style={{
            position: "absolute",
            left: 793,
            top: 373,
            width: 334,
            height: 334,
            borderRadius: "50%",
            background: "#ECE8E9",
            scale: interpolate(frame, [0, 12, 56, 92.13], [0.5389, 0.7186, 0.976, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        />
        {/* Cuadrados en órbita: calculados (giro polar compartido) */}
        {cuadrados && SQUARES.map((s, i) => {
          const a = ((s.angle + spin) * Math.PI) / 180
          const ox = Math.cos(a) * orbit
          const oy = Math.sin(a) * orbit
          // Fila a la derecha del ícono (el blanco se esconde detrás).
          const rx = s.row === 0 ? 0 : 20 + 49 * s.row
          const x = mix(ox, rx + 174 / 2 - 20, row)
          const y = mix(oy, 0, row)
          const appear = prog(f, 72 + i * 0.8, 77 + i * 0.8, outCubic)
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: gx + x - sq / 2,
                top: gy + y - sq / 2,
                width: sq,
                height: sq,
                borderRadius: mix(26, 18, row),
                background: s.color,
                boxShadow: s.edge
                  ? "inset 0 0 0 1px #EBDFE4, 0 4px 14px rgba(110,12,48,.10)"
                  : "0 6px 16px rgba(110,12,48,.14)",
                transform: `rotate(${spin * 0.6}deg) scale(${appear})`,
                zIndex: s.row === 0 ? 0 : 2,
              }}
            />
          )
        })}
        {/* Órbita de íconos: anillo punteado, insignias y puntos en contragiro */}
        {orbita === "iconos" && (() => {
          // Mismo giro que los cuadrados, más una deriva constante para que no se frene.
          const turn = spin - frame * 0.45
          const ringIn = prog(f, 73, 80, outCubic)
          return (
            <>
              <svg
                width={W}
                height={H}
                style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: ringIn }}
              >
                <circle
                  cx={gx}
                  cy={gy}
                  r={orbit}
                  fill="none"
                  stroke={P.primary}
                  strokeOpacity={0.28}
                  strokeWidth={2}
                  strokeDasharray="2 14"
                  strokeLinecap="round"
                  transform={`rotate(${-turn * 0.5} ${gx} ${gy})`}
                />
                {Array.from({ length: 7 }, (_, i) => {
                  const a = ((i * 360) / 7 + frame * 0.9) * (Math.PI / 180)
                  const r = orbit + 70 + (i % 3) * 18
                  return (
                    <circle
                      key={i}
                      cx={gx + Math.cos(a) * r}
                      cy={gy + Math.sin(a) * r}
                      r={[5, 3.5, 7, 4][i % 4] * prog(f, 74 + i * 0.6, 80 + i * 0.6, outCubic)}
                      fill={i % 2 ? P.pink : P.primary}
                      fillOpacity={i % 3 === 0 ? 0.9 : 0.5}
                    />
                  )
                })}
              </svg>
              {BADGES.map((b, i) => {
                const a = ((b.angle + turn) * Math.PI) / 180
                const appear = prog(f, 72 + i * 0.8, 77 + i * 0.8, outCubic)
                const pulse = 1 + 0.05 * Math.sin(frame * 0.12 + i * 1.6)
                const d = 96
                return (
                  <div
                    key={b.icon}
                    style={{
                      position: "absolute",
                      left: gx + Math.cos(a) * orbit - d / 2,
                      top: gy + Math.sin(a) * orbit - d / 2,
                      width: d,
                      height: d,
                      borderRadius: "50%",
                      background: b.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "edge" in b
                        ? "inset 0 0 0 1px #EBDFE4, 0 6px 18px rgba(110,12,48,.12)"
                        : "0 8px 20px rgba(110,12,48,.18)",
                      transform: `scale(${appear * pulse})`,
                      zIndex: 2,
                    }}
                  >
                    <BadgeIcon kind={b.icon} color={b.fg} />
                  </div>
                )
              })}
            </>
          )
        })()}
        {/* Ícono: 276 → 178 px (outExpo) y 178 → 174 px, como escala de un ícono de 174 px */}
        <Interactive.Div
          name="Ícono"
          style={{
            position: "absolute",
            left: 873,
            top: 453,
            width: 174,
            height: 174,
            zIndex: 1,
            scale: interpolate(frame, [0, 56, 92.13], [1.5862, 1.023, 1], { easing: [Easing.bezier(0.154, 1.04, 0.347, 0.985), Easing.linear], extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <AppIcon size={174} />
        </Interactive.Div>
      </Interactive.Div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* S3 · f101–158                                                        */
/* ------------------------------------------------------------------ */

const PROMPT = "Negociá con mis 128 deudores"

/** Cantidad de caracteres tipeados: ~1 por frame con una pausa cada 2–3. */
function typedCount(f: number) {
  // Incrementos por frame: tipeo irregular de ~1 carácter por frame.
  const steps = [1, 2, 0, 1, 1, 0, 2, 1]
  let n = 0
  for (let t = 121, k = 0; t <= f; t++, k++) n += steps[k % steps.length]
  return Math.min(PROMPT.length, n)
}

export function Wallpaper({ w = W, h = 1200 }: { w?: number; h?: number }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="wp" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor="#5E0A29" />
          <stop offset="0.45" stopColor="#A21245" />
          <stop offset="1" stopColor="#E0628F" />
        </linearGradient>
        <radialGradient id="wpg" cx="0.88" cy="0.05" r="0.45">
          <stop offset="0" stopColor="#FFC2D6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFC2D6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={w} height={h} fill="url(#wp)" />
      <rect width={w} height={h} fill="url(#wpg)" />
      <g stroke="#fff" strokeOpacity={0.45} strokeWidth={1.6} fill="none">
        <circle cx={w * 0.73} cy={h * 0.72} r={h * 0.62} />
        <line x1={0} x2={w} y1={h * 0.37} y2={h * 0.37} />
        <line x1={0} x2={w} y1={h * 0.66} y2={h * 0.66} />
        <line x1={w * 0.6} x2={w * 0.6} y1={0} y2={h} />
      </g>
      <path
        d={`M${w * 0.6} ${h * 0.66 - 16}Q${w * 0.6} ${h * 0.66} ${w * 0.6 + 16} ${h * 0.66}Q${w * 0.6} ${h * 0.66} ${w * 0.6} ${h * 0.66 + 16}Q${w * 0.6} ${h * 0.66} ${w * 0.6 - 16} ${h * 0.66}Q${w * 0.6} ${h * 0.66} ${w * 0.6} ${h * 0.66 - 16}Z`}
        fill="#fff"
      />
    </svg>
  )
}

const BAR_TOP = 477
const BAR_H = 61
const MARK_X = 977 // centro de la marca en la barra

export function S3() {
  const frame = useCurrentFrame()
  // Frame de guion viejo (101 → 158).
  const f = kf(frame, [
    [-0.35, 101],
    [173.84, 158],
  ])
  const enterBlur = kf(f, [
    [101, 3],
    [110, 0],
  ], outCubic)
  // Entrada (enterY) y paneo (pan): en línea en el translate de "Escena".
  // Deriva hacia arriba que acelera hasta el whip-tilt (~25 px/frame en f158).
  const lift = liftAt(f)
  const liftV = (liftAt(f) - liftAt(f - 0.5)) * 2
  const smearY = Math.min(8, Math.max(0, (liftV - 8) * 0.42))

  // Caja de vidrio: brota de debajo de la marca.
  const sp = spring({
    frame: Math.max(0, f - 116),
    fps: 30,
    config: { damping: 11, mass: 0.7, stiffness: 120 },
  })
  const boxW = f < 116 ? 0 : 726 * Math.max(0, sp)
  const boxH =
    f < 116
      ? 0
      : 228 *
        Math.max(
          0,
          spring({
            frame: Math.max(0, f - 117),
            fps: 30,
            config: { damping: 13, mass: 0.7, stiffness: 120 },
          })
        )
  const boxCX = MARK_X - 30
  const boxTop = 568 + (1 - Math.min(1, sp)) * -40
  const n = typedCount(f)

  // Cursor: sube desde abajo hasta la marca, clic f113–117.
  const curX = kf(f, [
    [102, MARK_X + 160],
    [111, MARK_X + 10],
  ], outExpo)
  const curY = kf(f, [
    [102, 1120],
    [111, BAR_TOP + 36],
  ], outExpo)
  const press = prog(f, 113, 115) - prog(f, 115, 117)

  return (
    <div style={{ position: "absolute", inset: 0, background: P.page }}>
      <Smear id="s3" y={smearY + enterBlur * 0.5} x={enterBlur}>
        {/* Whip-tilt: deriva cúbica hacia arriba (calculada) */}
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${-lift}px)` }}>
        <Interactive.Div
          name="Escena"
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "50.8854% 55.5556%",
            scale: 1.3,
            translate: interpolate(frame, [-0.35, 27.15, 42.43, 88.27], ["0px 70px", "0px 0px", "0px 0px", "125px 0px"], { easing: [Easing.bezier(0.154, 1.04, 0.347, 0.985), Easing.linear, Easing.bezier(0.65, 0, 0.35, 1)], extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          {/* Pantalla de la notebook */}
          <div
            style={{
              position: "absolute",
              left: -400,
              width: W + 800,
              top: BAR_TOP,
              height: 1400,
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", left: 0, top: BAR_H }}>
              <Wallpaper w={W + 800} h={1300} />
            </div>
          </div>
          {/* Bisel */}
          <div
            style={{
              position: "absolute",
              left: -400,
              width: W + 800,
              top: 425,
              height: 52,
              background: "#0B0A0A",
              borderTop: "2px solid #686866",
              borderRadius: "40px 40px 0 0",
            }}
          />
          {/* Barra de menú */}
          <div
            style={{
              position: "absolute",
              left: -400,
              width: W + 800,
              top: BAR_TOP,
              height: BAR_H,
              background: "rgba(27,22,24,.94)",
            }}
          />
          <MenuCluster press={press} />

          {/* Caja de vidrio */}
          {boxW > 2 && boxH > 2 && (
            <div
              style={{
                position: "absolute",
                left: boxCX - boxW / 2,
                top: boxTop,
                width: boxW,
                height: boxH,
                borderRadius: 60,
                overflow: "hidden",
                boxShadow:
                  "inset 0 1.5px 0 rgba(255,255,255,.85), inset 0 0 0 1px rgba(255,255,255,.35), 0 24px 60px rgba(60,6,26,.35)",
              }}
            >
              {/* Copia desenfocada del fondo */}
              <div
                style={{
                  position: "absolute",
                  left: -(boxCX - boxW / 2) - 400,
                  top: -(boxTop - BAR_TOP - BAR_H),
                  filter: "blur(26px) saturate(1.15)",
                }}
              >
                <Wallpaper w={W + 800} h={1300} />
              </div>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,.34), rgba(255,235,243,.18))",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 44,
                  top: 46,
                  fontSize: 36,
                  fontWeight: 500,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {n === 0 ? (
                  <span style={{ opacity: 0.6 }}>Pedile algo a pacta</span>
                ) : (
                  PROMPT.slice(0, n)
                )}
                <span
                  style={{
                    display: "inline-block",
                    width: 3,
                    height: 40,
                    marginLeft: n === 0 ? -2 : 3,
                    background: "#fff",
                    order: n === 0 ? -1 : 0,
                    marginRight: n === 0 ? 6 : 0,
                  }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 44,
                  bottom: 36,
                  display: "flex",
                  gap: 30,
                }}
              >
                {["M12 5v14M5 12h14", "M8 12l6-6a3 3 0 014 4l-8 8a5 5 0 01-7-7l7-7", "M12 4a3 3 0 013 3v5a3 3 0 01-6 0V7a3 3 0 013-3zM6 12a6 6 0 0012 0M12 18v3"].map(
                  (d) => (
                    <svg key={d} width={32} height={32} viewBox="0 0 24 24" fill="none">
                      <path d={d} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                )}
              </div>
              <div
                style={{
                  position: "absolute",
                  right: 32,
                  bottom: 28,
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  background: P.primary,
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 4px 12px rgba(60,6,26,.35)",
                }}
              >
                <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
                  <path d="M12 19V5M6 11l6-6 6 6" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          )}

          {f >= 102 && (
            <Cursor x={curX} y={curY} scale={1 - 0.15 * press} />
          )}
        </Interactive.Div>
        </div>
      </Smear>
      <Interactive.Div
        name="Tinte"
        style={{
          position: "absolute",
          inset: 0,
          background: "#FCE7EF",
          opacity: interpolate(frame, [161.61, 173.84], [0, 0.85], { easing: Easing.quad, extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      />
    </div>
  )
}

function liftAt(f: number) {
  if (f < 136) return 0
  const t = f - 136
  return 0.4 * t + 0.017 * t * t * t
}

function MenuCluster({ press }: { press: number }) {
  const y = BAR_TOP + BAR_H / 2
  const white = "#FFFFFF"
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: y,
        width: W,
        height: 0,
        color: white,
        fontFamily: font,
      }}
    >
      {/* Wi-Fi */}
      <svg width={36} height={28} viewBox="0 0 24 18" style={{ position: "absolute", left: 700, top: -14 }}>
        <path d="M2 6a14 14 0 0120 0M5.5 9.5a9 9 0 0113 0M9 13a4 4 0 016 0" fill="none" stroke={white} strokeWidth={2.2} strokeLinecap="round" />
        <circle cx={12} cy={16} r={1.6} fill={white} />
      </svg>
      {/* Batería */}
      <svg width={48} height={24} viewBox="0 0 32 16" style={{ position: "absolute", left: 770, top: -12 }}>
        <rect x={1} y={2} width={26} height={12} rx={3.5} fill="none" stroke={white} strokeOpacity={0.6} strokeWidth={1.4} />
        <rect x={3} y={4} width={19} height={8} rx={2} fill={white} />
        <rect x={28.5} y={6} width={2} height={4} rx={1} fill={white} fillOpacity={0.6} />
      </svg>
      {/* Controles */}
      <svg width={30} height={30} viewBox="0 0 24 24" style={{ position: "absolute", left: 856, top: -15 }}>
        <rect x={3} y={5} width={18} height={6} rx={3} fill="none" stroke={white} strokeWidth={1.8} />
        <rect x={3} y={13} width={18} height={6} rx={3} fill="none" stroke={white} strokeWidth={1.8} />
        <circle cx={7} cy={8} r={2} fill={white} />
        <circle cx={17} cy={16} r={2} fill={white} />
      </svg>
      {/* Marca de pacta */}
      <div
        style={{
          position: "absolute",
          left: MARK_X - 27,
          top: -27,
          width: 54,
          height: 54,
          borderRadius: 14,
          background: press > 0 ? `rgba(255,255,255,${0.18 * press})` : "transparent",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Isotipo size={38} />
      </div>
      {[P.primary, P.pink, "#FFFFFF"].map((c, i) => (
        <div
          key={c}
          style={{
            position: "absolute",
            left: MARK_X + 55 + i * 49 - 18,
            top: -18,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: c,
            boxShadow: i === 0 ? "0 0 0 1.5px rgba(255,255,255,.35)" : undefined,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: MARK_X + 200,
          top: -21,
          fontSize: 32,
          fontWeight: 500,
          whiteSpace: "nowrap",
          letterSpacing: 0.2,
        }}
      >
        Lun 22 jun&nbsp;&nbsp;9:41
      </div>
    </div>
  )
}

export { H }
