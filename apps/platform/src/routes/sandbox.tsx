import { createFileRoute } from "@tanstack/react-router"
import { AgentSandbox } from "@/components/agent-sandbox"

export const Route = createFileRoute("/sandbox")({
  head: () => ({
    meta: [
      { title: "Sandbox del agente | pacta.ai" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AgentSandbox,
})
