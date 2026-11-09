import { z } from "zod"
import type {
  DebtInput,
  EvaluatedOffer,
  NegotiationPolicy,
  PolicySnapshotRow,
} from "@agente/negotiation-engine"

// Montos en pesos (lo que edita el usuario); se convierten a centavos al armar
// el contexto del agente. Los límites replican los de "Reglas del agente".
const pesos = z.number().min(0).max(100_000_000)
const pct = z.number().int().min(0).max(100)

export const sandboxDebtSchema = z.object({
  organizationName: z.string().trim().min(1).max(120),
  debtorAlias: z.string().trim().min(1).max(80),
  groupLabel: z.string().trim().max(120),
  concept: z.string().trim().min(1).max(200),
  dueDate: z.iso.date(),
  principal: pesos.min(1),
  interest: pesos,
})

export const sandboxAgentSchema = z.object({
  maxInstallments: z.number().int().min(1).max(24),
  minDownPaymentPct: pct,
  minInstallment: pesos,
  maxInterestWaiverPct: pct,
  singlePaymentWaiverPct: pct,
  maxPrincipalDiscountPct: pct,
  maxFirstDueDays: z.number().int().min(1).max(90),
  offerValidityHours: z.number().int().min(1).max(720),
  // null: sin umbral de derivación por monto.
  escalateAbove: pesos.nullable(),
  tone: z.enum(["empatico_formal", "empatico_cercano", "neutral"]),
  instructions: z.string().max(500),
})

export const sandboxConfigSchema = z.object({
  debt: sandboxDebtSchema,
  agent: sandboxAgentSchema,
})

export type SandboxDebtConfig = z.infer<typeof sandboxDebtSchema>
export type SandboxAgentConfig = z.infer<typeof sandboxAgentSchema>
export type SandboxConfig = z.infer<typeof sandboxConfigSchema>

export const defaultSandboxAgent: SandboxAgentConfig = {
  maxInstallments: 3,
  minDownPaymentPct: 20,
  minInstallment: 20_000,
  maxInterestWaiverPct: 50,
  singlePaymentWaiverPct: 100,
  maxPrincipalDiscountPct: 0,
  maxFirstDueDays: 15,
  offerValidityHours: 72,
  escalateAbove: 1_500_000,
  tone: "empatico_formal",
  instructions: "",
}

export const strictSandboxAgent: SandboxAgentConfig = {
  ...defaultSandboxAgent,
  maxInstallments: 2,
  minDownPaymentPct: 50,
  minInstallment: 30_000,
  maxInterestWaiverPct: 0,
  singlePaymentWaiverPct: 0,
  tone: "neutral",
}

function dueDateDaysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10)
}

export function sandboxDebtPresets(organizationName: string): {
  name: string
  description: string
  debt: SandboxDebtConfig
}[] {
  return [
    {
      name: "Expensas pendientes",
      description:
        "Deuda habitual. Probá pago único, cuotas y pedidos fuera de política.",
      debt: {
        organizationName,
        debtorAlias: "Unidad 4B",
        groupLabel: "Consorcio de prueba",
        concept: "Expensas ordinarias de tres meses",
        dueDate: dueDateDaysAgo(45),
        principal: 158_000,
        interest: 28_400,
      },
    },
    {
      name: "Deuda chica y reciente",
      description: "Un mes de expensas. Ideal para probar el pago único.",
      debt: {
        organizationName,
        debtorAlias: "Unidad 2A",
        groupLabel: "Consorcio de prueba",
        concept: "Expensas ordinarias del último mes",
        dueDate: dueDateDaysAgo(10),
        principal: 52_000,
        interest: 1_800,
      },
    },
    {
      name: "Deuda que requiere atención humana",
      description: "Supera el umbral de derivación por monto por defecto.",
      debt: {
        organizationName,
        debtorAlias: "Unidad 9C",
        groupLabel: "Consorcio de prueba",
        concept: "Expensas y extraordinarias de un año",
        dueDate: dueDateDaysAgo(300),
        principal: 2_000_000,
        interest: 200_000,
      },
    },
  ]
}

/** Reglas guardadas de la organización (snake_case de la DB) → formulario. */
export function sandboxAgentFromPolicy(
  row: PolicySnapshotRow | null | undefined
): SandboxAgentConfig {
  if (!row) return defaultSandboxAgent
  return {
    maxInstallments: row.max_installments,
    minDownPaymentPct: row.min_down_payment_pct,
    minInstallment: row.min_installment_amount_cents / 100,
    maxInterestWaiverPct: row.max_interest_waiver_pct,
    singlePaymentWaiverPct: row.single_payment_interest_waiver_pct,
    maxPrincipalDiscountPct: row.max_principal_discount_pct,
    maxFirstDueDays: row.max_first_due_days,
    offerValidityHours: row.offer_validity_hours,
    escalateAbove:
      row.escalate_above_amount_cents == null
        ? null
        : row.escalate_above_amount_cents / 100,
    tone: row.tone ?? "empatico_formal",
    instructions: row.custom_instructions ?? "",
  }
}

const toCents = (value: number) => Math.round(value * 100)

export function sandboxDebtInput(debt: SandboxDebtConfig): DebtInput {
  return {
    principalCents: toCents(debt.principal),
    interestCents: toCents(debt.interest),
  }
}

export function sandboxPolicy(agent: SandboxAgentConfig): NegotiationPolicy {
  return {
    maxInstallments: agent.maxInstallments,
    minDownPaymentPct: agent.minDownPaymentPct,
    minInstallmentAmountCents: toCents(agent.minInstallment),
    maxInterestWaiverPct: agent.maxInterestWaiverPct,
    singlePaymentInterestWaiverPct: agent.singlePaymentWaiverPct,
    maxPrincipalDiscountPct: agent.maxPrincipalDiscountPct,
    maxFirstDueDays: agent.maxFirstDueDays,
    offerValidityHours: agent.offerValidityHours,
    escalateAboveAmountCents:
      agent.escalateAbove == null ? null : toCents(agent.escalateAbove),
    tone: agent.tone,
    customInstructions: agent.instructions,
  }
}

export type SandboxTrace = {
  tool: string
  input: unknown
  output: unknown
}

export type SandboxTurn = {
  user: string
  assistant: string
  elapsedMs: number
  steps: number
  inputTokens: number
  outputTokens: number
  guardrailPassed: boolean
  tools: SandboxTrace[]
  events: { type: string; payload: Record<string, unknown> }[]
}

export type SandboxSession = {
  id: string
  config: SandboxConfig
  disclosure: string
  status: "active" | "escalated" | "agreed"
  turns: SandboxTurn[]
  offer: (EvaluatedOffer & { id: string }) | null
  model: string
  provider: string
  maxTurns: number
}

export type SandboxInfo = {
  enabled: boolean
  configured: boolean
  model: string
  provider: string
}

// Último formulario usado, para volver a la configuración sin perder cambios.
export const SANDBOX_DRAFT_KEY = "pacta.sandbox.config"
