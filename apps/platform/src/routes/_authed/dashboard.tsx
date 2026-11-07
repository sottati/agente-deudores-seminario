import { Suspense } from "react"
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  DashboardOverview,
  DashboardOverviewSkeleton,
  buildDashboardViewData,
} from "@/components/dashboard/dashboard-overview"
import { NewNegotiationDialog } from "@/components/new-negotiation-dialog"
import { PageBody, PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  getAgreementsByPlan,
  getAttentionItems,
  getDashboardKpis,
  getMonthlyRecovery,
  listRecentAgreements,
} from "@/server/metrics"

export const dashboardKpisQueryOptions = () =>
  queryOptions({
    queryKey: ["dashboard", "kpis"],
    queryFn: () => getDashboardKpis(),
  })

export const monthlyRecoveryQueryOptions = (months = 6) =>
  queryOptions({
    queryKey: ["dashboard", "monthly-recovery", { months }],
    queryFn: () => getMonthlyRecovery({ data: { months } }),
  })

export const agreementsByPlanQueryOptions = (period = "all") =>
  queryOptions({
    queryKey: ["dashboard", "agreements-by-plan", { period }],
    queryFn: () => getAgreementsByPlan({ data: { period } }),
  })

export const recentAgreementsQueryOptions = (limit = 3) =>
  queryOptions({
    queryKey: ["dashboard", "recent-agreements", { limit }],
    queryFn: () => listRecentAgreements({ data: { limit } }),
  })

export const attentionItemsQueryOptions = () =>
  queryOptions({
    queryKey: ["dashboard", "attention-items"],
    queryFn: () => getAttentionItems(),
  })

export const Route = createFileRoute("/_authed/dashboard")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(dashboardKpisQueryOptions()),
      context.queryClient.ensureQueryData(monthlyRecoveryQueryOptions(6)),
      context.queryClient.ensureQueryData(agreementsByPlanQueryOptions("all")),
      context.queryClient.ensureQueryData(recentAgreementsQueryOptions(3)),
      context.queryClient.ensureQueryData(attentionItemsQueryOptions()),
    ])
  },
  pendingComponent: DashboardPendingPage,
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard | pacta.ia" }] }),
})

function DashboardHeader() {
  return (
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
  )
}

function DashboardPendingPage() {
  return (
    <>
      <DashboardHeader />
      <PageBody>
        <DashboardOverviewSkeleton />
      </PageBody>
    </>
  )
}

function DashboardContent() {
  const { data: kpis } = useSuspenseQuery(dashboardKpisQueryOptions())
  const { data: monthlyRecovery } = useSuspenseQuery(
    monthlyRecoveryQueryOptions(6)
  )
  const { data: agreementsByPlan } = useSuspenseQuery(
    agreementsByPlanQueryOptions("all")
  )
  const { data: recentAgreements } = useSuspenseQuery(
    recentAgreementsQueryOptions(3)
  )
  const { data: attentionItems } = useSuspenseQuery(
    attentionItemsQueryOptions()
  )

  const viewData = buildDashboardViewData({
    kpis,
    monthlyRecovery,
    agreementsByPlan,
    recentAgreements,
    attentionItems,
  })

  return <DashboardOverview data={viewData} interactive />
}

function DashboardPage() {
  return (
    <>
      <DashboardHeader />
      <PageBody>
        <Suspense fallback={<DashboardOverviewSkeleton />}>
          <DashboardContent />
        </Suspense>
      </PageBody>
    </>
  )
}
