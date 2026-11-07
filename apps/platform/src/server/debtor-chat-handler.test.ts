import { beforeEach, describe, expect, it, vi } from "vitest"
import { DefaultChatTransport, readUIMessageStream } from "ai"
import { MockLanguageModelV4, simulateReadableStream } from "ai/test"
import { negotiationFixture } from "@/test/negotiation"
import { HUMAN_HANDOFF_MESSAGE, messagePartsToText } from "@/lib/debtor-chat"
import type { DebtorUIMessage } from "@/lib/debtor-chat"
import {
  GUARDRAIL_SAFE_FALLBACK_MESSAGE,
  MAX_TURNS_PER_NEGOTIATION,
} from "@agente/agent"
import { createConfiguredModel } from "@agente/agent/model"
import { handleDebtorChat } from "./debtor-chat-handler"
import * as access from "./db/debtor-access"
import * as debtorSession from "./debtor-session"

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@agente/agent/model", () => ({ createConfiguredModel: vi.fn() }))
vi.mock("./debtor-session", () => ({
  hasValidDebtorSessionRequest: vi.fn(),
}))
vi.mock("./db/debtor-access", () => ({
  resolveNegotiationByToken: vi.fn(),
  getConversationHistory: vi.fn(),
  claimNegotiationTurn: vi.fn(),
  releaseNegotiationTurn: vi.fn(),
  createNegotiationPersistence: vi.fn(),
  getNegotiationAccessState: vi.fn(),
  persistAgentResponse: vi.fn(),
  toAgentContext: (n: ReturnType<typeof negotiationFixture>) => ({
    id: n.id,
    organization: n.organization,
    debtor: n.debtor,
    debt: n.debt,
    policy: {
      maxInstallments: 3,
      minDownPaymentPct: 20,
      minInstallmentAmountCents: 100,
      maxInterestWaiverPct: 50,
      singlePaymentInterestWaiverPct: 100,
      maxPrincipalDiscountPct: 0,
      maxFirstDueDays: 15,
      offerValidityHours: 72,
      escalateAboveAmountCents: null,
    },
  }),
}))

const messageId = "40000000-0000-4000-8000-000000000001"
function request(text = "Hola", role = "user") {
  return new Request("https://pacta.test/api/n/example/chat", {
    method: "POST",
    body: JSON.stringify({
      messages: [{ id: messageId, role, parts: [{ type: "text", text }] }],
    }),
  })
}

describe("endpoint del chat", () => {
  beforeEach(() => {
    vi.mocked(debtorSession.hasValidDebtorSessionRequest).mockReturnValue(true)
    vi.mocked(access.resolveNegotiationByToken).mockResolvedValue(
      negotiationFixture()
    )
    vi.mocked(access.getConversationHistory).mockResolvedValue([])
    vi.mocked(access.claimNegotiationTurn).mockImplementation(
      async (n, _id, _parts, human) => {
        n.updatedAt = "2026-11-04T00:00:00.001Z"
        n.turnId = "50000000-0000-4000-8000-000000000001"
        if (human) n.status = "escalated"
        else if (n.status === "pending") n.status = "active"
        return true
      }
    )
    vi.mocked(access.releaseNegotiationTurn).mockResolvedValue()
    vi.mocked(access.getNegotiationAccessState).mockImplementation(
      async (n) => ({
        status: n.status,
        expiresAt: n.expiresAt,
        updatedAt: n.updatedAt,
      })
    )
    vi.mocked(access.persistAgentResponse).mockImplementation(async (n) => ({
      status: n.status,
      persisted: true,
    }))
    vi.mocked(access.createNegotiationPersistence).mockImplementation(
      (negotiation) => ({
        saveOffer: vi.fn(),
        logEvent: vi.fn().mockResolvedValue(undefined),
        escalate: vi.fn().mockImplementation(() => {
          negotiation.status = "escalated"
          return Promise.resolve()
        }),
      })
    )
  })

  it.each(["Quiero hablar con una persona", "Quiero hablar con un humano"])(
    "confirma '%s' con SSE y estado autoritativo sin llamar al modelo",
    async (text) => {
      const transport = new DefaultChatTransport<DebtorUIMessage>({
        fetch: async (_url, init) =>
          handleDebtorChat({
            request: new Request("https://pacta.test/chat", init),
            params: { token: "example" },
          }),
      })
      const stream = await transport.sendMessages({
        trigger: "submit-message",
        chatId: "review",
        messageId: undefined,
        abortSignal: undefined,
        messages: [
          { id: messageId, role: "user", parts: [{ type: "text", text }] },
        ],
      })
      let last: DebtorUIMessage | undefined
      for await (const message of readUIMessageStream<DebtorUIMessage>({
        stream,
      }))
        last = message
      expect(last?.parts).toEqual([
        { type: "text", text: HUMAN_HANDOFF_MESSAGE, state: "done" },
      ])
      expect(last?.metadata?.negotiationStatus).toBe("escalated")
      expect(createConfiguredModel).not.toHaveBeenCalled()
      expect(access.persistAgentResponse).toHaveBeenLastCalledWith(
        expect.anything(),
        last?.id,
        [{ type: "text", text: HUMAN_HANDOFF_MESSAGE }]
      )
    }
  )

  it.each([
    null,
    {},
    { messages: [null] },
    { messages: [{ role: "assistant", parts: [] }] },
  ])("rechaza entradas inválidas sin efectos: %j", async (body) => {
    const response = await handleDebtorChat({
      request: new Request("https://pacta.test/chat", {
        method: "POST",
        body: JSON.stringify(body),
      }),
      params: { token: "example" },
    })
    expect(response.status).toBe(400)
    expect(access.claimNegotiationTurn).not.toHaveBeenCalled()
  })

  it("una derivación decidida por el agente conserva la tool y llega al cliente sin texto generado", async () => {
    vi.mocked(createConfiguredModel).mockReturnValue(
      new MockLanguageModelV4({
        doStream: async () => ({
          stream: simulateReadableStream({
            chunks: [
              {
                type: "tool-call",
                toolCallId: "handoff",
                toolName: "escalate_to_human",
                input: JSON.stringify({ reason: "hardship" }),
              },
              {
                type: "finish",
                finishReason: { unified: "tool-calls", raw: "tool_calls" },
                usage: {
                  inputTokens: {
                    total: 1,
                    noCache: 1,
                    cacheRead: 0,
                    cacheWrite: 0,
                  },
                  outputTokens: { total: 1, text: 1, reasoning: 0 },
                },
              },
            ],
          }),
        }),
      })
    )
    const transport = new DefaultChatTransport<DebtorUIMessage>({
      fetch: async (_url, init) =>
        handleDebtorChat({
          request: new Request("https://pacta.test/chat", init),
          params: { token: "example" },
        }),
    })
    const stream = await transport.sendMessages({
      trigger: "submit-message",
      chatId: "review",
      messageId: undefined,
      abortSignal: undefined,
      messages: [
        {
          id: messageId,
          role: "user",
          parts: [
            { type: "text", text: "No puedo resolverlo con estas opciones" },
          ],
        },
      ],
    })
    let last: DebtorUIMessage | undefined
    for await (const message of readUIMessageStream<DebtorUIMessage>({
      stream,
    }))
      last = message
    expect(last?.metadata?.negotiationStatus).toBe("escalated")
    expect(messagePartsToText(last?.parts)).toBe(HUMAN_HANDOFF_MESSAGE)
    expect(access.persistAgentResponse).toHaveBeenLastCalledWith(
      expect.anything(),
      last?.id,
      expect.arrayContaining([
        expect.objectContaining({
          type: "tool-escalate_to_human",
          state: "output-available",
        }),
      ])
    )
  })

  it("un request que pierde la reserva devuelve 409 antes de ejecutar el modelo", async () => {
    const model = new MockLanguageModelV4()
    vi.mocked(createConfiguredModel).mockReturnValue(model)
    vi.mocked(access.claimNegotiationTurn).mockResolvedValue(false)
    const response = await handleDebtorChat({
      request: request(),
      params: { token: "example" },
    })
    expect(response.status).toBe(409)
    expect(model.doStreamCalls).toHaveLength(0)
    expect(access.getConversationHistory).not.toHaveBeenCalled()
    expect(access.persistAgentResponse).not.toHaveBeenCalled()
  })

  it("no persiste mensajes si falta la configuración del proveedor", async () => {
    vi.mocked(createConfiguredModel).mockImplementation(() => {
      throw new Error("missing key")
    })
    const response = await handleDebtorChat({
      request: request(),
      params: { token: "example" },
    })
    expect(response.status).toBe(503)
    expect(access.claimNegotiationTurn).not.toHaveBeenCalled()
  })

  it.each(["escalated", "expired", "locked"] as const)(
    "detiene una respuesta lenta si la negociación cambia a %s mientras el proveedor espera",
    async (status) => {
      let release!: () => void
      let notify!: () => void
      const ready = new Promise<void>((resolve) => {
        notify = resolve
      })
      const gate = new Promise<void>((resolve) => {
        release = resolve
      })
      vi.mocked(createConfiguredModel).mockReturnValue(
        new MockLanguageModelV4({
          doStream: async () => {
            notify()
            await gate
            return {
              stream: simulateReadableStream({
                chunks: [
                  { type: "text-start", id: "late" },
                  {
                    type: "text-delta",
                    id: "late",
                    delta: "Respuesta que llegó tarde",
                  },
                  { type: "text-end", id: "late" },
                  {
                    type: "finish",
                    finishReason: { unified: "stop", raw: "stop" },
                    usage: {
                      inputTokens: {
                        total: 1,
                        noCache: 1,
                        cacheRead: 0,
                        cacheWrite: 0,
                      },
                      outputTokens: { total: 1, text: 1, reasoning: 0 },
                    },
                  },
                ],
              }),
            }
          },
        })
      )
      const response = await handleDebtorChat({
        request: request(),
        params: { token: "example" },
      })
      const bodyPromise = response.text()
      await ready
      vi.mocked(access.getNegotiationAccessState).mockResolvedValue({
        status,
        expiresAt: negotiationFixture().expiresAt,
        updatedAt: "2026-11-04T00:00:01Z",
      })
      release()
      const body = await bodyPromise
      expect(body).not.toContain("Respuesta que llegó tarde")
      expect(body).toContain(`"negotiationStatus":"${status}"`)
      expect(body).toContain('"type":"abort"')
      expect(access.persistAgentResponse).not.toHaveBeenCalled()
      expect(access.claimNegotiationTurn).toHaveBeenCalledTimes(1)
    }
  )

  it.each([
    { overrides: { expiresAt: "2020-01-01" }, expected: 410 },
    { overrides: { status: "expired" as const }, expected: 410 },
    { overrides: { status: "locked" as const }, expected: 409 },
    { overrides: { status: "escalated" as const }, expected: 409 },
  ])(
    "rechaza accesos vencidos o estados terminales: %j",
    async ({ overrides, expected }) => {
      vi.mocked(access.resolveNegotiationByToken).mockResolvedValue(
        negotiationFixture(overrides)
      )
      const response = await handleDebtorChat({
        request: request(),
        params: { token: "example" },
      })
      expect(response.status).toBe(expected)
      expect(access.claimNegotiationTurn).not.toHaveBeenCalled()
    }
  )

  it("rechaza con 401 si no hay cookie de sesión verificada del deudor", async () => {
    vi.mocked(debtorSession.hasValidDebtorSessionRequest).mockReturnValue(false)
    const response = await handleDebtorChat({
      request: request(),
      params: { token: "example" },
    })
    expect(response.status).toBe(401)
    expect(access.claimNegotiationTurn).not.toHaveBeenCalled()
  })

  it("reserva antes de cargar el historial y persiste la respuesta completa con ID estable", async () => {
    vi.mocked(createConfiguredModel).mockReturnValue(
      new MockLanguageModelV4({
        doStream: async () => ({
          stream: simulateReadableStream({
            chunks: [
              { type: "text-start", id: "t1" },
              { type: "text-delta", id: "t1", delta: "Hola, te ayudo." },
              { type: "text-end", id: "t1" },
              {
                type: "finish",
                finishReason: { unified: "stop", raw: "stop" },
                usage: {
                  inputTokens: {
                    total: 1,
                    noCache: 1,
                    cacheRead: 0,
                    cacheWrite: 0,
                  },
                  outputTokens: { total: 1, text: 1, reasoning: 0 },
                },
              },
            ],
          }),
        }),
      })
    )
    const response = await handleDebtorChat({
      request: request(),
      params: { token: "example" },
    })
    expect(response.headers.get("content-type")).toContain("text/event-stream")
    const body = await response.text()
    expect(body).toContain("Hola, te ayudo.")
    expect(
      vi.mocked(access.claimNegotiationTurn).mock.invocationCallOrder[0]
    ).toBeLessThan(
      vi.mocked(access.getConversationHistory).mock.invocationCallOrder[0]
    )
    expect(access.persistAgentResponse).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.stringMatching(/^[a-f\d-]{36}$/),
      expect.arrayContaining([
        expect.objectContaining({ type: "text", text: "Hola, te ayudo." }),
      ])
    )
  })

  it("reemplaza el texto persistido y registra guardrail_violation si el modelo menciona cifras inventadas", async () => {
    const logEvent = vi.fn().mockResolvedValue(undefined)
    vi.mocked(access.createNegotiationPersistence).mockImplementation(
      (negotiation) => ({
        saveOffer: vi.fn(),
        logEvent,
        escalate: vi.fn().mockImplementation(() => {
          negotiation.status = "escalated"
          return Promise.resolve()
        }),
      })
    )
    vi.mocked(createConfiguredModel).mockReturnValue(
      new MockLanguageModelV4({
        doStream: async () => ({
          stream: simulateReadableStream({
            chunks: [
              { type: "text-start", id: "t1" },
              {
                type: "text-delta",
                id: "t1",
                delta: "Te hago un descuento del 95% y pagás solo $ 12.345.",
              },
              { type: "text-end", id: "t1" },
              {
                type: "finish",
                finishReason: { unified: "stop", raw: "stop" },
                usage: {
                  inputTokens: {
                    total: 1,
                    noCache: 1,
                    cacheRead: 0,
                    cacheWrite: 0,
                  },
                  outputTokens: { total: 1, text: 1, reasoning: 0 },
                },
              },
            ],
          }),
        }),
      })
    )

    const response = await handleDebtorChat({
      request: request("¿Qué descuento me hacés?"),
      params: { token: "example" },
    })
    await response.text()

    expect(logEvent).toHaveBeenCalledWith(
      "guardrail_violation",
      expect.objectContaining({
        reason: "number_mismatch",
      })
    )
    expect(access.persistAgentResponse).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.stringMatching(/^[a-f\d-]{36}$/),
      expect.arrayContaining([
        { type: "text", text: GUARDRAIL_SAFE_FALLBACK_MESSAGE },
      ])
    )
  })

  it("escala automáticamente la negociación cuando se supera MAX_TURNS_PER_NEGOTIATION", async () => {
    const logEvent = vi.fn().mockResolvedValue(undefined)
    const escalate = vi.fn().mockResolvedValue(undefined)
    vi.mocked(access.createNegotiationPersistence).mockImplementation(() => ({
      saveOffer: vi.fn(),
      logEvent,
      escalate,
    }))
    vi.mocked(access.getConversationHistory).mockResolvedValue(
      Array.from({ length: MAX_TURNS_PER_NEGOTIATION + 1 }, (_, idx) => ({
        id: idx === MAX_TURNS_PER_NEGOTIATION ? messageId : `msg-${idx}`,
        role: "debtor" as const,
        parts: [{ type: "text", text: `Mensaje ${idx + 1}` }],
        created_at: "2026-11-04T00:00:00Z",
      }))
    )

    const model = new MockLanguageModelV4()
    vi.mocked(createConfiguredModel).mockReturnValue(model)

    const response = await handleDebtorChat({
      request: request("Un mensaje más"),
      params: { token: "example" },
    })
    const body = await response.text()

    expect(body).toContain(HUMAN_HANDOFF_MESSAGE)
    expect(escalate).toHaveBeenCalledWith("max_turns_exceeded")
    expect(logEvent).toHaveBeenCalledWith(
      "escalated",
      expect.objectContaining({
        reason: "max_turns_exceeded",
        max_turns: MAX_TURNS_PER_NEGOTIATION,
      })
    )
    expect(model.doStreamCalls).toHaveLength(0)
  })
})
