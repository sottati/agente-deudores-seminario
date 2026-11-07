import "@tanstack/react-start/server-only"
import { randomUUID } from "node:crypto"
import { createUIMessageStream, createUIMessageStreamResponse } from "ai"
import type { InferUIMessageChunk } from "ai"
import type { RunNegotiationTurnResult } from "@agente/agent"
import {
  AGENT_ANSWERABLE_STATUSES,
  isNegotiationExpired,
} from "@/lib/debtor-chat"
import type { DebtorUIMessage } from "@/lib/debtor-chat"
import {
  getNegotiationAccessState,
  persistAgentResponse,
  releaseNegotiationTurn,
} from "./db/debtor-access"
import type {
  NegotiationAccessState,
  ResolvedNegotiation,
} from "./db/debtor-access"
import type { Json } from "./db/types.gen"

/** Revalida la lectura si una tool propia cambió la versión mientras la consulta viajaba. */
async function currentAccess(negotiation: ResolvedNegotiation) {
  let state: NegotiationAccessState
  for (let attempt = 0; ; attempt++) {
    const expected = negotiation.updatedAt
    state = await getNegotiationAccessState(negotiation)
    if (expected === negotiation.updatedAt || attempt >= 5) return state
  }
}

function ownsTurn(
  negotiation: ResolvedNegotiation,
  state: NegotiationAccessState
) {
  return (
    !isNegotiationExpired(state) &&
    state.updatedAt === negotiation.updatedAt &&
    (AGENT_ANSWERABLE_STATUSES.includes(state.status) ||
      (negotiation.status === "escalated" && state.status === "escalated"))
  )
}

export function negotiationStreamResponse(
  result: RunNegotiationTurnResult,
  negotiation: ResolvedNegotiation,
  controller: AbortController
) {
  let finalMessage: DebtorUIMessage | undefined
  const source = result.toUIMessageStream<DebtorUIMessage>({
    generateMessageId: randomUUID,
    sendReasoning: false,
    onEnd: ({ responseMessage }) => {
      finalMessage = responseMessage
    },
  })
  return createUIMessageStreamResponse({
    headers: { "Cache-Control": "private, no-store" },
    stream: createUIMessageStream<DebtorUIMessage>({
      onError: () => "No pudimos completar la respuesta. Intentá de nuevo.",
      execute: async ({ writer }) => {
        try {
          function revoked(state: { status: ResolvedNegotiation["status"] }) {
            controller.abort()
            writer.write({
              type: "message-metadata",
              messageMetadata: {
                negotiationStatus: state.status,
                responseDiscarded: true,
              },
            })
            writer.write({
              type: "abort",
              reason: "El estado de la conversación cambió.",
            })
            writer.setOutcome({ status: "aborted" })
          }
          let terminal:
            | Extract<
                InferUIMessageChunk<DebtorUIMessage>,
                { type: "finish" | "abort" }
              >
            | undefined
          let lastCheck = -Infinity
          for await (const chunk of source) {
            if (chunk.type === "finish" || chunk.type === "abort") {
              terminal = chunk
              continue
            }
            // La primera salida se valida siempre. Durante streaming, se comprueba
            // periódicamente, y el cierre vuelve a validarse atómicamente en DB.
            if (
              (chunk.type === "text-delta" ||
                chunk.type === "tool-output-available") &&
              Date.now() - lastCheck >= 1000
            ) {
              const access = await currentAccess(negotiation)
              lastCheck = Date.now()
              if (!ownsTurn(negotiation, access)) {
                revoked({
                  status: isNegotiationExpired(access)
                    ? "expired"
                    : access.status,
                })
                return
              }
            }
            writer.write(chunk)
          }
          if (finalMessage?.parts.length) {
            const saved = await persistAgentResponse(
              negotiation,
              finalMessage.id,
              finalMessage.parts as Json[]
            )
            if (!saved.persisted) {
              revoked(saved)
              return
            }
            writer.write({
              type: "message-metadata",
              messageMetadata: { negotiationStatus: saved.status },
            })
          } else {
            const access = await currentAccess(negotiation)
            if (!ownsTurn(negotiation, access)) {
              revoked({
                status: isNegotiationExpired(access)
                  ? "expired"
                  : access.status,
              })
              return
            }
            writer.write({
              type: "message-metadata",
              messageMetadata: { negotiationStatus: access.status },
            })
          }
          if (terminal) writer.write(terminal)
        } finally {
          await releaseNegotiationTurn(negotiation)
        }
      },
    }),
  })
}
