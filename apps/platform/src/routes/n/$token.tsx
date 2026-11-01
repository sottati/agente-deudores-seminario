import { createFileRoute } from "@tanstack/react-router"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { getDebtorChatState } from "@/server/debtor-chat"
import type { DebtorChatMessage } from "@/server/debtor-chat"

export const Route = createFileRoute("/n/$token")({
  loader: ({ params }) => getDebtorChatState({ data: { token: params.token } }),
  component: DebtorChatPage,
  head: () => ({ meta: [{ title: "Conversá con pacta.ia" }] }),
})

// Convierte los mensajes guardados en la DB al formato de burbujas del chat.
function toBubbles(messages: DebtorChatMessage[]) {
  return messages.map((message, index) => ({
    id: `history-${index}`,
    fromDebtor: message.role === "debtor",
    text: message.text,
  }))
}

function DebtorChatPage() {
  const { token } = Route.useParams()
  const state = Route.useLoaderData()

  if (!state.found) {
    return (
      <ChatShell>
        <StatusCard
          title="Link no válido"
          description="El enlace de negociación no existe o fue dado de baja. Si creés que es un error, escribile a la administración."
        />
      </ChatShell>
    )
  }

  if (state.expired) {
    return (
      <ChatShell>
        <StatusCard
          title="El link venció"
          description="Este enlace de negociación ya no está disponible. Contactá a la administración para obtener uno nuevo."
        />
      </ChatShell>
    )
  }

  return (
    <ChatShell>
      <ActiveChat
        token={token}
        organizationName={state.organizationName}
        disclosure={state.disclosure}
        history={state.messages}
        initialStatus={state.status}
      />
    </ChatShell>
  )
}

function ActiveChat({
  token,
  organizationName,
  disclosure,
  history,
  initialStatus,
}: {
  token: string
  organizationName: string
  disclosure: string
  history: DebtorChatMessage[]
  initialStatus: string
}) {
  const [input, setInput] = useState("")
  const [escalated, setEscalated] = useState(initialStatus === "escalated")

  const historyBubbles = useMemo(() => toBubbles(history), [history])

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/n/${token}/chat`,
      }),
    [token]
  )

  const { messages, sendMessage, status, error } = useChat({ transport })

  const isBusy = status === "submitted" || status === "streaming"

  async function handleSend() {
    const text = input.trim()
    if (!text || isBusy || escalated) return

    // Detección local del pedido de humano para reflejar el estado en la UI.
    if (/hablar\s+con\s+(una\s+)?persona/i.test(text)) {
      setEscalated(true)
    }
    setInput("")
    await sendMessage({ text })
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }

  return (
    <>
      <header className="border-b px-4 py-3">
        <p className="text-sm font-medium">{organizationName}</p>
        <p className="text-xs text-muted-foreground">
          Asistente virtual de pacta.ia
        </p>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        {/* Mensaje inicial determinístico (bot disclosure). */}
        <Bubble fromDebtor={false} text={disclosure} />

        {/* Historial previo persistido en la base de datos. */}
        {historyBubbles.map((bubble) => (
          <Bubble key={bubble.id} fromDebtor={bubble.fromDebtor} text={bubble.text} />
        ))}

        {/* Mensajes del turno actual (streaming en vivo). */}
        {messages.map((message) => {
          const text = message.parts
            .filter((part) => part.type === "text")
            .map((part) => ("text" in part ? part.text : ""))
            .join("")
          if (!text) return null
          return (
            <Bubble
              key={message.id}
              fromDebtor={message.role === "user"}
              text={text}
            />
          )
        })}

        {escalated && (
          <p className="rounded-lg bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
            Derivamos la conversación a una persona de la administración. Te van
            a responder por este mismo chat.
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
            Hubo un problema al enviar el mensaje. Intentá de nuevo en unos
            segundos.
          </p>
        )}
      </div>

      <footer className="border-t px-4 py-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              escalated
                ? "Esperá la respuesta de la administración…"
                : "Escribí tu mensaje…"
            }
            disabled={escalated}
            rows={1}
            className="max-h-32 min-h-10 resize-none"
          />
          <Button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isBusy || escalated}
            size="lg"
          >
            {isBusy ? "Enviando…" : "Enviar"}
          </Button>
        </div>
      </footer>
    </>
  )
}

function ChatShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh justify-center bg-muted/30">
      <div className="flex min-h-svh w-full max-w-xl flex-col bg-background shadow-sm">
        {children}
      </div>
    </div>
  )
}

function Bubble({ fromDebtor, text }: { fromDebtor: boolean; text: string }) {
  return (
    <div className={cn("flex", fromDebtor ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap",
          fromDebtor
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {text}
      </div>
    </div>
  )
}

function StatusCard({
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
