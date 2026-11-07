import { createFileRoute } from "@tanstack/react-router"
import { createSandboxHandler } from "@/server/sandbox"

const handler = createSandboxHandler()

export const Route = createFileRoute("/api/sandbox")({
  server: { handlers: { GET: handler, POST: handler } },
})
