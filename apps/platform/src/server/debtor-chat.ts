import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { buildBotDisclosureMessage } from "@agente/agent"

import {
  getConversationHistory,
  resolveNegotiationByToken,
} from "./db/debtor-access"

// Estado "público" que la página /n/$token necesita para renderizar el chat.
// SEM-32: todavía sin verificación de identidad (llega en el Sprint 2), por eso
// no exponemos montos de la deuda acá: solo el nombre visible de la
// administración, el estado y el historial de texto de la conversación.
export type DebtorChatMessage = {
  role: "debtor" | "agent" | "admin" | "system"
  text: string
}

export type DebtorChatState =
  | {
      found: false
    }
  | {
      found: true
      status: string
      expired: boolean
      organizationName: string
      disclosure: string
      messages: DebtorChatMessage[]
    }

function partsToText(parts: unknown): string {
  if (!Array.isArray(parts)) return ""
  const texts: string[] = []
  for (const part of parts) {
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

export const getDebtorChatState = createServerFn({ method: "GET" })
  .validator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }): Promise<DebtorChatState> => {
    const negotiation = await resolveNegotiationByToken(data.token)
    if (!negotiation) return { found: false }

    const expired = new Date(negotiation.expiresAt).getTime() < Date.now()
    const history = await getConversationHistory(negotiation.id)

    const messages: DebtorChatMessage[] = history
      .map((row) => ({ role: row.role, text: partsToText(row.parts) }))
      .filter((message) => message.text.length > 0)

    return {
      found: true,
      status: negotiation.status,
      expired,
      organizationName: negotiation.organization.displayNameForDebtors,
      disclosure: buildBotDisclosureMessage(
        negotiation.organization.displayNameForDebtors
      ),
      messages,
    }
  })
