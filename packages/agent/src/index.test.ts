import type {
  EvaluatedOffer,
  NegotiationPolicy,
} from "@agente/negotiation-engine"
import type { ToolExecutionOptions } from "ai"
import { MockLanguageModelV4, simulateReadableStream } from "ai/test"
import { describe, expect, it, vi } from "vitest"

import {
  MAX_STEPS_PER_TURN,
  SYSTEM_PROMPT_VERSION,
  buildBotDisclosureMessage,
  buildSystemPrompt,
  createNegotiationTools,
  isHumanHandoffKeyword,
  normalizeNegotiationMessages,
  runNegotiationTurn,
} from "./index"
import type {
  AgentAuditEventType,
  AgentNegotiationContext,
  AgentPersistence,
} from "./index"

const FIXED_NOW = new Date("2026-10-30T15:00:00.000Z")

const samplePolicy: NegotiationPolicy = {
  maxInstallments: 3,
  minDownPaymentPct: 30,
  minInstallmentAmountCents: 2_000_000, // $ 20.000
  maxInterestWaiverPct: 50,
  singlePaymentInterestWaiverPct: 100,
  maxPrincipalDiscountPct: 0,
  maxFirstDueDays: 15,
  offerValidityHours: 72,
  escalateAboveAmountCents: 150_000_000, // $ 1.500.000
  tone: "empatico_formal",
  customInstructions:
    "Recordar que el pago se realiza por transferencia a la cuenta del consorcio.",
}

const sampleNegotiation: AgentNegotiationContext = {
  id: "a0000000-0000-4000-8000-000000000001",
  organization: {
    displayNameForDebtors: "Administración Consorcios del Sur",
    kind: "consorcio",
  },
  debtor: {
    alias: "Unidad 4B",
    groupLabel: "Torre Jacarandá",
  },
  debt: {
    concept: "Expensas ordinarias junio a agosto 2026",
    dueDate: "2026-08-10",
    principalCents: 15_800_000, // $ 158.000
    interestCents: 2_840_000, // $ 28.400
  },
  policy: samplePolicy,
}

function createMockPersistence() {
  const events: Array<{
    type: AgentAuditEventType
    payload: Record<string, unknown>
  }> = []
  const savedOffers: Array<{ id: string; offer: EvaluatedOffer }> = []
  const escalations: string[] = []

  const persistence: AgentPersistence = {
    saveOffer: vi.fn(async (offer: EvaluatedOffer) => {
      const id = `offer-${savedOffers.length + 1}`
      savedOffers.push({ id, offer })
      return { id }
    }),
    escalate: vi.fn(async (reason: string) => {
      escalations.push(reason)
    }),
    logEvent: vi.fn(
      async (type: AgentAuditEventType, payload: Record<string, unknown>) => {
        events.push({ type, payload })
      }
    ),
  }

  return { persistence, events, savedOffers, escalations }
}

const mockUsage = {
  inputTokens: {
    total: 50,
    noCache: 50,
    cacheRead: 0,
    cacheWrite: 0,
  },
  outputTokens: {
    total: 25,
    text: 25,
    reasoning: 0,
  },
}

describe("@agente/agent", () => {
  describe("buildSystemPrompt & bot disclosure", () => {
    it("incluye la versión del prompt, el nombre de la organización, el alias y los guardrails sin exponer PII", () => {
      const prompt = buildSystemPrompt(sampleNegotiation)

      expect(prompt).toContain(SYSTEM_PROMPT_VERSION)
      expect(prompt).toContain("Administración Consorcios del Sur")
      expect(prompt).toContain("Unidad 4B (Torre Jacarandá)")
      expect(prompt).toContain("Regla D7")
      expect(prompt).toContain("propose_offer")
      expect(prompt).toContain("escalate_to_human")
      expect(prompt).toContain(
        "Recordar que el pago se realiza por transferencia a la cuenta del consorcio."
      )
      // No contiene campos de nombre completo ni DNI
      expect(prompt).not.toContain("full_name")
      expect(prompt).not.toContain("verification_hash")
    })

    it("adapta las instrucciones según el tono y el tipo de organización (colegio)", () => {
      const prompt = buildSystemPrompt({
        organization: {
          displayNameForDebtors: "Colegio San Martín",
          kind: "colegio",
        },
        debtor: {
          alias: "Familia Pereyra",
        },
        policy: {
          ...samplePolicy,
          tone: "neutral",
          customInstructions: null,
        },
      })

      expect(prompt).toContain("Colegio San Martín")
      expect(prompt).toContain("colegio privado")
      expect(prompt).toContain("tono neutral, objetivo, conciso y directo")
      expect(prompt).not.toContain(
        "Instrucciones adicionales de la administración"
      )
    })

    it("construye el mensaje determinístico de bot disclosure y detecta pedidos de humano", () => {
      const disclosure = buildBotDisclosureMessage(
        "Administración Consorcios del Sur"
      )
      expect(disclosure).toContain("asistente virtual automatizado de pacta.ia")
      expect(disclosure).toContain("Administración Consorcios del Sur")
      expect(disclosure).toContain("hablar con una persona")

      expect(isHumanHandoffKeyword("Quiero hablar con una persona")).toBe(true)
      expect(isHumanHandoffKeyword("prefiero hablar con un humano")).toBe(true)
      expect(isHumanHandoffKeyword("derivame con la administración")).toBe(true)
      expect(isHumanHandoffKeyword("¿Lo puedo pagar en 3 cuotas?")).toBe(false)
    })
  })

  describe("createNegotiationTools (ejecución directa de tools)", () => {
    async function execTool<TInput, TOutput>(
      toolObj: {
        execute?: (
          input: TInput,
          options: ToolExecutionOptions<never>
        ) => PromiseLike<TOutput> | TOutput | AsyncIterable<TOutput>
      },
      input: TInput,
      toolCallId: string
    ): Promise<TOutput> {
      const out = await toolObj.execute!(input, {
        toolCallId,
        messages: [],
        context: undefined as never,
      })
      if (
        out !== null &&
        typeof out === "object" &&
        Symbol.asyncIterator in out
      ) {
        throw new Error("Unexpected AsyncIterable tool output")
      }
      return out as TOutput
    }

    it("get_debt_summary devuelve capital, intereses, total, concepto y alias (sin PII)", async () => {
      const { persistence } = createMockPersistence()
      const tools = createNegotiationTools({
        negotiation: sampleNegotiation,
        persistence,
        now: FIXED_NOW,
      })

      const summary = await execTool(tools.get_debt_summary, {}, "tc-1")

      expect(summary).toEqual({
        debtorAlias: "Unidad 4B",
        groupLabel: "Torre Jacarandá",
        organizationDisplayName: "Administración Consorcios del Sur",
        concept: "Expensas ordinarias junio a agosto 2026",
        dueDate: "2026-08-10",
        principalCents: 15_800_000,
        interestCents: 2_840_000,
        totalCents: 18_640_000,
        formatted: {
          principal: expect.stringContaining("158.000"),
          interest: expect.stringContaining("28.400"),
          total: expect.stringContaining("186.400"),
        },
      })
    })

    it("get_negotiation_options devuelve los límites de la política y el detalle de cada plan", async () => {
      const { persistence } = createMockPersistence()
      const tools = createNegotiationTools({
        negotiation: sampleNegotiation,
        persistence,
        now: FIXED_NOW,
      })

      const options = await execTool(tools.get_negotiation_options, {}, "tc-2")

      expect(options.summary.maxInstallments).toBe(3)
      expect(options.summary.allowedInstallments).toEqual([1, 2, 3])
      expect(options.summary.singlePaymentInterestWaiverPct).toBe(100)
      expect(options.summary.maxInterestWaiverPct).toBe(50)
      expect(options.plans).toHaveLength(3)

      // Plan 1 cuota: quita 100 % de intereses → total = $ 158.000
      expect(options.plans[0]).toMatchObject({
        installments: 1,
        label: "Pago único",
        totalCents: 15_800_000,
        waivedInterestCents: 2_840_000,
      })

      // Plan 3 cuotas: quita 50 % de intereses → total = $ 172.200
      expect(options.plans[2]).toMatchObject({
        installments: 3,
        label: "3 cuotas",
        totalCents: 17_220_000,
        waivedInterestCents: 1_420_000,
      })
    })

    it("simulate_plan devuelve ok=true cuando el plan está dentro de la política y no loguea eventos de rechazo", async () => {
      const { persistence, events } = createMockPersistence()
      const tools = createNegotiationTools({
        negotiation: sampleNegotiation,
        persistence,
        now: FIXED_NOW,
      })

      const res = await execTool(
        tools.simulate_plan,
        { installments: 2 },
        "tc-3"
      )

      expect(res.ok).toBe(true)
      if (res.ok) {
        expect(res.offer.installments).toBe(2)
        expect(res.offer.totalCents).toBe(17_220_000)
        expect(res.offer.schedule).toHaveLength(2)
      }
      expect(events).toHaveLength(0)
    })

    it("simulate_plan registra out_of_policy_request y devuelve closestValidOffer cuando piden más cuotas que el máximo", async () => {
      const { persistence, events } = createMockPersistence()
      const tools = createNegotiationTools({
        negotiation: sampleNegotiation,
        persistence,
        now: FIXED_NOW,
      })

      const res = await execTool(
        tools.simulate_plan,
        { installments: 12 },
        "tc-4"
      )

      expect(res.ok).toBe(false)
      if (!res.ok) {
        expect(res.reason).toBe("installments_exceed_max")
        expect(res.closestValidOffer?.installments).toBe(3)
        expect(res.closestValidOffer?.totalCents).toBe(17_220_000)
        expect(res.shouldSuggestEscalation).toBe(false)
      }

      expect(events).toEqual([
        {
          type: "out_of_policy_request",
          payload: {
            requested_installments: 12,
            requested_down_payment_cents: null,
            requested_first_due_date: null,
            max_installments: 3,
            reason: "installments_exceed_max",
          },
        },
      ])
    })

    it("propose_offer persiste una oferta válida y registra offer_proposed; rechaza sin persistir si está fuera de política", async () => {
      const { persistence, events, savedOffers } = createMockPersistence()
      const tools = createNegotiationTools({
        negotiation: sampleNegotiation,
        persistence,
        now: FIXED_NOW,
      })

      // 1) Intento fuera de política (6 cuotas): NO persiste oferta
      const invalidRes = await execTool(
        tools.propose_offer,
        { installments: 6 },
        "tc-5"
      )
      expect(invalidRes.ok).toBe(false)
      expect(savedOffers).toHaveLength(0)
      expect(events).toHaveLength(1)
      expect(events[0]?.type).toBe("out_of_policy_request")

      // 2) Oferta válida (3 cuotas): persiste y devuelve offerId
      const validRes = await execTool(
        tools.propose_offer,
        { installments: 3 },
        "tc-6"
      )
      expect(validRes.ok).toBe(true)
      if (validRes.ok) {
        expect(validRes.offerId).toBe("offer-1")
        expect(validRes.offer.installments).toBe(3)
        expect(validRes.offer.totalCents).toBe(17_220_000)
      }
      expect(savedOffers).toHaveLength(1)
      expect(events).toHaveLength(2)
      expect(events[1]).toEqual({
        type: "offer_proposed",
        payload: {
          offer_id: "offer-1",
          installments: 3,
          total_cents: 17_220_000,
          down_payment_cents: 5_740_000,
          waived_interest_cents: 1_420_000,
        },
      })
    })

    it("escalate_to_human invoca persistence.escalate y registra el evento", async () => {
      const { persistence, events, escalations } = createMockPersistence()
      const tools = createNegotiationTools({
        negotiation: sampleNegotiation,
        persistence,
        now: FIXED_NOW,
      })

      const res = await execTool(
        tools.escalate_to_human,
        { reason: "debtor_requested_human" },
        "tc-7"
      )

      expect(res.escalated).toBe(true)
      expect(escalations).toEqual(["debtor_requested_human"])
      expect(events).toEqual([
        {
          type: "escalated",
          payload: { reason: "debtor_requested_human" },
        },
      ])
    })
  })

  describe("normalizeNegotiationMessages", () => {
    it("convierte mensajes almacenados en la DB (roles debtor/agent/system con parts) y el último mensaje a ModelMessage[]", async () => {
      const normalized = await normalizeNegotiationMessages(
        [
          {
            role: "system",
            parts: [{ type: "text", text: "Bot disclosure inicial" }],
          },
          {
            role: "debtor",
            parts: [{ type: "text", text: "Hola, quiero ver mi deuda" }],
          },
          {
            role: "agent",
            parts: [{ type: "text", text: "Tenés expensas pendientes." }],
          },
        ],
        "¿Lo puedo pagar en 2 cuotas?"
      )

      expect(normalized).toHaveLength(4)
      expect(normalized[0]?.role).toBe("system")
      expect(normalized[1]?.role).toBe("user")
      expect(normalized[2]?.role).toBe("assistant")
      expect(normalized[3]).toEqual({
        role: "user",
        content: "¿Lo puedo pagar en 2 cuotas?",
      })
    })
  })

  describe("runNegotiationTurn con MockLanguageModelV4", () => {
    it("ejecuta un turno multi-paso (tool call propose_offer → respuesta final) y dispara onFinish", async () => {
      const { persistence, savedOffers, events } = createMockPersistence()
      const onFinish = vi.fn()

      let stepIndex = 0
      const model = new MockLanguageModelV4({
        doStream: async () => {
          stepIndex += 1
          if (stepIndex === 1) {
            return {
              stream: simulateReadableStream({
                chunks: [
                  {
                    type: "tool-call",
                    toolCallId: "call-propose-1",
                    toolName: "propose_offer",
                    input: JSON.stringify({ installments: 2 }),
                  },
                  {
                    type: "finish",
                    finishReason: { unified: "tool-calls", raw: "tool_calls" },
                    usage: mockUsage,
                  },
                ],
              }),
            }
          }

          return {
            stream: simulateReadableStream({
              chunks: [
                { type: "text-start", id: "txt-1" },
                {
                  type: "text-delta",
                  id: "txt-1",
                  delta:
                    "Te dejé la propuesta formal de 2 cuotas por un total de $ 172.200.",
                },
                { type: "text-end", id: "txt-1" },
                {
                  type: "finish",
                  finishReason: { unified: "stop", raw: "stop" },
                  usage: mockUsage,
                },
              ],
            }),
          }
        },
      })

      const turn = await runNegotiationTurn({
        negotiation: sampleNegotiation,
        history: [
          {
            role: "debtor",
            parts: [{ type: "text", text: "Hola, ¿puedo pagar en 2 cuotas?" }],
          },
        ],
        model,
        persistence,
        now: FIXED_NOW,
        onFinish,
      })

      expect(turn.systemPromptVersion).toBe(SYSTEM_PROMPT_VERSION)
      expect(MAX_STEPS_PER_TURN).toBe(5)

      const finalText = await turn.text
      expect(finalText).toContain("$ 172.200")
      expect(savedOffers).toHaveLength(1)
      expect(savedOffers[0]?.offer.installments).toBe(2)
      expect(events).toEqual([
        {
          type: "offer_proposed",
          payload: {
            offer_id: "offer-1",
            installments: 2,
            total_cents: 17_220_000,
            down_payment_cents: 8_610_000,
            waived_interest_cents: 1_420_000,
          },
        },
      ])
      expect(model.doStreamCalls).toHaveLength(2)
      expect(onFinish).toHaveBeenCalledTimes(1)
    })

    it("detiene inmediatamente el loop de pasos cuando se invoca escalate_to_human", async () => {
      const { persistence, escalations } = createMockPersistence()

      const model = new MockLanguageModelV4({
        doStream: async () => ({
          stream: simulateReadableStream({
            chunks: [
              {
                type: "tool-call",
                toolCallId: "call-esc-1",
                toolName: "escalate_to_human",
                input: JSON.stringify({ reason: "debtor_requested_human" }),
              },
              {
                type: "finish",
                finishReason: { unified: "tool-calls", raw: "tool_calls" },
                usage: mockUsage,
              },
            ],
          }),
        }),
      })

      const turn = await runNegotiationTurn({
        negotiation: sampleNegotiation,
        lastMessage: "Quiero hablar con una persona",
        model,
        persistence,
        now: FIXED_NOW,
      })

      const steps = await turn.steps
      expect(steps).toHaveLength(1)
      expect(escalations).toEqual(["debtor_requested_human"])
      expect(model.doStreamCalls).toHaveLength(1)
    })
  })
})
