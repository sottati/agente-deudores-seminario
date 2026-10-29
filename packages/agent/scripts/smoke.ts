// Prueba de humo: verifica que la API key y el modelo configurados respondan.
// Uso: pnpm smoke:llm (desde la raíz). Lee apps/platform/.env.local.
import { generateText } from "ai"

const model = process.env.AI_MODEL
if (!model) {
  console.error(
    "Falta AI_MODEL. Copiá apps/platform/.env.example a apps/platform/.env.local y completalo."
  )
  process.exit(1)
}

const { text, usage } = await generateText({
  model,
  prompt: 'Respondé únicamente "ok".',
})

console.log(`Modelo: ${model}`)
console.log(`Respuesta: ${text}`)
console.log("Uso:", usage)
