import { z } from "zod"
import type { EvaluatedOffer } from "@agente/negotiation-engine"

export const sandboxConfigSchema = z.object({
  principal: z.number().min(1).max(100_000_000),
  interest: z.number().min(0).max(100_000_000),
  maxInstallments: z.number().int().min(1).max(12),
  minDownPaymentPct: z.number().min(0).max(100),
  minInstallment: z.number().min(1).max(100_000_000),
  interestWaiverPct: z.number().min(0).max(100),
  singlePaymentWaiverPct: z.number().min(0).max(100),
  escalateAbove: z.number().min(0).max(100_000_000),
  tone: z.enum(["empatico_formal", "empatico_cercano", "neutral"]),
  instructions: z.string().max(2000),
})

export type SandboxConfig = z.infer<typeof sandboxConfigSchema>

export const sandboxPresets: {
  name: string
  description: string
  config: SandboxConfig
}[] = [
  {
    name: "Expensas pendientes",
    description:
      "Deuda habitual. Probá pago único, cuotas y pedidos fuera de política.",
    config: {
      principal: 158_000,
      interest: 28_400,
      maxInstallments: 3,
      minDownPaymentPct: 20,
      minInstallment: 20_000,
      interestWaiverPct: 50,
      singlePaymentWaiverPct: 100,
      escalateAbove: 1_500_000,
      tone: "empatico_formal",
      instructions: "",
    },
  },
  {
    name: "Política estricta",
    description: "Sin quitas, hasta dos cuotas y anticipo del 50%.",
    config: {
      principal: 320_000,
      interest: 64_000,
      maxInstallments: 2,
      minDownPaymentPct: 50,
      minInstallment: 30_000,
      interestWaiverPct: 0,
      singlePaymentWaiverPct: 0,
      escalateAbove: 1_500_000,
      tone: "neutral",
      instructions: "",
    },
  },
  {
    name: "Deuda que requiere atención humana",
    description: "Supera el umbral de negociación automática.",
    config: {
      principal: 2_000_000,
      interest: 200_000,
      maxInstallments: 3,
      minDownPaymentPct: 20,
      minInstallment: 20_000,
      interestWaiverPct: 50,
      singlePaymentWaiverPct: 100,
      escalateAbove: 1_500_000,
      tone: "empatico_cercano",
      instructions: "",
    },
  },
]

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
}

export type SandboxInfo = {
  enabled: boolean
  configured: boolean
  model: string
  provider: string
}
