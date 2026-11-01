import { createFileRoute } from "@tanstack/react-router"

import {
  buildBotDisclosureMessage,
  isHumanHandoffKeyword,
  runNegotiationTurn,
} from "@agente/agent"
import type { UIMessage } from "ai"

import {
  appendMessage,
  createNegotiationPersistence,
  getConversationHistory,
  resolveNegotiationByToken,
  toAgentContext,
} from "@/server/db/debtor-access"

// Tamaño máximo del último mensaje del deudor (anti-abuso / anti-inyección).
const MAX_MESSAGE_LENGTH = 4_000

// Estados en los que el agente puede responder. En "escalated"/"agreed"/etc.
// el agente deja de responder (atiende un humano o la negociación está cerrada).
const AGENT_ANSWERABLE_STATUSES = new Set(["pending", "verifying", "active", "offer_pending"])

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  })
}

function textPart(text: string) {
  return [{ type: "text", text }]
}

// Extrae el texto plano de un UIMessage (solo partes de tipo "text").
function extractText(message: UIMessage | undefined): string {
  if (!message || !Array.isArray(message.parts)) return ""
  const texts: string[] = []
  for (const part of message.parts) {
    if (
      part &&
      typeof part === "object" &&
      (part as { type?: unknown }).type === "text" &&
      typeof (part as { text?: unknown }).text === "string"
    ) {
      texts.push((part as { text: string }).text)
    }
  }
  return texts.join("\n").trim()
}

async function handleChat({
  request,
  params,
}: {
  request: Request
  params: { token: string }
}): Promise<Response> {
  const negotiation = await resolveNegotiationByToken(params.token)
  if (!negotiation) {
    return json({ error: "Link de negociación inválido." }, 404)
  }

  // Link vencido.
  if (new Date(negotiation.expiresAt).getTime() < Date.now()) {
    return json({ error: "Este link de negociación venció." }, 410)
  }

  // El agente no responde si la negociación está escalada, cerrada o bloqueada.
  if (!AGENT_ANSWERABLE_STATUSES.has(negotiation.status)) {
    return json(
      { error: "Esta conversación no está disponible para el asistente." },
      409
    )
  }

  // Solo se toma el ÚLTIMO mensaje del cliente; el historial se reconstruye
  // desde la DB (PLAN_BACKEND §3.3-2).
  let body: { messages?: UIMessage[] }
  try {
    body = await request.json()
  } catch {
    return json({ error: "Cuerpo de la solicitud inválido." }, 400)
  }

  const clientMessages = Array.isArray(body.messages) ? body.messages : []
  const lastClientMessage = clientMessages.at(-1)
  const lastText = extractText(lastClientMessage)

  if (!lastText) {
    return json({ error: "El mensaje no puede estar vacío." }, 400)
  }
  if (lastText.length > MAX_MESSAGE_LENGTH) {
    return json({ error: "El mensaje es demasiado largo." }, 413)
  }

  // Persistimos el mensaje del deudor antes de responder.
  await appendMessage(negotiation, "debtor", textPart(lastText))

  // Interceptor de "hablar con una persona" ANTES del LLM (PLAN_BACKEND D9).
  if (isHumanHandoffKeyword(lastText)) {
    const persistence = createNegotiationPersistence(negotiation)
    await persistence.escalate("debtor_requested_human")
    await persistence.logEvent("escalated", { reason: "debtor_requested_human" })

    const handoffText =
      "Te derivo con una persona de la administración. Te van a responder por este mismo chat."
    await appendMessage(negotiation, "agent", textPart(handoffText))

    return json(
      { escalated: true, message: handoffText },
      200
    )
  }

  const history = await getConversationHistory(negotiation.id)
  // El último registro es el mensaje del deudor que acabamos de guardar: se pasa
  // como `lastMessage` y el resto como historial.
  // Se descartan los mensajes con rol "system" (avisos internos del seed/UI):
  // el prompt de sistema lo arma el propio agente y el AI SDK v7 no permite
  // mensajes "system" dentro del historial de la conversación.
  const priorHistory = history
    .slice(0, -1)
    .filter((message) => message.role !== "system")

  const model = process.env.AI_MODEL
  if (!model) {
    return json(
      {
        error:
          "El asistente no está configurado (falta AI_MODEL). Ver apps/platform/.env.example.",
      },
      503
    )
  }

  const persistence = createNegotiationPersistence(negotiation)

  const result = await runNegotiationTurn({
    negotiation: toAgentContext(negotiation),
    history: priorHistory,
    lastMessage: lastText,
    model,
    persistence,
    onFinish: async (event) => {
      // Persistimos la respuesta del agente reconstruida desde el servidor.
      const text = event.text?.trim()
      if (text) {
        await appendMessage(negotiation, "agent", textPart(text))
      }
    },
  })

  return result.toUIMessageStreamResponse()
}

export const Route = createFileRoute("/api/n/$token/chat")({
  server: {
    handlers: {
      POST: handleChat,
    },
  },
})

/**
 * Mensaje inicial determinístico del chat (bot disclosure). No lo genera el LLM
 * (PLAN_BACKEND §3.3-1). La página `/n/$token` lo usa como primer mensaje.
 */
export function getInitialDisclosure(organizationDisplayName: string) {
  return buildBotDisclosureMessage(organizationDisplayName)
}
