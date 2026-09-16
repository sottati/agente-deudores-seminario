import { useEffect, useRef, useState } from "react"
import {
  BotIcon,
  CheckmarkCircle02Icon,
  SentIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { BrandIsotipo } from "@/components/brand-logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useResolvedDark } from "@/hooks/use-resolved-dark"
import { cn } from "@/lib/utils"

const steps = [
  {
    n: "01",
    title: "Cargás la deuda y los límites",
    panel: "setup" as const,
  },
  {
    n: "02",
    title: "El agente habla con cada deudor",
    panel: "conversation" as const,
  },
  {
    n: "03",
    title: "El acuerdo queda registrado",
    panel: "records" as const,
  },
] as const

const DETAIL_HEIGHT = "h-72 sm:h-80 lg:h-[22rem]"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value)
}

function parseCurrencyInput(value: string) {
  const digits = value.replace(/[^\d]/g, "")
  return digits ? Number.parseInt(digits, 10) : 0
}

function InteractiveSlider({
  id,
  label,
  display,
  min,
  max,
  step = 1,
  value,
  onChange,
}: {
  id: string
  label: string
  display: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
}) {
  const percent = ((value - min) / (max - min)) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <label htmlFor={id} className="text-muted-foreground">
          {label}
        </label>
        <span className="font-medium tabular-nums">{display}</span>
      </div>
      <div className="relative flex h-5 items-center">
        <div className="pointer-events-none absolute inset-x-0 h-1.5 rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            style={{ width: `${percent}%` }}
          />
          <div
            className="absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow-sm"
            style={{ left: `calc(${percent}% - 7px)` }}
          />
        </div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="relative z-10 w-full cursor-pointer opacity-0"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>
    </div>
  )
}

function SetupPanel() {
  const [debtBalance, setDebtBalance] = useState(186_400)
  const [debtInput, setDebtInput] = useState(formatCurrency(186_400))
  const [maxInstallments, setMaxInstallments] = useState(3)
  const [interestWaiver, setInterestWaiver] = useState(15)
  const [isActive, setIsActive] = useState(true)

  function handleDebtBlur() {
    const parsed = parseCurrencyInput(debtInput)
    const next = parsed > 0 ? parsed : debtBalance
    setDebtBalance(next)
    setDebtInput(formatCurrency(next))
  }

  return (
    <Card size="sm" className="flex h-full flex-col overflow-hidden">
      <CardHeader className="shrink-0 border-b pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm">Reglas del agente</CardTitle>
            <CardDescription className="text-xs">
              Unidad 4B · Av. Rivadavia 2840
            </CardDescription>
          </div>
          <Badge variant={isActive ? "secondary" : "outline"} className="shrink-0">
            {isActive ? "Política activa" : "Sin activar"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden pt-4">
        <div className="space-y-1.5">
          <label
            htmlFor="setup-debt-balance"
            className="text-xs font-medium text-muted-foreground"
          >
            Saldo adeudado
          </label>
          <Input
            id="setup-debt-balance"
            value={debtInput}
            onChange={(event) => setDebtInput(event.target.value)}
            onBlur={handleDebtBlur}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur()
              }
            }}
            className="h-8 text-sm font-medium tabular-nums"
          />
        </div>

        <InteractiveSlider
          id="setup-max-installments"
          label="Máximo de cuotas"
          display={`${maxInstallments} ${maxInstallments === 1 ? "cuota" : "cuotas"}`}
          min={1}
          max={6}
          value={maxInstallments}
          onChange={setMaxInstallments}
        />
        <InteractiveSlider
          id="setup-interest-waiver"
          label="Quita de intereses"
          display={`${interestWaiver} %`}
          min={0}
          max={30}
          value={interestWaiver}
          onChange={setInterestWaiver}
        />

        <div className="mt-auto space-y-2 rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium">Resumen de límites</p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[0.65rem]">
              Hasta {maxInstallments}{" "}
              {maxInstallments === 1 ? "cuota" : "cuotas"}
            </Badge>
            <Badge variant="outline" className="text-[0.65rem]">
              {interestWaiver} % de quita
            </Badge>
            <Badge variant="outline" className="text-[0.65rem]">
              Saldo {formatCurrency(debtBalance)}
            </Badge>
          </div>
        </div>

        <Button
          size="sm"
          className="w-full shrink-0"
          variant={isActive ? "secondary" : "default"}
          onClick={() => setIsActive((current) => !current)}
        >
          {isActive ? "Pausar agente" : "Activar agente"}
        </Button>
      </CardContent>
    </Card>
  )
}

type ChatMessage = {
  id: string
  from: "agent" | "debtor"
  text: string
  time: string
}

const initialMessages: ChatMessage[] = [
  {
    id: "1",
    from: "agent",
    text:
      "Hola, soy el agente de Pacta para Consorcios del Sur. Tenés un saldo de $ 186.400 por expensas vencidas.",
    time: "10:14",
  },
  {
    id: "2",
    from: "debtor",
    text: "Sí, pero no puedo pagar todo junto este mes.",
    time: "10:18",
  },
]

const quickReplies = [
  "¿Cuánto sería por mes?",
  "Acepto el plan en cuotas",
  "Necesito más tiempo",
]

const agentReplies: Record<string, string> = {
  "¿Cuánto sería por mes?":
    "Con hasta 3 cuotas y 15 % de quita, serían $ 62.133 por mes.",
  "Acepto el plan en cuotas":
    "Perfecto. Te confirmo el acuerdo en 3 cuotas y lo registro en el sistema.",
  "Necesito más tiempo":
    "Puedo ofrecerte hasta 3 cuotas dentro de la política del consorcio. ¿Te sirve?",
}

function currentTime() {
  const now = new Date()
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isAgent = message.from === "agent"

  return (
    <div
      className={cn("flex gap-2", isAgent ? "justify-start" : "justify-end")}
    >
      {isAgent && (
        <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
          <HugeiconsIcon icon={BotIcon} className="size-3.5" strokeWidth={2} />
        </div>
      )}
      <div
        className={cn(
          "max-w-[82%] space-y-1",
          isAgent ? "items-start" : "items-end"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-xs leading-relaxed",
            isAgent
              ? "rounded-tl-sm bg-muted text-foreground"
              : "rounded-tr-sm bg-primary text-primary-foreground"
          )}
        >
          {message.text}
        </div>
        <p
          className={cn(
            "px-1 text-[0.65rem] text-muted-foreground",
            isAgent ? "text-left" : "text-right"
          )}
        >
          {message.time}
        </p>
      </div>
    </div>
  )
}

function ConversationPanel() {
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, isTyping])

  function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

    const debtorMessage: ChatMessage = {
      id: `debtor-${Date.now()}`,
      from: "debtor",
      text: trimmed,
      time: currentTime(),
    }

    setMessages((current) => [...current, debtorMessage])
    setDraft("")
    setIsTyping(true)

    window.setTimeout(() => {
      const reply =
        agentReplies[trimmed] ??
        "Entiendo. Puedo ofrecerte un plan en hasta 3 cuotas con quita de intereses. ¿Querés que te detalle el monto mensual?"

      setMessages((current) => [
        ...current,
        {
          id: `agent-${Date.now()}`,
          from: "agent",
          text: reply,
          time: currentTime(),
        },
      ])
      setIsTyping(false)
    }, 900)
  }

  return (
    <Card size="sm" className="flex h-full flex-col overflow-hidden">
      <CardHeader className="shrink-0 border-b pb-3">
        <div className="flex items-center gap-2.5">
          <BrandIsotipo className="size-7" />
          <div className="min-w-0">
            <CardTitle className="text-sm">Unidad 4B</CardTitle>
            <CardDescription className="text-xs">
              {isTyping ? "Agente escribiendo…" : "Agente negociando · en curso"}
            </CardDescription>
          </div>
          <span
            className={cn(
              "ml-auto size-2 shrink-0 rounded-full",
              isTyping ? "animate-pulse bg-amber-500" : "bg-emerald-500"
            )}
          />
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden pt-3">
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1"
        >
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {isTyping && (
            <div className="flex gap-2">
              <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                <HugeiconsIcon icon={BotIcon} className="size-3.5" strokeWidth={2} />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2">
                <span className="inline-flex gap-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-2 border-t pt-3">
          <div className="flex flex-wrap gap-1.5">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => sendMessage(reply)}
                disabled={isTyping}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-[0.65rem] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                {reply}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage(draft)
            }}
          >
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Escribí un mensaje…"
              className="h-8 min-w-0 flex-1 text-xs"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="icon-sm"
              disabled={!draft.trim() || isTyping}
              aria-label="Enviar mensaje"
            >
              <HugeiconsIcon icon={SentIcon} strokeWidth={2} />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

const agreementRecords = [
  {
    id: "4b",
    debtor: "Unidad 4B",
    building: "Av. Rivadavia 2840",
    amount: 186_400,
    plan: "3 cuotas",
    status: "Acordado" as const,
  },
  {
    id: "7a",
    debtor: "Unidad 7A",
    building: "Sarmiento 912",
    amount: 94_250,
    plan: "Pago único",
    status: "Pendiente" as const,
  },
  {
    id: "2c",
    debtor: "Unidad 2C",
    building: "México 1456",
    amount: 231_800,
    plan: "2 cuotas",
    status: "Acordado" as const,
  },
  {
    id: "1d",
    debtor: "Unidad 1D",
    building: "Corrientes 520",
    amount: 67_900,
    plan: "3 cuotas",
    status: "Acordado" as const,
  },
]

type RecordFilter = "all" | "Acordado" | "Pendiente"

function RecordsPanel() {
  const [filter, setFilter] = useState<RecordFilter>("all")
  const [selectedId, setSelectedId] = useState<string | null>("4b")
  const [records, setRecords] = useState(agreementRecords)

  const filteredRecords =
    filter === "all"
      ? records
      : records.filter((record) => record.status === filter)

  const closedCount = records.filter((record) => record.status === "Acordado").length

  function toggleStatus(id: string) {
    setRecords((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              status: record.status === "Acordado" ? "Pendiente" : "Acordado",
            }
          : record
      )
    )
  }

  return (
    <Card size="sm" className="flex h-full flex-col overflow-hidden">
      <CardHeader className="shrink-0 border-b pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm">Acuerdos registrados</CardTitle>
            <CardDescription className="text-xs">
              Resultado de las conversaciones del agente.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} />
            {closedCount} cerrados
          </Badge>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(["all", "Acordado", "Pendiente"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[0.65rem] transition-colors",
                filter === option
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {option === "all" ? "Todos" : option}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-hidden px-0 pt-0">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-x-3 border-b px-4 py-2 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
          <span>Deudor</span>
          <span className="text-right">Monto</span>
          <span>Estado</span>
        </div>
        <div className="divide-y overflow-y-auto">
          {filteredRecords.map((record) => {
            const isSelected = selectedId === record.id

            return (
              <div
                key={record.id}
                className={cn(
                  "grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 px-4 py-2.5 transition-colors",
                  isSelected && "bg-muted/60"
                )}
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(record.id)}
                  className="min-w-0 text-left"
                >
                  <p className="truncate text-xs font-medium">{record.debtor}</p>
                  <p className="truncate text-[0.65rem] text-muted-foreground">
                    {record.building}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedId(record.id)}
                  className="text-right"
                >
                  <p className="text-xs font-medium tabular-nums">
                    {formatCurrency(record.amount)}
                  </p>
                  <p className="text-[0.65rem] text-muted-foreground">
                    {record.plan}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => toggleStatus(record.id)}
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Cambiar estado de ${record.debtor}`}
                >
                  <Badge
                    variant={
                      record.status === "Acordado" ? "secondary" : "outline"
                    }
                    className="cursor-pointer text-[0.65rem]"
                  >
                    {record.status}
                  </Badge>
                </button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

const panels = {
  setup: SetupPanel,
  conversation: ConversationPanel,
  records: RecordsPanel,
} as const

export function HowItWorks() {
  const isDark = useResolvedDark()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = steps[selectedIndex]
  const Panel = panels[selected.panel]

  return (
    <section
      id="como-funciona"
      aria-labelledby="como-funciona-heading"
      className="mt-56 w-full max-w-6xl scroll-mt-28 sm:mt-72 lg:mt-96"
    >
      <h1
        id="como-funciona-heading"
        className={cn(
          "text-center text-4xl leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-5xl",
          isDark
            ? "text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.75)]"
            : "text-foreground drop-shadow-[0_1px_14px_rgba(255,255,255,0.9)]"
        )}
      >
        Cómo funciona
      </h1>

      <div className="mt-16 grid gap-8 sm:mt-24 lg:grid-cols-[minmax(0,18rem)_1fr] lg:items-center lg:gap-10 xl:grid-cols-[minmax(0,20rem)_1fr] xl:gap-12">
        <div
          role="tablist"
          aria-label="Pasos de Cómo funciona"
          className="flex flex-col justify-center gap-3"
        >
          {steps.map((step, index) => {
            const isSelected = index === selectedIndex

            return (
              <button
                key={step.n}
                type="button"
                role="tab"
                id={`como-funciona-tab-${step.n}`}
                aria-selected={isSelected}
                aria-controls={`como-funciona-panel-${step.n}`}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "w-full rounded-xl border px-4 py-4 text-left transition-[background-color,border-color,box-shadow] duration-200",
                  isDark
                    ? isSelected
                      ? "border-white/25 bg-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                    : isSelected
                      ? "border-foreground/20 bg-background/85 shadow-lg shadow-foreground/8"
                      : "border-border/70 bg-background/60 hover:border-foreground/15 hover:bg-background/80"
                )}
              >
                <span
                  className={cn(
                    "block text-2xl leading-none font-semibold tracking-[-0.06em] tabular-nums",
                    isDark
                      ? isSelected
                        ? "text-white"
                        : "text-white/45"
                      : isSelected
                        ? "text-foreground"
                        : "text-foreground/35"
                  )}
                >
                  {step.n}
                </span>
                <span
                  className={cn(
                    "mt-2 block text-base leading-snug font-medium tracking-[-0.02em] text-pretty",
                    isDark
                      ? isSelected
                        ? "text-white"
                        : "text-white/70"
                      : isSelected
                        ? "text-foreground"
                        : "text-foreground/65"
                  )}
                >
                  {step.title}
                </span>
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id={`como-funciona-panel-${selected.n}`}
          aria-labelledby={`como-funciona-tab-${selected.n}`}
          className={cn("w-full", DETAIL_HEIGHT)}
        >
          <Panel />
        </div>
      </div>
    </section>
  )
}
