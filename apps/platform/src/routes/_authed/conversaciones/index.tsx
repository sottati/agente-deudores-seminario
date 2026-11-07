import { Link, createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { ButtonLink } from "@/components/button-link"
import { PageBody, PageHeader } from "@/components/page-header"
import { NegotiationStatusBadge } from "@/components/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatARS, formatRelative } from "@/lib/format"
import { negotiationFilters } from "@/lib/labels"
import type { NegotiationFilter } from "@/lib/labels"
import { listNegotiations } from "@/server/negotiations"

const filterKeys = Object.keys(negotiationFilters) as [
  NegotiationFilter,
  ...NegotiationFilter[],
]

export const Route = createFileRoute("/_authed/conversaciones/")({
  validateSearch: z.object({ estado: z.enum(filterKeys).optional() }),
  loaderDeps: ({ search }) => ({ filter: search.estado ?? "todas" }),
  loader: ({ deps }) => listNegotiations({ data: { filter: deps.filter } }),
  component: ConversationsPage,
  head: () => ({ meta: [{ title: "Conversaciones | pacta.ia" }] }),
})

function ConversationsPage() {
  const negotiations = Route.useLoaderData()
  const { filter } = Route.useLoaderDeps()

  return (
    <>
      <PageHeader title="Conversaciones" />
      <PageBody>
        <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
          {filterKeys.map((key) => (
            <ButtonLink
              key={key}
              size="sm"
              variant={key === filter ? "default" : "outline"}
              to="/conversaciones"
              search={key === "todas" ? {} : { estado: key }}
            >
              {negotiationFilters[key].label}
            </ButtonLink>
          ))}
        </nav>

        <Card className="py-0">
          <CardContent className="px-0">
            {negotiations.length === 0 ? (
              <p className="px-4 py-10 text-center text-muted-foreground">
                No hay conversaciones en este estado.
              </p>
            ) : (
              <ul className="divide-y">
                {negotiations.map((negotiation) => {
                  const debt = negotiation.debts
                  const debtor = debt.debtors
                  return (
                    <li key={negotiation.id}>
                      <Link
                        to="/conversaciones/$negotiationId"
                        params={{ negotiationId: negotiation.id }}
                        className="grid gap-2 px-4 py-3 transition-colors hover:bg-muted/50 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {debtor.alias}
                            <span className="font-normal text-muted-foreground">
                              {debtor.group_label
                                ? ` · ${debtor.group_label}`
                                : ""}
                            </span>
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {debt.concept}
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <p className="font-medium tabular-nums">
                            {formatARS(
                              debt.principal_cents + debt.interest_cents
                            )}
                          </p>
                          <time
                            dateTime={negotiation.lastActivityAt}
                            className="text-xs text-muted-foreground"
                            suppressHydrationWarning
                          >
                            {formatRelative(negotiation.lastActivityAt)}
                          </time>
                        </div>
                        <NegotiationStatusBadge status={negotiation.status} />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </PageBody>
    </>
  )
}
