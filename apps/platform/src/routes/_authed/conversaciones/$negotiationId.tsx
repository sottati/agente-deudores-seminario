import { useEffect, useRef, useState } from "react"
import { Link, createFileRoute, useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"

import { ButtonLink } from "@/components/button-link"
import { FormError } from "@/components/form-field"
import { PageBody, PageHeader } from "@/components/page-header"
import { NegotiationStatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useAction } from "@/hooks/use-action"
import { formatARS, formatDate, formatDateTime } from "@/lib/format"
import {
  auditEventLabel,
  canCancel,
  canReturnToAgent,
  canSendAdminMessage,
  canTakeOver,
  installmentsLabel,
  messageRoleLabel,
  offerStatusLabel,
  type MessageRole,
} from "@/lib/labels"
import { cn } from "@/lib/utils"
import type { Json } from "@/server/db/types.gen"
import {
  cancelNegotiation,
  getNegotiation,
  returnToAgent,
  sendAdminMessage,
  takeOverNegotiation,
} from "@/server/negotiations"

export const Route = createFileRoute("/_authed/conversaciones/$negotiationId")({
  loader: ({ params }) => getNegotiation({ data: { id: params.negotiationId } }),
  component: NegotiationPage,
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.debt.debtors?.alias ?? "Conversación"} | pacta.ia` }],
  }),
})

type Negotiation = Awaited<ReturnType<typeof getNegotiation>>

const POLL_INTERVAL_MS = 10_000

function NegotiationPage() {
  const negotiation = Route.useLoaderData()
  const router = useRouter()
  const debtor = negotiation.debt.debtors
  const isOpen = canCancel(negotiation.status)

  // Mientras la conversación sigue abierta se refresca para ver mensajes nuevos
  // del deudor (PLAN_BACKEND D9: polling en lugar de Realtime).
  useEffect(() => {
    if (!isOpen) return
    const interval = window.setInterval(() => router.invalidate(), POLL_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [isOpen, router])

  return (
    <>
      <PageHeader title={debtor?.alias ?? "Conversación"}>
        <NegotiationStatusBadge status={negotiation.status} />
      </PageHeader>
      <PageBody>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Transcript negotiation={negotiation} />
          <aside className="grid content-start gap-4">
            <DebtCard negotiation={negotiation} />
            <ActionsCard negotiation={negotiation} />
            <OffersCard negotiation={negotiation} />
            <PolicyCard snapshot={negotiation.policy_snapshot} />
            <ActivityCard negotiation={negotiation} />
          </aside>
        </div>
      </PageBody>
    </>
  )
}

// ---------------------------------------------------------------------------
// Transcript
// ---------------------------------------------------------------------------

type MessagePart = { type?: unknown; text?: unknown }
type MessageContent = { kind: "text" | "tool"; text: string }

/** Partes UIMessage del AI SDK → texto y llamadas a herramientas. */
function partsToContent(parts: Json): MessageContent[] {
  if (!Array.isArray(parts)) return []
  return parts.flatMap((part): MessageContent[] => {
    if (!part || typeof part !== "object" || Array.isArray(part)) return []
    const { type, text } = part as MessagePart
    if (type === "text" && typeof text === "string") return [{ kind: "text", text }]
    if (typeof type === "string" && type.startsWith("tool-")) {
      return [{ kind: "tool", text: type.slice("tool-".length) }]
    }
    return []
  })
}

const bubbleStyles: Record<MessageRole, string> = {
  debtor: "mr-auto bg-muted",
  agent: "ml-auto bg-primary/10",
  admin: "ml-auto bg-primary text-primary-foreground",
  system: "mx-auto max-w-[90%] bg-transparent text-center text-xs text-muted-foreground",
}

function Transcript({ negotiation }: { negotiation: Negotiation }) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const messageCount = negotiation.messages.length

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" })
  }, [messageCount])

  return (
    <Card className="min-h-[60svh]">
      <CardHeader className="border-b">
        <CardTitle>Conversación</CardTitle>
        <CardDescription>
          {negotiation.status === "escalated"
            ? "El agente está en pausa: respondé desde acá o devolvé la conversación al agente."
            : "Transcript completo de la negociación."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {messageCount === 0 ? (
          <p className="m-auto text-center text-muted-foreground">
            {negotiation.status === "pending"
              ? "El deudor todavía no abrió el link."
              : "Sin mensajes."}
          </p>
        ) : (
          <ol className="flex flex-col gap-3">
            {negotiation.messages.map((message) => (
              <li
                key={message.id}
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2",
                  bubbleStyles[message.role]
                )}
              >
                {message.role !== "system" ? (
                  <p className="mb-0.5 text-[11px] font-medium opacity-70">
                    {messageRoleLabel[message.role]} · {formatDateTime(message.created_at)}
                  </p>
                ) : null}
                {partsToContent(message.parts).map((content, index) =>
                  content.kind === "text" ? (
                    <p key={index} className="whitespace-pre-wrap">
                      {content.text}
                    </p>
                  ) : (
                    <Badge key={index} variant="outline">
                      Herramienta: {content.text}
                    </Badge>
                  )
                )}
              </li>
            ))}
          </ol>
        )}
        <div ref={bottomRef} />
        {canSendAdminMessage(negotiation.status) ? (
          <AdminComposer negotiationId={negotiation.id} />
        ) : null}
      </CardContent>
    </Card>
  )
}

function AdminComposer({ negotiationId }: { negotiationId: string }) {
  const send = useAction(useServerFn(sendAdminMessage))
  const [text, setText] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = await send.run({ data: { negotiationId, text } })
    if (result.ok) setText("")
  }

  return (
    <form method="post" onSubmit={handleSubmit} className="mt-auto grid gap-2 border-t pt-3">
      <Textarea
        aria-label="Mensaje para el deudor"
        placeholder="Escribí como administración…"
        value={text}
        onChange={(event) => setText(event.target.value)}
        maxLength={2000}
        rows={3}
      />
      <FormError message={send.error} />
      <Button type="submit" className="justify-self-end" disabled={send.pending || !text.trim()}>
        {send.pending ? "Enviando…" : "Enviar"}
      </Button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Panel lateral
// ---------------------------------------------------------------------------

function DebtCard({ negotiation }: { negotiation: Negotiation }) {
  const { debt } = negotiation
  const debtor = debt.debtors
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Deuda</CardTitle>
        {debtor ? (
          <CardDescription>
            <Link
              to="/deudores/$debtorId"
              params={{ debtorId: debtor.id }}
              className="hover:underline"
            >
              {debtor.full_name} · {debtor.alias}
            </Link>
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-2">
        <p>{debt.concept}</p>
        <Row label="Capital" value={formatARS(debt.principal_cents)} />
        <Row label="Intereses" value={formatARS(debt.interest_cents)} />
        <Row label="Total" value={formatARS(debt.principal_cents + debt.interest_cents)} strong />
        <Row label="Vencida desde" value={formatDate(debt.due_date)} />
        <Row label="Link vigente hasta" value={formatDateTime(negotiation.expires_at)} />
        <Row
          label="Identidad"
          value={negotiation.verified_at ? `Verificada ${formatDateTime(negotiation.verified_at)}` : "Sin verificar"}
        />
      </CardContent>
    </Card>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-right tabular-nums", strong && "font-semibold")}>{value}</span>
    </div>
  )
}

function ActionsCard({ negotiation }: { negotiation: Negotiation }) {
  const takeOver = useAction(useServerFn(takeOverNegotiation))
  const giveBack = useAction(useServerFn(returnToAgent))
  const cancel = useAction(useServerFn(cancelNegotiation))
  const { status, id } = negotiation
  const error = takeOver.error ?? giveBack.error ?? cancel.error

  if (!canTakeOver(status) && !canReturnToAgent(status) && !canCancel(status)) return null

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Acciones</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {canTakeOver(status) ? (
          <Button
            variant="outline"
            disabled={takeOver.pending}
            onClick={() => takeOver.run({ data: { id } })}
          >
            Tomar el control
          </Button>
        ) : null}
        {canReturnToAgent(status) ? (
          <Button disabled={giveBack.pending} onClick={() => giveBack.run({ data: { id } })}>
            Devolver al agente
          </Button>
        ) : null}
        {canCancel(status) ? (
          <Dialog>
            <DialogTrigger render={<Button variant="ghost" className="text-destructive" />}>
              Cancelar link
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Cancelar el link de negociación?</DialogTitle>
                <DialogDescription>
                  El deudor ya no va a poder usarlo y la deuda vuelve a quedar impaga.
                  Podés generar un link nuevo más adelante.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Volver</DialogClose>
                <DialogClose
                  render={<Button variant="destructive" />}
                  onClick={() => cancel.run({ data: { id } })}
                >
                  Cancelar link
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
        <FormError message={error} />
      </CardContent>
    </Card>
  )
}

type ScheduleItem = { number: number; due_date: string; amount_cents: number }

function parseSchedule(schedule: Json): ScheduleItem[] {
  if (!Array.isArray(schedule)) return []
  return schedule.filter(
    (item): item is ScheduleItem =>
      !!item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      typeof item.number === "number" &&
      typeof item.due_date === "string" &&
      typeof item.amount_cents === "number"
  )
}

function OffersCard({ negotiation }: { negotiation: Negotiation }) {
  if (negotiation.offers.length === 0) return null
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Ofertas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {negotiation.offers.map((offer) => {
          const agreement = offer.agreements[0]
          return (
            <div key={offer.id} className="grid gap-1.5 rounded-lg bg-muted/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{installmentsLabel(offer.installments)}</span>
                <Badge variant={offer.status === "accepted" ? "default" : "outline"}>
                  {offerStatusLabel[offer.status]}
                </Badge>
              </div>
              <Row label="Total" value={formatARS(offer.total_cents)} strong />
              {offer.waived_interest_cents > 0 ? (
                <Row label="Quita de intereses" value={formatARS(offer.waived_interest_cents)} />
              ) : null}
              <ul className="text-xs text-muted-foreground">
                {parseSchedule(offer.schedule).map((item) => (
                  <li key={item.number} className="flex justify-between">
                    <span>Cuota {item.number} · {formatDate(item.due_date)}</span>
                    <span className="tabular-nums">{formatARS(item.amount_cents)}</span>
                  </li>
                ))}
              </ul>
              {agreement ? (
                <ButtonLink
                  size="sm"
                  variant="outline"
                  to="/acuerdos/$agreementId"
                  params={{ agreementId: agreement.id }}
                >
                  Ver acta del acuerdo
                </ButtonLink>
              ) : offer.status === "proposed" ? (
                <p className="text-xs text-muted-foreground">
                  Vigente hasta {formatDateTime(offer.valid_until)}
                </p>
              ) : null}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function snapshotNumber(snapshot: Json, key: string) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return null
  const value = snapshot[key]
  return typeof value === "number" ? value : null
}

function PolicyCard({ snapshot }: { snapshot: Json }) {
  const maxInstallments = snapshotNumber(snapshot, "max_installments")
  const downPayment = snapshotNumber(snapshot, "min_down_payment_pct")
  const waiver = snapshotNumber(snapshot, "max_interest_waiver_pct")
  const singleWaiver = snapshotNumber(snapshot, "single_payment_interest_waiver_pct")
  const escalateAbove = snapshotNumber(snapshot, "escalate_above_amount_cents")

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Reglas aplicadas</CardTitle>
        <CardDescription>Fijadas al crear la negociación.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {maxInstallments !== null ? <Row label="Cuotas máximas" value={String(maxInstallments)} /> : null}
        {downPayment !== null ? <Row label="Anticipo mínimo" value={`${downPayment} %`} /> : null}
        {waiver !== null ? <Row label="Quita de intereses en cuotas" value={`hasta ${waiver} %`} /> : null}
        {singleWaiver !== null ? <Row label="Quita en pago único" value={`hasta ${singleWaiver} %`} /> : null}
        <Row
          label="Deriva a una persona desde"
          value={escalateAbove !== null ? formatARS(escalateAbove) : "Sin umbral"}
        />
      </CardContent>
    </Card>
  )
}

function ActivityCard({ negotiation }: { negotiation: Negotiation }) {
  if (negotiation.audit_events.length === 0) return null
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Actividad</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-2">
          {negotiation.audit_events.map((event) => (
            <li key={event.id} className="flex justify-between gap-3">
              <span>{auditEventLabel[event.type] ?? event.type}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDateTime(event.created_at)}
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
