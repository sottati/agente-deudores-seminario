import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getCachedSession, rememberSession } from "@/lib/session-cache"
import { getSessionContext } from "@/server/auth"

// Layout protegido del panel: sin sesión redirige a /login y, con sesión,
// expone `session` (usuario + organización) en el contexto de las rutas hijas.
export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    // beforeLoad corre en cada navegación: reusar la sesión evita dos viajes a
    // Supabase por cambio de sección (ver lib/session-cache.ts).
    const session = getCachedSession() ?? (await getSessionContext())
    if (!session) {
      throw redirect({ to: "/login", search: { redirect: location.href } })
    }
    rememberSession(session)
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
