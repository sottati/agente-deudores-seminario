import { createFileRoute } from "@tanstack/react-router"

import { ButtonLink } from "@/components/button-link"
import { PageBody, PageHeader } from "@/components/page-header"
import { SandboxChat } from "@/components/sandbox/sandbox-chat"
import { ensureSandboxEnabled, fetchSandboxSession } from "@/lib/sandbox-client"

// Las simulaciones viven en memoria del servidor y se piden con la cookie del
// navegador: el loader corre solo en el cliente.
export const Route = createFileRoute("/_authed/sandbox/$sessionId")({
  ssr: false,
  beforeLoad: ensureSandboxEnabled,
  loader: ({ params }) => fetchSandboxSession(params.sessionId),
  component: SandboxChatPage,
  pendingComponent: () => (
    <>
      <PageHeader title="Simulación" />
      <PageBody>
        <p role="status" className="text-sm text-muted-foreground">
          Cargando la simulación…
        </p>
      </PageBody>
    </>
  ),
  errorComponent: ({ error }) => (
    <>
      <PageHeader title="Simulación" />
      <PageBody>
        <div className="grid max-w-md gap-3">
          <p className="text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "No se pudo cargar la simulación."}
          </p>
          <ButtonLink to="/sandbox" className="w-fit">
            Configurar una simulación
          </ButtonLink>
        </div>
      </PageBody>
    </>
  ),
  head: () => ({
    meta: [
      { title: "Simulación | pacta.ia" },
      { name: "robots", content: "noindex" },
    ],
  }),
})

function SandboxChatPage() {
  const session = Route.useLoaderData()
  // key: al reiniciar se navega a otra sesión y el chat arranca de cero.
  return <SandboxChat key={session.id} initialSession={session} />
}
