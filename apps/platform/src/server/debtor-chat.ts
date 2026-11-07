import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { setResponseHeader } from "@tanstack/react-start/server"

import { buildBotDisclosureMessage } from "@agente/agent"
import type { ScheduleItem } from "@agente/negotiation-engine"
import { isNegotiationExpired, messagePartsToText } from "@/lib/debtor-chat"
import type { NegotiationStatus } from "@/lib/labels"

import {
  MAX_VERIFICATION_ATTEMPTS,
  getConversationHistory,
  getMessagesSinceForDebtor,
  getNegotiationOffersForDebtor,
  markNegotiationVerifying,
  resolveNegotiationByToken,
  verifyDebtorIdentity,
} from "./db/debtor-access"
import {
  hasValidDebtorSessionCookie,
  setDebtorSessionCookie,
} from "./debtor-session"

// Estado que la página /n/$token necesita para renderizar la pantalla de
// bienvenida/verificación (sin montos) o el chat (una vez emitida la cookie
// firmada tras verificar la identidad, PLAN_BACKEND D4).
export type DebtorChatMessage = {
  id: string
  role: "debtor" | "agent" | "admin" | "system"
  text: string
  createdAt?: string
}

export type DebtorOfferView = {
  id: string
  installments: number
  downPaymentCents: number
  waivedInterestCents: number
  totalCents: number
  schedule: ScheduleItem[]
  validUntil: string
  engineVersion: string
}

export type DebtorAgreementView = {
  id: string
  offerId: string
  acceptedAt: string
  transcriptSha256: string
  installments: number
  downPaymentCents: number
  waivedInterestCents: number
  totalCents: number
  schedule: ScheduleItem[]
  agreementUrl: string
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
      verified: boolean
      organizationName: string
      debtorAlias: string
      groupLabel: string | null
      remainingAttempts: number
      disclosure: string
      messages: DebtorChatMessage[]
      proposedOffer?: DebtorOfferView | null
      acceptedAgreement?: DebtorAgreementView | null
      cursor?: string | null
    }

export const getDebtorChatState = createServerFn({ method: "GET" })
  .validator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }): Promise<DebtorChatState> => {
    setResponseHeader("Cache-Control", "private, no-store")
    const negotiation = await resolveNegotiationByToken(data.token)
    if (!negotiation) return { found: false }

    const organizationName = negotiation.organization.displayNameForDebtors
    const expired = isNegotiationExpired(negotiation)
    const remainingAttempts = Math.max(
      0,
      MAX_VERIFICATION_ATTEMPTS - negotiation.verificationAttempts
    )

    if (expired || negotiation.status === "locked") {
      return {
        found: true,
        status: negotiation.status,
        expired,
        expiresAt: negotiation.expiresAt,
        verified: false,
        organizationName,
        debtorAlias: negotiation.debtor.alias,
        groupLabel: negotiation.debtor.groupLabel,
        remainingAttempts:
          negotiation.status === "locked" ? 0 : remainingAttempts,
        disclosure: "",
        messages: [],
        proposedOffer: null,
        acceptedAgreement: null,
        cursor: null,
      }
    }

    const hasSession = hasValidDebtorSessionCookie(negotiation.id)

    if (!hasSession) {
      // Si el link recién se abrió por primera vez, pasamos de "pending" a "verifying".
      const nextStatus = await markNegotiationVerifying(negotiation)
      return {
        found: true,
        status: nextStatus,
        expired: false,
        expiresAt: negotiation.expiresAt,
        verified: false,
        organizationName,
        debtorAlias: negotiation.debtor.alias,
        groupLabel: negotiation.debtor.groupLabel,
        remainingAttempts,
        disclosure: "",
        messages: [],
        proposedOffer: null,
        acceptedAgreement: null,
        cursor: null,
      }
    }

    // La vigencia y la sesión verificada se aplican antes de leer el transcript.
    const [history, { proposedOffer, acceptedAgreement }] = await Promise.all([
      getConversationHistory(negotiation.id),
      getNegotiationOffersForDebtor(negotiation),
    ])
    const messages: DebtorChatMessage[] = history
      .filter((row) => row.role !== "system")
      .map((row) => ({
        id: row.id,
        role: row.role,
        text: messagePartsToText(row.parts),
        createdAt: row.created_at,
      }))
      .filter((message) => message.text.length > 0)

    const cursor = history.at(-1)?.created_at ?? null
    const encodedToken = encodeURIComponent(data.token)

    return {
      found: true,
      status: negotiation.status,
      expired,
      expiresAt: negotiation.expiresAt,
      verified: true,
      organizationName,
      debtorAlias: negotiation.debtor.alias,
      groupLabel: negotiation.debtor.groupLabel,
      remainingAttempts,
      disclosure: buildBotDisclosureMessage(organizationName),
      messages,
      proposedOffer: proposedOffer
        ? {
            id: proposedOffer.id,
            installments: proposedOffer.installments,
            downPaymentCents: proposedOffer.downPaymentCents,
            waivedInterestCents: proposedOffer.waivedInterestCents,
            totalCents: proposedOffer.totalCents,
            schedule: proposedOffer.schedule,
            validUntil: proposedOffer.validUntil,
            engineVersion: proposedOffer.engineVersion,
          }
        : null,
      acceptedAgreement: acceptedAgreement
        ? {
            id: acceptedAgreement.id,
            offerId: acceptedAgreement.offerId,
            acceptedAt: acceptedAgreement.acceptedAt,
            transcriptSha256: acceptedAgreement.transcriptSha256,
            installments: acceptedAgreement.installments,
            downPaymentCents: acceptedAgreement.downPaymentCents,
            waivedInterestCents: acceptedAgreement.waivedInterestCents,
            totalCents: acceptedAgreement.totalCents,
            schedule: acceptedAgreement.schedule,
            agreementUrl: `/api/n/${encodedToken}/accept`,
          }
        : null,
      cursor,
    }
  })

const messagesSinceInputSchema = z.object({
  token: z.string().min(1),
  cursor: z.string().optional(),
})

export type MessagesSinceResponse =
  | { found: false }
  | {
      found: true
      status: NegotiationStatus
      expired: boolean
      verified: boolean
      messages: DebtorChatMessage[]
      nextCursor: string | null
      proposedOffer: DebtorOfferView | null
      acceptedAgreement: DebtorAgreementView | null
    }

/**
 * Polling liviano cada ~5 s mientras la conversación está en `escalated` para
 * recibir mensajes de la administración o enterarse si el admin devolvió el
 * control al agente o cerró el link (PLAN_BACKEND D9, §5, SEM-39).
 */
export const getMessagesSince = createServerFn({ method: "GET" })
  .validator(messagesSinceInputSchema)
  .handler(async ({ data }): Promise<MessagesSinceResponse> => {
    setResponseHeader("Cache-Control", "private, no-store")
    const negotiation = await resolveNegotiationByToken(data.token)
    if (!negotiation) return { found: false }

    const expired = isNegotiationExpired(negotiation)
    if (expired || negotiation.status === "locked") {
      return {
        found: true,
        status: negotiation.status,
        expired,
        verified: false,
        messages: [],
        nextCursor: null,
        proposedOffer: null,
        acceptedAgreement: null,
      }
    }

    if (!hasValidDebtorSessionCookie(negotiation.id)) {
      return {
        found: true,
        status: negotiation.status,
        expired: false,
        verified: false,
        messages: [],
        nextCursor: null,
        proposedOffer: null,
        acceptedAgreement: null,
      }
    }

    const [
      { messages: rows, nextCursor },
      { proposedOffer, acceptedAgreement },
    ] = await Promise.all([
      getMessagesSinceForDebtor(negotiation, data.cursor),
      getNegotiationOffersForDebtor(negotiation),
    ])
    const encodedToken = encodeURIComponent(data.token)

    const messages: DebtorChatMessage[] = rows
      .filter((row) => row.role !== "system")
      .map((row) => ({
        id: row.id,
        role: row.role,
        text: messagePartsToText(row.parts),
        createdAt: row.created_at,
      }))
      .filter((message) => message.text.length > 0)

    return {
      found: true,
      status: negotiation.status,
      expired: false,
      verified: true,
      messages,
      nextCursor,
      proposedOffer: proposedOffer
        ? {
            id: proposedOffer.id,
            installments: proposedOffer.installments,
            downPaymentCents: proposedOffer.downPaymentCents,
            waivedInterestCents: proposedOffer.waivedInterestCents,
            totalCents: proposedOffer.totalCents,
            schedule: proposedOffer.schedule,
            validUntil: proposedOffer.validUntil,
            engineVersion: proposedOffer.engineVersion,
          }
        : null,
      acceptedAgreement: acceptedAgreement
        ? {
            id: acceptedAgreement.id,
            offerId: acceptedAgreement.offerId,
            acceptedAt: acceptedAgreement.acceptedAt,
            transcriptSha256: acceptedAgreement.transcriptSha256,
            installments: acceptedAgreement.installments,
            downPaymentCents: acceptedAgreement.downPaymentCents,
            waivedInterestCents: acceptedAgreement.waivedInterestCents,
            totalCents: acceptedAgreement.totalCents,
            schedule: acceptedAgreement.schedule,
            agreementUrl: `/api/n/${encodedToken}/accept`,
          }
        : null,
    }
  })

const verifyIdentityInputSchema = z.object({
  token: z.string().min(1),
  dniLast3: z
    .string()
    .trim()
    .regex(/^\d{3}$/, "Ingresá los últimos 3 dígitos de tu DNI"),
})

export type VerifyIdentityResponse =
  | { ok: true }
  | {
      ok: false
      locked?: boolean
      remainingAttempts?: number
      error: string
    }

export const verifyIdentity = createServerFn({ method: "POST" })
  .validator(verifyIdentityInputSchema)
  .handler(async ({ data }): Promise<VerifyIdentityResponse> => {
    setResponseHeader("Cache-Control", "private, no-store")
    const negotiation = await resolveNegotiationByToken(data.token)
    if (!negotiation) {
      return { ok: false, error: "El enlace de negociación no es válido." }
    }

    if (isNegotiationExpired(negotiation)) {
      return { ok: false, error: "Este enlace de negociación ya venció." }
    }

    const result = await verifyDebtorIdentity(negotiation, data.dniLast3)
    if (!result.ok) {
      return {
        ok: false,
        locked: result.locked,
        remainingAttempts: result.remainingAttempts,
        error: result.message,
      }
    }

    setDebtorSessionCookie(negotiation.id)
    return { ok: true }
  })
