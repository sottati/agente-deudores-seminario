import { createFileRoute } from "@tanstack/react-router"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { NewNegotiationDialog } from "@/components/new-negotiation-dialog"
import { PageBody, PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_authed/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard | pacta.ia" }] }),
})

// Las métricas todavía son de ejemplo: se conectan a la base en el Sprint 4
// (PLAN_BACKEND §5, vistas v_dashboard_*).
function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard">
        <NewNegotiationDialog
          trigger={
            <Button aria-label="Nueva negociación">
              <HugeiconsIcon icon={PlusSignIcon} data-icon="inline-start" />
              <span className="hidden sm:inline">Nueva negociación</span>
            </Button>
          }
        />
      </PageHeader>
      <PageBody>
        <DashboardOverview />
      </PageBody>
    </>
  )
}
