import type { ResolvedNegotiation } from "@/server/db/debtor-access"

export function negotiationFixture(
  overrides: Partial<ResolvedNegotiation> = {}
): ResolvedNegotiation {
  return {
    id: "a0000000-0000-4000-8000-000000000001",
    organizationId: "11111111-1111-4111-8111-111111111111",
    status: "pending",
    updatedAt: "2026-11-04T00:00:00.000Z",
    verifiedAt: null,
    verificationAttempts: 0,
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    debtId: "de000000-0000-4000-8000-000000000001",
    debt: {
      concept: "Expensas",
      dueDate: "2026-10-01",
      principalCents: 10_000,
      interestCents: 500,
    },
    debtor: {
      id: "deb00000-0000-4000-8000-000000000001",
      fullName: "Marina Gutiérrez",
      alias: "Unidad 4B",
      groupLabel: null,
      verificationHash: null,
    },
    organization: {
      name: "Consorcios del Sur",
      displayNameForDebtors: "Administración demo",
      kind: "consorcio",
    },
    policySnapshot: {
      max_installments: 3,
      min_down_payment_pct: 20,
      min_installment_amount_cents: 100,
      max_interest_waiver_pct: 50,
      single_payment_interest_waiver_pct: 100,
      max_principal_discount_pct: 0,
      max_first_due_days: 15,
      offer_validity_hours: 72,
      escalate_above_amount_cents: null,
    },
    ...overrides,
  }
}
