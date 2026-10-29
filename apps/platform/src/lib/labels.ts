import type { Enums } from "@/server/db/types.gen"

export type NegotiationStatus = Enums<"negotiation_status">
export type DebtStatus = Enums<"debt_status">
export type MessageRole = Enums<"message_role">
export type OfferStatus = Enums<"offer_status">
export type AgentTone = Enums<"agent_tone">
export type OrganizationKind = Enums<"organization_kind">

type BadgeVariant = "default" | "secondary" | "outline" | "destructive"

export const negotiationStatusMeta: Record<
  NegotiationStatus,
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: "Link enviado", variant: "outline" },
  verifying: { label: "Verificando identidad", variant: "outline" },
  active: { label: "En conversación", variant: "secondary" },
  offer_pending: { label: "Oferta enviada", variant: "secondary" },
  escalated: { label: "Requiere atención", variant: "destructive" },
  agreed: { label: "Acordada", variant: "default" },
  expired: { label: "Vencida", variant: "outline" },
  locked: { label: "Bloqueada", variant: "destructive" },
}

export const debtStatusMeta: Record<
  DebtStatus,
  { label: string; variant: BadgeVariant }
> = {
  open: { label: "Impaga", variant: "outline" },
  in_negotiation: { label: "En negociación", variant: "secondary" },
  agreed: { label: "Con acuerdo", variant: "default" },
  paid: { label: "Pagada", variant: "secondary" },
  written_off: { label: "Incobrable", variant: "outline" },
}

export const offerStatusLabel: Record<OfferStatus, string> = {
  proposed: "Propuesta",
  superseded: "Reemplazada",
  accepted: "Aceptada",
  expired: "Vencida",
}

export const messageRoleLabel: Record<MessageRole, string> = {
  debtor: "Deudor",
  agent: "Agente",
  admin: "Administración",
  system: "Sistema",
}

export const toneLabel: Record<AgentTone, string> = {
  empatico_formal: "Empático y formal",
  empatico_cercano: "Empático y cercano",
  neutral: "Neutral",
}

export const organizationKindLabel: Record<OrganizationKind, string> = {
  consorcio: "Administración de consorcios",
  colegio: "Colegio",
}

export const auditEventLabel: Record<string, string> = {
  negotiation_created: "Negociación creada",
  out_of_policy_request: "Pedido fuera de política",
  escalated: "Derivada a una persona",
  admin_takeover: "La administración tomó el control",
  returned_to_agent: "Devuelta al agente",
  negotiation_cancelled: "Link cancelado",
  guardrail_violation: "Respuesta del agente bloqueada",
  offer_proposed: "Oferta propuesta",
}

export function installmentsLabel(installments: number) {
  return installments === 1 ? "Pago único" : `${installments} cuotas`
}

// Transiciones que puede disparar el administrador (PLAN_BACKEND §3.4).
const OPEN_STATUSES: NegotiationStatus[] = [
  "pending",
  "verifying",
  "active",
  "offer_pending",
]

export const canTakeOver = (status: NegotiationStatus) =>
  OPEN_STATUSES.includes(status)
export const canReturnToAgent = (status: NegotiationStatus) =>
  status === "escalated"
export const canCancel = (status: NegotiationStatus) =>
  OPEN_STATUSES.includes(status) || status === "escalated"
export const canSendAdminMessage = (status: NegotiationStatus) =>
  status === "escalated"

export const negotiationFilters = {
  todas: { label: "Todas", statuses: null },
  atencion: { label: "Requieren atención", statuses: ["escalated"] },
  en_curso: { label: "En curso", statuses: OPEN_STATUSES },
  acordadas: { label: "Acordadas", statuses: ["agreed"] },
  cerradas: { label: "Cerradas", statuses: ["expired", "locked"] },
} satisfies Record<
  string,
  { label: string; statuses: NegotiationStatus[] | null }
>

export type NegotiationFilter = keyof typeof negotiationFilters
