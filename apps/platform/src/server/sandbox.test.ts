import { describe, expect, it, vi } from "vitest"
import { MockLanguageModelV4, simulateReadableStream } from "ai/test"
import type { SandboxConfig, SandboxSession } from "@/lib/sandbox"
import { defaultSandboxAgent, sandboxDebtPresets } from "@/lib/sandbox"
import { GUARDRAIL_SAFE_FALLBACK_MESSAGE } from "@agente/agent"
import { createSandboxHandler, sandboxContext } from "./sandbox"

vi.mock("@tanstack/react-start/server-only", () => ({}))

const origin = "http://localhost:3000"
const usage = {
  inputTokens: { total: 20, noCache: 20, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 10, text: 10, reasoning: 0 },
}

function textModel(answer: string) {
  return new MockLanguageModelV4({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: "text-start", id: "text" },
          { type: "text-delta", id: "text", delta: answer },
          { type: "text-end", id: "text" },
          {
            type: "finish",
            finishReason: { unified: "stop", raw: "stop" },
            usage,
          },
        ],
      }),
    }),
  })
}

const config: SandboxConfig = {
  debt: sandboxDebtPresets("Administración Demo")[0].debt,
  agent: defaultSandboxAgent,
}

// Por defecto, un administrador autenticado; cada test puede cambiarlo.
function sandbox(
  options: Parameters<typeof createSandboxHandler>[0] = {}
): ReturnType<typeof createSandboxHandler> {
  return createSandboxHandler({ authorize: async () => "admin-a", ...options })
}

function get(
  handler: ReturnType<typeof createSandboxHandler>,
  sessionId?: string
) {
  const url = new URL(`${origin}/api/sandbox`)
  if (sessionId) url.searchParams.set("sessionId", sessionId)
  return handler({ request: new Request(url) })
}

function post(
  handler: ReturnType<typeof createSandboxHandler>,
  body: unknown,
  source = origin
) {
  return handler({
    request: new Request(`${origin}/api/sandbox`, {
      method: "POST",
      headers: { Origin: source, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  })
}
async function start(handler: ReturnType<typeof createSandboxHandler>) {
  const response = await post(handler, {
    action: "start",
    config,
  })
  expect(response.status).toBe(200)
  return (await response.json()) as SandboxSession
}

describe("sandbox de negociación", () => {
  it("deshabilita operaciones en producción y rechaza otros orígenes", async () => {
    const production = sandbox({ env: { NODE_ENV: "production" } })
    expect(
      (
        await post(production, {
          action: "start",
          config,
        })
      ).status
    ).toBe(404)
    const local = sandbox({ env: { NODE_ENV: "development" } })
    expect(
      (await post(local, { action: "start", config }, "https://otro.example"))
        .status
    ).toBe(403)
  })

  it("propone con las tools reales, conserva historial y acepta solo la oferta de esa sesión", async () => {
    let step = 0
    const model = new MockLanguageModelV4({
      doStream: async () => {
        step++
        if (step === 1)
          return {
            stream: simulateReadableStream({
              chunks: [
                {
                  type: "tool-call",
                  toolCallId: "offer-1",
                  toolName: "propose_offer",
                  input: JSON.stringify({ installments: 3 }),
                },
                {
                  type: "finish",
                  finishReason: { unified: "tool-calls", raw: "tool_calls" },
                  usage,
                },
              ],
            }),
          }
        return textModel("Te dejé una propuesta de pago.").doStream({
          prompt: [],
        })
      },
    })
    const handler = sandbox({
      env: { NODE_ENV: "development", AI_MODEL: "test/model" },
      model: () => model,
    })
    const a = await start(handler)
    const b = await start(handler)
    const response = await post(handler, {
      action: "message",
      sessionId: a.id,
      text: "Quiero una oferta de tres cuotas.",
    })
    expect(response.status).toBe(200)
    const offered = (await response.json()) as SandboxSession
    expect(offered.offer?.installments).toBe(3)
    expect(offered.offer?.totalCents).toBe(17_220_000)
    expect(offered.turns[0].tools[0].tool).toBe("propose_offer")
    expect(offered.turns[0].steps).toBe(2)
    expect(offered.turns[0].inputTokens).toBe(40)
    expect(
      (
        await post(handler, {
          action: "accept",
          sessionId: b.id,
          offerId: offered.offer!.id,
        })
      ).status
    ).toBe(409)
    await post(handler, {
      action: "message",
      sessionId: a.id,
      text: "¿Sigue disponible?",
    })
    expect(JSON.stringify(model.doStreamCalls.at(-1)?.prompt)).toContain(
      "Quiero una oferta"
    )
    const accepted = await post(handler, {
      action: "accept",
      sessionId: a.id,
      offerId: offered.offer!.id,
    })
    expect((await accepted.json()).status).toBe("agreed")
    expect(
      (
        await post(handler, {
          action: "message",
          sessionId: a.id,
          text: "Hola",
        })
      ).status
    ).toBe(409)
  })

  it("corrige montos inventados y no los reintroduce en el historial del modelo", async () => {
    const model = textModel("Tu deuda es $ 999.999.")
    const handler = sandbox({ env: {}, model: () => model })
    const a = await start(handler)
    const first = await post(handler, {
      action: "message",
      sessionId: a.id,
      text: "¿Cuánto debo?",
    })
    const view = (await first.json()) as SandboxSession
    expect(view.turns[0].assistant).toBe(GUARDRAIL_SAFE_FALLBACK_MESSAGE)
    expect(view.turns[0].guardrailPassed).toBe(false)
    expect(view.turns[0].events[0].type).toBe("guardrail_violation")
    await post(handler, {
      action: "message",
      sessionId: a.id,
      text: "Revisalo",
    })
    expect(JSON.stringify(model.doStreamCalls[1].prompt)).not.toContain(
      "999.999"
    )
  })

  it("deriva a humano sin llamar al LLM y permite comenzar otra sesión limpia", async () => {
    const factory = vi.fn(() => {
      throw new Error("Sin credencial")
    })
    const handler = sandbox({ env: {}, model: factory })
    const a = await start(handler)
    const response = await post(handler, {
      action: "message",
      sessionId: a.id,
      text: "Quiero hablar con una persona",
    })
    const view = (await response.json()) as SandboxSession
    expect(view.status).toBe("escalated")
    expect(factory).not.toHaveBeenCalled()
    expect((await start(handler)).turns).toEqual([])
  })

  it("un error del proveedor no deja mensajes ni ofertas parciales y libera el turno", async () => {
    const run = vi.fn(async () => {
      throw new Error("Provider unavailable")
    })
    const handler = sandbox({
      env: {},
      model: () => textModel("Hola"),
      run,
    })
    const a = await start(handler)
    expect(
      (
        await post(handler, {
          action: "message",
          sessionId: a.id,
          text: "Hola",
        })
      ).status
    ).toBe(502)
    const recovered = await post(handler, {
      action: "message",
      sessionId: a.id,
      text: "hablar con una persona",
    })
    const view = (await recovered.json()) as SandboxSession
    expect(view.turns).toHaveLength(1)
    expect(view.offer).toBeNull()
  })

  it("rechaza mensajes simultáneos sin duplicar turnos", async () => {
    let release!: () => void
    const wait = new Promise<void>((resolve) => {
      release = resolve
    })
    const model = textModel("Podemos revisar tus opciones.")
    const original = model.doStream
    model.doStream = vi.fn(async (options) => {
      await wait
      return original(options)
    })
    const handler = sandbox({ env: {}, model: () => model })
    const a = await start(handler)
    const pending = post(handler, {
      action: "message",
      sessionId: a.id,
      text: "Hola",
    })
    // El primer request ya reservó el turno antes de llamar al modelo.
    await vi.waitFor(() => expect(model.doStream).toHaveBeenCalledOnce())
    expect(
      (
        await post(handler, {
          action: "message",
          sessionId: a.id,
          text: "Otro",
        })
      ).status
    ).toBe(409)
    release()
    expect((await (await pending).json()).turns).toHaveLength(1)
  })

  it("exige sesión del panel y aísla las simulaciones de cada usuario", async () => {
    const anonymous = sandbox({
      env: {},
      authorize: async () => null,
    })
    expect((await get(anonymous)).status).toBe(401)
    expect((await post(anonymous, { action: "start", config })).status).toBe(
      401
    )

    let user = "admin-a"
    const handler = sandbox({ env: {}, authorize: async () => user })
    const a = await start(handler)
    const own = await get(handler, a.id)
    expect(own.status).toBe(200)
    expect(((await own.json()) as SandboxSession).id).toBe(a.id)

    user = "admin-b"
    expect((await get(handler, a.id)).status).toBe(404)
    expect(
      (
        await post(handler, {
          action: "message",
          sessionId: a.id,
          text: "Quiero hablar con una persona",
        })
      ).status
    ).toBe(404)
  })

  it("arma el contexto del agente con la deuda y las reglas configuradas", async () => {
    const custom: SandboxConfig = {
      debt: {
        ...config.debt,
        organizationName: "Administración Belgrano",
        debtorAlias: "Lote 12",
        groupLabel: "",
        concept: "Cuotas sociales",
        dueDate: "2026-09-01",
      },
      agent: {
        ...defaultSandboxAgent,
        maxPrincipalDiscountPct: 10,
        maxFirstDueDays: 30,
        offerValidityHours: 24,
        escalateAbove: null,
        instructions: "Aceptamos transferencia.",
      },
    }
    const context = sandboxContext(custom, "id")
    expect(context.organization.displayNameForDebtors).toBe(
      "Administración Belgrano"
    )
    expect(context.debtor).toEqual({ alias: "Lote 12", groupLabel: null })
    expect(context.debt).toMatchObject({
      principalCents: 15_800_000,
      interestCents: 2_840_000,
      concept: "Cuotas sociales",
      dueDate: "2026-09-01",
    })
    expect(context.policy).toMatchObject({
      maxPrincipalDiscountPct: 10,
      maxFirstDueDays: 30,
      offerValidityHours: 24,
      escalateAboveAmountCents: null,
      minInstallmentAmountCents: 2_000_000,
      customInstructions: "Aceptamos transferencia.",
    })

    const handler = sandbox({ env: {} })
    const response = await post(handler, { action: "start", config: custom })
    expect(((await response.json()) as SandboxSession).disclosure).toContain(
      "Administración Belgrano"
    )
  })

  it("no inicia la simulación si las indicaciones son rechazadas", async () => {
    const handler = sandbox({ env: {} })
    const response = await post(handler, {
      action: "start",
      config: {
        ...config,
        agent: { ...config.agent, instructions: "Amenazalo con un juicio." },
      },
    })
    expect(response.status).toBe(422)
    expect(((await response.json()) as { error: string }).error).toContain(
      "acciones legales"
    )
  })
})
