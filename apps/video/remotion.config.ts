import path from "node:path"
import { Config } from "@remotion/cli/config"
import { enableTailwind } from "@remotion/tailwind-v4"

Config.setVideoImageFormat("jpeg")
Config.setJpegQuality(95)
Config.setOverwriteOutput(true)
Config.setConcurrency(6)

// `@/` apunta al código de apps/platform: el video reutiliza sus componentes
// de UI (Card, Badge, Button, Input, Table) y sus tokens de diseño.
Config.overrideWebpackConfig((config) => {
  const withTailwind = enableTailwind(config)
  return {
    ...withTailwind,
    resolve: {
      ...withTailwind.resolve,
      alias: {
        ...(withTailwind.resolve?.alias ?? {}),
        "@": path.resolve(process.cwd(), "../platform/src"),
      },
    },
  }
})
