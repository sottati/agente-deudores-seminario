import { createFileRoute } from "@tanstack/react-router"
import { ChatShell, ChatStatus, DebtorChat } from "@/components/debtor-chat"
import { getDebtorChatState } from "@/server/debtor-chat"

export const Route = createFileRoute("/n/$token")({
  loader: ({ params }) => getDebtorChatState({ data: { token: params.token } }),
  component: DebtorChatPage,
  head: () => ({ meta: [{ title: "Conversá con pacta.ia" }] }),
})

function DebtorChatPage() {
  const { token } = Route.useParams()
  const state = Route.useLoaderData()
  return (
    <ChatShell>
      {state.found ? (
        <DebtorChat key={token} token={token} initialState={state} />
      ) : (
        <ChatStatus
          title="Link no válido"
          description="El enlace de negociación no existe. Contactá a la administración para obtener uno nuevo."
        />
      )}
    </ChatShell>
  )
}
