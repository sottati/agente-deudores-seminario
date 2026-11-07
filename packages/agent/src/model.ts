import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { createGateway } from "ai"
import { z } from "zod"

const modelConfigSchema = z.object({
  AI_PROVIDER: z.enum(["gateway", "openrouter"]).default("gateway"),
  AI_MODEL: z.string().trim().min(1),
  AI_GATEWAY_API_KEY: z.string().trim().optional(),
  OPENROUTER_API_KEY: z.string().trim().optional(),
})

/** La aplicación y el smoke test usan la misma configuración. No lee env al importar. */
export function createConfiguredModel(env: Record<string, string | undefined>) {
  const parsed = modelConfigSchema.safeParse(env)
  if (!parsed.success) {
    throw new Error(
      "Configuración del asistente inválida. Revisá AI_PROVIDER y AI_MODEL."
    )
  }
  const config = parsed.data
  if (config.AI_PROVIDER === "openrouter") {
    if (!config.OPENROUTER_API_KEY) throw new Error("Falta OPENROUTER_API_KEY.")
    return createOpenRouter({ apiKey: config.OPENROUTER_API_KEY })(
      config.AI_MODEL
    )
  }
  if (!config.AI_GATEWAY_API_KEY) throw new Error("Falta AI_GATEWAY_API_KEY.")
  return createGateway({ apiKey: config.AI_GATEWAY_API_KEY })(config.AI_MODEL)
}
