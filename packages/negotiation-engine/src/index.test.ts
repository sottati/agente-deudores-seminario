import { describe, expect, it } from "vitest"
import {
  ENGINE_VERSION,
  applyPctCeil,
  applyPctFloor,
  assertCents,
  buildSchedule,
  centsToPesos,
  evaluateRequest,
  formatCentsARS,
  getNegotiationBounds,
  pesosToCents,
  policyFromSnapshot,
  requiresHuman,
} from "./index"
import type { DebtInput, NegotiationPolicy } from "./index"

const defaultPolicy: NegotiationPolicy = {
  maxInstallments: 3,
  minDownPaymentPct: 20,
  minInstallmentAmountCents: 2_000_000, // $ 20.000
  maxInterestWaiverPct: 50,
  singlePaymentInterestWaiverPct: 100,
  maxPrincipalDiscountPct: 0,
  maxFirstDueDays: 15,
  offerValidityHours: 72,
  escalateAboveAmountCents: 100_000_000, // $ 1.000.000
  tone: "empatico_formal",
  customInstructions: null,
}

// Unidad 4B del seed: Capital $ 158.000 + Interés $ 28.400 = $ 186.400
const sampleDebt: DebtInput = {
  principalCents: 15_800_000,
  interestCents: 2_840_000,
}

const fixedNow = new Date("2026-10-28T15:00:00.000Z")

describe("money and snapshot utilities", () => {
  it("converts between pesos and cents accurately", () => {
    expect(pesosToCents(0)).toBe(0)
    expect(pesosToCents(158000)).toBe(15_800_000)
    expect(pesosToCents(19.99)).toBe(1999)
    expect(centsToPesos(15_800_000)).toBe(158000)
  })

  it("throws on invalid cents or pesos", () => {
    expect(() => assertCents(-1)).toThrow(RangeError)
    expect(() => assertCents(12.5)).toThrow(RangeError)
    expect(() => pesosToCents(-5)).toThrow(RangeError)
    expect(() => pesosToCents(Number.NaN)).toThrow(RangeError)
  })

  it("formats ARS currency strings", () => {
    const formatted = formatCentsARS(15_800_000)
    expect(formatted).toContain("158.000")
  })

  it("applies percentage floor and ceil deterministically", () => {
    // 33% of 101 cents = 33.33 -> floor 33, ceil 34
    expect(applyPctFloor(101, 33)).toBe(33)
    expect(applyPctCeil(101, 33)).toBe(34)
    expect(applyPctFloor(100, -10)).toBe(0)
    expect(applyPctCeil(100, 150)).toBe(100)
  })

  it("normalizes DB snake_case policy snapshot to camelCase policy", () => {
    const normalized = policyFromSnapshot({
      max_installments: 3,
      min_down_payment_pct: 20,
      min_installment_amount_cents: 2_000_000,
      max_interest_waiver_pct: 50,
      single_payment_interest_waiver_pct: 100,
      max_principal_discount_pct: 0,
      max_first_due_days: 15,
      offer_validity_hours: 72,
      escalate_above_amount_cents: 100_000_000,
      tone: "empatico_cercano",
      custom_instructions: "Horario de 9 a 17",
    })
    expect(normalized).toEqual({
      ...defaultPolicy,
      tone: "empatico_cercano",
      customInstructions: "Horario de 9 a 17",
    })
  })
})

describe("requiresHuman", () => {
  it("does not escalate normal debt within bounds", () => {
    expect(requiresHuman(sampleDebt, defaultPolicy)).toEqual({
      escalate: false,
    })
  })

  it("escalates when debtor explicitly requests a human", () => {
    expect(
      requiresHuman(sampleDebt, defaultPolicy, { debtorRequestedHuman: true })
    ).toEqual({
      escalate: true,
      reason: "debtor_requested_human",
    })
  })

  it("escalates when total debt reaches or exceeds threshold", () => {
    // Unidad PB-B del seed: $ 1.250.000 + $ 210.000 = $ 1.460.000 >= $ 1.000.000
    const largeDebt: DebtInput = {
      principalCents: 125_000_000,
      interestCents: 21_000_000,
    }
    expect(requiresHuman(largeDebt, defaultPolicy)).toEqual({
      escalate: true,
      reason: "amount_above_threshold",
    })

    // Exactamente en el umbral
    expect(
      requiresHuman(
        { principalCents: 100_000_000, interestCents: 0 },
        defaultPolicy
      )
    ).toEqual({
      escalate: true,
      reason: "amount_above_threshold",
    })
  })

  it("does not escalate by amount when threshold is null", () => {
    const largeDebt: DebtInput = {
      principalCents: 500_000_000,
      interestCents: 0,
    }
    expect(
      requiresHuman(largeDebt, {
        ...defaultPolicy,
        escalateAboveAmountCents: null,
      })
    ).toEqual({ escalate: false })
  })

  it("escalates after repeated out-of-policy requests", () => {
    expect(
      requiresHuman(sampleDebt, defaultPolicy, { outOfPolicyAttempts: 2 })
    ).toEqual({ escalate: false })
    expect(
      requiresHuman(sampleDebt, defaultPolicy, { outOfPolicyAttempts: 3 })
    ).toEqual({
      escalate: true,
      reason: "repeated_out_of_policy_requests",
    })
    expect(
      requiresHuman(sampleDebt, defaultPolicy, {
        outOfPolicyAttempts: 2,
        maxOutOfPolicyAttempts: 2,
      })
    ).toEqual({
      escalate: true,
      reason: "repeated_out_of_policy_requests",
    })
  })
})

describe("getNegotiationBounds", () => {
  it("computes 1, 2 and 3 installment options with 100% single-payment waiver and 50% installment waiver", () => {
    const bounds = getNegotiationBounds(sampleDebt, defaultPolicy)
    expect(bounds.originalTotalCents).toBe(18_640_000)
    expect(bounds.requiresHumanEscalation).toBe(false)
    expect(bounds.allowedInstallments).toEqual([1, 2, 3])
    expect(bounds.maxInstallments).toBe(3)

    // 1 cuota: 100% quita de interés ($ 28.400) -> total $ 158.000
    const plan1 = bounds.plans[0]!
    expect(plan1.installments).toBe(1)
    expect(plan1.waivedInterestCents).toBe(2_840_000)
    expect(plan1.totalCents).toBe(15_800_000)

    // 2 cuotas: 50% quita de interés ($ 14.200) -> total $ 172.200
    const plan2 = bounds.plans[1]!
    expect(plan2.installments).toBe(2)
    expect(plan2.waivedInterestCents).toBe(1_420_000)
    expect(plan2.totalCents).toBe(17_220_000)
    expect(plan2.minDownPaymentCents).toBe(3_444_000) // 20% de $ 172.200 = $ 34.440 (> $ 20.000)
    expect(plan2.maxDownPaymentCents).toBe(15_220_000) // $ 172.200 - $ 20.000

    // 3 cuotas: 50% quita de interés ($ 14.200) -> total $ 172.200 ($ 57.400 por cuota)
    const plan3 = bounds.plans[2]!
    expect(plan3.installments).toBe(3)
    expect(plan3.totalCents).toBe(17_220_000)
    expect(plan3.defaultDownPaymentCents).toBe(5_740_000)
    expect(plan3.regularInstallmentCents).toBe(5_740_000)
  })

  it("filters out installment counts where installments fall below minInstallmentAmountCents", () => {
    // Deuda chica de $ 45.000 sin intereses; cuota mínima $ 20.000:
    // 1 cuota ($ 45.000) ok, 2 cuotas ($ 22.500) ok, 3 cuotas ($ 15.000 < $ 20.000) no permitido
    const smallDebt: DebtInput = { principalCents: 4_500_000, interestCents: 0 }
    const bounds = getNegotiationBounds(smallDebt, defaultPolicy)
    expect(bounds.allowedInstallments).toEqual([1, 2])
    expect(bounds.maxInstallments).toBe(2)
  })

  it("handles zero-amount debt gracefully without plans", () => {
    const zeroDebt: DebtInput = { principalCents: 0, interestCents: 0 }
    const bounds = getNegotiationBounds(zeroDebt, defaultPolicy)
    expect(bounds.allowedInstallments).toEqual([])
    expect(bounds.maxInstallments).toBe(1)
  })

  it(" handles multi-installment plans when minInstallmentAmountCents is 0", () => {
    const zeroMinPolicy: NegotiationPolicy = {
      ...defaultPolicy,
      minInstallmentAmountCents: 0,
    }
    const bounds = getNegotiationBounds(sampleDebt, zeroMinPolicy)
    expect(bounds.allowedInstallments).toEqual([1, 2, 3])
    expect(bounds.plans[1]!.maxDownPaymentCents).toBe(17_220_000 - 1)
  })
})

describe("buildSchedule", () => {
  it("builds a single payment schedule", () => {
    const schedule = buildSchedule(
      { installments: 1, totalCents: 15_800_000 },
      "2026-11-04"
    )
    expect(schedule).toEqual([
      { number: 1, due_date: "2026-11-04", amount_cents: 15_800_000 },
    ])
  })

  it("distributes rounding remainder to the last installment deterministically", () => {
    // $ 100.00 (10000 centavos) en 3 cuotas iguales: 3333, 3333 y 3334
    const schedule = buildSchedule(
      { installments: 3, totalCents: 10_000 },
      new Date("2026-11-01T12:00:00Z")
    )
    expect(schedule).toEqual([
      { number: 1, due_date: "2026-11-01", amount_cents: 3333 },
      { number: 2, due_date: "2026-12-01", amount_cents: 3333 },
      { number: 3, due_date: "2026-12-31", amount_cents: 3334 },
    ])
    const sum = schedule.reduce((acc, item) => acc + item.amount_cents, 0)
    expect(sum).toBe(10_000)
  })

  it("respects custom down payment and splits remaining balance across remaining installments", () => {
    // Total 10_000 en 3 cuotas con anticipo de 4_001 -> quedan 5_999 en 2 cuotas: 2_999 y 3_000
    const schedule = buildSchedule(
      { installments: 3, totalCents: 10_000, downPaymentCents: 4001 },
      "2026-11-01"
    )
    expect(schedule.map((s) => s.amount_cents)).toEqual([4001, 2999, 3000])
  })

  it("validates arguments and throws on invalid schedule inputs", () => {
    expect(() =>
      buildSchedule({ installments: 0, totalCents: 10_000 }, "2026-11-01")
    ).toThrow(RangeError)
    expect(() =>
      buildSchedule({ installments: 2, totalCents: 0 }, "2026-11-01")
    ).toThrow(RangeError)
    expect(() =>
      buildSchedule({ installments: 2, totalCents: 10_000 }, "not-a-date")
    ).toThrow(RangeError)
    expect(() =>
      buildSchedule({ installments: 2, totalCents: 10_000 }, "2026-02-30")
    ).toThrow(RangeError)
    expect(() =>
      buildSchedule(
        { installments: 2, totalCents: 10_000, downPaymentCents: 10_000 },
        "2026-11-01"
      )
    ).toThrow(RangeError)
    expect(() =>
      buildSchedule(
        { installments: 2, totalCents: 10_000, downPaymentCents: 0 },
        "2026-11-01"
      )
    ).toThrow(RangeError)
    expect(() =>
      buildSchedule(
        { installments: 1, totalCents: 10_000 },
        new Date("invalid")
      )
    ).toThrow(RangeError)
  })
})

describe("evaluateRequest", () => {
  it("approves a valid 1-installment request with 100% interest waiver", () => {
    const res = evaluateRequest(sampleDebt, defaultPolicy, {
      installments: 1,
      now: fixedNow,
    })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.offer.installments).toBe(1)
    expect(res.offer.waivedInterestCents).toBe(2_840_000)
    expect(res.offer.totalCents).toBe(15_800_000)
    expect(res.offer.downPaymentCents).toBe(15_800_000)
    expect(res.offer.engineVersion).toBe(ENGINE_VERSION)
    expect(res.offer.schedule).toEqual([
      { number: 1, due_date: "2026-11-04", amount_cents: 15_800_000 },
    ])
  })

  it("approves a valid 3-installment request with custom down payment and valid firstDueDate", () => {
    const res = evaluateRequest(sampleDebt, defaultPolicy, {
      installments: 3,
      downPaymentCents: 6_000_000,
      firstDueDate: "2026-11-05",
      now: fixedNow,
    })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.offer.installments).toBe(3)
    expect(res.offer.totalCents).toBe(17_220_000)
    expect(res.offer.downPaymentCents).toBe(6_000_000)
    expect(res.offer.schedule).toEqual([
      { number: 1, due_date: "2026-11-05", amount_cents: 6_000_000 },
      { number: 2, due_date: "2026-12-05", amount_cents: 5_610_000 },
      { number: 3, due_date: "2027-01-04", amount_cents: 5_610_000 },
    ])
  })

  it("rejects installments above policy max (e.g. 12 installments) and returns 3-installment closestValidOffer", () => {
    const res = evaluateRequest(sampleDebt, defaultPolicy, {
      installments: 12,
      now: fixedNow,
    })
    expect(res.ok).toBe(false)
    if (res.ok) return
    expect(res.reason).toBe("installments_exceed_max")
    expect(res.closestValidOffer).not.toBeNull()
    expect(res.closestValidOffer?.installments).toBe(3)
    expect(res.closestValidOffer?.totalCents).toBe(17_220_000)
  })

  it("rejects invalid installment numbers (0 or negative) and proposes 1 installment", () => {
    const res = evaluateRequest(sampleDebt, defaultPolicy, {
      installments: 0,
      now: fixedNow,
    })
    expect(res.ok).toBe(false)
    if (res.ok) return
    expect(res.reason).toBe("invalid_installments")
    expect(res.closestValidOffer?.installments).toBe(1)
  })

  it("rejects when installment amount falls below minInstallmentAmountCents and suggests closest valid count", () => {
    const smallDebt: DebtInput = { principalCents: 4_500_000, interestCents: 0 }
    const res = evaluateRequest(smallDebt, defaultPolicy, {
      installments: 3,
      now: fixedNow,
    })
    expect(res.ok).toBe(false)
    if (res.ok) return
    expect(res.reason).toBe("installment_below_minimum")
    expect(res.closestValidOffer?.installments).toBe(2)
    expect(res.closestValidOffer?.schedule).toHaveLength(2)
  })

  it("rejects down payment below minimum and returns closestValidOffer with minDownPaymentCents", () => {
    // Para 3 cuotas ($ 172.200), el anticipo mínimo (20%) es $ 34.440 (3_444_000 centavos)
    const res = evaluateRequest(sampleDebt, defaultPolicy, {
      installments: 3,
      downPaymentCents: 2_500_000, // $ 25.000 < $ 34.440
      now: fixedNow,
    })
    expect(res.ok).toBe(false)
    if (res.ok) return
    expect(res.reason).toBe("down_payment_below_minimum")
    expect(res.closestValidOffer?.downPaymentCents).toBe(3_444_000)

    // También en pago único si pide pagar menos del total
    const singleRes = evaluateRequest(sampleDebt, defaultPolicy, {
      installments: 1,
      downPaymentCents: 10_000_000,
      now: fixedNow,
    })
    expect(singleRes.ok).toBe(false)
    if (singleRes.ok) return
    expect(singleRes.reason).toBe("down_payment_below_minimum")
    expect(singleRes.closestValidOffer?.downPaymentCents).toBe(15_800_000)
  })

  it("rejects down payment above maximum and returns closestValidOffer with maxDownPaymentCents", () => {
    // En 2 cuotas ($ 172.200), si ofrece anticipo de $ 160.000, la 2da cuota queda en $ 12.200 (< $ 20.000 mínimo)
    const res = evaluateRequest(sampleDebt, defaultPolicy, {
      installments: 2,
      downPaymentCents: 16_000_000,
      now: fixedNow,
    })
    expect(res.ok).toBe(false)
    if (res.ok) return
    expect(res.reason).toBe("down_payment_exceeds_max")
    expect(res.closestValidOffer?.downPaymentCents).toBe(15_220_000)

    // En 1 cuota si pasa más del total
    const singleRes = evaluateRequest(sampleDebt, defaultPolicy, {
      installments: 1,
      downPaymentCents: 20_000_000,
      now: fixedNow,
    })
    expect(singleRes.ok).toBe(false)
    if (singleRes.ok) return
    expect(singleRes.reason).toBe("down_payment_exceeds_max")
    expect(singleRes.closestValidOffer?.downPaymentCents).toBe(15_800_000)
  })

  it("rejects firstDueDate beyond maxFirstDueDays or in the past", () => {
    const tooLate = evaluateRequest(sampleDebt, defaultPolicy, {
      installments: 2,
      firstDueDate: "2026-12-15", // > 15 días desde 2026-10-28
      now: fixedNow,
    })
    expect(tooLate.ok).toBe(false)
    if (tooLate.ok) return
    expect(tooLate.reason).toBe("first_due_date_out_of_range")
    expect(tooLate.closestValidOffer?.schedule[0]?.due_date).toBe("2026-11-04")

    const inPast = evaluateRequest(sampleDebt, defaultPolicy, {
      installments: 2,
      firstDueDate: "2026-10-01",
      now: fixedNow,
    })
    expect(inPast.ok).toBe(false)
    if (inPast.ok) return
    expect(inPast.reason).toBe("first_due_date_out_of_range")

    const invalidDateStr = evaluateRequest(sampleDebt, defaultPolicy, {
      installments: 2,
      firstDueDate: "fecha-invalida",
      now: fixedNow,
    })
    expect(invalidDateStr.ok).toBe(false)
    if (invalidDateStr.ok) return
    expect(invalidDateStr.reason).toBe("first_due_date_out_of_range")
  })

  it("rejects when debt exceeds human escalation threshold", () => {
    const largeDebt: DebtInput = {
      principalCents: 125_000_000,
      interestCents: 21_000_000,
    }
    const res = evaluateRequest(largeDebt, defaultPolicy, {
      installments: 3,
      now: fixedNow,
    })
    expect(res.ok).toBe(false)
    if (res.ok) return
    expect(res.reason).toBe("requires_human_escalation")
    expect(res.closestValidOffer).toBeNull()
  })

  it("rejects invalid debt inputs without throwing", () => {
    const res = evaluateRequest(
      { principalCents: 0, interestCents: 0 },
      defaultPolicy,
      { installments: 1, now: fixedNow }
    )
    expect(res.ok).toBe(false)
    if (res.ok) return
    expect(res.reason).toBe("invalid_debt")
    expect(res.closestValidOffer).toBeNull()
  })

  it("clamps requested downPaymentCents when building fallback for out-of-range installments", () => {
    const res = evaluateRequest(sampleDebt, defaultPolicy, {
      installments: 6,
      downPaymentCents: 5_000_000,
      now: fixedNow,
    })
    expect(res.ok).toBe(false)
    if (res.ok) return
    expect(res.closestValidOffer?.installments).toBe(3)
    expect(res.closestValidOffer?.downPaymentCents).toBe(5_000_000)
  })
})
