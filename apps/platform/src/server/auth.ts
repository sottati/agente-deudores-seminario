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
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
      .from("memberships")
      .select("organizations(id, name, kind, display_name_for_debtors)")
      .limit(1)
      .maybeSingle()
    const organization = data?.organizations
    if (!organization) return null

    const email = user.email ?? ""
    const fullName =
      typeof user.user_metadata.full_name === "string"
        ? user.user_metadata.full_name
        : email
    return {
      user: { id: user.id, email, fullName },
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

export const signOut = createServerFn({ method: "POST" }).handler(
  async () => {
    const supabase = createServerSupabase()
    await supabase.auth.signOut()
  }
)
