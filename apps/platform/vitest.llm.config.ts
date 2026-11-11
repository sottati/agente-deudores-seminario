import { fileURLToPath } from "node:url"
import { loadEnv } from "vite"
import { defineConfig } from "vitest/config"

// Evals con el modelo real (pnpm eval:llm). Carga las variables del LLM desde
// .env.local sin exponerlas al cliente.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  for (const key of [
    "AI_PROVIDER",
    "AI_MODEL",
    "AI_GATEWAY_API_KEY",
    "OPENROUTER_API_KEY",
    "EVAL_SCENARIOS",
  ]) {
    if (env[key] && !process.env[key]) process.env[key] = env[key]
  }
  return {
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    test: {
      include: ["src/**/*.llm.test.ts"],
      // Un escenario a la vez: evita rate limits y hace legible el costo.
      fileParallelism: false,
      sequence: { concurrent: false },
    },
  }
})
