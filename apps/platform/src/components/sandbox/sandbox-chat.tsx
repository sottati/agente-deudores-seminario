import { useRef, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  ArrowUp02Icon,
  Download04Icon,
  Edit02Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { ButtonLink } from "@/components/button-link"
import { ChatText } from "@/components/chat-text"
import { OfferCard } from "@/components/debtor-chat"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  Message,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Textarea } from "@/components/ui/textarea"
import { formatARS } from "@/lib/format"
import type { SandboxSession, SandboxTurn } from "@/lib/sandbox"
import { postSandbox } from "@/lib/sandbox-client"

const suggestions = [
  "¿Cuánto debo y qué opciones de pago tengo?",
  "Solo puedo pagar en 12 cuotas.",
  "Si pago todo hoy, ¿me quitan los intereses?",
  "Quiero hablar con una persona.",
]

const statusMeta: Record<
  SandboxSession["status"],
  { label: string; variant: "secondary" | "default" | "destructive" }
> = {
  active: { label: "En negociación", variant: "secondary" },
  agreed: { label: "Acuerdo simulado", variant: "default" },
  escalated: { label: "Derivada a una persona", variant: "destructive" },
}

export function SandboxChat({
  initialSession,
}: {
  initialSession: SandboxSession
}) {
  const navigate = useNavigate()
  const [session, setSession] = useState(initialSession)
  const [input, setInput] = useState("")
  const [pending, setPending] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const composer = useRef<HTMLTextAreaElement>(null)

  const active = session.status === "active"
  const { debt } = session.config

  async function run(action: () => Promise<SandboxSession>) {
    setBusy(true)
    setError(null)
    try {
      setSession(await action())
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar.")
      return false
    } finally {
      setBusy(false)
    }
  }

  async function send(text: string) {
    const message = text.trim()
    if (!message || busy || !active) return
    setPending(message)
    setInput("")
    const ok = await run(() =>
      postSandbox({ action: "message", sessionId: session.id, text: message })
    )
    if (!ok) setInput(message)
    setPending(null)
    // El textarea sigue deshabilitado hasta el próximo render.
    requestAnimationFrame(() => composer.current?.focus())
  }

  async function restart() {
    setBusy(true)
    setError(null)
    try {
      const next = await postSandbox({
        action: "start",
        config: session.config,
      })
      await navigate({
        to: "/sandbox/$sessionId",
        params: { sessionId: next.id },
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo reiniciar.")
    } finally {
      setBusy(false)
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(session, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `pacta-sandbox-${session.id}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <PageHeader title={`Simulación · ${debt.debtorAlias}`}>
        <Badge
          variant={statusMeta[session.status].variant}
          className="hidden sm:inline-flex"
        >
          {statusMeta[session.status].label}
        </Badge>
        <ButtonLink to="/sandbox" variant="outline" size="sm">
          <HugeiconsIcon icon={Edit02Icon} data-icon="inline-start" />
          <span className="hidden md:inline">Configuración</span>
        </ButtonLink>
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => void restart()}
        >
          <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
          <span className="hidden md:inline">Reiniciar</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={exportJson}
          aria-label="Exportar conversación en JSON"
        >
          <HugeiconsIcon icon={Download04Icon} data-icon="inline-start" />
          <span className="hidden md:inline">JSON</span>
        </Button>
      </PageHeader>

      {/* lg:flex-none: con flex-1 el alto lo define el contenido (el padre no
          tiene alto fijo) y el espaciador del scroller crece sin límite. */}
      <div className="grid min-h-0 flex-1 lg:h-[calc(100svh-3.5rem)] lg:flex-none lg:grid-cols-[minmax(0,1fr)_360px] lg:grid-rows-[minmax(0,1fr)]">
        <section
          aria-label="Conversación simulada"
          className="flex h-[calc(100svh-3.5rem)] min-h-0 flex-col lg:h-auto"
        >
          <MessageScrollerProvider autoScroll defaultScrollPosition="end">
            <MessageScroller className="min-h-0 flex-1">
              <MessageScrollerViewport aria-label="Mensajes de la simulación">
                <MessageScrollerContent
                  className="mx-auto w-full max-w-3xl gap-4 px-4 py-6 sm:px-6"
                  aria-busy={busy}
                >
                  <MessageScrollerItem messageId="scenario">
                    <p className="text-center text-xs text-muted-foreground">
                      Sos {debt.debtorAlias}
                      {debt.groupLabel ? ` de ${debt.groupLabel}` : ""} · debés{" "}
                      {formatARS(
                        Math.round((debt.principal + debt.interest) * 100)
                      )}{" "}
                      a {debt.organizationName}
                    </p>
                  </MessageScrollerItem>
                  <MessageScrollerItem messageId="disclosure">
                    <ChatMessage author="pacta.ia" text={session.disclosure} />
                  </MessageScrollerItem>
                  {session.turns.flatMap((turn, i) => [
                    <MessageScrollerItem
                      key={`user-${i}`}
                      messageId={`user-${i}`}
                      scrollAnchor
                    >
                      <ChatMessage fromDebtor text={turn.user} />
                    </MessageScrollerItem>,
                    <MessageScrollerItem
                      key={`agent-${i}`}
                      messageId={`agent-${i}`}
                    >
                      <ChatMessage
                        author="pacta.ia"
                        text={turn.assistant}
                        turn={turn}
                      />
                    </MessageScrollerItem>,
                  ])}
                  {pending && (
                    <MessageScrollerItem messageId="pending" scrollAnchor>
                      <ChatMessage fromDebtor text={pending} />
                      <p
                        role="status"
                        className="mt-3 px-3 text-xs text-muted-foreground"
                      >
                        El agente está consultando las opciones…
                      </p>
                    </MessageScrollerItem>
                  )}
                  {session.offer && session.status !== "agreed" && (
                    <MessageScrollerItem
                      messageId={`offer-${session.offer.id}`}
                    >
                      <OfferCard
                        offer={session.offer}
                        canAccept={active && !busy}
                        accepting={busy && !pending}
                        error={null}
                        onAccept={() =>
                          void run(() =>
                            postSandbox({
                              action: "accept",
                              sessionId: session.id,
                              offerId: session.offer!.id,
                            })
                          )
                        }
                      />
                    </MessageScrollerItem>
                  )}
                  {!active && (
                    <MessageScrollerItem messageId="terminal">
                      <p
                        role="status"
                        className="rounded-lg bg-muted p-4 text-sm"
                      >
                        {session.status === "agreed"
                          ? `Aceptaste ${session.offer ? formatARS(session.offer.totalCents) : "la propuesta"}. Es una simulación: no se creó ningún acuerdo real.`
                          : "El agente derivó la conversación a una persona. Reiniciá para probar otro recorrido."}
                      </p>
                    </MessageScrollerItem>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>

          <footer className="shrink-0 border-t bg-background px-4 pt-3 pb-4 sm:px-6">
            <div className="mx-auto grid w-full max-w-3xl gap-3">
              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </p>
              )}
              {active && session.turns.length === 0 && !pending && (
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((text) => (
                    <Button
                      key={text}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      disabled={busy}
                      onClick={() => void send(text)}
                    >
                      {text}
                    </Button>
                  ))}
                </div>
              )}
              <form
                className="flex items-end gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  void send(input)
                }}
              >
                <label htmlFor="sandbox-message" className="sr-only">
                  Tu mensaje como deudor
                </label>
                <Textarea
                  ref={composer}
                  id="sandbox-message"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing
                    ) {
                      e.preventDefault()
                      void send(input)
                    }
                  }}
                  placeholder={
                    active
                      ? "Escribí como si fueras el deudor…"
                      : "La simulación terminó. Reiniciala para seguir probando."
                  }
                  disabled={!active || busy}
                  maxLength={4_000}
                  rows={1}
                  className="max-h-36 min-h-11 resize-none"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="size-11 shrink-0"
                  disabled={!input.trim() || !active || busy}
                  aria-label={busy ? "Esperando respuesta" : "Enviar mensaje"}
                >
                  <HugeiconsIcon icon={ArrowUp02Icon} />
                </Button>
              </form>
              <p className="text-center text-xs text-muted-foreground">
                Enter para enviar · Shift + Enter para un salto de línea ·{" "}
                {session.turns.length} / {session.maxTurns} turnos
              </p>
            </div>
          </footer>
        </section>

        <SandboxInspector session={session} />
      </div>
    </>
  )
}

function ChatMessage({
  text,
  author,
  fromDebtor = false,
  turn,
}: {
  text: string
  author?: string
  fromDebtor?: boolean
  turn?: SandboxTurn
}) {
  const align = fromDebtor ? "end" : "start"
  return (
    <Message align={align}>
      <MessageContent>
        <MessageHeader>{fromDebtor ? "Vos (deudor)" : author}</MessageHeader>
        <Bubble align={align} variant={fromDebtor ? "default" : "muted"}>
          <BubbleContent className="whitespace-pre-wrap">
            <ChatText text={text} />
          </BubbleContent>
        </Bubble>
        {turn && (
          <MessageFooter className="gap-1.5 font-normal">
            {(turn.elapsedMs / 1000).toFixed(1)} s · {turn.tools.length}{" "}
            {turn.tools.length === 1 ? "herramienta" : "herramientas"}
            {!turn.guardrailPassed && (
              <Badge variant="destructive">Cifras corregidas</Badge>
            )}
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  )
}

function SandboxInspector({ session }: { session: SandboxSession }) {
  const latest = session.turns.at(-1)
  const totals = session.turns.reduce(
    (sum, turn) => ({
      input: sum.input + turn.inputTokens,
      output: sum.output + turn.outputTokens,
    }),
    { input: 0, output: 0 }
  )
  const { agent } = session.config

  return (
    <aside
      aria-label="Qué hizo el agente"
      className="grid content-start gap-5 border-t p-4 text-sm lg:overflow-y-auto lg:border-t-0 lg:border-l"
    >
      <div>
        <h2 className="font-medium">Qué hizo el agente</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Herramientas, resultados y eventos de control de cada turno.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <Stat label="Modelo" value={session.model} wide />
        <Stat label="Proveedor" value={session.provider} />
        <Stat
          label="Turnos"
          value={`${session.turns.length} / ${session.maxTurns}`}
        />
        {latest && (
          <>
            <Stat
              label="Última respuesta"
              value={`${(latest.elapsedMs / 1000).toFixed(1)} s · ${latest.steps} pasos`}
              wide
            />
            <Stat label="Tokens de entrada" value={String(totals.input)} />
            <Stat label="Tokens de salida" value={String(totals.output)} />
          </>
        )}
      </dl>

      <details className="rounded-lg border p-3">
        <summary className="cursor-pointer font-medium">
          Reglas de esta simulación
        </summary>
        <dl className="mt-3 grid gap-1.5 text-xs">
          <Rule label="Máximo de cuotas" value={agent.maxInstallments} />
          <Rule label="Anticipo mínimo" value={`${agent.minDownPaymentPct}%`} />
          <Rule
            label="Cuota mínima"
            value={formatARS(Math.round(agent.minInstallment * 100))}
          />
          <Rule
            label="Quita pago único"
            value={`${agent.singlePaymentWaiverPct}%`}
          />
          <Rule
            label="Quita en cuotas"
            value={`${agent.maxInterestWaiverPct}%`}
          />
          <Rule
            label="Quita de capital"
            value={`${agent.maxPrincipalDiscountPct}%`}
          />
          <Rule
            label="Primera cuota hasta"
            value={`${agent.maxFirstDueDays} días`}
          />
          <Rule
            label="Vigencia de ofertas"
            value={`${agent.offerValidityHours} h`}
          />
          <Rule
            label="Derivar desde"
            value={
              agent.escalateAbove
                ? formatARS(Math.round(agent.escalateAbove * 100))
                : "Sin umbral"
            }
          />
        </dl>
      </details>

      {session.turns.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Mandá el primer mensaje para ver qué herramientas usa el agente.
        </p>
      ) : (
        session.turns.map((turn, i) => (
          <details
            key={i}
            className="rounded-lg border p-3"
            open={i === session.turns.length - 1}
          >
            <summary className="cursor-pointer font-medium">
              Turno {i + 1} · {turn.tools.length}{" "}
              {turn.tools.length === 1 ? "herramienta" : "herramientas"}
            </summary>
            <div className="mt-3 grid gap-3">
              {turn.tools.map((tool, j) => (
                <details key={j}>
                  <summary className="cursor-pointer font-mono text-xs break-all">
                    {tool.tool}
                  </summary>
                  <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-muted p-2 text-[10px] break-all whitespace-pre-wrap">
                    {JSON.stringify(
                      { input: tool.input, output: tool.output },
                      null,
                      2
                    )}
                  </pre>
                </details>
              ))}
              {turn.events.map((event, j) => (
                <div key={j} className="text-xs">
                  <Badge variant="secondary">{event.type}</Badge>
                  <pre className="mt-1 max-h-40 overflow-auto break-all whitespace-pre-wrap text-muted-foreground">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                </div>
              ))}
              {turn.tools.length === 0 && turn.events.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Respondió sin usar herramientas.
                </p>
              )}
            </div>
          </details>
        ))
      )}

      <p className="text-xs text-muted-foreground">
        Las simulaciones viven en memoria del servidor durante dos horas sin
        uso. Reiniciar el servidor las borra.
      </p>
    </aside>
  )
}

function Stat({
  label,
  value,
  wide = false,
}: {
  label: string
  value: string
  wide?: boolean
}) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium break-all">{value}</dd>
    </div>
  )
}

function Rule({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  )
}
