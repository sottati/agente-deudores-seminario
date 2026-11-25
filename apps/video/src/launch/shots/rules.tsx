import type { ReactNode } from "react"
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { easeInOut, progress, typed } from "../../lib/anim"
import {
  C,
  Camera,
  Cursor,
  Float,
  Ground,
  GroundWipe,
  Headline,
  Iris,
  Kicker,
  LaunchStage,
  Panel,
  Roll,
} from "../kit"
import type { GroundKind, Tone } from "../kit"

function Chevrons({ kind }: { kind: "stepper" | "select" }) {
  return (
    <svg
      width="12"
      height="14"
      viewBox="0 0 12 14"
      className="text-muted-foreground"
    >
      {kind === "stepper" && (
        <path
          d="M3 5l3-3 3 3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
      <path
        d="M3 9l3 3 3-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Mismo marcado que el `Input` de la plataforma, pero acepta contenido animado. */
export function FakeInput({
  children,
  focus,
  adornment,
  className,
}: {
  children: ReactNode
  focus?: boolean
  adornment?: "stepper" | "select"
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input px-2.5 text-sm tabular-nums dark:bg-input/30",
        focus && "border-ring ring-3 ring-ring/50",
        className
      )}
    >
      <span className="min-w-0 truncate">{children}</span>
      {adornment && <Chevrons kind={adornment} />}
    </div>
  )
}

/** Un campo de la página "Reglas del agente", suelto en una tarjeta. */
export function FieldCard({
  label,
  value,
  on = "dark",
  tone = "dark",
  width = 260,
  zoom = 2,
  focus,
  stepper,
  select,
}: {
  label: string
  value: ReactNode
  on?: GroundKind
  tone?: Tone
  width?: number
  zoom?: number
  focus?: boolean
  stepper?: boolean
  select?: boolean
}) {
  return (
    <Panel tone={tone} on={on} zoom={zoom} pad={14} style={{ width }}>
      <div className="mb-2 text-xs font-medium text-muted-foreground">
        {label}
      </div>
      <FakeInput
        focus={focus}
        adornment={stepper ? "stepper" : select ? "select" : undefined}
      >
        {value}
      </FakeInput>
    </Panel>
  )
}

/** 2A · Los campos de reglas flotan en tres capas; la cámara respira. */
export function ShotFields() {
  const frame = useCurrentFrame()
  const push = interpolate(frame, [0, 120], [1, 1.08])
  return (
    <LaunchStage>
      <GroundWipe
        from="mag"
        to="dark"
        p={progress(frame, 0, 10, easeInOut)}
        dir="right"
      />
      <Camera
        scale={push}
        x={interpolate(frame, [0, 120], [60, -60])}
        y={interpolate(frame, [0, 120], [20, -20])}
      >
        <Float x={110} y={90} depth={2} rot={-5} at={6}>
          <FieldCard label="Vigencia de cada oferta (horas)" value="48" />
        </Float>
        <Float x={1360} y={110} depth={2} rot={6} at={10}>
          <FieldCard label="Intereses en cuotas (%)" value="100" />
        </Float>
        <Float x={1300} y={790} depth={2} rot={-4} at={14}>
          <FieldCard
            label="Derivar a una persona desde ($)"
            value="800.000"
            width={290}
          />
        </Float>
        <Float x={230} y={700} depth={1} rot={4} at={18}>
          <FieldCard label="Anticipo mínimo (%)" value="20" />
        </Float>
        <Float x={100} y={400} depth={1} rot={-3} at={22}>
          <FieldCard
            label="Días máximos hasta la primera cuota"
            value="10"
            width={290}
          />
        </Float>
        <Float x={720} y={330} depth={0} rot={-2} at={28} focusAt={40}>
          <FieldCard
            label="Cantidad máxima de cuotas"
            value="3"
            stepper
            focus
            zoom={2.6}
            width={290}
          />
        </Float>
        <Float x={760} y={720} depth={0} rot={3} at={34}>
          <Panel tone="mag" zoom={2} pad={10} radius={12}>
            <span className="text-sm font-medium">Reglas del agente</span>
          </Panel>
        </Float>
      </Camera>
      <div style={{ position: "absolute", left: 110, top: 960 }}>
        <Kicker at={20}>Reglas del agente</Kicker>
      </div>
    </LaunchStage>
  )
}

const STEPS = [
  { f: 0, v: "3" },
  { f: 34, v: "4" },
  { f: 52, v: "5" },
  { f: 70, v: "6" },
]

/** 2B · Sobre magenta: el cursor sube las cuotas y el margen se recalcula. */
export function ShotStepper() {
  const frame = useCurrentFrame()
  const n = STEPS.reduce((acc, s) => (frame >= s.f ? Number(s.v) : acc), 3)
  const barTo = interpolate(
    frame,
    [34, 41, 52, 59, 70, 77],
    [3, 4, 4, 5, 5, 6],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  )
  const zoom = 1 + progress(frame, 22, 24, easeInOut) * 0.05
  const clicks = [34, 52, 70]

  return (
    <LaunchStage>
      <GroundWipe
        from="dark"
        to="mag"
        p={progress(frame, 0, 10, easeInOut)}
        dir="right"
      />
      <Camera scale={zoom} ox={1030} oy={520}>
        <Float x={150} y={330} depth={0} rot={-2} at={4} bob={0.3}>
          <Panel on="mag" zoom={3.2} pad={16} style={{ width: 300 }}>
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              Cantidad máxima de cuotas
            </div>
            <FakeInput focus adornment="stepper" className="h-10 text-lg">
              <Roll steps={STEPS} />
            </FakeInput>
          </Panel>
        </Float>
        {clicks.map((c) => {
          const p = progress(frame, c, 24)
          if (frame < c || p >= 1) return null
          return (
            <div
              key={c}
              style={{
                position: "absolute",
                left: 1050,
                top: 440 - p * 120,
                fontSize: 56,
                fontWeight: 600,
                color: "#FFFFFF",
                opacity: 1 - p,
              }}
            >
              +1
            </div>
          )
        })}
        <Float x={1210} y={230} depth={0} rot={3} at={12}>
          <Panel
            tone="light"
            on="mag"
            zoom={2.4}
            pad={16}
            style={{ width: 250 }}
          >
            <div className="mb-3 text-sm font-semibold">
              Margen de negociación
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <MarginRow
                label="Plan más largo"
                value={`${n} cuotas`}
                pct={(barTo / 6) * 100}
                accent
              />
              <MarginRow label="Cuota mínima" value="$ 25.000" pct={42} />
              <MarginRow label="Anticipo" value="20 %" pct={20} />
            </div>
          </Panel>
        </Float>
      </Camera>
      <Cursor
        path={[
          [14, 1500, 980],
          [30, 1036, 520],
          [80, 1036, 520],
          [110, 1180, 700],
        ]}
        clicks={clicks}
      />
      <div style={{ position: "absolute", left: 150, top: 800 }}>
        <Kicker at={84} color="rgba(252,240,244,.75)">
          Reglas
        </Kicker>
        <Headline
          text="Vos definís las reglas."
          at={88}
          size={110}
          style={{ marginTop: 12 }}
        />
      </div>
    </LaunchStage>
  )
}

function MarginRow({
  label,
  value,
  pct,
  accent,
}: {
  label: string
  value: string
  pct: number
  accent?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full",
            accent ? "bg-primary" : "bg-muted-foreground/40"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

const TONES = ["Empático y formal", "Empático y cercano", "Neutral"]
const NOTE =
  "Recordá que la administración atiende de lunes a viernes de 9 a 17."

/** 2C · Fondo claro: tono, indicaciones, validación y guardar. */
export function ShotTone() {
  const frame = useCurrentFrame()
  const hi = frame < 16 ? 2 : frame < 26 ? 1 : 0
  const text = typed(NOTE, frame, 26, 48)
  const sweep = progress(frame, 100, 14)
  const exit = progress(frame, 124, 26, easeInOut)
  const bx = 1652
  const by = 806

  return (
    <LaunchStage>
      <GroundWipe
        from="mag"
        to="light"
        p={progress(frame, 0, 10, easeInOut)}
        dir="up"
      />

      <Float x={150} y={160} depth={0} rot={-4} at={4}>
        <Panel
          tone="dark"
          on="light"
          zoom={2.2}
          pad={10}
          style={{ width: 250 }}
        >
          <div className="mb-2 px-1 text-xs font-medium text-muted-foreground">
            Tono
          </div>
          <FakeInput adornment="select" focus>
            {TONES[hi]}
          </FakeInput>
          <div className="mt-2 flex flex-col gap-0.5 rounded-lg bg-background/60 p-1 text-sm">
            {TONES.map((t, i) => (
              <div
                key={t}
                className={cn(
                  "flex items-center justify-between rounded-md px-2 py-1.5",
                  i === hi ? "bg-muted" : "text-muted-foreground"
                )}
              >
                {t}
                {i === 0 && frame >= 26 && <span className="text-xs">✓</span>}
              </div>
            ))}
          </div>
        </Panel>
      </Float>

      <Float x={980} y={140} depth={0} rot={2} at={12}>
        <Panel
          tone="light"
          on="light"
          zoom={2.2}
          pad={14}
          style={{ width: 360 }}
        >
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Indicaciones adicionales
          </div>
          <div className="min-h-16 rounded-lg border border-ring px-2.5 py-2 text-sm leading-relaxed ring-3 ring-ring/40">
            {text}
            <span
              className="ml-px inline-block h-4 w-px bg-foreground align-middle"
              style={{ opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0 }}
            />
          </div>
        </Panel>
      </Float>

      <Float x={1060} y={600} depth={0} rot={-5} at={84} pop>
        <Panel tone="light" on="light" zoom={2.4} pad={5} radius={999}>
          <Badge variant="outline" className="border-primary text-primary">
            ✓ Indicación válida
          </Badge>
        </Panel>
      </Float>

      <Float x={1480} y={760} depth={0} rot={3} at={66}>
        <div
          style={{
            zoom: 2.6,
            position: "relative",
            overflow: "hidden",
            borderRadius: 10,
            boxShadow: "0 30px 60px -14px rgba(195,25,82,.55)",
          }}
        >
          <Button
            style={{
              transform: `scale(${1 - (progress(frame, 101, 3) - progress(frame, 104, 6)) * 0.05})`,
            }}
          >
            Guardar reglas
          </Button>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(100deg, transparent 30%, rgba(255,255,255,.55) 50%, transparent 70%)",
              transform: `translateX(${(sweep * 2 - 1) * 120}%)`,
              opacity: sweep > 0 && sweep < 1 ? 1 : 0,
            }}
          />
        </div>
      </Float>

      <Float x={700} y={56} depth={0} at={110} from={[0, -140]}>
        <Panel tone="dark" on="light" zoom={2} pad={10} radius={12}>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[0.7rem] text-primary-foreground">
              ✓
            </span>
            Reglas guardadas. El agente ya las usa.
          </div>
        </Panel>
      </Float>

      <Cursor
        path={[
          [60, 1760, 1060],
          [96, bx, by],
          [150, bx, by],
        ]}
        clicks={[102]}
        ring={C.primary}
      />

      <div style={{ position: "absolute", left: 150, top: 820, width: 860 }}>
        <Headline
          text="El agente negocia dentro de ellas."
          at={34}
          size={92}
          color="#1A1A1A"
        />
      </div>

      {exit > 0 && (
        <>
          <Iris p={exit} cx={bx} cy={by} size0={40} shape="circle">
            <Ground kind="dark" />
          </Iris>
          <RingEdge p={exit} cx={bx} cy={by} />
        </>
      )}
    </LaunchStage>
  )
}

function RingEdge({ p, cx, cy }: { p: number; cx: number; cy: number }) {
  const far = Math.hypot(Math.max(cx, 1920 - cx), Math.max(cy, 1080 - cy)) + 40
  const r = interpolate(p, [0, 1], [20, far])
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: cx - r,
          top: cy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          border: `14px solid ${C.primary}`,
          opacity: 1 - p * 0.6,
        }}
      />
    </AbsoluteFill>
  )
}
