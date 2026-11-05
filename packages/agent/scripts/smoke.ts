// Prueba de humo: verifica que la API key y el modelo configurados respondan.
// Uso: pnpm smoke:llm (desde la raíz). Lee apps/platform/.env.local.
import { streamText, stepCountIs, tool } from "ai"
import { z } from "zod"
import { createConfiguredModel } from "../src/model"

const model = createConfiguredModel(process.env)
let toolExecuted = false

const result = streamText({
  model,
  prompt:
    "Llamá a smoke_check y luego respondé únicamente el código que devuelve.",
  tools: {
    smoke_check: tool({
      description: "Devuelve el código de verificación de la integración.",
      inputSchema: z.object({}),
      execute: () => {
        toolExecuted = true
        return { code: "pacta-tools-ok" }
      },
    }),
  },
  prepareStep: ({ stepNumber }) => ({
    toolChoice:
      stepNumber === 0 ? { type: "tool", toolName: "smoke_check" } : "none",
  }),
  stopWhen: stepCountIs(2),
})

const [text, usage, steps] = await Promise.all([
  result.text,
  result.usage,
  result.steps,
])

if (!toolExecuted || steps.length < 2 || !text.includes("pacta-tools-ok")) {
  throw new Error(
    "El modelo no completó el ciclo herramienta → resultado → respuesta."
  )
}
console.log(`Proveedor: ${process.env.AI_PROVIDER ?? "gateway"}`)
console.log(`Modelo: ${process.env.AI_MODEL}`)
console.log(`Respuesta: ${text}`)
console.log("Uso:", usage)
