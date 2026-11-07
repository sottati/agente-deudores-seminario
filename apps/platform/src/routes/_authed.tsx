import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getSessionContext } from "@/server/auth"

// Layout protegido del panel: sin sesión redirige a /login y, con sesión,
// expone `session` (usuario + organización) en el contexto de las rutas hijas.
export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    const session = await getSessionContext()
    if (!session) {
      throw redirect({ to: "/login", search: { redirect: location.href } })
    }
    return { session }
  },
  component: AuthedLayout,
})

function AuthedLayout() {
  const { session } = Route.useRouteContext()
  return (
    <SidebarProvider>
      <AppSidebar session={session} />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
