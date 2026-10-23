import { Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { BrandIsotipo } from "@/components/brand-logo"
import {
  BotIcon,
  DashboardSquare02Icon,
  Logout01Icon,
  MessageMultiple02Icon,
  Settings02Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { signOut, type SessionContext } from "@/server/auth"

const navItems = [
  { title: "Dashboard", to: "/dashboard", icon: DashboardSquare02Icon },
  { title: "Conversaciones", to: "/conversaciones", icon: MessageMultiple02Icon },
  { title: "Deudores", to: "/deudores", icon: UserMultipleIcon },
] as const

const footerNavItems = [
  { title: "Reglas del agente", to: "/reglas", icon: BotIcon },
  { title: "Configuración", to: "/configuracion", icon: Settings02Icon },
] as const

export function AppSidebar({ session }: { session: SessionContext }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`)

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="print:hidden">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="pacta.ia"
              render={<Link to="/dashboard" />}
            >
              <BrandIsotipo />
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-semibold lowercase">
                  pacta.ia
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {session.organization.name}
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
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    isActive={isActive(item.to)}
                    tooltip={item.title}
                    render={<Link to={item.to} />}
                  >
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
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton
                isActive={isActive(item.to)}
                tooltip={item.title}
                render={<Link to={item.to} />}
              >
                <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <UserMenu session={session} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function UserMenu({ session }: { session: SessionContext }) {
  const router = useRouter()
  const navigate = useNavigate()
  const signOutFn = useServerFn(signOut)
  const initial = session.user.fullName.charAt(0).toUpperCase()

  async function handleSignOut() {
    await signOutFn()
    await router.invalidate()
    await navigate({ to: "/login" })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<SidebarMenuButton size="lg" tooltip={session.user.fullName} />}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold">
          {initial}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-medium">
            {session.user.fullName}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {session.user.email}
          </span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{session.organization.name}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
