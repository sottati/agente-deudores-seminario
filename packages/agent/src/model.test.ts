import { afterEach, describe, expect, it, vi } from "vitest"
import { createConfiguredModel } from "./model"
import { runNegotiationTurn } from "./index"

afterEach(() => vi.unstubAllGlobals())

describe("configuración del proveedor", () => {
  it.each([
    {},
    { AI_MODEL: "test/model", AI_PROVIDER: "unknown" },
    { AI_MODEL: "test/model", AI_PROVIDER: "openrouter" },
    { AI_MODEL: "test/model", AI_PROVIDER: "gateway" },
  ])(
    "rechaza configuración incompleta sin cambiar de proveedor silenciosamente: %j",
    (env) => {
      expect(() => createConfiguredModel(env)).toThrow()
    }
  )

  it("mantiene gateway como proveedor predeterminado", () => {
    const model = createConfiguredModel({
      AI_MODEL: "test/model",
      AI_GATEWAY_API_KEY: "test-key",
    })
    expect(model.modelId).toBe("test/model")
    expect(model.provider).toContain("gateway")
  })

  it("OpenRouter ejecuta una tool y continúa la respuesta por streaming con el agente real", async () => {
    const calls: Array<{
      url: string
      body: {
        messages: Array<{ role: string; content?: string }>
        tools: unknown[]
      }
    }> = []
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL, init: RequestInit) => {
        expect(new Headers(init.headers).get("authorization")).toBe(
          "Bearer openrouter-test-key"
        )
        calls.push({ url: String(input), body: JSON.parse(String(init.body)) })
        const first = calls.length === 1
        const delta = first
          ? {
              role: "assistant",
              tool_calls: [
                {
                  index: 0,
                  id: "call-summary",
                  type: "function",
                  function: { name: "get_debt_summary", arguments: "{}" },
                },
              ],
            }
          : { role: "assistant", content: "El total de la deuda es $105." }
        const chunks = [
          {
            id: "completion",
            model: "test/model",
            choices: [{ index: 0, delta, finish_reason: null }],
          },
          {
            id: "completion",
            model: "test/model",
            choices: [
              {
                index: 0,
                delta: {},
                finish_reason: first ? "tool_calls" : "stop",
              },
            ],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 5,
              total_tokens: 15,
            },
          },
        ]
        return new Response(
          chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("") +
            "data: [DONE]\n\n",
          { headers: { "Content-Type": "text/event-stream" } }
        )
      })
    )
    const result = await runNegotiationTurn({
      model: createConfiguredModel({
        AI_PROVIDER: "openrouter",
        AI_MODEL: "test/model",
        OPENROUTER_API_KEY: "openrouter-test-key",
      }),
      negotiation: {
        id: "test",
        organization: { displayNameForDebtors: "Administración" },
        debtor: { alias: "Unidad" },
        debt: {
          concept: "Expensas",
          dueDate: "2026-01-01",
          principalCents: 10000,
          interestCents: 500,
        },
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
      },
      lastMessage: "¿Cuánto debo?",
      persistence: { saveOffer: vi.fn(), escalate: vi.fn(), logEvent: vi.fn() },
    })
    const stream = await result.toUIMessageStreamResponse().text()
    expect(stream).toContain("El total de la deuda es $105.")
    expect(calls).toHaveLength(2)
    expect(calls[0]?.url).toBe("https://openrouter.ai/api/v1/chat/completions")
    expect(calls[0]?.body.tools).toHaveLength(5)
    const toolResult = calls[1]?.body.messages.find(
      (message) => message.role === "tool"
    )
    expect(toolResult?.content).toContain('"totalCents":10500')
  })
})
