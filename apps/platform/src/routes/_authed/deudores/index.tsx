import { useMemo, useState } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { ButtonLink } from "@/components/button-link"
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
import { debtStatusMeta } from "@/lib/labels"
import type { DebtStatus } from "@/lib/labels"
import { listDebtors } from "@/server/debtors"

// Filtro por el estado que muestra la columna "Estado" (el más relevante del
// deudor). "sin_deudas": deudores sin ninguna deuda cargada.
const statusFilters = [
  "todos",
  "in_negotiation",
  "open",
  "agreed",
  "paid",
  "written_off",
  "sin_deudas",
] as const
type StatusFilter = (typeof statusFilters)[number]

const filterLabel = (filter: StatusFilter) =>
  filter === "todos"
    ? "Todos"
    : filter === "sin_deudas"
      ? "Sin deudas"
      : debtStatusMeta[filter].label

export const Route = createFileRoute("/_authed/deudores/")({
  validateSearch: z.object({ estado: z.enum(statusFilters).optional() }),
  loader: () => listDebtors(),
  component: DebtorsPage,
  head: () => ({ meta: [{ title: "Deudores | pacta.ia" }] }),
})

const PENDING: DebtStatus[] = ["open", "in_negotiation", "agreed"]
// Estado más relevante para la administración cuando hay varias deudas.
const PRIORITY: DebtStatus[] = [
  "in_negotiation",
  "open",
  "agreed",
  "paid",
  "written_off",
]

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
  const { estado = "todos" } = Route.useSearch()
  const [query, setQuery] = useState("")

  const summarized = useMemo(
    () => debtors.map((debtor) => ({ debtor, ...summarize(debtor) })),
    [debtors]
  )
  const counts = useMemo(() => {
    const result = new Map<StatusFilter, number>([["todos", summarized.length]])
    for (const { status } of summarized) {
      const key = status ?? "sin_deudas"
      result.set(key, (result.get(key) ?? 0) + 1)
    }
    return result
  }, [summarized])

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return summarized.filter(({ debtor, status }) => {
      if (estado !== "todos" && (status ?? "sin_deudas") !== estado)
        return false
      return (
        !needle ||
        [debtor.alias, debtor.full_name, debtor.group_label ?? ""].some(
          (value) => value.toLowerCase().includes(needle)
        )
      )
    })
  }, [summarized, query, estado])

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
        <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => {
            const count = counts.get(filter) ?? 0
            // Se ocultan los estados sin deudores, salvo el que está activo.
            if (count === 0 && filter !== estado) return null
            return (
              <ButtonLink
                key={filter}
                size="sm"
                variant={filter === estado ? "default" : "outline"}
                to="/deudores"
                search={filter === "todos" ? {} : { estado: filter }}
              >
                {filterLabel(filter)}
                <span className="tabular-nums opacity-70">{count}</span>
              </ButtonLink>
            )
          })}
        </nav>

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
                  : estado !== "todos" && !query.trim()
                    ? `No hay deudores con estado "${filterLabel(estado)}".`
                    : "Ningún deudor coincide con la búsqueda."}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Deudor</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Edificio / curso
                    </TableHead>
                    <TableHead className="text-right">
                      Deuda pendiente
                    </TableHead>
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
                        <p className="text-xs text-muted-foreground">
                          {debtor.full_name}
                        </p>
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
                          <span className="text-xs text-muted-foreground">
                            Sin deudas
                          </span>
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
