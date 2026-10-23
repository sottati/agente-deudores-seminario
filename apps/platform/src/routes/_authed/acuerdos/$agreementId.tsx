import { createFileRoute } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { PrinterIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { ButtonLink } from "@/components/button-link"
import { FormError } from "@/components/form-field"
import { PageBody, PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAction } from "@/hooks/use-action"
import { formatARS, formatDate, formatDateTime } from "@/lib/format"
import { installmentsLabel } from "@/lib/labels"
import { getAgreement, setInstallmentPaid } from "@/server/agreements"

export const Route = createFileRoute("/_authed/acuerdos/$agreementId")({
  loader: ({ params }) => getAgreement({ data: { id: params.agreementId } }),
  component: AgreementPage,
  head: () => ({ meta: [{ title: "Acta de acuerdo | pacta.ia" }] }),
})

// Acta imprimible ("Guardar como PDF" desde el navegador), PLAN_BACKEND D11.
function AgreementPage() {
  const agreement = Route.useLoaderData()
  const markPaid = useAction(useServerFn(setInstallmentPaid))
  const { debt, debtor, offer, organization } = agreement
  const originalCents = debt.principal_cents + debt.interest_cents
  const paidCents = agreement.installments
    .filter((item) => item.paid_at)
    .reduce((sum, item) => sum + item.amount_cents, 0)

  return (
    <>
      <PageHeader title="Acta de acuerdo">
        <ButtonLink
          variant="outline"
          to="/conversaciones/$negotiationId"
          params={{ negotiationId: agreement.negotiationId }}
        >
          Ver conversación
        </ButtonLink>
        <Button onClick={() => window.print()}>
          <HugeiconsIcon icon={PrinterIcon} data-icon="inline-start" />
          <span className="hidden sm:inline">Imprimir / PDF</span>
        </Button>
      </PageHeader>
      <PageBody>
        <article className="mx-auto grid w-full max-w-3xl gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10 print:max-w-none print:p-0 print:ring-0">
          <header className="grid gap-1 border-b pb-4">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              Acta de acuerdo de pago · {organization.display_name_for_debtors}
            </p>
            <h2 className="text-xl font-semibold">
              {installmentsLabel(offer.installments)} por {formatARS(offer.total_cents)}
            </h2>
            <p className="text-muted-foreground">
              Aceptado el {formatDateTime(agreement.acceptedAt)}
            </p>
          </header>

          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-1 font-medium">Acreedor</h3>
              <p>{organization.name}</p>
            </div>
            <div>
              <h3 className="mb-1 font-medium">Deudor</h3>
              <p>{debtor.full_name}</p>
              <p className="text-muted-foreground">
                {debtor.alias}
                {debtor.group_label ? ` · ${debtor.group_label}` : ""}
              </p>
            </div>
          </section>

          <section className="grid gap-2">
            <h3 className="font-medium">Deuda regularizada</h3>
            <p>{debt.concept} (vencida el {formatDate(debt.due_date)})</p>
            <dl className="grid gap-1 sm:max-w-sm">
              <Amount label="Capital" cents={debt.principal_cents} />
              <Amount label="Intereses" cents={debt.interest_cents} />
              <Amount label="Deuda original" cents={originalCents} />
              <Amount label="Quita de intereses" cents={-offer.waived_interest_cents} />
              <Amount label="Total acordado" cents={offer.total_cents} strong />
            </dl>
          </section>

          <section className="grid gap-2">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-medium">Cronograma de pagos</h3>
              <p className="text-xs text-muted-foreground print:hidden">
                Cobrado: {formatARS(paidCents)} de {formatARS(offer.total_cents)}
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cuota</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead className="text-right">Importe</TableHead>
                  <TableHead className="text-right print:hidden">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agreement.installments.map((installment) => (
                  <TableRow key={installment.id}>
                    <TableCell>{installment.number}</TableCell>
                    <TableCell>{formatDate(installment.due_date)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatARS(installment.amount_cents)}
                    </TableCell>
                    <TableCell className="text-right print:hidden">
                      <Button
                        size="sm"
                        variant={installment.paid_at ? "secondary" : "outline"}
                        disabled={markPaid.pending}
                        onClick={() =>
                          markPaid.run({
                            data: { id: installment.id, paid: !installment.paid_at },
                          })
                        }
                      >
                        {installment.paid_at
                          ? `Pagada ${formatDate(installment.paid_at)}`
                          : "Marcar pagada"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <FormError message={markPaid.error} />
          </section>

          <section className="grid gap-2 border-t pt-4 text-xs text-muted-foreground">
            <h3 className="text-sm font-medium text-foreground">Evidencia de aceptación</h3>
            <p>
              El deudor aceptó expresamente los términos mediante el botón "Acepto
              los términos del plan de pago" en el canal de negociación de pacta.ia.
            </p>
            <dl className="grid gap-1 break-all sm:grid-cols-[auto_1fr] sm:gap-x-4">
              <dt>Fecha y hora</dt>
              <dd>{formatDateTime(agreement.acceptedAt)}</dd>
              <dt>Dirección IP</dt>
              <dd>{agreement.acceptanceIp ?? "—"}</dd>
              <dt>Navegador</dt>
              <dd>{agreement.userAgent ?? "—"}</dd>
              <dt>Hash SHA-256 de la conversación</dt>
              <dd className="font-mono">{agreement.transcriptSha256}</dd>
              <dt>Versión de plantilla / motor</dt>
              <dd>
                {agreement.templateVersion} / {offer.engine_version}
              </dd>
            </dl>
          </section>
        </article>
      </PageBody>
    </>
  )
}

function Amount({ label, cents, strong }: { label: string; cents: number; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={strong ? "font-semibold tabular-nums" : "tabular-nums"}>{formatARS(cents)}</dd>
    </div>
  )
}
