import "@tanstack/react-start/server-only"
import { z } from "zod"

import { isNegotiationExpired } from "@/lib/debtor-chat"
import {
  AGREEMENT_TEMPLATE_VERSION,
  renderAgreementDocumentHtml,
} from "./agreement-document"
import {
  acceptNegotiationOffer,
  getNegotiationOffersForDebtor,
  resolveNegotiationByToken,
} from "./db/debtor-access"
import { hasValidDebtorSessionRequest } from "./debtor-session"

const acceptBodySchema = z
  .object({
    offerId: z.uuid().optional(),
  })
  .optional()

function json(body: unknown, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  })
}

export function extractClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first.slice(0, 120)
  }
  const realIp = request.headers.get("x-real-ip")?.trim()
  if (realIp) return realIp.slice(0, 120)
  const cfIp = request.headers.get("cf-connecting-ip")?.trim()
  if (cfIp) return cfIp.slice(0, 120)
  return null
}

export function extractUserAgent(request: Request): string | null {
  const ua = request.headers.get("user-agent")?.trim()
  return ua ? ua.slice(0, 500) : null
}

export async function handleDebtorAcceptPost({
  request,
  params,
}: {
  request: Request
  params: { token: string }
}): Promise<Response> {
  try {
    const negotiation = await resolveNegotiationByToken(params.token)
    if (!negotiation) {
      return json({ error: "Link de negociación inválido." }, 404)
    }
    if (isNegotiationExpired(negotiation)) {
      return json({ error: "Este link de negociación venció." }, 410)
    }
    if (negotiation.status === "locked") {
      return json(
        { error: "Esta conversación fue bloqueada por seguridad." },
        409
      )
    }
    if (!hasValidDebtorSessionRequest(request, negotiation.id)) {
      return json(
        { error: "Verificá tu identidad antes de aceptar una propuesta." },
        401
      )
    }

    const rawBody = await request.json().catch(() => undefined)
    const parsedBody = acceptBodySchema.safeParse(rawBody)
    if (!parsedBody.success) {
      return json({ error: "Cuerpo de la solicitud inválido." }, 400)
    }

    const acceptanceIp = extractClientIp(request)
    const userAgent = extractUserAgent(request)

    const result = await acceptNegotiationOffer({
      negotiation,
      offerId: parsedBody.data?.offerId,
      acceptanceIp,
      userAgent,
    })

    if (!result.ok) {
      return json({ error: result.error }, result.status)
    }

    const encodedToken = encodeURIComponent(params.token)
    const agreementUrl = `/api/n/${encodedToken}/accept`

    return json(
      {
        ok: true,
        agreementId: result.agreementId,
        acceptedAt: result.acceptedAt,
        transcriptSha256: result.transcriptSha256,
        agreementUrl,
        documentHtml: result.documentHtml,
      },
      200
    )
  } catch {
    return json(
      { error: "No pudimos confirmar el acuerdo. Intentá de nuevo." },
      500
    )
  }
}

export async function handleDebtorAcceptGet({
  request,
  params,
}: {
  request: Request
  params: { token: string }
}): Promise<Response> {
  try {
    const negotiation = await resolveNegotiationByToken(params.token)
    if (!negotiation) {
      return json({ error: "Link de negociación inválido." }, 404)
    }
    if (!hasValidDebtorSessionRequest(request, negotiation.id)) {
      return json(
        { error: "Verificá tu identidad para consultar el acta del acuerdo." },
        401
      )
    }

    const { acceptedAgreement } =
      await getNegotiationOffersForDebtor(negotiation)
    if (!acceptedAgreement) {
      return json(
        {
          error:
            "Esta negociación todavía no tiene un acta de acuerdo generada.",
        },
        404
      )
    }

    const html =
      acceptedAgreement.documentHtml ??
      renderAgreementDocumentHtml({
        organization: {
          name: negotiation.organization.name,
          displayNameForDebtors: negotiation.organization.displayNameForDebtors,
        },
        debtor: {
          fullName: negotiation.debtor.fullName,
          alias: negotiation.debtor.alias,
          groupLabel: negotiation.debtor.groupLabel,
        },
        debt: negotiation.debt,
        offer: {
          id: acceptedAgreement.offerId,
          installments: acceptedAgreement.installments,
          downPaymentCents: acceptedAgreement.downPaymentCents,
          waivedInterestCents: acceptedAgreement.waivedInterestCents,
          totalCents: acceptedAgreement.totalCents,
          schedule: acceptedAgreement.schedule,
          engineVersion: acceptedAgreement.engineVersion,
        },
        evidence: {
          acceptedAt: acceptedAgreement.acceptedAt,
          acceptanceIp: acceptedAgreement.acceptanceIp,
          userAgent: acceptedAgreement.userAgent,
          transcriptSha256: acceptedAgreement.transcriptSha256,
          templateVersion:
            acceptedAgreement.templateVersion || AGREEMENT_TEMPLATE_VERSION,
        },
        policySnapshot: negotiation.policySnapshot,
      })

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
      },
    })
  } catch {
    return json({ error: "No pudimos cargar el acta del acuerdo." }, 500)
  }
}
