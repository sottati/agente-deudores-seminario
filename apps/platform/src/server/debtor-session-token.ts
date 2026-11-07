import { createHmac, timingSafeEqual } from "node:crypto"

// ---------------------------------------------------------------------------
// Funciones puras de firma y verificación de la cookie de sesión del deudor
// (PLAN_BACKEND D4, §3.3-7). Separadas de `@tanstack/react-start/server` para
// poder testearse en forma unitaria sin entorno HTTP.
// ---------------------------------------------------------------------------

export const DEBTOR_SESSION_COOKIE_NAME = "pacta_debtor_session"
export const DEBTOR_SESSION_TTL_SECONDS = 2 * 60 * 60 // 2 horas

export type DebtorSessionPayload = {
  negotiationId: string
  /** Timestamp Unix en segundos cuando vence la sesión. */
  exp: number
}

function getSigningSecret(explicitSecret?: string): string {
  const secret = explicitSecret ?? process.env.NEGOTIATION_TOKEN_SECRET
  if (!secret) {
    throw new Error(
      "Falta NEGOTIATION_TOKEN_SECRET. Revisá apps/platform/.env.local (ver .env.example)."
    )
  }
  return secret
}

function computeHmacBase64Url(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url")
}

/**
 * Crea el valor firmado `<payloadBase64Url>.<signatureBase64Url>` para la
 * cookie de sesión del deudor.
 */
export function signDebtorSessionToken(
  negotiationId: string,
  options?: {
    nowMs?: number
    ttlSeconds?: number
    secret?: string
  }
): string {
  const secret = getSigningSecret(options?.secret)
  const nowSec = Math.floor((options?.nowMs ?? Date.now()) / 1000)
  const ttl = options?.ttlSeconds ?? DEBTOR_SESSION_TTL_SECONDS
  const payload: DebtorSessionPayload = {
    negotiationId,
    exp: nowSec + ttl,
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  )
  const signature = computeHmacBase64Url(encodedPayload, secret)
  return `${encodedPayload}.${signature}`
}

/**
 * Verifica la firma HMAC, la expiración y que el `negotiationId` coincida con
 * la negociación esperada. Devuelve el payload si es válido o `null` si no.
 */
export function verifyDebtorSessionToken(
  cookieValue: string | undefined | null,
  expectedNegotiationId: string,
  options?: {
    nowMs?: number
    secret?: string
  }
): DebtorSessionPayload | null {
  if (!cookieValue || typeof cookieValue !== "string") return null

  const parts = cookieValue.split(".")
  if (parts.length !== 2) return null
  const [encodedPayload, providedSignature] = parts
  if (!encodedPayload || !providedSignature) return null

  let secret: string
  try {
    secret = getSigningSecret(options?.secret)
  } catch {
    return null
  }

  const expectedSignature = computeHmacBase64Url(encodedPayload, secret)
  const providedBuf = Buffer.from(providedSignature, "utf8")
  const expectedBuf = Buffer.from(expectedSignature, "utf8")

  if (
    providedBuf.length !== expectedBuf.length ||
    !timingSafeEqual(providedBuf, expectedBuf)
  ) {
    return null
  }

  let parsed: unknown
  try {
    const json = Buffer.from(encodedPayload, "base64url").toString("utf8")
    parsed = JSON.parse(json)
  } catch {
    return null
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    typeof (parsed as { negotiationId?: unknown }).negotiationId !== "string" ||
    typeof (parsed as { exp?: unknown }).exp !== "number"
  ) {
    return null
  }

  const payload = parsed as DebtorSessionPayload
  if (payload.negotiationId !== expectedNegotiationId) return null

  const nowSec = Math.floor((options?.nowMs ?? Date.now()) / 1000)
  if (payload.exp <= nowSec) return null

  return payload
}

/** Extrae el valor de una cookie desde el header `Cookie` de un `Request`. */
export function readCookieFromHeader(
  cookieHeader: string | null | undefined,
  name: string
): string | undefined {
  if (!cookieHeader) return undefined
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const eqIdx = trimmed.indexOf("=")
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    if (key !== name) continue
    const rawValue = trimmed.slice(eqIdx + 1).trim()
    try {
      return decodeURIComponent(rawValue)
    } catch {
      return rawValue
    }
  }
  return undefined
}
