import "@tanstack/react-start/server-only"
import { getCookie, setCookie } from "@tanstack/react-start/server"

import {
  DEBTOR_SESSION_COOKIE_NAME,
  DEBTOR_SESSION_TTL_SECONDS,
  readCookieFromHeader,
  signDebtorSessionToken,
  verifyDebtorSessionToken,
} from "./debtor-session-token"

export {
  DEBTOR_SESSION_COOKIE_NAME,
  DEBTOR_SESSION_TTL_SECONDS,
  readCookieFromHeader,
  signDebtorSessionToken,
  verifyDebtorSessionToken,
}
export type { DebtorSessionPayload } from "./debtor-session-token"

/**
 * Emite la cookie `httpOnly` firmada para la negociación verificada en el
 * contexto de un server function / handler de TanStack Start.
 */
export function setDebtorSessionCookie(negotiationId: string): void {
  const token = signDebtorSessionToken(negotiationId)
  setCookie(DEBTOR_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEBTOR_SESSION_TTL_SECONDS,
  })
}

/**
 * Verifica si la request actual (server function) tiene una cookie válida para
 * `expectedNegotiationId`.
 */
export function hasValidDebtorSessionCookie(
  expectedNegotiationId: string
): boolean {
  const raw = getCookie(DEBTOR_SESSION_COOKIE_NAME)
  return verifyDebtorSessionToken(raw, expectedNegotiationId) !== null
}

/**
 * Verifica si un `Request` HTTP estándar (ej. `POST /api/n/$token/chat`)
 * incluye una cookie de sesión válida para `expectedNegotiationId`.
 */
export function hasValidDebtorSessionRequest(
  request: Request,
  expectedNegotiationId: string
): boolean {
  const raw = readCookieFromHeader(
    request.headers.get("cookie"),
    DEBTOR_SESSION_COOKIE_NAME
  )
  return verifyDebtorSessionToken(raw, expectedNegotiationId) !== null
}
