// Evals del agente con un modelo guionado (SEM-51). Corren en CI sin API keys.
// Verifican que los guardrails determinísticos (motor de reglas, validador de
// cifras, interceptor de derivación, límite de turnos) se cumplen aunque el
// modelo se equivoque o desobedezca.
import { describe, expect, it, vi } from "vitest"
import { runScenario } from "./harness"
import { scenarios } from "./scenarios"

vi.mock("@tanstack/react-start/server-only", () => ({}))

describe("evals del agente (modelo guionado)", () => {
  it("cubre al menos 20 escenarios con ids únicos", () => {
    expect(scenarios.length).toBeGreaterThanOrEqual(20)
    expect(new Set(scenarios.map((s) => s.id)).size).toBe(scenarios.length)
  })

  it.each(scenarios.map((s) => [s.id, s] as const))(
    "%s",
    async (_, scenario) => {
      const result = await runScenario(scenario, { mode: "mock" })
      expect(result.failures).toEqual([])
    }
  )
})
