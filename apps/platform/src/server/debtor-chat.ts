import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { setResponseHeader } from "@tanstack/react-start/server"

import { buildBotDisclosureMessage } from "@agente/agent"
import { isNegotiationExpired, messagePartsToText } from "@/lib/debtor-chat"
import type { NegotiationStatus } from "@/lib/labels"

import {
  getConversationHistory,
  resolveNegotiationByToken,
} from "./db/debtor-access"

// Estado "público" que la página /n/$token necesita para renderizar el chat.
// SEM-32: todavía sin verificación de identidad (llega en el Sprint 2), por eso
// no exponemos montos de la deuda acá: solo el nombre visible de la
// administración, el estado y el historial de texto de la conversación.
export type DebtorChatMessage = {
  id: string
  role: "debtor" | "agent" | "admin" | "system"
  text: string
}

export type DebtorChatState =
  | {
      found: false
    }
  | {
      found: true
      status: NegotiationStatus
      expired: boolean
      expiresAt: string
      organizationName: string
      disclosure: string
      messages: DebtorChatMessage[]
    }

export const getDebtorChatState = createServerFn({ method: "GET" })
  .validator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }): Promise<DebtorChatState> => {
    setResponseHeader("Cache-Control", "private, no-store")
    const negotiation = await resolveNegotiationByToken(data.token)
    if (!negotiation) return { found: false }

    const expired = isNegotiationExpired(negotiation)
    // La vigencia se aplica antes de leer el transcript, también al invocar la server fn directamente.
    const history =
      expired || negotiation.status === "locked"
        ? []
        : await getConversationHistory(negotiation.id)

    const messages: DebtorChatMessage[] = history
      .filter((row) => row.role !== "system")
      .map((row) => ({
        id: row.id,
        role: row.role,
        text: messagePartsToText(row.parts),
      }))
      .filter((message) => message.text.length > 0)

    return {
      found: true,
      status: negotiation.status,
      expired,
      expiresAt: negotiation.expiresAt,
      organizationName: negotiation.organization.displayNameForDebtors,
      disclosure: buildBotDisclosureMessage(
        negotiation.organization.displayNameForDebtors
      ),
      messages,
    }
  })
