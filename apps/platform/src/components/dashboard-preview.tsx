import {
  BotIcon,
  Building02Icon,
  DashboardSquare02Icon,
  MessageMultiple02Icon,
  Notification02Icon,
  PlusSignIcon,
  Settings02Icon,
  SidebarLeftIcon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { title: "Dashboard", icon: DashboardSquare02Icon, active: true },
  { title: "Conversaciones", icon: MessageMultiple02Icon },
  { title: "Deudores", icon: UserMultipleIcon },
]

const footerItems = [
  { title: "Reglas del agente", icon: BotIcon },
  { title: "Configuración", icon: Settings02Icon },
]

function PreviewSidebar() {
  return (
    <aside
      aria-hidden="true"
      className="flex w-52 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground"
    >
      <div className="border-b p-2">
        <div className="flex items-center gap-2 rounded-lg px-2 py-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HugeiconsIcon icon={Building02Icon} strokeWidth={2} />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold">pacta.ia</span>
            <span className="block truncate text-xs text-muted-foreground">
              Consorcios del Sur
            </span>
          </span>
        </div>
      </div>

      <div className="flex-1 p-2">
        <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
          Principal
        </p>
        <div className="mt-1 space-y-0.5">
          {navItems.map((item) => (
            <div
              key={item.title}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-2 text-sm",
                item.active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              <HugeiconsIcon icon={item.icon} className="size-4" strokeWidth={2} />
              <span className="truncate">{item.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-0.5 border-t p-2">
        {footerItems.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground"
          >
            <HugeiconsIcon icon={item.icon} className="size-4" strokeWidth={2} />
            <span className="truncate">{item.title}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 rounded-lg px-2 py-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold">
            S
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-medium">Simon</span>
            <span className="block truncate text-xs text-muted-foreground">
              Administradora
            </span>
          </span>
        </div>
      </div>
    </aside>
  )
}

export function DashboardPreview() {
  return (
    <section
      id="producto"
      aria-label="Vista previa del dashboard"
      className="relative scroll-mt-8"
    >
      <div
        aria-hidden="true"
        className="absolute -inset-5 -z-10 rounded-[2rem] bg-primary/8 blur-2xl"
      />
      <div className="overflow-hidden rounded-2xl bg-background shadow-2xl ring-1 shadow-foreground/8 ring-foreground/10">
        <div className="pointer-events-none flex h-[38rem] overflow-hidden select-none">
          <PreviewSidebar />

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
            <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-2 backdrop-blur md:px-4">
              <Button variant="ghost" size="icon-sm" aria-hidden="true">
                <HugeiconsIcon icon={SidebarLeftIcon} strokeWidth={2} />
              </Button>
              <div className="h-4 w-px bg-border" />
              <p className="text-sm font-medium">Dashboard</p>
              <Button
                className="ml-auto"
                variant="ghost"
                size="icon-sm"
                aria-hidden="true"
              >
                <HugeiconsIcon icon={Notification02Icon} strokeWidth={2} />
              </Button>
              <Button aria-hidden="true">
                <HugeiconsIcon icon={PlusSignIcon} data-icon="inline-start" />
                <span className="hidden sm:inline">Nueva negociación</span>
              </Button>
            </header>

            <div className="overflow-hidden p-2 md:p-4">
              <DashboardOverview compact />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
