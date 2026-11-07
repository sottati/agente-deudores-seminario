import { defineConfig, loadEnv } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const config = defineConfig(({ mode }) => {
  // Variables del LLM solo en el servidor; no usan el prefijo público VITE_.
  const env = loadEnv(mode, process.cwd(), "")
  for (const key of [
    "AI_PROVIDER",
    "AI_MODEL",
    "AI_GATEWAY_API_KEY",
    "OPENROUTER_API_KEY",
  ]) {
    if (env[key] && !process.env[key]) process.env[key] = env[key]
  }
  return {
    resolve: { tsconfigPaths: true },
    plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
  }
})

export default config
