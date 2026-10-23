import type { Json } from "./types.gen"
import type { ServerSupabase } from "./supabase-server"

type AuditContext = {
  supabase: ServerSupabase
  organizationId: string
  user: { id: string }
}

export async function logAuditEvent(
  context: AuditContext,
  type: string,
  negotiationId: string | null,
  payload: NonNullable<Json> = {}
) {
  const { error } = await context.supabase.from("audit_events").insert({
    organization_id: context.organizationId,
    negotiation_id: negotiationId,
    type,
    payload,
    actor_user_id: context.user.id,
  })
  if (error) throw new Error(error.message)
}

export function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}
