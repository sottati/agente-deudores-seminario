// Evals del agente con el modelo real (SEM-51). Se corren a demanda:
//   pnpm eval:llm
// Lee AI_PROVIDER, AI_MODEL y la API key de apps/platform/.env.local.
// Sin credencial, los escenarios se saltean. Escribe un reporte JSON en
// apps/platform/.evals/ (ignorado por git).
import { mkdir, writeFile } from "node:fs/promises"
import { createConfiguredModel } from "@agente/agent/model"
import { afterAll, describe, expect, it, vi } from "vitest"
import type { EvalResult } from "./harness"
import { runScenario } from "./harness"
import { scenarios } from "./scenarios"

vi.mock("@tanstack/react-start/server-only", () => ({}))

const env = process.env
let configured = true
try {
  createConfiguredModel(env)
} catch {
  configured = false
}
const filter = env.EVAL_SCENARIOS?.split(",").map((s) => s.trim())
const selected = filter
  ? scenarios.filter((s) => filter.includes(s.id))
  : scenarios
const results: EvalResult[] = []

describe.skipIf(!configured)(
  `evals del agente con ${env.AI_PROVIDER ?? "gateway"}/${env.AI_MODEL ?? "?"}`,
  () => {
    it.each(selected.map((s) => [s.id, s] as const))(
      "%s",
      async (_, scenario) => {
        const result = await runScenario(scenario, {
          mode: "llm",
          env,
          model: () => createConfiguredModel(env),
        })
        results.push(result)
        expect(result.failures).toEqual([])
      },
      180_000
    )

    afterAll(async () => {
      const passed = results.filter((r) => r.failures.length === 0).length
      const report = {
        provider: env.AI_PROVIDER ?? "gateway",
        model: env.AI_MODEL,
        ranAt: new Date().toISOString(),
        passed,
        total: results.length,
        scenarios: results.map((r) => ({
          id: r.scenario.id,
          name: r.scenario.name,
          category: r.scenario.category,
          passed: r.failures.length === 0,
          failures: r.failures,
          status: r.session?.status,
          offer: r.session?.offer
            ? {
                installments: r.session.offer.installments,
                totalCents: r.session.offer.totalCents,
              }
            : null,
          turns: r.session?.turns.map((t) => ({
            user: t.user,
            assistant: t.assistant,
            tools: t.tools.map((tool) => tool.tool),
            events: t.events.map((e) => e.type),
            guardrailPassed: t.guardrailPassed,
            inputTokens: t.inputTokens,
            outputTokens: t.outputTokens,
            elapsedMs: t.elapsedMs,
          })),
        })),
      }
      await mkdir(".evals", { recursive: true })
      const file = `.evals/llm-${report.ranAt.replace(/[:.]/g, "-")}.json`
      await writeFile(file, JSON.stringify(report, null, 2))
      console.log(
        `\nEvals LLM: ${passed}/${results.length} escenarios OK. Reporte: apps/platform/${file}`
      )
    })
  }
)

it.skipIf(configured)("evals LLM salteadas: falta configurar el modelo", () => {
  console.warn(
    "Configurá AI_PROVIDER, AI_MODEL y la API key en apps/platform/.env.local para correr las evals con el modelo real."
  )
})
