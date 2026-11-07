import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useEffect, useMemo, useRef, useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { ArrowUp02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Message, MessageContent, MessageHeader } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Textarea } from "@/components/ui/textarea"
import {
  AGENT_ANSWERABLE_STATUSES,
  createChatMessageId,
  isNegotiationExpired,
  messagePartsToText,
} from "@/lib/debtor-chat"
import type { DebtorUIMessage } from "@/lib/debtor-chat"
import { getDebtorChatState, verifyIdentity } from "@/server/debtor-chat"
import type { DebtorChatState } from "@/server/debtor-chat"

type AvailableState = Extract<DebtorChatState, { found: true }>

function initialMessages(state: AvailableState): DebtorUIMessage[] {
  if (!state.verified || state.expired || state.status === "locked") {
    return []
  }
  return [
    ...(state.disclosure
      ? [
          {
            id: "bot-disclosure",
            role: "assistant" as const,
            parts: [{ type: "text" as const, text: state.disclosure }],
            metadata: { authorRole: "system" as const },
          },
        ]
      : []),
    ...state.messages.map((message): DebtorUIMessage => ({
      id: message.id,
      role: message.role === "debtor" ? "user" : "assistant",
      parts: [{ type: "text", text: message.text }],
      metadata: { authorRole: message.role },
    })),
  ]
}

export function DebtorChat({
  token,
  initialState,
}: {
  token: string
  initialState: AvailableState
}) {
  const [state, setState] = useState(initialState)
  const [input, setInput] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [refreshError, setRefreshError] = useState(false)
  const sending = useRef(false)
  const pendingMessage = useRef<{ id: string; text: string } | undefined>(
    undefined
  )
  const reconciliation = useRef<Promise<void> | null>(null)

  const transport = useMemo(
    () =>
      new DefaultChatTransport<DebtorUIMessage>({
        api: `/api/n/${encodeURIComponent(token)}/chat`,
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { messages: messages.slice(-1) },
        }),
      }),
    [token]
  )

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    error,
    clearError,
    stop,
  } = useChat<DebtorUIMessage>({
    id: token,
    messages: initialMessages(initialState),
    generateId: createChatMessageId,
    transport,
    onFinish: ({ message, isAbort, isError, finishReason }) => {
      const nextStatus = message.metadata?.negotiationStatus
      if (nextStatus)
        setState((current) => ({ ...current, status: nextStatus }))
      if (
        isAbort ||
        isError ||
        finishReason === "interrupted" ||
        message.metadata?.responseDiscarded
      ) {
        setMessages((current) =>
          current.filter((item) => item.id !== message.id)
        )
        void refreshState(isError ? pendingMessage.current : undefined)
      }
    },
    onError: () => {
      setMessages((current) =>
        current.at(-1)?.role === "assistant" ? current.slice(0, -1) : current
      )
      void refreshState(pendingMessage.current)
    },
  })

  const isBusy = status === "submitted" || status === "streaming"
  const canSend =
    state.verified &&
    !state.expired &&
    AGENT_ANSWERABLE_STATUSES.includes(state.status)

  async function refreshState(failedMessage?: { id: string; text: string }) {
    if (reconciliation.current) return reconciliation.current
    setRefreshing(true)
    setRefreshError(false)
    const work = reconcile(failedMessage)
    reconciliation.current = work
    try {
      await work
    } finally {
      reconciliation.current = null
    }
  }

  async function reconcile(failedMessage?: { id: string; text: string }) {
    try {
      const next = await getDebtorChatState({ data: { token } })
      if (!next.found) {
        setUnavailable(true)
        setMessages([])
      } else {
        setState(next)
        setMessages(
          next.expired || next.status === "locked" || !next.verified
            ? []
            : initialMessages(next)
        )
        if (
          failedMessage &&
          next.verified &&
          !next.messages.some((item) => item.id === failedMessage.id)
        ) {
          setInput((current) => current || failedMessage.text)
        }
      }
    } catch {
      setRefreshError(true)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (state.expired) return
    let timer: ReturnType<typeof setTimeout>
    function checkExpiry() {
      if (isNegotiationExpired(state)) {
        void stop()
        setMessages([])
        setState((current) => ({ ...current, expired: true, messages: [] }))
      } else {
        timer = setTimeout(
          checkExpiry,
          Math.min(Date.parse(state.expiresAt) - Date.now(), 2_147_483_647)
        )
      }
    }
    checkExpiry()
    return () => clearTimeout(timer)
  }, [state.expiresAt, state.expired, state.status, setMessages, stop])

  async function send(text: string) {
    const trimmed = text.trim()
    if (
      !trimmed ||
      isBusy ||
      refreshing ||
      reconciliation.current ||
      refreshError ||
      sending.current ||
      !canSend
    )
      return
    sending.current = true
    const id = createChatMessageId()
    pendingMessage.current = { id, text: trimmed }
    setInput("")
    clearError()
    try {
      await sendMessage({
        id,
        role: "user",
        parts: [{ type: "text", text: trimmed }],
      })
    } finally {
      sending.current = false
    }
  }

  if (unavailable)
    return (
      <ChatStatus
        title="Link no válido"
        description="El enlace ya no está disponible. Contactá a la administración."
      />
    )
  if (state.expired)
    return (
      <ChatStatus
        title="El link venció"
        description="Contactá a la administración para obtener un enlace nuevo."
      />
    )
  if (state.status === "locked")
    return (
      <ChatStatus
        title="Conversación bloqueada"
        description={`Se superó el número máximo de intentos de verificación de identidad. Contactá a ${state.organizationName} para continuar.`}
      />
    )
  if (!state.verified)
    return (
      <IdentityVerificationGate
        token={token}
        organizationName={state.organizationName}
        debtorAlias={state.debtorAlias}
        groupLabel={state.groupLabel}
        initialRemainingAttempts={state.remainingAttempts}
        onVerifiedOrLocked={() => refreshState()}
      />
    )

  return (
    <>
      <header className="flex shrink-0 items-center justify-between gap-4 border-b px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold">
            {state.organizationName}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Asistente virtual de pacta.ia
          </p>
        </div>
        <Button
          variant="outline"
          className="min-h-11 shrink-0"
          disabled={!canSend || isBusy || refreshing || refreshError}
          onClick={() => void send("Quiero hablar con una persona")}
        >
          Hablar con una persona
        </Button>
      </header>

      <MessageScrollerProvider autoScroll defaultScrollPosition="end">
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport aria-label="Conversación con la administración">
            <MessageScrollerContent
              className="gap-4 px-4 py-6 sm:px-6"
              aria-busy={isBusy}
            >
              {messages.map((message) => {
                const text = messagePartsToText(message.parts)
                if (!text) return null
                const fromDebtor = message.role === "user"
                return (
                  <MessageScrollerItem
                    key={message.id}
                    messageId={message.id}
                    scrollAnchor={fromDebtor}
                  >
                    <Message align={fromDebtor ? "end" : "start"}>
                      <MessageContent>
                        <MessageHeader>
                          {fromDebtor
                            ? "Vos"
                            : message.metadata?.authorRole === "admin"
                              ? "Administración"
                              : "pacta.ia"}
                        </MessageHeader>
                        <Bubble
                          align={fromDebtor ? "end" : "start"}
                          variant={fromDebtor ? "default" : "muted"}
                        >
                          <BubbleContent className="whitespace-pre-wrap">
                            {text}
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                )
              })}
              {isBusy && (
                <MessageScrollerItem messageId="responding">
                  <p
                    role="status"
                    className="px-3 text-xs text-muted-foreground"
                  >
                    El asistente está respondiendo…
                  </p>
                </MessageScrollerItem>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <footer className="shrink-0 border-t bg-background px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
        {!canSend && (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2">
            <p role="status" className="text-xs text-muted-foreground">
              {state.status === "escalated"
                ? "La conversación está en manos de la administración."
                : "Esta negociación ya está cerrada."}
            </p>
            <Button
              size="sm"
              variant="ghost"
              disabled={refreshing}
              onClick={() => void refreshState()}
            >
              {refreshing ? "Actualizando…" : "Actualizar"}
            </Button>
          </div>
        )}
        {(error || refreshError) && (
          <p role="alert" className="mb-3 text-sm text-destructive">
            No pudimos completar la solicitud. Podés volver a intentarlo.
          </p>
        )}
        {refreshError && (
          <Button
            variant="outline"
            className="mb-3"
            disabled={refreshing}
            onClick={() => void refreshState(pendingMessage.current)}
          >
            Actualizar conversación
          </Button>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void send(input)
          }}
          className="flex items-end gap-2"
        >
          <label htmlFor="debtor-message" className="sr-only">
            Tu mensaje
          </label>
          <Textarea
            id="debtor-message"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault()
                void send(input)
              }
            }}
            placeholder={
              canSend
                ? "Escribí tu mensaje…"
                : "La conversación no admite mensajes por ahora"
            }
            disabled={!canSend}
            maxLength={4_000}
            rows={1}
            className="max-h-36 min-h-11 resize-none"
          />
          <Button
            type="submit"
            size="icon"
            className="size-11 shrink-0"
            disabled={
              !input.trim() || !canSend || isBusy || refreshing || refreshError
            }
            aria-label={isBusy ? "Enviando mensaje" : "Enviar mensaje"}
          >
            <HugeiconsIcon icon={ArrowUp02Icon} />
          </Button>
        </form>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Podés pedir hablar con una persona en cualquier momento.
        </p>
      </footer>
    </>
  )
}

export function ChatShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-dvh justify-center overflow-hidden bg-muted/30">
      <section className="flex h-full min-h-0 w-full max-w-2xl flex-col bg-background shadow-sm">
        {children}
      </section>
    </main>
  )
}

export function ChatStatus({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function IdentityVerificationGate({
  token,
  organizationName,
  debtorAlias,
  groupLabel,
  initialRemainingAttempts,
  onVerifiedOrLocked,
}: {
  token: string
  organizationName: string
  debtorAlias: string
  groupLabel: string | null
  initialRemainingAttempts: number
  onVerifiedOrLocked: () => Promise<void>
}) {
  const verifyFn = useServerFn(verifyIdentity)
  const [dniLast3, setDniLast3] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remainingAttempts, setRemainingAttempts] = useState(
    initialRemainingAttempts
  )

  const sanitized = dniLast3.replace(/\D/g, "").slice(0, 3)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sanitized.length !== 3 || pending) return

    setPending(true)
    setError(null)
    try {
      const result = await verifyFn({
        data: { token, dniLast3: sanitized },
      })

      if (!result.ok) {
        if (result.locked) {
          await onVerifiedOrLocked()
          return
        }
        if (typeof result.remainingAttempts === "number") {
          setRemainingAttempts(result.remainingAttempts)
        }
        setError(result.error)
        return
      }

      await onVerifiedOrLocked()
    } catch {
      setError(
        "No pudimos verificar tu identidad en este momento. Intentá de nuevo."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <header className="shrink-0 border-b px-4 py-4 sm:px-6">
        <p className="truncate text-sm font-semibold">{organizationName}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Asistente virtual de pacta.ia
        </p>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-xl font-semibold tracking-tight">
              Verificá tu identidad
            </h1>
            <p className="text-sm text-muted-foreground">
              Hola. Estás ingresando al canal de atención automatizada de{" "}
              <span className="font-medium text-foreground">
                {organizationName}
              </span>{" "}
              para{" "}
              <span className="font-medium text-foreground">
                {debtorAlias}
                {groupLabel ? ` (${groupLabel})` : ""}
              </span>
              .
            </p>
            <p className="text-xs text-muted-foreground">
              Para proteger tu privacidad y no exponer información a terceros,
              ingresá los <strong>últimos 3 dígitos del DNI</strong> de la
              persona titular antes de ver el detalle de la deuda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="dni-last-3"
                className="block text-center text-xs font-medium text-muted-foreground"
              >
                Últimos 3 dígitos del DNI
              </label>
              <Input
                id="dni-last-3"
                name="dniLast3"
                type="text"
                inputMode="numeric"
                pattern="\d{3}"
                maxLength={3}
                autoComplete="off"
                autoFocus
                placeholder="123"
                value={sanitized}
                onChange={(event) =>
                  setDniLast3(event.target.value.replace(/\D/g, "").slice(0, 3))
                }
                disabled={pending}
                className="h-11 text-center font-mono text-lg tracking-widest"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-xs text-destructive"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={sanitized.length !== 3 || pending}
            >
              {pending ? "Verificando…" : "Continuar al chat"}
            </Button>
          </form>

          <p className="text-center text-[11px] text-muted-foreground">
            Intentos restantes: {remainingAttempts}. Este canal es operado por
            un asistente virtual automatizado de pacta.ia.
          </p>
        </div>
      </div>
    </>
  )
}
