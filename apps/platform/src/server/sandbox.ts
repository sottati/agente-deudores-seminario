import "@tanstack/react-start/server-only"
import { randomUUID } from "node:crypto"
import {
  buildBotDisclosureMessage,
  isHumanHandoffKeyword,
  MAX_TURNS_PER_NEGOTIATION,
  runNegotiationTurn,
  validateGeneratedNumbers,
} from "@agente/agent"
import type {
  AgentNegotiationContext,
  RunNegotiationTurnResult,
} from "@agente/agent"
import { createConfiguredModel } from "@agente/agent/model"
import type { LanguageModel, ModelMessage } from "ai"
import { evaluateRequest } from "@agente/negotiation-engine"
import { z } from "zod"
import {
  sandboxConfigSchema,
  sandboxDebtInput,
  sandboxPolicy,
} from "@/lib/sandbox"
import type { SandboxConfig, SandboxSession, SandboxTurn } from "@/lib/sandbox"
import { HUMAN_HANDOFF_MESSAGE } from "@/lib/debtor-chat"
import { createInstructionsValidator } from "./instructions-guard"
import type { InstructionsCheck } from "./instructions-guard"

const TTL = 2 * 60 * 60 * 1000
const requestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start"), config: sandboxConfigSchema }),
  z.object({
    action: z.literal("message"),
    sessionId: z.uuid(),
    text: z.string().trim().min(1).max(4000),
  }),
  z.object({
    action: z.literal("accept"),
    sessionId: z.uuid(),
    offerId: z.uuid(),
  }),
])

type Session = {
  ownerId: string
  view: SandboxSession
  context: AgentNegotiationContext
  history: ModelMessage[]
  busy: boolean
  touchedAt: number
}

export function sandboxContext(
  config: SandboxConfig,
  id: string
): AgentNegotiationContext {
  const { debt } = config
  return {
    id,
    organization: {
      displayNameForDebtors: debt.organizationName,
      kind: "consorcio",
    },
    debtor: { alias: debt.debtorAlias, groupLabel: debt.groupLabel || null },
    debt: {
      ...sandboxDebtInput(debt),
      concept: debt.concept,
      dueDate: debt.dueDate,
    },
    policy: sandboxPolicy(config.agent),
  }
}

// Usuario del panel autenticado con la cookie de Supabase. Import dinámico:
// los tests inyectan `authorize` y no necesitan el cliente de Supabase.
async function authorizeAdmin(): Promise<string | null> {
  const { createServerSupabase } = await import("./db/supabase-server")
  const {
    data: { user },
  } = await createServerSupabase().auth.getUser()
  return user?.id ?? null
}

// Cada instancia mantiene sesiones ficticias en memoria. No importa ni usa Supabase.
export function createSandboxHandler(
  options: {
    env?: Record<string, string | undefined>
    model?: () => LanguageModel
    run?: typeof runNegotiationTurn
    authorize?: (request: Request) => Promise<string | null>
    /** Valida las indicaciones adicionales antes de iniciar una simulación. */
    checkInstructions?: (text: string) => Promise<InstructionsCheck>
  } = {}
) {
  const sessions = new Map<string, Session>()
  const env = options.env ?? process.env
  const model = options.model ?? (() => createConfiguredModel(env))
  const run = options.run ?? runNegotiationTurn
  const authorize = options.authorize ?? authorizeAdmin
  const checkInstructions =
    options.checkInstructions ?? createInstructionsValidator(env)
  const json = (body: unknown, status = 200) =>
    Response.json(body, {
      status,
      headers: { "Cache-Control": "private, no-store" },
    })

  return async function handleSandbox({
    request,
  }: {
    request: Request
  }): Promise<Response> {
    if (env.NODE_ENV === "production")
      return json({ error: "No encontrado." }, 404)
    const ownerId = await authorize(request).catch(() => null)
    if (!ownerId)
      return json({ error: "Iniciá sesión para usar el sandbox." }, 401)
    const sessionNotFound = () =>
      json(
        {
          error:
            "La sesión venció o el servidor se reinició. Iniciá otra prueba.",
        },
        404
      )
    if (request.method === "GET") {
      const sessionId = new URL(request.url).searchParams.get("sessionId")
      if (sessionId) {
        const session = sessions.get(sessionId)
        if (!session || session.ownerId !== ownerId) return sessionNotFound()
        return json(session.view)
      }
      let configured = true
      try {
        model()
      } catch {
        configured = false
      }
      return json({
        enabled: true,
        configured,
        provider: env.AI_PROVIDER ?? "gateway",
        model: env.AI_MODEL ?? "Sin configurar",
      })
    }
    if (request.method !== "POST")
      return json({ error: "Método no permitido." }, 405)
    // Evita que otro sitio consuma el LLM del servidor local desde un navegador.
    if (
      request.headers.get("origin") !== new URL(request.url).origin ||
      !request.headers.get("content-type")?.startsWith("application/json")
    ) {
      return json({ error: "Origen no permitido." }, 403)
    }
    const body = requestSchema.safeParse(await request.json().catch(() => null))
    if (!body.success)
      return json(
        { error: "Revisá los datos. El mensaje admite hasta 4000 caracteres." },
        400
      )
    const now = Date.now()
    for (const [id, session] of sessions) {
      if (!session.busy && now - session.touchedAt > TTL) sessions.delete(id)
    }
    if (body.data.action === "start") {
      if (sessions.size >= 100)
        return json(
          { error: "Se alcanzó el límite de sesiones. Probá más tarde." },
          429
        )
      const config = body.data.config
      const check = await checkInstructions(config.agent.instructions)
      if (!check.ok) return json({ error: check.message }, 422)
      const id = randomUUID()
      const view: SandboxSession = {
        id,
        config,
        disclosure: buildBotDisclosureMessage(config.debt.organizationName),
        status: "active",
        turns: [],
        offer: null,
        model: env.AI_MODEL ?? "Sin configurar",
        provider: env.AI_PROVIDER ?? "gateway",
        maxTurns: MAX_TURNS_PER_NEGOTIATION,
      }
      sessions.set(id, {
        ownerId,
        view,
        context: sandboxContext(config, id),
        history: [],
        busy: false,
        touchedAt: now,
      })
      return json(view)
    }

    const session = sessions.get(body.data.sessionId)
    if (!session || session.ownerId !== ownerId) return sessionNotFound()
    if (session.busy)
      return json({ error: "Esperá a que termine el turno actual." }, 409)
    if (session.view.status !== "active")
      return json({ error: "La simulación terminó. Iniciá otra prueba." }, 409)
    session.touchedAt = now

    if (body.data.action === "accept") {
      const offer = session.view.offer
      if (
        !offer ||
        offer.id !== body.data.offerId ||
        Date.parse(offer.validUntil) <= now
      ) {
        return json({ error: "La propuesta ya no está vigente." }, 409)
      }
      const evaluation = evaluateRequest(
        session.context.debt,
        session.context.policy,
        {
          installments: offer.installments,
          downPaymentCents: offer.downPaymentCents,
          firstDueDate: offer.schedule[0]?.due_date,
        }
      )
      if (!evaluation.ok || evaluation.offer.totalCents !== offer.totalCents)
        return json({ error: "La oferta no cumple la política." }, 409)
      session.view.status = "agreed"
      return json(session.view)
    }

    const text = body.data.text
    const turn: SandboxTurn = {
      user: text,
      assistant: "",
      elapsedMs: 0,
      steps: 0,
      inputTokens: 0,
      outputTokens: 0,
      guardrailPassed: true,
      tools: [],
      events: [],
    }
    // Los efectos se confirman juntos al completar el turno; un error permite reintentar.
    let nextOffer = session.view.offer
    const nextState = { escalated: false }
    session.busy = true
    try {
      if (
        isHumanHandoffKeyword(text) ||
        session.view.turns.length >= MAX_TURNS_PER_NEGOTIATION
      ) {
        nextState.escalated = true
        turn.assistant = HUMAN_HANDOFF_MESSAGE
        turn.events.push({
          type: "escalated",
          payload: {
            reason: isHumanHandoffKeyword(text)
              ? "debtor_requested_human"
              : "max_turns_exceeded",
          },
        })
      } else {
        let configuredModel: LanguageModel
        try {
          configuredModel = model()
        } catch {
          return json(
            {
              error:
                "Falta configurar AI_PROVIDER, AI_MODEL y la API key en el servidor.",
            },
            503
          )
        }
        const result: RunNegotiationTurnResult = await run({
          negotiation: session.context,
          history: session.history,
          lastMessage: text,
          model: configuredModel,
          abortSignal: AbortSignal.any([
            request.signal,
            AbortSignal.timeout(120_000),
          ]),
          persistence: {
            saveOffer: async (offer) => {
              nextOffer = { ...offer, id: randomUUID() }
              return { id: nextOffer.id }
            },
            escalate: async () => {
              nextState.escalated = true
            },
            logEvent: async (type, payload) => {
              turn.events.push({ type, payload })
            },
          },
        })
        // Consumir el stream conserva el mismo bucle de tools del portal real.
        for await (const chunk of result.fullStream) {
          if (chunk.type === "error") throw new Error("LLM stream failed")
          if (chunk.type === "abort") throw new Error("LLM stream aborted")
        }
        const [answer, steps, usage, response] = await Promise.all([
          result.text,
          result.steps,
          result.totalUsage,
          result.response,
        ])
        turn.steps = steps.length
        turn.inputTokens = usage.inputTokens ?? 0
        turn.outputTokens = usage.outputTokens ?? 0
        turn.tools = steps.flatMap((step) =>
          step.toolResults.map((tool) => ({
            tool: tool.toolName,
            input: tool.input,
            output: tool.output,
          }))
        )
        const validation = validateGeneratedNumbers(
          answer,
          session.context,
          turn.tools.map((tool) => tool.output)
        )
        turn.guardrailPassed = validation.valid
        turn.assistant = validation.valid
          ? answer.trim() ||
            (nextState.escalated
              ? HUMAN_HANDOFF_MESSAGE
              : "Consultá la propuesta o pedime otra opción de pago.")
          : validation.safeText
        if (!validation.valid)
          turn.events.push({
            type: "guardrail_violation",
            payload: { mismatches: validation.mismatches },
          })
        session.history.push(
          { role: "user", content: text },
          ...response.messages
        )
        if (!validation.valid) {
          // No reintroducir cifras rechazadas en los siguientes turnos del modelo.
          session.history = session.view.turns.flatMap((t) => [
            { role: "user" as const, content: t.user },
            { role: "assistant" as const, content: t.assistant },
          ])
          session.history.push(
            { role: "user", content: text },
            { role: "assistant", content: turn.assistant }
          )
        }
      }
      turn.elapsedMs = Date.now() - now
      session.view.turns.push(turn)
      session.view.offer = nextOffer
      if (nextState.escalated) session.view.status = "escalated"
      session.context.outOfPolicyAttempts =
        (session.context.outOfPolicyAttempts ?? 0) +
        turn.events.filter((e) => e.type === "out_of_policy_request").length
      return json(session.view)
    } catch {
      return json(
        {
          error:
            "El modelo no pudo completar el turno. Revisá la credencial, el saldo y que el modelo soporte herramientas. Podés reintentar el mensaje.",
        },
        502
      )
    } finally {
      session.busy = false
    }
  }
}
