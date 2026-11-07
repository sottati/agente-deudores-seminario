import type { UIMessage } from "ai"
import type { ScheduleItem } from "@agente/negotiation-engine"
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

export type ExtractedProposedOffer = {
  id: string
  installments: number
  downPaymentCents: number
  waivedInterestCents: number
  totalCents: number
  schedule: ScheduleItem[]
  validUntil: string
  engineVersion: string
}

/**
 * Extrae una oferta formal de los parts de un mensaje del agente cuando el
 * stream acaba de ejecutar `tool-propose_offer` con `ok: true` (PLAN_BACKEND D7).
 */
export function extractProposedOfferFromParts(
  parts: unknown
): ExtractedProposedOffer | null {
  if (!Array.isArray(parts)) return null
  let found: ExtractedProposedOffer | null = null
  for (const part of parts) {
    if (!part || typeof part !== "object" || Array.isArray(part)) continue
    const record = part as {
      type?: unknown
      state?: unknown
      output?: unknown
    }
    if (
      record.type === "tool-propose_offer" &&
      record.state === "output-available" &&
      record.output &&
      typeof record.output === "object" &&
      !Array.isArray(record.output)
    ) {
      const output = record.output as {
        ok?: unknown
        offerId?: unknown
        offer?: {
          installments?: unknown
          downPaymentCents?: unknown
          waivedInterestCents?: unknown
          totalCents?: unknown
          schedule?: unknown
          validUntil?: unknown
          engineVersion?: unknown
        }
      }
      if (
        output.ok === true &&
        typeof output.offerId === "string" &&
        output.offer &&
        typeof output.offer.installments === "number" &&
        typeof output.offer.downPaymentCents === "number" &&
        typeof output.offer.waivedInterestCents === "number" &&
        typeof output.offer.totalCents === "number" &&
        typeof output.offer.validUntil === "string" &&
        typeof output.offer.engineVersion === "string" &&
        Array.isArray(output.offer.schedule)
      ) {
        const schedule: ScheduleItem[] = output.offer.schedule
          .filter(
            (s): s is ScheduleItem =>
              !!s &&
              typeof s === "object" &&
              typeof (s as ScheduleItem).number === "number" &&
              typeof (s as ScheduleItem).due_date === "string" &&
              typeof (s as ScheduleItem).amount_cents === "number"
          )
          .map((s) => ({
            number: s.number,
            due_date: s.due_date,
            amount_cents: s.amount_cents,
          }))

        found = {
          id: output.offerId,
          installments: output.offer.installments,
          downPaymentCents: output.offer.downPaymentCents,
          waivedInterestCents: output.offer.waivedInterestCents,
          totalCents: output.offer.totalCents,
          schedule,
          validUntil: output.offer.validUntil,
          engineVersion: output.offer.engineVersion,
        }
      }
    }
  }
  return found
}

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
