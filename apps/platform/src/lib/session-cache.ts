import type { SessionContext } from "@/server/auth"

// Sesión del panel recordada en el navegador para no pedirla al servidor en
// cada cambio de sección. Es solo para mostrar datos (nombre, organización):
// la seguridad la siguen dando authMiddleware y RLS en cada server function.
// En el servidor (SSR) nunca se guarda, porque el módulo se comparte entre
// usuarios.
let cached: SessionContext | null = null

const isBrowser = () => typeof window !== "undefined"

export function getCachedSession() {
  return isBrowser() ? cached : null
}

export function rememberSession(session: SessionContext) {
  if (isBrowser()) cached = session
}

/** Llamar al iniciar o cerrar sesión, o al cambiar datos de la organización. */
export function clearCachedSession() {
  cached = null
}
