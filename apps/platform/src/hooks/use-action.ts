import { useRouter } from "@tanstack/react-router"
import { useState } from "react"

/** Mensaje legible de un error de server function (incluye errores de Zod). */
export function errorMessage(error: unknown) {
  if (error instanceof Error) {
    try {
      const issues: unknown = JSON.parse(error.message)
      if (Array.isArray(issues) && typeof issues[0]?.message === "string") {
        return issues[0].message as string
      }
    } catch {
      // No era un error de validación serializado.
    }
    return error.message
  }
  return "Ocurrió un error inesperado."
}

/**
 * Ejecuta una mutación (server function), expone estado de carga/error y
 * revalida los loaders de la ruta al terminar bien.
 */
export function useAction<TInput, TResult>(
  action: (input: TInput) => Promise<TResult>
) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(
    input: TInput
  ): Promise<{ ok: true; data: TResult } | { ok: false }> {
    setPending(true)
    setError(null)
    try {
      const data = await action(input)
      await router.invalidate()
      return { ok: true, data }
    } catch (caught) {
      setError(errorMessage(caught))
      return { ok: false }
    } finally {
      setPending(false)
    }
  }

  return { run, pending, error, clearError: () => setError(null) }
}

/** FormData → objeto de strings (los server functions validan y convierten). */
export function formValues(form: HTMLFormElement) {
  const values: Record<string, string> = {}
  for (const [key, value] of new FormData(form)) {
    if (typeof value === "string") values[key] = value
  }
  return values
}
