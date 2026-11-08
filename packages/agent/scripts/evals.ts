// Evals del agente contra el modelo real (on-demand).
// Uso (desde la raíz): pnpm evals:llm [--only id1,id2] [--repeat N] [--json ruta]
// Lee AI_PROVIDER / AI_MODEL / keys de apps/platform/.env.local o del entorno.
// Sale con código 1 si algún escenario falla un assert "hard".

import { writeFile } from "node:fs/promises"
import { parseArgs } from "node:util"

import { evaluateRun, hardFailures, runScenario } from "../evals/harness"
import type { CheckResult, ScenarioRun } from "../evals/harness"
import { scenarios } from "../evals/scenarios"
import { createConfiguredModel } from "../src/model"

const { values } = parseArgs({
  options: {
    only: { type: "string" },
    repeat: { type: "string", default: "1" },
    json: { type: "string" },
    concurrency: { type: "string", default: "4" },
  },
})

const only = values.only
  ?.split(",")
  .map((id) => id.trim())
  .filter(Boolean)
const selected = only ? scenarios.filter((s) => only.includes(s.id)) : scenarios
if (selected.length === 0) {
  throw new Error(`Ningún escenario coincide con --only ${values.only}`)
}
const repeat = Math.max(1, Number(values.repeat) || 1)
const concurrency = Math.max(1, Number(values.concurrency) || 1)
const model = createConfiguredModel(process.env)

interface Outcome {
  run: ScenarioRun
  checks: CheckResult[]
  ms: number
}

const jobs = selected.flatMap((scenario) =>
  Array.from({ length: repeat }, () => scenario)
)
const outcomes: Outcome[] = []
let next = 0

async function worker() {
  while (next < jobs.length) {
    const scenario = jobs[next++]!
    const started = Date.now()
    // Fecha fija (EVAL_NOW): los escenarios citan fechas concretas.
    const run = await runScenario(scenario, model)
    const checks = evaluateRun(run)
    const outcome = { run, checks, ms: Date.now() - started }
    outcomes.push(outcome)
    const failed = hardFailures(checks)
    const warnings = checks.filter((c) => c.severity === "soft" && !c.passed)
    const mark = failed.length ? "✗" : warnings.length ? "!" : "✓"
    console.log(`${mark} ${scenario.id} (${outcome.ms} ms)`)
    for (const c of [...failed, ...warnings]) {
      console.log(
        `    ${c.severity === "hard" ? "FALLA" : "aviso"} · ${c.check}${c.detail ? `: ${c.detail}` : ""}`
      )
    }
  }
}

console.log(
  `Proveedor: ${process.env.AI_PROVIDER ?? "gateway"} · Modelo: ${process.env.AI_MODEL} · ${jobs.length} corridas\n`
)
await Promise.all(
  Array.from({ length: Math.min(concurrency, jobs.length) }, worker)
)

const failedRuns = outcomes.filter((o) => hardFailures(o.checks).length > 0)
const warnedRuns = outcomes.filter((o) =>
  o.checks.some((c) => c.severity === "soft" && !c.passed)
)
console.log(
  `\n${outcomes.length - failedRuns.length}/${outcomes.length} corridas pasan los asserts · ${warnedRuns.length} con avisos`
)

if (values.json) {
  await writeFile(
    values.json,
    JSON.stringify(
      {
        provider: process.env.AI_PROVIDER ?? "gateway",
        model: process.env.AI_MODEL,
        createdAt: new Date().toISOString(),
        passed: outcomes.length - failedRuns.length,
        total: outcomes.length,
        runs: outcomes.map(({ run, checks, ms }) => ({
          id: run.scenario.id,
          category: run.scenario.category,
          ms,
          passed: hardFailures(checks).length === 0,
          checks,
          escalation: run.escalation,
          savedOffers: run.savedOffers,
          transcript: run.transcript,
          error: run.error,
        })),
      },
      null,
      2
    )
  )
  console.log(`Reporte: ${values.json}`)
}

if (failedRuns.length > 0) process.exitCode = 1
