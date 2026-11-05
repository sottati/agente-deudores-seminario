import { beforeEach, describe, expect, it, vi } from "vitest"
import { negotiationFixture } from "@/test/negotiation"
import { HUMAN_HANDOFF_MESSAGE } from "@/lib/debtor-chat"
import { getDebtorChatState } from "./debtor-chat"
import {
  getConversationHistory,
  resolveNegotiationByToken,
} from "./db/debtor-access"

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    const builder = { validator: () => builder, handler: (fn: unknown) => fn }
    return builder
  },
}))
vi.mock("@tanstack/react-start/server", () => ({ setResponseHeader: vi.fn() }))
vi.mock("./db/debtor-access", () => ({
  getConversationHistory: vi.fn(),
  resolveNegotiationByToken: vi.fn(),
}))

describe("getDebtorChatState", () => {
  beforeEach(() => {
    vi.mocked(resolveNegotiationByToken).mockResolvedValue(negotiationFixture())
    vi.mocked(getConversationHistory).mockResolvedValue([])
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
      { id: "handoff", role: "agent", text: HUMAN_HANDOFF_MESSAGE },
    ])
  })
})
