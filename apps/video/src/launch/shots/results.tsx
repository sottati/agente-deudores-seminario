import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion"

import { Badge } from "@/components/ui/badge"

import { easeInOut, progress } from "../../lib/anim"
import {
  C,
  Float,
  GroundWipe,
  Headline,
  Kicker,
  LaunchStage,
  Panel,
} from "../kit"

const MONTHS = ["Jun", "Jul", "Ago", "Sep", "Oct", "Nov"]
const VALUES = [1.4, 1.2, 1.6, 3.4, 5.9, 8.4]
const CH = {
  left: 150,
  top: 330,
  w: 1620,
  h: 640,
  x0: 110,
  x1: 1560,
  yb: 560,
  yt: 50,
}
const xAt = (i: number) => CH.x0 + (i * (CH.x1 - CH.x0)) / 5
const yAt = (v: number) => CH.yb - (v / 9) * (CH.yb - CH.yt)

function millions(v: number) {
  return `$ ${v.toFixed(1).replace(".", ",")} M`
}

/** 5A · El gráfico de recupero dibujado sobre magenta: antes gris, después blanco. */
export function ShotChart() {
  const frame = useCurrentFrame()
  const before = progress(frame, 26, 28, easeInOut)
  const after = progress(frame, 64, 64, easeInOut)
  const marker = progress(frame, 52, 14)
  const leader = progress(frame, 132, 10)
  const value = interpolate(frame, [136, 166], [0, 8.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  })
  const end = { x: xAt(5), y: yAt(8.4) }
  const pulse = frame > 128 ? ((frame - 128) % 30) / 30 : -1
  const areaW = (xAt(5) - xAt(2)) * after
  const pts = (from: number, to: number) =>
    VALUES.slice(from, to + 1)
      .map((v, k) => `${xAt(from + k)},${yAt(v)}`)
      .join(" ")

  return (
    <LaunchStage>
      <GroundWipe
        from="dark"
        to="mag"
        p={progress(frame, 0, 12, easeInOut)}
        dir="up"
      />
      <div style={{ position: "absolute", left: 150, top: 90 }}>
        <Kicker at={6} color="rgba(252,240,244,.8)">
          Evolución del recupero
        </Kicker>
        <Headline
          text="Más acuerdos. Más cobros."
          at={12}
          size={88}
          style={{ marginTop: 12 }}
        />
      </div>
      <svg
        width={CH.w}
        height={CH.h}
        style={{
          position: "absolute",
          left: CH.left,
          top: CH.top,
          overflow: "visible",
        }}
      >
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.38} />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </linearGradient>
          <clipPath id="reveal">
            <rect x={xAt(2)} y={0} width={areaW} height={CH.h} />
          </clipPath>
        </defs>
        <rect
          x={CH.x0}
          y={CH.yt - 20}
          width={xAt(2) - CH.x0}
          height={CH.yb - CH.yt + 20}
          fill="rgba(60,0,20,.22)"
          opacity={progress(frame, 20, 16)}
        />
        <text
          x={(CH.x0 + xAt(2)) / 2}
          y={CH.yt + 30}
          fill="rgba(252,240,244,.65)"
          fontSize={26}
          textAnchor="middle"
          opacity={progress(frame, 24, 16)}
        >
          Gestión manual
        </text>
        {[0, 3, 6, 9].map((v, k) => {
          const p = progress(frame, 2 + k * 4, 18)
          return (
            <g key={v}>
              <line
                x1={CH.x0}
                x2={CH.x0 + (CH.x1 - CH.x0 + 30) * p}
                y1={yAt(v)}
                y2={yAt(v)}
                stroke="rgba(255,255,255,.18)"
                strokeWidth={2}
              />
              <text
                x={CH.x0 - 24}
                y={yAt(v) + 9}
                fill="rgba(252,240,244,.7)"
                fontSize={24}
                textAnchor="end"
                opacity={p}
              >
                {v === 0 ? "0" : `${v} M`}
              </text>
            </g>
          )
        })}
        {MONTHS.map((m, i) => (
          <text
            key={m}
            x={xAt(i)}
            y={CH.yb + 50}
            fill="rgba(252,240,244,.7)"
            fontSize={24}
            textAnchor="middle"
            opacity={progress(frame, 12 + i * 2, 14)}
          >
            {m}
          </text>
        ))}
        <line
          x1={xAt(2)}
          x2={xAt(2)}
          y1={CH.yb}
          y2={CH.yb - (CH.yb - CH.yt + 20) * marker}
          stroke="#FFFFFF"
          strokeOpacity={0.7}
          strokeWidth={2}
          strokeDasharray="8 8"
        />
        <polyline
          points={pts(0, 2)}
          fill="none"
          stroke="rgba(60,0,20,.6)"
          strokeWidth={6}
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - before}
        />
        <path
          d={`M${xAt(2)} ${yAt(VALUES[2])} ${VALUES.slice(3)
            .map((v, k) => `L${xAt(3 + k)} ${yAt(v)}`)
            .join(" ")} L${xAt(5)} ${CH.yb} L${xAt(2)} ${CH.yb} Z`}
          fill="url(#area)"
          clipPath="url(#reveal)"
        />
        <polyline
          points={pts(2, 5)}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={7}
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - after}
        />
        {pulse >= 0 && (
          <circle
            cx={end.x}
            cy={end.y}
            r={10 + pulse * 40}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3}
            opacity={1 - pulse}
          />
        )}
        {frame > 126 && (
          <circle
            cx={end.x}
            cy={end.y}
            r={11}
            fill="#FFFFFF"
            stroke={C.primary}
            strokeWidth={4}
          />
        )}
        <line
          x1={end.x - 10}
          y1={end.y - 10}
          x2={end.x - 10 - 70 * leader}
          y2={end.y - 10 - 50 * leader}
          stroke="#FFFFFF"
          strokeWidth={3}
        />
      </svg>
      <Float
        x={CH.left + xAt(2) + 24}
        y={CH.top + 70}
        at={56}
        rot={-6}
        from={[0, -140]}
        pop
      >
        <Panel on="mag" zoom={2} pad={8} radius={10}>
          <span className="text-sm font-medium">pacta.ai activo</span>
        </Panel>
      </Float>
      <Float
        x={CH.left + end.x - 380}
        y={CH.top + end.y - 170}
        at={138}
        rot={3}
        pop
      >
        <Panel tone="light" on="mag" zoom={2.4} pad={10} radius={12}>
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            {millions(value)}
          </span>
        </Panel>
      </Float>
      <div
        style={{
          position: "absolute",
          right: 60,
          bottom: 36,
          fontSize: 22,
          color: "rgba(252,240,244,.6)",
          opacity: progress(frame, 30, 20),
        }}
      >
        Datos ilustrativos
      </div>
    </LaunchStage>
  )
}

const PLANS = [
  { label: "Pago único", n: 14, color: "#E7D7DD" },
  { label: "2 cuotas", n: 18, color: "#1A1A1A" },
  { label: "3 cuotas", n: 10, color: C.primary },
]

function Donut({ frame }: { frame: number }) {
  let acc = 0
  return (
    <svg viewBox="0 0 42 42" width={150} height={150}>
      {PLANS.map((p, k) => {
        const len = (p.n / 42) * 100
        const q = progress(frame, 40 + k * 16, 22, easeInOut)
        const offset = 25 - acc
        acc += len
        return (
          <circle
            key={p.label}
            cx={21}
            cy={21}
            r={15.9155}
            fill="none"
            stroke={p.color}
            strokeWidth={6}
            strokeDasharray={`${len * q} ${100 - len * q}`}
            strokeDashoffset={offset}
          />
        )
      })}
    </svg>
  )
}

/** 5B · Fondo claro: los KPIs del dashboard flotando, cada uno con otro tratamiento. */
export function ShotKpis() {
  const frame = useCurrentFrame()
  const r = (to: number, at = 10) =>
    interpolate(frame, [at, at + 40], [0, to], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeInOut,
    })
  const out = 180

  return (
    <LaunchStage>
      <GroundWipe
        from="mag"
        to="light"
        p={progress(frame, 0, 12, easeInOut)}
        dir="right"
      />
      <Float
        x={1300}
        y={720}
        depth={2}
        rot={-6}
        at={20}
        out={out}
        outTo={[300, 0]}
      >
        <span style={{ zoom: 2.2, display: "inline-block" }}>
          <Badge>Acordada</Badge>
        </span>
      </Float>
      <Float
        x={1560}
        y={900}
        depth={2}
        rot={5}
        at={30}
        out={out}
        outTo={[300, 0]}
      >
        <span style={{ zoom: 2.2, display: "inline-block" }}>
          <Badge>Acordada</Badge>
        </span>
      </Float>
      <Float
        x={1080}
        y={880}
        depth={1}
        rot={4}
        at={40}
        out={out}
        outTo={[300, 0]}
      >
        <span style={{ zoom: 2.2, display: "inline-block" }}>
          <Badge>Acordada</Badge>
        </span>
      </Float>

      <Float x={150} y={180} rot={-3} at={6} out={out} outTo={[-500, -100]}>
        <Panel
          tone="light"
          on="light"
          zoom={2.4}
          pad={16}
          style={{ width: 250 }}
        >
          <div className="text-xs text-muted-foreground">Monto recuperado</div>
          <div className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
            {millions(r(8.4))}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            +12,5 % vs. agosto
          </div>
        </Panel>
      </Float>
      <Float x={850} y={300} rot={2} at={14} out={out} outTo={[0, -600]}>
        <Panel tone="mag" on="light" zoom={2.4} pad={16} style={{ width: 200 }}>
          <div className="text-xs text-muted-foreground">Acuerdos cerrados</div>
          <div className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
            {Math.round(r(42, 18))}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            9 esta semana
          </div>
        </Panel>
      </Float>
      <Float
        x={1420}
        y={140}
        depth={1}
        rot={5}
        at={22}
        out={out}
        outTo={[500, -100]}
      >
        <Panel
          tone="dark"
          on="light"
          zoom={2.4}
          pad={16}
          style={{ width: 210 }}
        >
          <div className="text-xs text-muted-foreground">
            Conversaciones activas
          </div>
          <div className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
            {Math.round(r(18, 26))}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            6 esperan respuesta
          </div>
        </Panel>
      </Float>
      <Float x={260} y={600} rot={2} at={30} out={out} outTo={[-300, 500]}>
        <Panel
          tone="light"
          on="light"
          zoom={2.2}
          pad={16}
          style={{ width: 380 }}
        >
          <div className="mb-3 text-sm font-semibold">Acuerdos por plan</div>
          <div className="flex items-center gap-6">
            <Donut frame={frame} />
            <div className="flex flex-col gap-2 text-sm">
              {PLANS.map((p, k) => (
                <div
                  key={p.label}
                  className="flex items-center gap-2"
                  style={{ opacity: progress(frame, 44 + k * 16, 12) }}
                >
                  <span
                    className="size-3 rounded-sm"
                    style={{ background: p.color }}
                  />
                  <span className="w-24 text-muted-foreground">{p.label}</span>
                  <span className="font-medium tabular-nums">{p.n}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </Float>
      <AbsoluteFill style={{ opacity: 1 - progress(frame, out, 16) }}>
        <div style={{ position: "absolute", left: 150, top: 80 }}>
          <Kicker at={4} color="rgba(26,26,26,.55)">
            Dashboard
          </Kicker>
        </div>
        <div
          style={{
            position: "absolute",
            right: 60,
            bottom: 36,
            fontSize: 22,
            color: "rgba(26,26,26,.5)",
            opacity: progress(frame, 30, 20),
          }}
        >
          Datos ilustrativos
        </div>
      </AbsoluteFill>
    </LaunchStage>
  )
}
