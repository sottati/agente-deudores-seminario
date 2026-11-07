import { describe, expect, it, vi } from "vitest"
import { MockLanguageModelV4, simulateReadableStream } from "ai/test"
import type { SandboxSession } from "@/lib/sandbox"
import { sandboxPresets } from "@/lib/sandbox"
import { GUARDRAIL_SAFE_FALLBACK_MESSAGE } from "@agente/agent"
import { createSandboxHandler } from "./sandbox"

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
    config: sandboxPresets[0].config,
  })
  expect(response.status).toBe(200)
  return (await response.json()) as SandboxSession
}

describe("sandbox de negociación", () => {
  it("deshabilita operaciones en producción y rechaza otros orígenes", async () => {
    const production = createSandboxHandler({ env: { NODE_ENV: "production" } })
    expect(
      (
        await post(production, {
          action: "start",
          config: sandboxPresets[0].config,
        })
      ).status
    ).toBe(404)
    const local = createSandboxHandler({ env: { NODE_ENV: "development" } })
    expect(
      (
        await post(
          local,
          { action: "start", config: sandboxPresets[0].config },
          "https://otro.example"
        )
      ).status
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
    const handler = createSandboxHandler({
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
    const handler = createSandboxHandler({ env: {}, model: () => model })
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
    const handler = createSandboxHandler({ env: {}, model: factory })
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
    const handler = createSandboxHandler({
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
    const handler = createSandboxHandler({ env: {}, model: () => model })
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
})
