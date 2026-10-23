import { useMemo, useState } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { CreateDebtorDialog } from "@/components/debtor-dialogs"
import { PageBody, PageHeader } from "@/components/page-header"
import { DebtStatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatARS } from "@/lib/format"
import type { DebtStatus } from "@/lib/labels"
import { listDebtors } from "@/server/debtors"

export const Route = createFileRoute("/_authed/deudores/")({
  loader: () => listDebtors(),
  component: DebtorsPage,
  head: () => ({ meta: [{ title: "Deudores | pacta.ia" }] }),
})

const PENDING: DebtStatus[] = ["open", "in_negotiation", "agreed"]
// Estado más relevante para la administración cuando hay varias deudas.
const PRIORITY: DebtStatus[] = ["in_negotiation", "open", "agreed", "paid", "written_off"]

type DebtorRow = Awaited<ReturnType<typeof listDebtors>>[number]

function summarize(debtor: DebtorRow) {
  const pendingCents = debtor.debts
    .filter((debt) => PENDING.includes(debt.status))
    .reduce((sum, debt) => sum + debt.principal_cents + debt.interest_cents, 0)
  const status = PRIORITY.find((candidate) =>
    debtor.debts.some((debt) => debt.status === candidate)
  )
  return { pendingCents, status }
}

function DebtorsPage() {
  const debtors = Route.useLoaderData()
  const [query, setQuery] = useState("")

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return debtors
      .filter((debtor) =>
        !needle
          ? true
          : [debtor.alias, debtor.full_name, debtor.group_label ?? ""].some((value) =>
              value.toLowerCase().includes(needle)
            )
      )
      .map((debtor) => ({ debtor, ...summarize(debtor) }))
  }, [debtors, query])

  return (
    <>
      <PageHeader title="Deudores">
        <CreateDebtorDialog
          trigger={
            <Button>
              <HugeiconsIcon icon={PlusSignIcon} data-icon="inline-start" />
              <span className="hidden sm:inline">Nuevo deudor</span>
            </Button>
          }
        />
      </PageHeader>
      <PageBody>
        <div className="relative max-w-sm">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Buscar por unidad, nombre o edificio"
            aria-label="Buscar deudores"
            className="pl-8"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <Card className="py-0">
          <CardContent className="px-0">
            {rows.length === 0 ? (
              <p className="px-4 py-10 text-center text-muted-foreground">
                {debtors.length === 0
                  ? "Todavía no cargaste deudores."
                  : "Ningún deudor coincide con la búsqueda."}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Deudor</TableHead>
                    <TableHead className="hidden md:table-cell">Edificio / curso</TableHead>
                    <TableHead className="text-right">Deuda pendiente</TableHead>
                    <TableHead className="pr-4">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(({ debtor, pendingCents, status }) => (
                    <TableRow key={debtor.id}>
                      <TableCell className="pl-4">
                        <Link
                          to="/deudores/$debtorId"
                          params={{ debtorId: debtor.id }}
                          className="font-medium hover:underline"
                        >
                          {debtor.alias}
                        </Link>
                        <p className="text-xs text-muted-foreground">{debtor.full_name}</p>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {debtor.group_label ?? "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {pendingCents > 0 ? formatARS(pendingCents) : "—"}
                      </TableCell>
                      <TableCell className="pr-4">
                        {status ? (
                          <DebtStatusBadge status={status} />
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin deudas</span>
                        )}
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
