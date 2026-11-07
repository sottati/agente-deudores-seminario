import type { UIMessage } from "ai"
import type { NegotiationStatus } from "./labels"

export const HUMAN_HANDOFF_MESSAGE =
  "Te derivo con una persona de la administración. Te van a responder por este mismo chat."

export const AGENT_ANSWERABLE_STATUSES: NegotiationStatus[] = [
  "pending",
  "verifying",
  "active",
  "offer_pending",
]

export type DebtorMessageMetadata = {
  negotiationStatus?: NegotiationStatus
  responseDiscarded?: boolean
  authorRole?: "debtor" | "agent" | "admin" | "system"
}

export type DebtorUIMessage = UIMessage<DebtorMessageMetadata>

export function isNegotiationExpired(
  negotiation: { status: NegotiationStatus; expiresAt: string },
  now = Date.now()
) {
  const expiresAt = Date.parse(negotiation.expiresAt)
  return (
    negotiation.status === "expired" ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= now
  )
}

export function messagePartsToText(parts: unknown): string {
  if (!Array.isArray(parts)) return ""
  const text: string[] = []
  let handoff = false
  for (const part of parts) {
    if (!part || typeof part !== "object") continue
    if (part.type === "text" && typeof part.text === "string")
      text.push(part.text)
    if (
      part.type === "tool-escalate_to_human" &&
      part.state === "output-available"
    )
      handoff = true
  }
  return text.join("\n").trim() || (handoff ? HUMAN_HANDOFF_MESSAGE : "")
}

// getRandomValues también está disponible al abrir el entorno de desarrollo por HTTP.
export function createChatMessageId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
