import { createClient } from "@supabase/supabase-js"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { getDebtor, listDebtors } from "./debtors"
import {
  getAgreementsByPlan,
  getAttentionItems,
  getDashboardKpis,
  getMonthlyRecovery,
  listRecentAgreements,
} from "./metrics"
import { listNegotiableDebts, listNegotiations } from "./negotiations"

vi.mock("./middleware", () => ({ authMiddleware: {} }))
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    const builder = {
      validator: () => builder,
      middleware: () => builder,
      handler: (fn: unknown) => fn,
    }
    return builder
  },
}))
vi.mock("@tanstack/react-router", () => ({
  notFound: () => new Error("not found"),
}))

const supabase = createClient("https://database.test", "test-key")
const context = { supabase, organizationId: "organization-a" }
const rows = [
  { id: "row-a", organization_id: "organization-a", messages: [] },
  { id: "row-b", organization_id: "organization-b", messages: [] },
]
function invoke(fn: unknown, data?: unknown) {
  return (
    fn as (args: {
      context: typeof context
      data?: unknown
    }) => Promise<unknown>
  )({ context, data })
}

describe("organización activa en el panel", () => {
  beforeEach(() => {
    // La sesión tiene acceso a ambas organizaciones por RLS; PostgREST aplica los filtros de la consulta.
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL) => {
        const url = new URL(String(input))
        const result = rows.filter(
          (row) =>
            (!url.searchParams.has("organization_id") ||
              url.searchParams.get("organization_id") ===
                `eq.${row.organization_id}`) &&
            (!url.searchParams.has("id") ||
              url.searchParams.get("id") === `eq.${row.id}`)
        )
        return Response.json(result)
      })
    )
  })
  afterEach(() => vi.unstubAllGlobals())

  it.each([
    { fn: listDebtors, data: undefined },
    { fn: listNegotiations, data: { filter: "todas" } },
    { fn: listNegotiableDebts, data: undefined },
  ])("lista únicamente la cartera activa", async ({ fn, data }) => {
    const result = (await invoke(fn, data)) as Array<{ id: string }>
    expect(result.map((row) => row.id)).toEqual(["row-a"])
  })

  it("filtra las vistas de métricas del dashboard por organization_id activo", async () => {
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = new URL(String(input))
      expect(url.searchParams.get("organization_id")).toBe("eq.organization-a")
      return Response.json([])
    })
    vi.stubGlobal("fetch", fetchMock)

    await invoke(getDashboardKpis)
    await invoke(getMonthlyRecovery, { months: 6 })
    await invoke(getAgreementsByPlan, { period: "all" })
    await invoke(listRecentAgreements, { limit: 3 })
    await invoke(getAttentionItems)

    expect(fetchMock).toHaveBeenCalledTimes(5)
  })

  it("un ID de otra cartera no atraviesa el contexto activo", async () => {
    await expect(invoke(getDebtor, { id: "row-b" })).rejects.toThrow(
      "not found"
    )
  })
})
