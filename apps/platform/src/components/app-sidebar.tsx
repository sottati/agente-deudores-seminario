import { Link } from "@tanstack/react-router"
import {
  BotIcon,
  Building02Icon,
  DashboardSquare02Icon,
  MessageMultiple02Icon,
  Settings02Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navItems = [
  { title: "Conversaciones", icon: MessageMultiple02Icon },
  { title: "Deudores", icon: UserMultipleIcon },
]

const footerNavItems = [
  { title: "Reglas del agente", icon: BotIcon },
  { title: "Configuración", icon: Settings02Icon },
]

export function AppSidebar() {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Cobro"
              render={<Link to="/dashboard" />}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HugeiconsIcon icon={Building02Icon} strokeWidth={2} />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-semibold">Cobro</span>
                <span className="block truncate text-xs text-muted-foreground">
                  Consorcios del Sur
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive
                  tooltip="Dashboard"
                  render={<Link to="/dashboard" />}
                >
                  <HugeiconsIcon icon={DashboardSquare02Icon} strokeWidth={2} />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton disabled tooltip={item.title}>
                    <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {footerNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton disabled tooltip={item.title}>
                <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Simon">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold">
                S
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-medium">
                  Simon
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  Administradora
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
