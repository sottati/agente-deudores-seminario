import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { NativeSelect } from "@/components/ui/native-select"
import { Badge } from "@/components/ui/badge"
import { Field, FormError } from "@/components/form-field"
import { formatARS, formatDate } from "@/lib/format"
import { sandboxPresets } from "@/lib/sandbox"
import type { SandboxConfig, SandboxInfo, SandboxSession } from "@/lib/sandbox"

const numericFields: {
  key: Exclude<keyof SandboxConfig, "tone" | "instructions">
  label: string
  max: number
  min: number
}[] = [
  { key: "principal", label: "Capital · ARS", min: 1, max: 100_000_000 },
  { key: "interest", label: "Intereses · ARS", min: 0, max: 100_000_000 },
  { key: "maxInstallments", label: "Máximo de cuotas", min: 1, max: 12 },
  { key: "minDownPaymentPct", label: "Anticipo mínimo · %", min: 0, max: 100 },
  {
    key: "minInstallment",
    label: "Cuota mínima · ARS",
    min: 1,
    max: 100_000_000,
  },
  { key: "interestWaiverPct", label: "Quita en cuotas · %", min: 0, max: 100 },
  {
    key: "singlePaymentWaiverPct",
    label: "Quita pago único · %",
    min: 0,
    max: 100,
  },
  {
    key: "escalateAbove",
    label: "Derivar por encima de · ARS",
    min: 0,
    max: 100_000_000,
  },
]
const suggestions = [
  "¿Cuánto debo y qué opciones de pago tengo?",
  "Solo puedo pagar en 12 cuotas.",
  "Si pago todo hoy, ¿me quitan los intereses?",
  "Quiero hablar con una persona.",
]

export function AgentSandbox() {
  const [config, setConfig] = useState<SandboxConfig>(sandboxPresets[0].config)
  const [preset, setPreset] = useState(0)
  const [session, setSession] = useState<SandboxSession | null>(null)
  const [info, setInfo] = useState<SandboxInfo | null>(null)
  const [input, setInput] = useState("")
  const [pendingMessage, setPendingMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const end = useRef<HTMLDivElement>(null)
  const composer = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/sandbox", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(
            "El sandbox está disponible únicamente en desarrollo."
          )
        setInfo(await response.json())
      })
      .catch((e: Error) => {
        if (e.name !== "AbortError") setError(e.message)
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" })
  }, [session, pendingMessage])

  async function request(body: unknown) {
    setBusy(true)
    setError(null)
    try {
      const response = await fetch("/api/sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (!response.ok)
        throw new Error(data.error ?? "No se pudo completar la operación.")
      setSession(data)
      return true
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo conectar al servidor."
      )
      return false
    } finally {
      setBusy(false)
    }
  }

  async function send(text = input) {
    if (!session || busy || !text.trim() || session.status !== "active") return
    setPendingMessage(text.trim())
    setInput("")
    const ok = await request({
      action: "message",
      sessionId: session.id,
      text: text.trim(),
    })
    if (!ok) setInput(text)
    setPendingMessage("")
    composer.current?.focus()
  }

  function download() {
    const blob = new Blob([JSON.stringify(session, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pacta-sandbox-${session?.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const terminal = session && session.status !== "active"
  const latest = session?.turns.at(-1)

  return (
    <main className="min-h-svh bg-muted/30">
      <header className="border-b bg-background px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold tracking-tight">
              pacta.ai<span className="text-primary">.</span>
            </span>
            <span className="h-5 border-l" />
            <h1 className="text-sm font-medium">Sandbox de conversaciones</h1>
            <Badge variant="secondary">Desarrollo</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Datos ficticios · Sin conexión a tu cartera
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-5 p-4 sm:p-6 xl:grid-cols-[300px_minmax(0,1fr)_300px]">
        <aside className="space-y-5 rounded-xl border bg-card p-5 xl:max-h-[calc(100svh-125px)] xl:overflow-y-auto">
          <div>
            <h2 className="font-semibold">Prepará el escenario</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Elegí una deuda y negociá como si fueras el deudor.
            </p>
          </div>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault()
              if (await request({ action: "start", config })) {
                setInput("")
                composer.current?.focus()
              }
            }}
          >
            <fieldset className="space-y-4" disabled={busy || !info?.enabled}>
              <Field label="Caso de prueba" htmlFor="sandbox-preset">
                <NativeSelect
                  id="sandbox-preset"
                  className="w-full"
                  value={preset}
                  onChange={(e) => {
                    const i = Number(e.target.value)
                    setPreset(i)
                    setConfig({ ...sandboxPresets[i].config })
                  }}
                >
                  {sandboxPresets.map((p, i) => (
                    <option key={p.name} value={i}>
                      {p.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <p className="text-xs text-muted-foreground">
                {sandboxPresets[preset].description}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {numericFields.map((field) => (
                  <Field
                    key={field.key}
                    label={field.label}
                    htmlFor={`sandbox-${field.key}`}
                  >
                    <Input
                      id={`sandbox-${field.key}`}
                      type="number"
                      required
                      min={field.min}
                      max={field.max}
                      step={field.key === "maxInstallments" ? 1 : "0.01"}
                      value={config[field.key]}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          [field.key]: e.target.valueAsNumber,
                        })
                      }
                    />
                  </Field>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Las quitas aplican a intereses. El capital se conserva. Umbral 0
                desactiva la derivación por monto.
              </p>
              <Field label="Tono del agente" htmlFor="sandbox-tone">
                <NativeSelect
                  id="sandbox-tone"
                  value={config.tone}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tone: e.target.value as SandboxConfig["tone"],
                    })
                  }
                >
                  <option value="empatico_formal">Empático formal</option>
                  <option value="empatico_cercano">Empático cercano</option>
                  <option value="neutral">Neutral</option>
                </NativeSelect>
              </Field>
              <Field
                label="Instrucciones adicionales"
                htmlFor="sandbox-instructions"
              >
                <Textarea
                  id="sandbox-instructions"
                  maxLength={2000}
                  rows={3}
                  value={config.instructions}
                  onChange={(e) =>
                    setConfig({ ...config, instructions: e.target.value })
                  }
                  placeholder="Ej.: recordar que se paga por transferencia."
                />
              </Field>
              <Button className="w-full" type="submit">
                {busy
                  ? "Procesando…"
                  : session
                    ? "Reiniciar con estos datos"
                    : "Iniciar conversación"}
              </Button>
              {session && (
                <p className="text-xs text-muted-foreground">
                  Los cambios se aplican al reiniciar. Exportá el chat si querés
                  conservarlo.
                </p>
              )}
            </fieldset>
          </form>
        </aside>

        <section
          aria-label="Conversación de prueba"
          className="flex min-h-[600px] min-w-0 flex-col overflow-hidden rounded-xl border bg-card xl:h-[calc(100svh-125px)]"
        >
          <div className="flex items-center justify-between gap-3 border-b p-5">
            <div>
              <h2 className="font-semibold">Vos sos Unidad 4B</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {session
                  ? `Deuda simulada: ${formatARS(Math.round((session.config.principal + session.config.interest) * 100))}`
                  : "Iniciá una conversación para probar al agente."}
              </p>
            </div>
            <Badge variant="outline">
              {session?.status === "agreed"
                ? "Acuerdo simulado"
                : session?.status === "escalated"
                  ? "Derivado a humano"
                  : session
                    ? "En negociación"
                    : "Sin iniciar"}
            </Badge>
          </div>

          <div
            className="flex-1 space-y-5 overflow-y-auto p-5"
            role="log"
            aria-label="Mensajes del chat"
          >
            {!session && (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <p className="text-lg font-medium">
                  Una deuda ficticia. Una conversación real.
                </p>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Probá cómo explica las opciones, responde a objeciones y
                  respeta la política de la administración.
                </p>
              </div>
            )}
            {session && <ChatBubble text={session.disclosure} />}
            {session?.turns.map((turn, i) => (
              <div key={i} className="space-y-5">
                <ChatBubble user text={turn.user} />
                <ChatBubble text={turn.assistant} />
                <p className="pl-1 text-[11px] text-muted-foreground">
                  {(turn.elapsedMs / 1000).toFixed(1)} s · {turn.tools.length}{" "}
                  herramientas ·{" "}
                  {turn.guardrailPassed
                    ? "Sin cifras rechazadas"
                    : "Respuesta corregida por el control de cifras"}
                </p>
              </div>
            ))}
            {pendingMessage && (
              <>
                <ChatBubble user text={pendingMessage} />
                <p role="status" className="text-sm text-muted-foreground">
                  El agente está consultando las opciones…
                </p>
              </>
            )}
            {session?.offer && (
              <section
                aria-label="Propuesta simulada"
                className="rounded-xl border border-primary/25 bg-primary/5 p-4"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  Propuesta del motor de reglas
                </p>
                <h3 className="mt-1 text-lg font-semibold">
                  {formatARS(session.offer.totalCents)} ·{" "}
                  {session.offer.installments === 1
                    ? "Pago único"
                    : `${session.offer.installments} cuotas`}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Quita de intereses:{" "}
                  {formatARS(session.offer.waivedInterestCents)}
                </p>
                <ul className="my-3 divide-y text-sm">
                  {session.offer.schedule.map((item) => (
                    <li
                      key={item.number}
                      className="flex justify-between gap-3 py-2"
                    >
                      <span>
                        Cuota {item.number} · {formatDate(item.due_date)}
                      </span>
                      <span className="tabular-nums">
                        {formatARS(item.amount_cents)}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  disabled={busy || !!terminal}
                  onClick={() =>
                    void request({
                      action: "accept",
                      sessionId: session.id,
                      offerId: session.offer?.id,
                    })
                  }
                >
                  Aceptar acuerdo simulado
                </Button>
              </section>
            )}
            {terminal && (
              <p role="status" className="rounded-lg bg-muted p-4 text-sm">
                {session.status === "agreed"
                  ? "Aceptación simulada completada. No se generó una deuda ni un acuerdo real."
                  : "El agente derivó la conversación. Reiniciá para probar otro recorrido."}
              </p>
            )}
            <div ref={end} />
          </div>

          <div className="space-y-3 border-t p-4">
            <FormError message={error} />
            {info && !info.configured && (
              <p
                role="status"
                className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900"
              >
                Falta configurar el modelo y su API key en el servidor para
                recibir respuestas reales.
              </p>
            )}
            {session && !terminal && !session.turns.length && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((text) => (
                  <button
                    key={text}
                    type="button"
                    disabled={busy}
                    className="rounded-full border px-3 py-1.5 text-left text-xs hover:bg-muted disabled:opacity-50"
                    onClick={() => {
                      setInput(text)
                      composer.current?.focus()
                    }}
                  >
                    {text}
                  </button>
                ))}
              </div>
            )}
            <form
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                void send()
              }}
            >
              <Textarea
                ref={composer}
                aria-label="Tu mensaje como deudor"
                placeholder="Escribí como si estuvieras negociando tus expensas…"
                rows={2}
                maxLength={4000}
                value={input}
                disabled={!session || busy || !!terminal}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault()
                    void send()
                  }
                }}
              />
              <Button
                type="submit"
                disabled={
                  !session ||
                  busy ||
                  !!terminal ||
                  !input.trim() ||
                  !info?.configured
                }
              >
                {busy ? "Esperando…" : "Enviar"}
              </Button>
            </form>
            <p className="text-[11px] text-muted-foreground">
              Enter para enviar · Shift + Enter para un salto de línea
            </p>
          </div>
        </section>

        <aside className="space-y-5 rounded-xl border bg-card p-5 xl:max-h-[calc(100svh-125px)] xl:overflow-y-auto">
          <div>
            <h2 className="font-semibold">Qué hizo el agente</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Inspeccioná cada turno y exportá la prueba para compararla
              después.
            </p>
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Modelo</dt>
              <dd className="mt-1 font-medium break-all">
                {info?.model ?? "Consultando…"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Proveedor</dt>
              <dd>{info?.provider ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                Turnos completados
              </dt>
              <dd>{session?.turns.length ?? 0} / 20</dd>
            </div>
          </dl>
          {latest && (
            <div className="grid grid-cols-2 gap-3 border-y py-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">
                  Última respuesta
                </p>
                <p className="mt-1 font-medium">
                  {(latest.elapsedMs / 1000).toFixed(1)} s
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Pasos del modelo
                </p>
                <p className="mt-1 font-medium">{latest.steps}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Tokens de entrada
                </p>
                <p>{latest.inputTokens}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Tokens de salida
                </p>
                <p>{latest.outputTokens}</p>
              </div>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full"
            disabled={!session || busy}
            onClick={download}
          >
            Exportar conversación JSON
          </Button>
          {!session?.turns.length && (
            <p className="text-xs text-muted-foreground">
              Acá aparecerán las herramientas, sus resultados y los eventos de
              control de cada respuesta.
            </p>
          )}
          {session?.turns.map((turn, i) => (
            <details
              key={i}
              className="rounded-lg border p-3"
              open={i === session.turns.length - 1}
            >
              <summary className="cursor-pointer text-sm font-medium">
                Turno {i + 1} · {turn.tools.length} herramientas
              </summary>
              <div className="mt-3 space-y-3">
                {turn.tools.map((tool, j) => (
                  <details key={j}>
                    <summary className="cursor-pointer text-xs font-medium break-all">
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
              </div>
            </details>
          ))}
          <p className="text-[11px] text-muted-foreground">
            Las pruebas viven en memoria durante dos horas. Reiniciar el
            servidor las borra. La aceptación también es simulada.
          </p>
        </aside>
      </div>
    </main>
  )
}

function ChatBubble({ text, user = false }: { text: string; user?: boolean }) {
  return (
    <div className={`flex ${user ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${user ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted"}`}
      >
        <p
          className={`mb-1 text-[10px] font-medium uppercase ${user ? "opacity-70" : "text-muted-foreground"}`}
        >
          {user ? "Vos" : "Agente de pacta"}
        </p>
        {text}
      </div>
    </div>
  )
}
