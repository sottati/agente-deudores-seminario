import "@tanstack/react-start/server-only"
import { randomUUID } from "node:crypto"
import { createUIMessageStream, createUIMessageStreamResponse } from "ai"
import { z } from "zod"
import {
  MAX_TURNS_PER_NEGOTIATION,
  isHumanHandoffKeyword,
  runNegotiationTurn,
} from "@agente/agent"
import { createConfiguredModel } from "@agente/agent/model"

import {
  AGENT_ANSWERABLE_STATUSES,
  HUMAN_HANDOFF_MESSAGE,
  isNegotiationExpired,
} from "@/lib/debtor-chat"
import type { DebtorUIMessage } from "@/lib/debtor-chat"
import {
  claimNegotiationTurn,
  createNegotiationPersistence,
  getConversationHistory,
  persistAgentResponse,
  releaseNegotiationTurn,
  resolveNegotiationByToken,
  toAgentContext,
} from "./db/debtor-access"
import { hasValidDebtorSessionRequest } from "./debtor-session"
import { negotiationStreamResponse } from "./negotiation-stream"
import type { ResolvedNegotiation } from "./db/debtor-access"

const requestSchema = z.object({ messages: z.array(z.unknown()).min(1) })
const messageSchema = z.object({
  id: z.uuid().optional(),
  role: z.literal("user"),
  parts: z
    .array(z.object({ type: z.literal("text"), text: z.string() }))
    .min(1)
    .max(16),
})

function json(body: unknown, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  })
}

export async function handleDebtorChat({
  request,
  params,
}: {
  request: Request
  params: { token: string }
}): Promise<Response> {
  let reserved: ResolvedNegotiation | undefined
  let streaming = false
  try {
    const negotiation = await resolveNegotiationByToken(params.token)
    if (!negotiation)
      return json({ error: "Link de negociación inválido." }, 404)
    if (isNegotiationExpired(negotiation))
      return json({ error: "Este link de negociación venció." }, 410)
    if (negotiation.status === "locked") {
      return json(
        { error: "Esta conversación no está disponible para el asistente." },
        409
      )
    }
    // Exige sesión del deudor verificada mediante cookie firmada (PLAN_BACKEND D4).
    if (!hasValidDebtorSessionRequest(request, negotiation.id)) {
      return json(
        { error: "Verificá tu identidad antes de iniciar la conversación." },
        401
      )
    }
    if (!AGENT_ANSWERABLE_STATUSES.includes(negotiation.status)) {
      return json(
        { error: "Esta conversación no está disponible para el asistente." },
        409
      )
    }

    const body = requestSchema.safeParse(await request.json().catch(() => null))
    if (!body.success)
      return json({ error: "Cuerpo de la solicitud inválido." }, 400)
    const message = messageSchema.safeParse(body.data.messages.at(-1))
    if (!message.success)
      return json(
        { error: "El mensaje no es válido. Usá hasta 4000 caracteres." },
        400
      )
    const text = message.data.parts
      .map((part) => part.text)
      .join("\n")
      .trim()
    if (!text) return json({ error: "El mensaje no puede estar vacío." }, 400)
    if (text.length > 4_000)
      return json({ error: "El mensaje es demasiado largo." }, 413)

    const humanRequested = isHumanHandoffKeyword(text)
    let model: ReturnType<typeof createConfiguredModel> | undefined
    if (!humanRequested) {
      try {
        model = createConfiguredModel(process.env)
      } catch {
        return json(
          {
            error:
              "El asistente no está disponible en este momento. Intentá más tarde.",
          },
          503
        )
      }
    }

    const messageId = message.data.id ?? randomUUID()
    if (
      !(await claimNegotiationTurn(
        negotiation,
        messageId,
        [{ type: "text", text }],
        humanRequested
      ))
    ) {
      return json(
        {
          error:
            "La conversación ya está procesando otro mensaje. Actualizá e intentá de nuevo.",
        },
        409
      )
    }
    reserved = negotiation
    // La reserva inserta el mensaje; el historial excluye por ID, nunca por posición.
    const history = humanRequested
      ? []
      : await getConversationHistory(negotiation.id)
    const persistence = createNegotiationPersistence(negotiation)

    const debtorTurnsCount =
      history.filter((row) => row.role === "debtor").length +
      (history.some((row) => row.id === messageId) ? 0 : 1)
    const turnLimitReached =
      !humanRequested && debtorTurnsCount > MAX_TURNS_PER_NEGOTIATION

    if (humanRequested || turnLimitReached) {
      if (turnLimitReached) {
        await persistence.escalate("max_turns_exceeded")
        await persistence.logEvent("escalated", {
          reason: "max_turns_exceeded",
          debtor_turns_count: debtorTurnsCount,
          max_turns: MAX_TURNS_PER_NEGOTIATION,
        })
      } else {
        // La reserva de humano ya cambió el control de forma atómica.
        await persistence.logEvent("escalated", {
          reason: "debtor_requested_human",
        })
      }
      const id = randomUUID()
      const saved = await persistAgentResponse(negotiation, id, [
        { type: "text", text: HUMAN_HANDOFF_MESSAGE },
      ])
      return createUIMessageStreamResponse({
        headers: { "Cache-Control": "private, no-store" },
        stream: createUIMessageStream<DebtorUIMessage>({
          execute: ({ writer }) => {
            if (!saved.persisted) {
              writer.write({
                type: "start",
                messageId: id,
                messageMetadata: {
                  negotiationStatus: saved.status,
                  responseDiscarded: true,
                },
              })
              writer.write({
                type: "abort",
                reason: "El estado de la conversación cambió.",
              })
              return
            }
            writer.write({
              type: "start",
              messageId: id,
              messageMetadata: { negotiationStatus: "escalated" },
            })
            writer.write({ type: "text-start", id: "handoff" })
            writer.write({
              type: "text-delta",
              id: "handoff",
              delta: HUMAN_HANDOFF_MESSAGE,
            })
            writer.write({ type: "text-end", id: "handoff" })
            writer.write({
              type: "finish",
              finishReason: "stop",
              messageMetadata: { negotiationStatus: "escalated" },
            })
          },
        }),
      })
    }

    const controller = new AbortController()
    const result = await runNegotiationTurn({
      negotiation: toAgentContext(negotiation),
      history: history.filter(
        (row) => row.role !== "system" && row.id !== messageId
      ),
      lastMessage: text,
      model: model!,
      persistence,
      abortSignal: AbortSignal.any([
        request.signal,
        controller.signal,
        AbortSignal.timeout(120_000),
      ]),
    })
    const response = negotiationStreamResponse(
      result,
      negotiation,
      controller,
      persistence
    )
    streaming = true
    return response
  } catch {
    return json(
      { error: "No pudimos procesar el mensaje. Intentá de nuevo." },
      500
    )
  } finally {
    if (reserved && !streaming) await releaseNegotiationTurn(reserved)
  }
}
