import { createFileRoute } from "@tanstack/react-router"
import {
  Notification02Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { AppSidebar } from "@/components/app-sidebar"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard | Cobro" }] }),
})

function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/95 px-2 backdrop-blur md:px-4">
          <SidebarTrigger aria-label="Abrir o cerrar navegación" />
          <div className="h-4 w-px bg-border" />
          <p className="text-sm font-medium">Dashboard</p>
          <Button
            className="ml-auto"
            variant="ghost"
            size="icon-sm"
            aria-label="Notificaciones"
          >
            <HugeiconsIcon icon={Notification02Icon} strokeWidth={2} />
          </Button>
          <Button aria-label="Nueva negociación">
            <HugeiconsIcon icon={PlusSignIcon} data-icon="inline-start" />
            <span className="hidden sm:inline">Nueva negociación</span>
          </Button>
        </header>

        <div className="flex flex-1 flex-col p-2 md:p-4 lg:p-6">
          <DashboardOverview />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
