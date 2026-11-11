import { notFound } from "@tanstack/react-router"

import { SANDBOX_DRAFT_KEY, sandboxConfigSchema } from "@/lib/sandbox"
import type { SandboxConfig, SandboxInfo, SandboxSession } from "@/lib/sandbox"

// El sandbox solo existe en desarrollo: la API responde 404 en producción.
export function ensureSandboxEnabled() {
  if (!import.meta.env.DEV) throw notFound()
}

async function call<T>(input: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(input, init)
  } catch {
    throw new Error("No se pudo conectar al servidor.")
  }
  const data = await response.json().catch(() => null)
  if (!response.ok)
    throw new Error(data?.error ?? "No se pudo completar la operación.")
  return data as T
}

export const fetchSandboxInfo = () => call<SandboxInfo>("/api/sandbox")

export function fetchSandboxSession(sessionId: string) {
  return call<SandboxSession>(
    `/api/sandbox?sessionId=${encodeURIComponent(sessionId)}`
  )
}

export type SandboxAction =
  | { action: "start"; config: SandboxConfig }
  | { action: "message"; sessionId: string; text: string }
  | { action: "accept"; sessionId: string; offerId: string }

export function postSandbox(body: SandboxAction) {
  return call<SandboxSession>("/api/sandbox", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

export function loadSandboxDraft(): SandboxConfig | null {
  try {
    const raw = sessionStorage.getItem(SANDBOX_DRAFT_KEY)
    if (!raw) return null
    const parsed = sandboxConfigSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function saveSandboxDraft(config: SandboxConfig) {
  try {
    sessionStorage.setItem(SANDBOX_DRAFT_KEY, JSON.stringify(config))
  } catch {
    // Sin almacenamiento disponible: el formulario igual funciona.
  }
}

export function clearSandboxDraft() {
  try {
    sessionStorage.removeItem(SANDBOX_DRAFT_KEY)
  } catch {
    // Ignorado: ver saveSandboxDraft.
  }
}
