import "@tanstack/react-start/server-only"
import { createServerClient } from "@supabase/ssr"
import { getCookies, setCookie } from "@tanstack/react-start/server"

import { getServerEnv } from "../env"
import type { Database } from "./types.gen"

// Cliente con la sesión del administrador (cookies): todas las consultas pasan
// por RLS. Para el deudor se usa debtor-access.ts (Sprint 1–2).
export function createServerSupabase() {
  const env = getServerEnv()
  return createServerClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () =>
        Object.entries(getCookies()).map(([name, value]) => ({ name, value })),
      setAll: (cookies) => {
        for (const { name, value, options } of cookies) {
          setCookie(name, value, options)
        }
      },
    },
  })
}

export type ServerSupabase = ReturnType<typeof createServerSupabase>
