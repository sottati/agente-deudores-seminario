import { beforeEach, describe, expect, it, vi } from "vitest"
import { negotiationFixture } from "@/test/negotiation"
import { HUMAN_HANDOFF_MESSAGE } from "@/lib/debtor-chat"
import {
  getDebtorChatState,
  getMessagesSince,
  verifyIdentity,
} from "./debtor-chat"
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

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    const builder = { validator: () => builder, handler: (fn: unknown) => fn }
    return builder
  },
}))
vi.mock("@tanstack/react-start/server", () => ({ setResponseHeader: vi.fn() }))
vi.mock("./db/debtor-access", () => ({
  MAX_VERIFICATION_ATTEMPTS: 5,
  getConversationHistory: vi.fn(),
  getMessagesSinceForDebtor: vi.fn(),
  getNegotiationOffersForDebtor: vi.fn(),
  markNegotiationVerifying: vi.fn(),
  resolveNegotiationByToken: vi.fn(),
  verifyDebtorIdentity: vi.fn(),
}))
vi.mock("./debtor-session", () => ({
  hasValidDebtorSessionCookie: vi.fn(),
  setDebtorSessionCookie: vi.fn(),
}))

describe("getDebtorChatState", () => {
  beforeEach(() => {
    vi.mocked(resolveNegotiationByToken).mockResolvedValue(negotiationFixture())
    vi.mocked(getConversationHistory).mockResolvedValue([])
    vi.mocked(getNegotiationOffersForDebtor).mockResolvedValue({
      proposedOffer: null,
      acceptedAgreement: null,
    })
    vi.mocked(getMessagesSinceForDebtor).mockResolvedValue({
      messages: [],
      nextCursor: null,
    })
    vi.mocked(hasValidDebtorSessionCookie).mockReturnValue(true)
    vi.mocked(markNegotiationVerifying).mockResolvedValue("verifying")
    vi.mocked(verifyDebtorIdentity).mockResolvedValue({ ok: true })
  })

  it.each([
    { status: "active" as const, expiresAt: "2020-01-01T00:00:00Z" },
    { status: "expired" as const },
    { status: "locked" as const },
  ])(
    "no consulta ni devuelve el historial con acceso revocado: %j",
    async (overrides) => {
      vi.mocked(resolveNegotiationByToken).mockResolvedValue(
        negotiationFixture(overrides)
      )
      const state = await getDebtorChatState({ data: { token: "old-link" } })
      expect(state.found && state.messages).toEqual([])
      expect(getConversationHistory).not.toHaveBeenCalled()
    }
  )

  it("sin cookie de sesión verificada, no consulta el historial y pasa a verifying", async () => {
    vi.mocked(hasValidDebtorSessionCookie).mockReturnValue(false)
    const state = await getDebtorChatState({ data: { token: "unverified" } })
    expect(state.found).toBe(true)
    if (state.found) {
      expect(state.verified).toBe(false)
      expect(state.status).toBe("verifying")
      expect(state.remainingAttempts).toBe(MAX_VERIFICATION_ATTEMPTS)
      expect(state.messages).toEqual([])
      expect(state.disclosure).toBe("")
    }
    expect(markNegotiationVerifying).toHaveBeenCalledTimes(1)
    expect(getConversationHistory).not.toHaveBeenCalled()
  })

  it("conserva IDs y muestra la derivación hecha por una tool, sin avisos internos duplicados", async () => {
    vi.mocked(getConversationHistory).mockResolvedValue([
      {
        id: "internal",
        role: "system",
        parts: [{ type: "text", text: "Aviso interno" }],
        created_at: "2026-01-01",
      },
      {
        id: "handoff",
        role: "agent",
        parts: [
          {
            type: "tool-escalate_to_human",
            state: "output-available",
            output: { escalated: true },
          },
        ],
        created_at: "2026-01-01",
      },
    ])
    const state = await getDebtorChatState({ data: { token: "valid-link" } })
    expect(state.found && state.messages).toEqual([
      {
        id: "handoff",
        role: "agent",
        text: HUMAN_HANDOFF_MESSAGE,
        createdAt: "2026-01-01",
      },
    ])
  })

  it("emite la cookie de sesión firmada cuando verifyIdentity tiene éxito", async () => {
    const result = await verifyIdentity({
      data: { token: "valid-link", dniLast3: "123" },
    })
    expect(result).toEqual({ ok: true })
    expect(setDebtorSessionCookie).toHaveBeenCalledWith(negotiationFixture().id)
  })

  it("getMessagesSince devuelve solo mensajes nuevos cuando la sesión está verificada", async () => {
    vi.mocked(getMessagesSinceForDebtor).mockResolvedValue({
      messages: [
        {
          id: "admin-msg-1",
          role: "admin",
          parts: [{ type: "text", text: "Mensaje de la administración" }],
          created_at: "2026-01-02T10:00:00Z",
        },
      ],
      nextCursor: "2026-01-02T10:00:00Z",
    })
    const result = await getMessagesSince({
      data: { token: "valid-link", cursor: "2026-01-01T10:00:00Z" },
    })
    expect(result).toMatchObject({
      found: true,
      verified: true,
      nextCursor: "2026-01-02T10:00:00Z",
      messages: [
        {
          id: "admin-msg-1",
          role: "admin",
          text: "Mensaje de la administración",
          createdAt: "2026-01-02T10:00:00Z",
        },
      ],
    })
  })
})
