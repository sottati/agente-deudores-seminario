import { beforeEach, describe, expect, it, vi } from "vitest"
import { negotiationFixture } from "@/test/negotiation"
import {
  handleDebtorAcceptGet,
  handleDebtorAcceptPost,
} from "./debtor-accept-handler"
import * as access from "./db/debtor-access"
import * as debtorSession from "./debtor-session"

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("./debtor-session", () => ({
  hasValidDebtorSessionRequest: vi.fn(),
}))
vi.mock("./db/debtor-access", () => ({
  resolveNegotiationByToken: vi.fn(),
  acceptNegotiationOffer: vi.fn(),
  getNegotiationOffersForDebtor: vi.fn(),
}))

const offerId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
const agreementId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"

describe("POST & GET /api/n/$token/accept", () => {
  beforeEach(() => {
    vi.mocked(debtorSession.hasValidDebtorSessionRequest).mockReturnValue(true)
    vi.mocked(access.resolveNegotiationByToken).mockResolvedValue(
      negotiationFixture({ status: "offer_pending" })
    )
    vi.mocked(access.acceptNegotiationOffer).mockResolvedValue({
      ok: true,
      agreementId,
      acceptedAt: "2026-11-07T15:00:00Z",
      transcriptSha256: "e3b0c44298fc1c149afbf4c8996fb924",
      documentHtml: "<!DOCTYPE html><html><body>Acta de acuerdo</body></html>",
    })
    vi.mocked(access.getNegotiationOffersForDebtor).mockResolvedValue({
      proposedOffer: null,
      acceptedAgreement: {
        id: agreementId,
        offerId,
        acceptedAt: "2026-11-07T15:00:00Z",
        acceptanceIp: "203.0.113.42",
        userAgent: "VitestBrowser/1.0",
        transcriptSha256: "e3b0c44298fc1c149afbf4c8996fb924",
        templateVersion: "1.0.0",
        documentHtml: null,
        installments: 2,
        downPaymentCents: 5250,
        waivedInterestCents: 250,
        totalCents: 10250,
        schedule: [
          { number: 1, due_date: "2026-11-15", amount_cents: 5250 },
          { number: 2, due_date: "2026-12-15", amount_cents: 5000 },
        ],
        engineVersion: "0.1.0",
      },
    })
  })

  it("captura IP y user-agent, ejecuta acceptNegotiationOffer y devuelve el link al acta", async () => {
    const req = new Request("https://pacta.test/api/n/dev-4b/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "203.0.113.42, 10.0.0.1",
        "user-agent": "VitestBrowser/1.0",
      },
      body: JSON.stringify({ offerId }),
    })

    const res = await handleDebtorAcceptPost({
      request: req,
      params: { token: "dev-4b" },
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({
      ok: true,
      agreementId,
      acceptedAt: "2026-11-07T15:00:00Z",
      transcriptSha256: "e3b0c44298fc1c149afbf4c8996fb924",
      agreementUrl: "/api/n/dev-4b/accept",
    })
    expect(access.acceptNegotiationOffer).toHaveBeenCalledWith({
      negotiation: expect.objectContaining({ status: "offer_pending" }),
      offerId,
      acceptanceIp: "203.0.113.42",
      userAgent: "VitestBrowser/1.0",
    })
  })

  it("rechaza con 401 si no hay cookie de sesión verificada del deudor", async () => {
    vi.mocked(debtorSession.hasValidDebtorSessionRequest).mockReturnValue(false)
    const res = await handleDebtorAcceptPost({
      request: new Request("https://pacta.test/api/n/dev-4b/accept", {
        method: "POST",
      }),
      params: { token: "dev-4b" },
    })
    expect(res.status).toBe(401)
    expect(access.acceptNegotiationOffer).not.toHaveBeenCalled()
  })

  it("GET /api/n/$token/accept devuelve el acta HTML imprimible con evidencia", async () => {
    const res = await handleDebtorAcceptGet({
      request: new Request("https://pacta.test/api/n/dev-4b/accept"),
      params: { token: "dev-4b" },
    })
    expect(res.status).toBe(200)
    expect(res.headers.get("content-type")).toContain("text/html")
    const html = await res.text()
    expect(html).toContain("Acta de acuerdo de pago")
    expect(html).toContain("Marina Gutiérrez")
    expect(html).toContain("203.0.113.42")
    expect(html).toContain("e3b0c44298fc1c149afbf4c8996fb924")
  })
})
