import { describe, expect, it } from "vitest"

import {
  DEBTOR_SESSION_COOKIE_NAME,
  DEBTOR_SESSION_TTL_SECONDS,
  readCookieFromHeader,
  signDebtorSessionToken,
  verifyDebtorSessionToken,
} from "./debtor-session-token"

const TEST_SECRET = "test-secret-for-debtor-session-hmac-256"
const NEGOTIATION_A = "a0000000-0000-4000-8000-000000000001"
const NEGOTIATION_B = "a0000000-0000-4000-8000-000000000002"
const FIXED_NOW_MS = Date.parse("2026-11-04T15:00:00Z")

describe("debtor-session-token (D4)", () => {
  it("firma y verifica correctamente un token dentro de su ventana de validez", () => {
    const token = signDebtorSessionToken(NEGOTIATION_A, {
      nowMs: FIXED_NOW_MS,
      secret: TEST_SECRET,
    })

    const verified = verifyDebtorSessionToken(token, NEGOTIATION_A, {
      nowMs: FIXED_NOW_MS + 60_000,
      secret: TEST_SECRET,
    })

    expect(verified).toEqual({
      negotiationId: NEGOTIATION_A,
      exp: Math.floor(FIXED_NOW_MS / 1000) + DEBTOR_SESSION_TTL_SECONDS,
    })
  })

  it("rechaza un token firmado para otra negociación (aislamiento por negociación)", () => {
    const token = signDebtorSessionToken(NEGOTIATION_A, {
      nowMs: FIXED_NOW_MS,
      secret: TEST_SECRET,
    })

    const verified = verifyDebtorSessionToken(token, NEGOTIATION_B, {
      nowMs: FIXED_NOW_MS,
      secret: TEST_SECRET,
    })

    expect(verified).toBeNull()
  })

  it("rechaza un token vencido", () => {
    const token = signDebtorSessionToken(NEGOTIATION_A, {
      nowMs: FIXED_NOW_MS,
      ttlSeconds: 300,
      secret: TEST_SECRET,
    })

    const verified = verifyDebtorSessionToken(token, NEGOTIATION_A, {
      nowMs: FIXED_NOW_MS + 301_000,
      secret: TEST_SECRET,
    })

    expect(verified).toBeNull()
  })

  it("rechaza un token con firma adulterada o firmado con otro secreto", () => {
    const token = signDebtorSessionToken(NEGOTIATION_A, {
      nowMs: FIXED_NOW_MS,
      secret: TEST_SECRET,
    })

    const [payload] = token.split(".")
    const tampered = `${payload}.firma-invalida`

    expect(
      verifyDebtorSessionToken(tampered, NEGOTIATION_A, {
        nowMs: FIXED_NOW_MS,
        secret: TEST_SECRET,
      })
    ).toBeNull()

    expect(
      verifyDebtorSessionToken(token, NEGOTIATION_A, {
        nowMs: FIXED_NOW_MS,
        secret: "otro-secreto-distinto",
      })
    ).toBeNull()
  })

  it("extrae correctamente la cookie desde el header Cookie", () => {
    const header = `foo=bar; ${DEBTOR_SESSION_COOKIE_NAME}=abc.def; theme=dark`
    expect(readCookieFromHeader(header, DEBTOR_SESSION_COOKIE_NAME)).toBe(
      "abc.def"
    )
    expect(readCookieFromHeader(header, "inexistente")).toBeUndefined()
    expect(
      readCookieFromHeader(null, DEBTOR_SESSION_COOKIE_NAME)
    ).toBeUndefined()
  })
})
