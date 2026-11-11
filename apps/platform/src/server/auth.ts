import { createServerFn } from "@tanstack/react-start"

import type { OrganizationKind } from "@/lib/labels"
import { createServerSupabase } from "./db/supabase-server"
import { signInSchema } from "./schemas"

export type SessionContext = {
  user: { id: string; email: string; fullName: string }
  organization: {
    id: string
    name: string
    kind: OrganizationKind
    displayNameForDebtors: string
  }
}

export const getSessionContext = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionContext | null> => {
    const supabase = createServerSupabase()
    // Verificación local del JWT (ver middleware.ts): evita un viaje a Auth.
    const { data: auth } = await supabase.auth.getClaims()
    if (!auth) return null
    const { claims } = auth

    const { data } = await supabase
      .from("memberships")
      .select("organizations(id, name, kind, display_name_for_debtors)")
      .order("organization_id")
      .limit(1)
      .maybeSingle()
    const organization = data?.organizations
    if (!organization) return null

    const email = claims.email ?? ""
    const metadataName = claims.user_metadata?.full_name
    const fullName = typeof metadataName === "string" ? metadataName : email
    return {
      user: { id: claims.sub, email, fullName },
      organization: {
        id: organization.id,
        name: organization.name,
        kind: organization.kind,
        displayNameForDebtors: organization.display_name_for_debtors,
      },
    }
  }
)

export const signIn = createServerFn({ method: "POST" })
  .validator(signInSchema)
  .handler(async ({ data }) => {
    const supabase = createServerSupabase()
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) {
      return { error: "El email o la contraseña no son correctos." }
    }
    return { error: null }
  })

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = createServerSupabase()
  await supabase.auth.signOut()
})
