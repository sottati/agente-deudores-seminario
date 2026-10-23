import { createFileRoute } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import {
  Alert02Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { ButtonLink } from "@/components/button-link"
import { CreateDebtDialog, EditDebtorDialog } from "@/components/debtor-dialogs"
import { FormError } from "@/components/form-field"
import { NewNegotiationDialog } from "@/components/new-negotiation-dialog"
import { PageBody, PageHeader } from "@/components/page-header"
import { DebtStatusBadge, NegotiationStatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAction } from "@/hooks/use-action"
import { formatARS, formatDate } from "@/lib/format"
import { getDebtor, updateDebtStatus } from "@/server/debtors"

export const Route = createFileRoute("/_authed/deudores/$debtorId")({
  loader: ({ params }) => getDebtor({ data: { id: params.debtorId } }),
  component: DebtorPage,
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.alias ?? "Deudor"} | pacta.ia` }],
  }),
})

type Debt = Awaited<ReturnType<typeof getDebtor>>["debts"][number]

function DebtorPage() {
  const debtor = Route.useLoaderData()
  const statusAction = useAction(useServerFn(updateDebtStatus))

  return (
    <>
      <PageHeader title={debtor.alias}>
        <EditDebtorDialog
          debtor={debtor}
          trigger={
            <Button variant="outline">
              <HugeiconsIcon icon={PencilEdit02Icon} data-icon="inline-start" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          }
        />
        <CreateDebtDialog
          debtorId={debtor.id}
          trigger={
            <Button>
              <HugeiconsIcon icon={PlusSignIcon} data-icon="inline-start" />
              <span className="hidden sm:inline">Agregar deuda</span>
            </Button>
          }
        />
      </PageHeader>
      <PageBody>
        <Card>
          <CardHeader>
            <CardTitle>{debtor.full_name}</CardTitle>
            <CardDescription>{debtor.group_label ?? "Sin edificio / curso"}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <Detail label="Email" value={debtor.email} />
            <Detail label="Teléfono" value={debtor.phone} />
            <Detail
              label="Verificación de identidad"
              value={debtor.hasVerification ? "DNI cargado" : null}
            />
            {!debtor.hasVerification ? (
              <p className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground sm:col-span-3">
                <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-4 shrink-0 text-primary" />
                Sin DNI cargado el deudor no puede verificar su identidad en el chat. Editalo para agregarlo.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <FormError message={statusAction.error} />

        <Card className="py-0">
          <CardContent className="px-0">
            {debtor.debts.length === 0 ? (
              <p className="px-4 py-10 text-center text-muted-foreground">
                Este deudor no tiene deudas cargadas.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Concepto</TableHead>
                    <TableHead className="hidden sm:table-cell">Vencimiento</TableHead>
                    <TableHead className="hidden text-right lg:table-cell">Capital</TableHead>
                    <TableHead className="hidden text-right lg:table-cell">Intereses</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="pr-4 text-right">
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debtor.debts.map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell className="pl-4 whitespace-normal">{debt.concept}</TableCell>
                      <TableCell className="hidden sm:table-cell">{formatDate(debt.due_date)}</TableCell>
                      <TableCell className="hidden text-right tabular-nums lg:table-cell">
                        {formatARS(debt.principal_cents)}
                      </TableCell>
                      <TableCell className="hidden text-right tabular-nums lg:table-cell">
                        {formatARS(debt.interest_cents)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatARS(debt.principal_cents + debt.interest_cents)}
                      </TableCell>
                      <TableCell>
                        <DebtStatusBadge status={debt.status} />
                      </TableCell>
                      <TableCell className="pr-4">
                        <DebtActions
                          debt={debt}
                          debtLabel={`${debtor.alias} · ${debt.concept}`}
                          onStatusChange={(status) =>
                            statusAction.run({ data: { id: debt.id, status } })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </PageBody>
    </>
  )
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate">{value ?? "—"}</p>
    </div>
  )
}

function DebtActions({
  debt,
  debtLabel,
  onStatusChange,
}: {
  debt: Debt
  debtLabel: string
  onStatusChange: (status: "open" | "paid" | "written_off") => void
}) {
  const latest = [...debt.negotiations].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  )[0]
  const canClose = debt.status === "open" || debt.status === "agreed"
  const canReopen = debt.status === "paid" || debt.status === "written_off"

  return (
    <div className="flex items-center justify-end gap-1">
      {debt.status === "open" ? (
        <NewNegotiationDialog
          debt={{ id: debt.id, label: debtLabel }}
          trigger={<Button size="sm">Negociar</Button>}
        />
      ) : latest ? (
        <ButtonLink
          size="sm"
          variant="outline"
          to="/conversaciones/$negotiationId"
          params={{ negotiationId: latest.id }}
        >
          <NegotiationStatusBadge status={latest.status} />
        </ButtonLink>
      ) : null}

      {canClose || canReopen ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button size="icon-sm" variant="ghost" aria-label="Más acciones" />}
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            {canClose ? (
              <>
                <DropdownMenuItem onClick={() => onStatusChange("paid")}>
                  Marcar como pagada
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => onStatusChange("written_off")}>
                  Marcar como incobrable
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={() => onStatusChange("open")}>Reabrir deuda</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}
