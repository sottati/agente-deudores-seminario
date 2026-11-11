import { fileURLToPath } from "node:url"
import { configDefaults, defineConfig } from "vitest/config"

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    clearMocks: true,
    restoreMocks: true,
    // Las evals con el modelo real se corren a demanda con `pnpm eval:llm`.
    exclude: [...configDefaults.exclude, "**/*.llm.test.ts"],
  },
})
