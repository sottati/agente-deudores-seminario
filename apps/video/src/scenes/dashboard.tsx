import {
  ArrowUpRight01Icon,
  CheckmarkCircle02Icon,
  Clock03Icon,
  MessageMultiple02Icon,
  MoneyReceiveCircleIcon,
  Notification02Icon,
  PlusSignIcon,
  SidebarLeftIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { easeInOut, pop, progress, rise } from "../lib/anim"
import { AppSidebar } from "../ui/product"
import { Backdrop, Glow, Stage, Zoom } from "../ui/stage"

const trend = [
  { month: "Abr", amount: 4.2 },
  { month: "May", amount: 5.1 },
  { month: "Jun", amount: 5.8 },
  { month: "Jul", amount: 6.5 },
  { month: "Ago", amount: 7.4 },
  { month: "Sep", amount: 8.4 },
]

const plans = [
  { label: "Pago único", count: 14, color: "var(--chart-1)" },
  { label: "2 cuotas", count: 18, color: "var(--chart-3)" },
  { label: "3 cuotas", count: 10, color: "var(--primary)" },
]

const recent = [
  {
    debtor: "Unidad 4B",
    building: "Av. Rivadavia 2840",
    amount: "$ 181.000",
    plan: "3 cuotas",
    status: "Acordado",
  },
  {
    debtor: "Unidad 7A",
    building: "Sarmiento 912",
    amount: "$ 94.250",
    plan: "Pago único",
    status: "Pendiente",
  },
  {
    debtor: "Unidad 2C",
    building: "México 1456",
    amount: "$ 231.800",
    plan: "2 cuotas",
    status: "Acordado",
  },
]

export function DashboardScene() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const tilt = pop(frame, fps, 0, 22)
  const push = progress(frame, 120, 160, easeInOut)
  const count = progress(frame, 30, 50, easeInOut)

  const metrics = [
    {
      label: "Monto recuperado",
      value: `$ ${(8.4 * count).toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M`,
      detail: "+12,5% vs. agosto",
      icon: MoneyReceiveCircleIcon,
    },
    {
      label: "Acuerdos cerrados",
      value: `${Math.round(42 * count)}`,
      detail: "9 esta semana",
      icon: CheckmarkCircle02Icon,
    },
    {
      label: "Conversaciones activas",
      value: `${Math.round(18 * count)}`,
      detail: "6 esperan respuesta",
      icon: MessageMultiple02Icon,
    },
  ]

  return (
    <Stage>
      <Backdrop intensity={0.6} />
      <AbsoluteFill className="items-center">
        <div
          className="mt-[58px] flex flex-col items-center text-center"
          style={rise(frame, 4)}
        >
          <p className="text-[22px] font-medium tracking-[0.18em] text-white/60 uppercase">
            Dashboard
          </p>
          <h2 className="mt-3 text-[58px] leading-none font-semibold tracking-[-0.045em] text-white">
            Todo el recupero, en un solo lugar.
          </h2>
        </div>

        <div
          className="relative mt-12"
          style={{
            transformOrigin: "50% 0%",
            transform: `perspective(2200px) rotateX(${(1 - tilt) * 28}deg) translateY(${(1 - tilt) * 160}px) scale(${0.9 + tilt * 0.1 + push * 0.05})`,
            opacity: Math.min(1, tilt * 1.5),
          }}
        >
          <Glow opacity={0.45} />
          <Zoom factor={1.22}>
            <div className="flex h-[640px] w-[1340px] overflow-hidden rounded-2xl bg-background shadow-2xl ring-1 ring-foreground/10">
              <AppSidebar />
              <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
                <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
                  <Button variant="ghost" size="icon-sm">
                    <HugeiconsIcon icon={SidebarLeftIcon} strokeWidth={2} />
                  </Button>
                  <div className="h-4 w-px bg-border" />
                  <p className="text-sm font-medium">Dashboard</p>
                  <Button className="ml-auto" variant="ghost" size="icon-sm">
                    <HugeiconsIcon icon={Notification02Icon} strokeWidth={2} />
                  </Button>
                  <Button>
                    <HugeiconsIcon
                      icon={PlusSignIcon}
                      data-icon="inline-start"
                    />
                    Nueva negociación
                  </Button>
                </header>

                <div className="grid grid-cols-3 gap-3 p-4">
                  {metrics.map((metric, i) => (
                    <Card
                      key={metric.label}
                      size="sm"
                      style={rise(frame, 18 + i * 6, 16, 18)}
                    >
                      <CardHeader>
                        <CardDescription>{metric.label}</CardDescription>
                        <CardAction className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <HugeiconsIcon icon={metric.icon} strokeWidth={2} />
                        </CardAction>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl font-semibold tracking-tight tabular-nums">
                          {metric.value}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {metric.detail}
                        </p>
                      </CardContent>
                    </Card>
                  ))}

                  <Card
                    size="sm"
                    className="col-span-2"
                    style={rise(frame, 34, 16, 18)}
                  >
                    <CardHeader>
                      <CardTitle>Evolución del recupero</CardTitle>
                      <CardDescription>
                        Monto recuperado por mes en los últimos 6 meses.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TrendChart p={progress(frame, 48, 70, easeInOut)} />
                    </CardContent>
                  </Card>

                  <Card size="sm" style={rise(frame, 40, 16, 18)}>
                    <CardHeader>
                      <CardTitle>Acuerdos por plan</CardTitle>
                      <CardDescription>
                        Distribución de los 42 acuerdos cerrados este mes.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Donut p={progress(frame, 56, 60, easeInOut)} />
                    </CardContent>
                  </Card>

                  <Card
                    size="sm"
                    className="col-span-2"
                    style={rise(frame, 60, 16, 18)}
                  >
                    <CardHeader className="border-b">
                      <CardTitle>Acuerdos recientes</CardTitle>
                      <CardDescription>
                        Últimas negociaciones registradas por el agente.
                      </CardDescription>
                      <CardAction>
                        <Button variant="ghost" size="sm">
                          Ver todos
                          <HugeiconsIcon
                            icon={ArrowUpRight01Icon}
                            data-icon="inline-end"
                          />
                        </Button>
                      </CardAction>
                    </CardHeader>
                    <CardContent className="px-0">
                      <div className="divide-y">
                        {recent.map((row, i) => (
                          <div
                            key={row.debtor}
                            className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 px-3 py-2"
                            style={rise(frame, 72 + i * 7, 12, 14)}
                          >
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {row.debtor}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {row.building}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium tabular-nums">
                                {row.amount}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {row.plan}
                              </p>
                            </div>
                            <Badge
                              variant={
                                row.status === "Acordado"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {row.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card size="sm" style={rise(frame, 66, 16, 18)}>
                    <CardHeader>
                      <CardTitle>Requieren atención</CardTitle>
                      <CardDescription>
                        Conversaciones que necesitan una decisión.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Attention
                        icon={Clock03Icon}
                        title="6 respuestas pendientes"
                        detail="La más antigua espera hace 18 horas."
                      />
                      <Attention
                        icon={MessageMultiple02Icon}
                        title="2 casos fuera de política"
                        detail="Pidieron más de 3 cuotas."
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </Zoom>
        </div>
      </AbsoluteFill>
    </Stage>
  )
}

function Attention({
  icon,
  title,
  detail,
}: {
  icon: typeof Clock03Icon
  title: string
  detail: string
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-muted/60 p-2">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-primary ring-1 ring-border">
        <HugeiconsIcon icon={icon} className="size-3.5" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium">{title}</p>
        <p className="text-[0.65rem] text-muted-foreground">{detail}</p>
      </div>
    </div>
  )
}

const CW = 700
const CH = 128
const PAD_L = 34
const PAD_B = 20
const MAX = 9

function TrendChart({ p }: { p: number }) {
  const innerW = CW - PAD_L - 8
  const innerH = CH - PAD_B - 6
  const pts = trend.map((d, i) => ({
    x: PAD_L + (i / (trend.length - 1)) * innerW,
    y: 6 + innerH - (d.amount / MAX) * innerH,
  }))
  const line = smoothPath(pts)
  const area = `${line} L ${pts[pts.length - 1].x} ${6 + innerH} L ${pts[0].x} ${6 + innerH} Z`
  const revealX = PAD_L + p * innerW
  const head = pointAt(pts, p)

  return (
    <svg
      width={CW}
      height={CH}
      className="overflow-visible text-muted-foreground"
    >
      <defs>
        <clipPath id="reveal">
          <rect x={0} y={0} width={revealX} height={CH} />
        </clipPath>
        <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.45} />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {[0, 3, 6, 9].map((t) => {
        const y = 6 + innerH - (t / MAX) * innerH
        return (
          <g key={t}>
            <line
              x1={PAD_L}
              x2={CW - 8}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.15}
            />
            <text
              x={PAD_L - 8}
              y={y + 3}
              textAnchor="end"
              fontSize={9}
              fill="currentColor"
            >
              {t}M
            </text>
          </g>
        )
      })}
      {trend.map((d, i) => (
        <text
          key={d.month}
          x={pts[i].x}
          y={CH - 4}
          textAnchor="middle"
          fontSize={9}
          fill="currentColor"
        >
          {d.month}
        </text>
      ))}
      <g clipPath="url(#reveal)">
        <path d={area} fill="url(#fill)" />
        <path
          d={line}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      </g>
      {p > 0.01 && (
        <g>
          <circle
            cx={head.x}
            cy={head.y}
            r={7}
            fill="var(--primary)"
            opacity={0.25}
          />
          <circle
            cx={head.x}
            cy={head.y}
            r={3.5}
            fill="#FCF0F4"
            stroke="var(--primary)"
            strokeWidth={2}
          />
        </g>
      )}
    </svg>
  )
}

function Donut({ p }: { p: number }) {
  const total = plans.reduce((s, x) => s + x.count, 0)
  const r = 40
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="flex items-center gap-4">
      <svg
        width={110}
        height={110}
        viewBox="0 0 110 110"
        style={{ transform: "rotate(-90deg)" }}
      >
        {plans.map((plan) => {
          const len = (plan.count / total) * c
          const visible = Math.max(0, Math.min(len, p * c - offset))
          const el = (
            <circle
              key={plan.label}
              cx={55}
              cy={55}
              r={r}
              fill="none"
              stroke={plan.color}
              strokeWidth={18}
              strokeDasharray={`${Math.max(0, visible - 2)} ${c}`}
              strokeDashoffset={-offset}
            />
          )
          offset += len
          return el
        })}
      </svg>
      <div className="grid gap-1.5 text-xs">
        {plans.map((plan) => (
          <div key={plan.label} className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-[3px]"
              style={{ backgroundColor: plan.color }}
            />
            <span className="text-muted-foreground">{plan.label}</span>
            <span className="ml-auto pl-2 font-medium tabular-nums">
              {Math.round(plan.count * interpolate(p, [0, 1], [0, 1]))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

type Pt = { x: number; y: number }

/** Curva suave (Catmull-Rom → Bézier) por los puntos. */
function smoothPath(pts: Pt[]) {
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`
  }
  return d
}

function pointAt(pts: Pt[], p: number): Pt {
  const f = p * (pts.length - 1)
  const i = Math.min(pts.length - 2, Math.floor(f))
  const t = f - i
  return {
    x: pts[i].x + (pts[i + 1].x - pts[i].x) * t,
    y: pts[i].y + (pts[i + 1].y - pts[i].y) * t,
  }
}
