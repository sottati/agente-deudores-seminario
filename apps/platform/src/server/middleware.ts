import { createMiddleware } from "@tanstack/react-start"
import { redirect } from "@tanstack/react-router"

import { createServerSupabase } from "./db/supabase-server"

// Exige sesión de administrador y resuelve su organización. Los server
// functions del panel lo declaran con `.middleware([authMiddleware])` y
// reciben `context.supabase`, `context.user` y `context.organizationId`.
export const authMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const supabase = createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw redirect({ to: "/login" })

    const { data: membership, error } = await supabase
      .from("memberships")
      .select("organization_id")
      .limit(1)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!membership) {
      throw new Error("Tu usuario no pertenece a ninguna organización.")
    }

    return next({
      context: { supabase, user, organizationId: membership.organization_id },
    })
  }
)
