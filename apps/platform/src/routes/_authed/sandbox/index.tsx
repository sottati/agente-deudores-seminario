import { createFileRoute } from "@tanstack/react-router"

import { SandboxConfigForm } from "@/components/sandbox/sandbox-config-form"
import { sandboxAgentFromPolicy } from "@/lib/sandbox"
import { ensureSandboxEnabled } from "@/lib/sandbox-client"
import { getPolicy } from "@/server/settings"

export const Route = createFileRoute("/_authed/sandbox/")({
  beforeLoad: ensureSandboxEnabled,
  loader: async () => sandboxAgentFromPolicy(await getPolicy()),
  component: SandboxConfigPage,
  head: () => ({
    meta: [
      { title: "Simulador del agente | pacta.ai" },
      { name: "robots", content: "noindex" },
    ],
  }),
})

function SandboxConfigPage() {
  const savedAgent = Route.useLoaderData()
  const { session } = Route.useRouteContext()
  return (
    <SandboxConfigForm
      organizationName={session.organization.displayNameForDebtors}
      savedAgent={savedAgent}
    />
  )
}
