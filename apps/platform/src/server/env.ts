import "@tanstack/react-start/server-only"
import { z } from "zod"

const envSchema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_ANON_KEY: z.string().min(1),
})

export function getServerEnv() {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ")
    throw new Error(
      `Variables de entorno faltantes o inválidas: ${missing}. Revisá apps/platform/.env.local (ver .env.example).`
    )
  }
  return parsed.data
}
