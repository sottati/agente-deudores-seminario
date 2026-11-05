import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { negotiationFixture } from "@/test/negotiation"
import { createNegotiationPersistence } from "./debtor-access"

vi.mock("@tanstack/react-start/server-only", () => ({}))

describe("persistencia del deudor", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "https://database.test")
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-key")
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it.each(["pending", "verifying", "active", "offer_pending"] as const)(
    "deriva %s y comunica el estado confirmado",
    async (status) => {
      const negotiation = negotiationFixture({ status })
      const row = { status }
      vi.stubGlobal(
        "fetch",
        vi.fn(async (input: string | URL, init: RequestInit) => {
          const url = new URL(String(input))
          const allowed =
            url.searchParams.get("status")?.slice(4, -1).split(",") ?? []
          if (!allowed.includes(row.status)) return Response.json([])
          expect(url.searchParams.get("organization_id")).toBe(
            `eq.${negotiation.organizationId}`
          )
          expect(url.searchParams.get("expires_at")).toMatch(/^gt\./)
          row.status = JSON.parse(String(init.body)).status
          return Response.json([row])
        })
      )
      await createNegotiationPersistence(negotiation).escalate(
        "debtor_requested_human"
      )
      expect(row.status).toBe("escalated")
      expect(negotiation.status).toBe("escalated")
    }
  )

  it("no anuncia éxito cuando la DB no actualiza filas", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json([]))
    )
    const negotiation = negotiationFixture()
    await expect(
      createNegotiationPersistence(negotiation).escalate("human")
    ).rejects.toThrow("ya no permite")
    expect(negotiation.status).toBe("pending")
  })
})
