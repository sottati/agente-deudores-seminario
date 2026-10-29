export const ENGINE_VERSION = "0.1.0"

// ---------------------------------------------------------------------------
// Tipos de dominio (montos en centavos enteros, porcentajes 0..100)
// ---------------------------------------------------------------------------

export type AgentTone = "empatico_formal" | "empatico_cercano" | "neutral"

export interface DebtInput {
  principalCents: number
  interestCents: number
}

export interface NegotiationPolicy {
  maxInstallments: number
  minDownPaymentPct: number
  minInstallmentAmountCents: number
  maxInterestWaiverPct: number
  singlePaymentInterestWaiverPct: number
  maxPrincipalDiscountPct: number
  maxFirstDueDays: number
  offerValidityHours: number
  escalateAboveAmountCents: number | null
  tone?: AgentTone
  customInstructions?: string | null
}

/**
 * Snapshot en snake_case tal como se guarda en `negotiations.policy_snapshot`
 * y en la tabla `negotiation_policies`.
 */
export interface PolicySnapshotRow {
  max_installments: number
  min_down_payment_pct: number
  min_installment_amount_cents: number
  max_interest_waiver_pct: number
  single_payment_interest_waiver_pct: number
  max_principal_discount_pct: number
  max_first_due_days: number
  offer_validity_hours: number
  escalate_above_amount_cents: number | null
  tone?: AgentTone
  custom_instructions?: string | null
}

export interface ScheduleItem {
  number: number
  due_date: string
  amount_cents: number
}

export interface EvaluatedOffer {
  installments: number
  downPaymentCents: number
  waivedInterestCents: number
  principalDiscountCents: number
  totalCents: number
  schedule: ScheduleItem[]
  validUntil: string
  engineVersion: string
}

export interface PlanBounds {
  installments: number
  waivedInterestCents: number
  principalDiscountCents: number
  totalCents: number
  minDownPaymentCents: number
  maxDownPaymentCents: number
  defaultDownPaymentCents: number
  regularInstallmentCents: number
}

export interface NegotiationBounds {
  originalTotalCents: number
  principalCents: number
  interestCents: number
  minInstallments: number
  maxInstallments: number
  allowedInstallments: number[]
  minDownPaymentPct: number
  minInstallmentAmountCents: number
  maxFirstDueDays: number
  offerValidityHours: number
  singlePaymentInterestWaiverPct: number
  maxInterestWaiverPct: number
  maxPrincipalDiscountPct: number
  requiresHumanEscalation: boolean
  plans: PlanBounds[]
}

export interface PlanRequest {
  installments: number
  downPaymentCents?: number
  firstDueDate?: string | Date
  now?: Date
}

export type RejectionReason =
  | "requires_human_escalation"
  | "invalid_debt"
  | "invalid_installments"
  | "installments_exceed_max"
  | "installment_below_minimum"
  | "down_payment_below_minimum"
  | "down_payment_exceeds_max"
  | "first_due_date_out_of_range"

export type EvaluationResult =
  | {
      ok: true
      offer: EvaluatedOffer
    }
  | {
      ok: false
      reason: RejectionReason
      message: string
      closestValidOffer: EvaluatedOffer | null
    }

export interface EscalationContext {
  outOfPolicyAttempts?: number
  maxOutOfPolicyAttempts?: number
  debtorRequestedHuman?: boolean
}

export type EscalationDecision =
  | { escalate: false }
  | {
      escalate: true
      reason:
        | "debtor_requested_human"
        | "amount_above_threshold"
        | "repeated_out_of_policy_requests"
    }

// ---------------------------------------------------------------------------
// Utilidades monetarias y de fechas (puras y determinísticas)
// ---------------------------------------------------------------------------

const arsFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** Valida que un monto en centavos sea un entero finito >= 0. */
export function assertCents(value: number, label = "amount"): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(
      `${label} must be a non-negative safe integer in cents`
    )
  }
  return value
}

/** Convierte pesos a centavos enteros con redondeo al centavo más cercano. */
export function pesosToCents(pesos: number): number {
  if (!Number.isFinite(pesos) || pesos < 0) {
    throw new RangeError("pesos must be a non-negative finite number")
  }
  return Math.round(pesos * 100)
}

/** Convierte centavos a pesos decimales. */
export function centsToPesos(cents: number): number {
  assertCents(cents)
  return cents / 100
}

/** Formatea centavos en formato moneda `es-AR` (ej. "$ 158.000"). */
export function formatCentsARS(cents: number): string {
  return arsFormatter.format(cents / 100)
}

/** Calcula el porcentaje de un monto en centavos redondeando hacia abajo (quita/descuento). */
export function applyPctFloor(cents: number, pct: number): number {
  const clampedPct = Math.min(100, Math.max(0, Math.trunc(pct)))
  return Math.floor((cents * clampedPct) / 100)
}

/** Calcula el porcentaje de un monto en centavos redondeando hacia arriba (anticipo mínimo). */
export function applyPctCeil(cents: number, pct: number): number {
  const clampedPct = Math.min(100, Math.max(0, Math.trunc(pct)))
  return Math.ceil((cents * clampedPct) / 100)
}

/** Normaliza un snapshot en snake_case de la DB al tipo `NegotiationPolicy`. */
export function policyFromSnapshot(row: PolicySnapshotRow): NegotiationPolicy {
  return {
    maxInstallments: row.max_installments,
    minDownPaymentPct: row.min_down_payment_pct,
    minInstallmentAmountCents: row.min_installment_amount_cents,
    maxInterestWaiverPct: row.max_interest_waiver_pct,
    singlePaymentInterestWaiverPct: row.single_payment_interest_waiver_pct,
    maxPrincipalDiscountPct: row.max_principal_discount_pct,
    maxFirstDueDays: row.max_first_due_days,
    offerValidityHours: row.offer_validity_hours,
    escalateAboveAmountCents: row.escalate_above_amount_cents,
    tone: row.tone,
    customInstructions: row.custom_instructions,
  }
}

function toUtcMidnight(input: string | Date): Date | null {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return null
    return new Date(
      Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate())
    )
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim())
  if (!match) {
    const parsed = new Date(input)
    if (Number.isNaN(parsed.getTime())) return null
    return new Date(
      Date.UTC(
        parsed.getUTCFullYear(),
        parsed.getUTCMonth(),
        parsed.getUTCDate()
      )
    )
  }
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }
  return date
}

function addUtcDays(date: Date, days: number): Date {
  const result = new Date(date.getTime())
  result.setUTCDate(result.getUTCDate() + days)
  return result
}

function formatIsoDate(date: Date): string {
  const y = String(date.getUTCFullYear()).padStart(4, "0")
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

// ---------------------------------------------------------------------------
// Reglas de escalado humano (`requiresHuman`)
// ---------------------------------------------------------------------------

const DEFAULT_MAX_OUT_OF_POLICY_ATTEMPTS = 3

export function requiresHuman(
  debt: DebtInput,
  policy: NegotiationPolicy,
  context: EscalationContext = {}
): EscalationDecision {
  if (context.debtorRequestedHuman) {
    return { escalate: true, reason: "debtor_requested_human" }
  }

  const totalDebtCents =
    Math.max(0, Math.trunc(debt.principalCents)) +
    Math.max(0, Math.trunc(debt.interestCents))

  if (
    policy.escalateAboveAmountCents !== null &&
    policy.escalateAboveAmountCents > 0 &&
    totalDebtCents >= policy.escalateAboveAmountCents
  ) {
    return { escalate: true, reason: "amount_above_threshold" }
  }

  const maxAttempts =
    context.maxOutOfPolicyAttempts ?? DEFAULT_MAX_OUT_OF_POLICY_ATTEMPTS
  if (
    typeof context.outOfPolicyAttempts === "number" &&
    context.outOfPolicyAttempts >= maxAttempts
  ) {
    return { escalate: true, reason: "repeated_out_of_policy_requests" }
  }

  return { escalate: false }
}

// ---------------------------------------------------------------------------
// Cálculo interno de cada modalidad de cuotas
// ---------------------------------------------------------------------------

function computeTotalsForInstallments(
  debt: DebtInput,
  policy: NegotiationPolicy,
  installments: number
): {
  waivedInterestCents: number
  principalDiscountCents: number
  totalCents: number
} {
  const principalCents = Math.max(0, Math.trunc(debt.principalCents))
  const interestCents = Math.max(0, Math.trunc(debt.interestCents))

  const interestWaiverPct =
    installments === 1
      ? policy.singlePaymentInterestWaiverPct
      : policy.maxInterestWaiverPct

  const waivedInterestCents = applyPctFloor(interestCents, interestWaiverPct)
  const principalDiscountCents = applyPctFloor(
    principalCents,
    policy.maxPrincipalDiscountPct
  )
  const totalCents =
    principalCents -
    principalDiscountCents +
    (interestCents - waivedInterestCents)

  return {
    waivedInterestCents,
    principalDiscountCents,
    totalCents,
  }
}

function computePlanBounds(
  debt: DebtInput,
  policy: NegotiationPolicy,
  installments: number
): PlanBounds | null {
  const { waivedInterestCents, principalDiscountCents, totalCents } =
    computeTotalsForInstallments(debt, policy, installments)

  if (totalCents <= 0) return null

  const minAmt = Math.max(0, Math.trunc(policy.minInstallmentAmountCents))

  if (installments === 1) {
    return {
      installments: 1,
      waivedInterestCents,
      principalDiscountCents,
      totalCents,
      minDownPaymentCents: totalCents,
      maxDownPaymentCents: totalCents,
      defaultDownPaymentCents: totalCents,
      regularInstallmentCents: totalCents,
    }
  }

  // En planes en cuotas (N >= 2):
  // - La primera cuota (anticipo) debe cubrir al menos `minDownPaymentPct` del total
  //   y al menos `minInstallmentAmountCents`.
  // - Las N-1 cuotas restantes también deben ser >= `minInstallmentAmountCents`,
  //   por lo que el anticipo máximo es `totalCents - (N - 1) * minAmt`.
  const pctMin = applyPctCeil(totalCents, policy.minDownPaymentPct)
  const minDownPaymentCents = Math.max(1, pctMin, minAmt)
  const maxDownPaymentCents =
    minAmt > 0
      ? totalCents - (installments - 1) * minAmt
      : totalCents - (installments - 1)

  if (
    totalCents < installments * minAmt ||
    minDownPaymentCents > maxDownPaymentCents
  ) {
    return null
  }

  const equalShare = Math.floor(totalCents / installments)
  const defaultDownPaymentCents = Math.min(
    maxDownPaymentCents,
    Math.max(minDownPaymentCents, equalShare)
  )
  const remainingCount = installments - 1
  const regularInstallmentCents = Math.floor(
    (totalCents - defaultDownPaymentCents) / remainingCount
  )

  return {
    installments,
    waivedInterestCents,
    principalDiscountCents,
    totalCents,
    minDownPaymentCents,
    maxDownPaymentCents,
    defaultDownPaymentCents,
    regularInstallmentCents,
  }
}

// ---------------------------------------------------------------------------
// Límites de negociación (`getNegotiationBounds`)
// ---------------------------------------------------------------------------

export function getNegotiationBounds(
  debt: DebtInput,
  policy: NegotiationPolicy
): NegotiationBounds {
  const principalCents = Math.max(0, Math.trunc(debt.principalCents))
  const interestCents = Math.max(0, Math.trunc(debt.interestCents))
  const originalTotalCents = principalCents + interestCents
  const policyMaxInstallments = Math.max(
    1,
    Math.min(24, Math.trunc(policy.maxInstallments))
  )

  const escalation = requiresHuman(debt, policy)
  const plans: PlanBounds[] = []

  for (let n = 1; n <= policyMaxInstallments; n++) {
    const plan = computePlanBounds(debt, policy, n)
    if (plan) {
      plans.push(plan)
    }
  }

  const allowedInstallments = plans.map((p) => p.installments)
  const maxInstallments = allowedInstallments.at(-1) ?? 1

  return {
    originalTotalCents,
    principalCents,
    interestCents,
    minInstallments: 1,
    maxInstallments,
    allowedInstallments,
    minDownPaymentPct: policy.minDownPaymentPct,
    minInstallmentAmountCents: policy.minInstallmentAmountCents,
    maxFirstDueDays: policy.maxFirstDueDays,
    offerValidityHours: policy.offerValidityHours,
    singlePaymentInterestWaiverPct: policy.singlePaymentInterestWaiverPct,
    maxInterestWaiverPct: policy.maxInterestWaiverPct,
    maxPrincipalDiscountPct: policy.maxPrincipalDiscountPct,
    requiresHumanEscalation: escalation.escalate,
    plans,
  }
}

// ---------------------------------------------------------------------------
// Armado del cronograma (`buildSchedule`)
// ---------------------------------------------------------------------------

export interface ScheduleInput {
  installments: number
  totalCents: number
  downPaymentCents?: number
}

/**
 * Construye el cronograma de cuotas cada 30 días a partir de `startDate`.
 * Redondeo determinístico: el resto de la división entera va siempre a la última cuota.
 */
export function buildSchedule(
  offer: ScheduleInput,
  startDate: string | Date
): ScheduleItem[] {
  const installments = Math.trunc(offer.installments)
  const totalCents = Math.trunc(offer.totalCents)
  if (!Number.isSafeInteger(installments) || installments < 1) {
    throw new RangeError("installments must be an integer >= 1")
  }
  if (!Number.isSafeInteger(totalCents) || totalCents <= 0) {
    throw new RangeError("totalCents must be a positive integer in cents")
  }

  const start = toUtcMidnight(startDate)
  if (!start) {
    throw new RangeError("startDate must be a valid ISO date or Date")
  }

  if (installments === 1) {
    return [
      {
        number: 1,
        due_date: formatIsoDate(start),
        amount_cents: totalCents,
      },
    ]
  }

  const equalShare = Math.floor(totalCents / installments)
  const firstInstallmentCents =
    offer.downPaymentCents !== undefined
      ? Math.trunc(offer.downPaymentCents)
      : equalShare

  if (firstInstallmentCents <= 0 || firstInstallmentCents >= totalCents) {
    throw new RangeError(
      "downPaymentCents must be > 0 and < totalCents for multi-installment plans"
    )
  }

  const remainingTotal = totalCents - firstInstallmentCents
  const remainingCount = installments - 1
  const eachRemaining = Math.floor(remainingTotal / remainingCount)
  const lastInstallmentCents =
    remainingTotal - eachRemaining * (remainingCount - 1)

  const items: ScheduleItem[] = []
  for (let i = 1; i <= installments; i++) {
    const dueDate = formatIsoDate(addUtcDays(start, 30 * (i - 1)))
    const amountCents =
      i === 1
        ? firstInstallmentCents
        : i === installments
          ? lastInstallmentCents
          : eachRemaining
    items.push({
      number: i,
      due_date: dueDate,
      amount_cents: amountCents,
    })
  }

  return items
}

// ---------------------------------------------------------------------------
// Evaluación determinística de propuestas (`evaluateRequest`)
// ---------------------------------------------------------------------------

function buildEvaluatedOffer(
  plan: PlanBounds,
  downPaymentCents: number,
  firstDueDate: Date,
  now: Date,
  offerValidityHours: number
): EvaluatedOffer {
  const actualDownPayment =
    plan.installments === 1 ? plan.totalCents : downPaymentCents

  const schedule = buildSchedule(
    {
      installments: plan.installments,
      totalCents: plan.totalCents,
      downPaymentCents: actualDownPayment,
    },
    firstDueDate
  )

  const validHours = Math.max(1, Math.trunc(offerValidityHours))
  const validUntil = new Date(
    now.getTime() + validHours * 3_600_000
  ).toISOString()

  return {
    installments: plan.installments,
    downPaymentCents: actualDownPayment,
    waivedInterestCents: plan.waivedInterestCents,
    principalDiscountCents: plan.principalDiscountCents,
    totalCents: plan.totalCents,
    schedule,
    validUntil,
    engineVersion: ENGINE_VERSION,
  }
}

function findClosestPlan(
  plans: PlanBounds[],
  requestedInstallments: number
): PlanBounds | null {
  if (plans.length === 0) return null
  const clamped = Math.max(1, Math.trunc(requestedInstallments || 1))
  let best = plans[0]!
  let bestDiff = Math.abs(best.installments - clamped)
  for (const plan of plans) {
    const diff = Math.abs(plan.installments - clamped)
    if (
      diff < bestDiff ||
      (diff === bestDiff && plan.installments > best.installments)
    ) {
      best = plan
      bestDiff = diff
    }
  }
  return best
}

function resolveFirstDueDate(
  requestedDate: string | Date | undefined,
  now: Date,
  maxFirstDueDays: number
): { ok: true; date: Date } | { ok: false; defaultDate: Date } {
  const todayUtc = toUtcMidnight(now) ?? new Date()
  const maxDays = Math.max(1, Math.trunc(maxFirstDueDays))
  const defaultDays = Math.min(7, maxDays)
  const defaultDate = addUtcDays(todayUtc, defaultDays)

  if (requestedDate === undefined) {
    return { ok: true, date: defaultDate }
  }

  const parsed = toUtcMidnight(requestedDate)
  if (!parsed) {
    return { ok: false, defaultDate }
  }

  const diffDays = Math.round(
    (parsed.getTime() - todayUtc.getTime()) / 86_400_000
  )
  if (diffDays < 0 || diffDays > maxDays) {
    return { ok: false, defaultDate }
  }

  return { ok: true, date: parsed }
}

/**
 * Evalúa el pedido de un deudor contra la deuda y la política de la organización.
 * Nunca lanza excepciones; si el pedido excede la política devuelve `ok: false`
 * junto con `closestValidOffer` (la alternativa válida más cercana, si existe).
 */
export function evaluateRequest(
  debt: DebtInput,
  policy: NegotiationPolicy,
  request: PlanRequest
): EvaluationResult {
  const now =
    request.now instanceof Date && !Number.isNaN(request.now.getTime())
      ? request.now
      : new Date()

  if (
    !Number.isFinite(debt.principalCents) ||
    !Number.isFinite(debt.interestCents) ||
    debt.principalCents <= 0 ||
    debt.interestCents < 0
  ) {
    return {
      ok: false,
      reason: "invalid_debt",
      message: "La deuda no tiene un monto válido para negociar.",
      closestValidOffer: null,
    }
  }

  const escalation = requiresHuman(debt, policy)
  if (escalation.escalate) {
    return {
      ok: false,
      reason: "requires_human_escalation",
      message:
        "El monto de la deuda supera el límite de atención automática y requiere intervención de la administración.",
      closestValidOffer: null,
    }
  }

  const bounds = getNegotiationBounds(debt, policy)
  const dateResolution = resolveFirstDueDate(
    request.firstDueDate,
    now,
    policy.maxFirstDueDays
  )
  const fallbackDate = dateResolution.ok
    ? dateResolution.date
    : dateResolution.defaultDate

  const buildFallback = (targetInstallments: number): EvaluatedOffer | null => {
    const closestPlan = findClosestPlan(bounds.plans, targetInstallments)
    if (!closestPlan) return null
    const requestedDown = request.downPaymentCents
    const clampedDown =
      requestedDown !== undefined && Number.isFinite(requestedDown)
        ? Math.min(
            closestPlan.maxDownPaymentCents,
            Math.max(closestPlan.minDownPaymentCents, Math.trunc(requestedDown))
          )
        : closestPlan.defaultDownPaymentCents
    return buildEvaluatedOffer(
      closestPlan,
      clampedDown,
      fallbackDate,
      now,
      policy.offerValidityHours
    )
  }

  const rawInstallments = request.installments
  if (!Number.isInteger(rawInstallments) || rawInstallments < 1) {
    return {
      ok: false,
      reason: "invalid_installments",
      message:
        "La cantidad de cuotas debe ser un número entero mayor o igual a 1.",
      closestValidOffer: buildFallback(1),
    }
  }

  const policyMax = Math.max(
    1,
    Math.min(24, Math.trunc(policy.maxInstallments))
  )
  if (rawInstallments > policyMax) {
    return {
      ok: false,
      reason: "installments_exceed_max",
      message: `La política permite hasta ${policyMax} cuota${policyMax === 1 ? "" : "s"}.`,
      closestValidOffer: buildFallback(policyMax),
    }
  }

  const matchingPlan = bounds.plans.find(
    (p) => p.installments === rawInstallments
  )
  if (!matchingPlan) {
    return {
      ok: false,
      reason: "installment_below_minimum",
      message: `En ${rawInstallments} cuotas el importe por cuota queda por debajo del mínimo permitido (${formatCentsARS(policy.minInstallmentAmountCents)}).`,
      closestValidOffer: buildFallback(rawInstallments),
    }
  }

  if (!dateResolution.ok) {
    return {
      ok: false,
      reason: "first_due_date_out_of_range",
      message: `La primera fecha de pago debe estar dentro de los próximos ${policy.maxFirstDueDays} días.`,
      closestValidOffer: buildEvaluatedOffer(
        matchingPlan,
        matchingPlan.defaultDownPaymentCents,
        dateResolution.defaultDate,
        now,
        policy.offerValidityHours
      ),
    }
  }

  let chosenDownPayment = matchingPlan.defaultDownPaymentCents
  if (request.downPaymentCents !== undefined) {
    if (
      !Number.isFinite(request.downPaymentCents) ||
      Math.trunc(request.downPaymentCents) < matchingPlan.minDownPaymentCents
    ) {
      return {
        ok: false,
        reason: "down_payment_below_minimum",
        message:
          matchingPlan.installments === 1
            ? `En pago único debés abonar el total acordado (${formatCentsARS(matchingPlan.totalCents)}).`
            : `El anticipo mínimo para ${matchingPlan.installments} cuotas es ${formatCentsARS(matchingPlan.minDownPaymentCents)}.`,
        closestValidOffer: buildEvaluatedOffer(
          matchingPlan,
          matchingPlan.minDownPaymentCents,
          dateResolution.date,
          now,
          policy.offerValidityHours
        ),
      }
    }

    const truncatedDown = Math.trunc(request.downPaymentCents)
    if (truncatedDown > matchingPlan.maxDownPaymentCents) {
      return {
        ok: false,
        reason: "down_payment_exceeds_max",
        message:
          matchingPlan.installments === 1
            ? `El monto no puede superar el total acordado (${formatCentsARS(matchingPlan.totalCents)}).`
            : `El anticipo máximo para mantener las cuotas restantes por encima del mínimo es ${formatCentsARS(matchingPlan.maxDownPaymentCents)}.`,
        closestValidOffer: buildEvaluatedOffer(
          matchingPlan,
          matchingPlan.maxDownPaymentCents,
          dateResolution.date,
          now,
          policy.offerValidityHours
        ),
      }
    }

    chosenDownPayment = truncatedDown
  }

  return {
    ok: true,
    offer: buildEvaluatedOffer(
      matchingPlan,
      chosenDownPayment,
      dateResolution.date,
      now,
      policy.offerValidityHours
    ),
  }
}
