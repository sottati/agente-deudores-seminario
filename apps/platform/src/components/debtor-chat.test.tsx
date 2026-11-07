// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { createUIMessageStream, createUIMessageStreamResponse } from "ai"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DebtorChat } from "./debtor-chat"
import { getDebtorChatState, verifyIdentity } from "@/server/debtor-chat"
import type { DebtorChatState } from "@/server/debtor-chat"
import type { DebtorUIMessage } from "@/lib/debtor-chat"

vi.mock("@tanstack/react-start", () => ({
  useServerFn: (fn: unknown) => fn,
}))
vi.mock("@/server/debtor-chat", () => ({
  getDebtorChatState: vi.fn(),
  verifyIdentity: vi.fn(),
}))
type AvailableState = Extract<DebtorChatState, { found: true }>
function state(overrides: Partial<AvailableState> = {}): AvailableState {
  return {
    found: true,
    status: "pending",
    expired: false,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    verified: true,
    organizationName: "Administración demo",
    debtorAlias: "Unidad 4B",
    groupLabel: null,
    remainingAttempts: 5,
    disclosure: "Soy el asistente virtual.",
    messages: [
      {
        id: "11111111-1111-4111-8111-111111111111",
        role: "debtor",
        text: "Mensaje anterior",
      },
    ],
    ...overrides,
  }
}
function response(status: AvailableState["status"] = "active") {
  return createUIMessageStreamResponse({
    stream: createUIMessageStream<DebtorUIMessage>({
      execute: ({ writer }) => {
        writer.write({
          type: "start",
          messageId: "22222222-2222-4222-8222-222222222222",
        })
        writer.write({ type: "text-start", id: "text" })
        writer.write({
          type: "text-delta",
          id: "text",
          delta: "Respuesta del servidor",
        })
        writer.write({ type: "text-end", id: "text" })
        writer.write({
          type: "finish",
          messageMetadata: { negotiationStatus: status },
        })
      },
    }),
  })
}

beforeEach(() => {
  vi.mocked(getDebtorChatState).mockResolvedValue(state())
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => response())
  )
  HTMLElement.prototype.scrollTo = function (options) {
    if (typeof options === "object") this.scrollTop = options.top ?? 0
  }
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("chat del deudor", () => {
  it("bloquea el envío cuando el servidor confirma escalated, aunque el texto no sea una frase local", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => response("escalated"))
    )
    render(<DebtorChat token="token" initialState={state()} />)
    fireEvent.change(screen.getByRole<HTMLTextAreaElement>("textbox"), {
      target: { value: "Necesito ayuda" },
    })
    fireEvent.click(
      screen.getByRole<HTMLButtonElement>("button", { name: "Enviar mensaje" })
    )
    await screen.findByText(
      "La conversación está en manos de la administración."
    )
    expect(screen.getByRole<HTMLTextAreaElement>("textbox").disabled).toBe(true)
    expect(screen.getByText("Respuesta del servidor")).toBeTruthy()
  })

  it("restaura el mensaje y permite reintentar si una solicitud de humano falla", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ error: "No disponible" }, { status: 503 })
      )
    )
    render(<DebtorChat token="token" initialState={state()} />)
    fireEvent.click(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "Hablar con una persona",
      })
    )
    await screen.findByRole("alert")
    await waitFor(() =>
      expect(
        screen.getByRole<HTMLButtonElement>("button", {
          name: "Hablar con una persona",
        }).disabled
      ).toBe(false)
    )
    expect(screen.getByRole<HTMLTextAreaElement>("textbox").value).toBe(
      "Quiero hablar con una persona"
    )
    expect(screen.getByRole<HTMLTextAreaElement>("textbox").disabled).toBe(
      false
    )
  })

  it("actualiza historial sin duplicados y permite continuar si el admin devuelve el control", async () => {
    vi.mocked(getDebtorChatState).mockResolvedValue(
      state({
        status: "active",
        messages: [
          ...state().messages,
          {
            id: "33333333-3333-4333-8333-333333333333",
            role: "admin",
            text: "Respuesta de la administración",
          },
        ],
      })
    )
    render(
      <DebtorChat token="token" initialState={state({ status: "escalated" })} />
    )
    const previous = screen.getByText("Mensaje anterior")
    fireEvent.click(
      screen.getByRole<HTMLButtonElement>("button", { name: "Actualizar" })
    )
    await screen.findByText("Respuesta de la administración")
    expect(screen.getAllByText("Mensaje anterior")).toHaveLength(1)
    expect(screen.getByText("Mensaje anterior")).toBe(previous)
    expect(screen.getByRole<HTMLTextAreaElement>("textbox").disabled).toBe(
      false
    )
  })

  it("retira texto abortado que nunca se guardó y recupera el estado del servidor", async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    vi.mocked(getDebtorChatState).mockResolvedValue(
      state({ status: "escalated" })
    )
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        createUIMessageStreamResponse({
          stream: createUIMessageStream<DebtorUIMessage>({
            execute: async ({ writer }) => {
              writer.write({ type: "start", messageId: "aborted-answer" })
              writer.write({ type: "text-start", id: "text" })
              writer.write({
                type: "text-delta",
                id: "text",
                delta: "Texto sin guardar",
              })
              await gate
              writer.write({
                type: "message-metadata",
                messageMetadata: {
                  negotiationStatus: "escalated",
                  responseDiscarded: true,
                },
              })
              writer.write({ type: "abort" })
            },
          }),
        })
      )
    )
    render(<DebtorChat token="token" initialState={state()} />)
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Consulta" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensaje" }))
    await screen.findByText("Texto sin guardar")
    await act(async () => {
      release()
    })
    await waitFor(() =>
      expect(screen.queryByText("Texto sin guardar")).toBeNull()
    )
    expect(screen.getByRole<HTMLTextAreaElement>("textbox").disabled).toBe(true)
    expect(getDebtorChatState).toHaveBeenCalledTimes(1)
  })

  it("un fallo posterior al guardado no repone el mensaje en el input ni lo duplica", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url, init) => {
        const body = JSON.parse(String(init?.body)) as {
          messages: DebtorUIMessage[]
        }
        const sent = body.messages[0]
        vi.mocked(getDebtorChatState).mockResolvedValue(
          state({
            messages: [
              ...state().messages,
              { id: sent.id, role: "debtor", text: "Consulta guardada" },
            ],
          })
        )
        return Response.json({ error: "Falló el modelo" }, { status: 500 })
      })
    )
    render(<DebtorChat token="token" initialState={state()} />)
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Consulta guardada" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensaje" }))
    await screen.findByRole("alert")
    await waitFor(() =>
      expect(screen.getByRole<HTMLTextAreaElement>("textbox").value).toBe("")
    )
    expect(screen.getAllByText("Consulta guardada")).toHaveLength(1)
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Enviar mensaje" })
        .disabled
    ).toBe(true)
  })

  it("si no puede reconciliar, exige actualizar antes de reenviar el texto", async () => {
    vi.mocked(getDebtorChatState).mockRejectedValue(new Error("sin conexión"))
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ error: "No disponible" }, { status: 500 })
      )
    )
    render(<DebtorChat token="token" initialState={state()} />)
    fireEvent.click(
      screen.getByRole("button", { name: "Hablar con una persona" })
    )
    await screen.findByRole("button", { name: "Actualizar conversación" })
    expect(screen.getByRole<HTMLTextAreaElement>("textbox").value).toBe("")
    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "Hablar con una persona",
      }).disabled
    ).toBe(true)
    vi.mocked(getDebtorChatState).mockResolvedValue(state())
    fireEvent.click(
      screen.getByRole("button", { name: "Actualizar conversación" })
    )
    await waitFor(() =>
      expect(screen.getByRole<HTMLTextAreaElement>("textbox").value).toBe(
        "Quiero hablar con una persona"
      )
    )
  })

  it("respeta IME y Shift+Enter, y envía solo el mensaje nuevo con un ID persistible", async () => {
    render(<DebtorChat token="token" initialState={state()} />)
    const input = screen.getByRole<HTMLTextAreaElement>("textbox")
    fireEvent.change(input, { target: { value: "Mensaje nuevo" } })
    fireEvent.keyDown(input, { key: "Enter", isComposing: true })
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true })
    expect(fetch).not.toHaveBeenCalled()
    fireEvent.keyDown(input, { key: "Enter" })
    await screen.findByText("Respuesta del servidor")
    const body = JSON.parse(
      String(vi.mocked(fetch).mock.calls[0]?.[1]?.body)
    ) as { messages: Array<{ id: string; parts: unknown }> }
    expect(body.messages).toHaveLength(1)
    expect(body.messages[0]?.id).toMatch(
      /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/
    )
  })

  it("retira el historial de la pantalla al vencer el link", async () => {
    vi.useFakeTimers()
    render(
      <DebtorChat
        token="token"
        initialState={state({
          expiresAt: new Date(Date.now() + 1000).toISOString(),
        })}
      />
    )
    await act(() => vi.advanceTimersByTimeAsync(1100))
    expect(screen.getByRole("heading", { name: "El link venció" })).toBeTruthy()
    expect(screen.queryByText("Mensaje anterior")).toBeNull()
  })

  it("muestra la pantalla de verificación cuando verified es false y pasa al chat al verificar", async () => {
    vi.mocked(verifyIdentity).mockResolvedValue({ ok: true })
    vi.mocked(getDebtorChatState).mockResolvedValue(
      state({ verified: true, status: "active" })
    )
    render(
      <DebtorChat
        token="token"
        initialState={state({ verified: false, messages: [], disclosure: "" })}
      />
    )
    expect(
      screen.getByRole("heading", { name: "Verificá tu identidad" })
    ).toBeTruthy()
    expect(screen.queryByText("Mensaje anterior")).toBeNull()

    fireEvent.change(screen.getByLabelText("Últimos 3 dígitos del DNI"), {
      target: { value: "123" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Continuar al chat" }))

    await screen.findByText("Mensaje anterior")
    expect(verifyIdentity).toHaveBeenCalledWith({
      data: { token: "token", dniLast3: "123" },
    })
  })
})
