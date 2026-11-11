// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  DEMO_DASHBOARD_VIEW_DATA,
  DashboardOverview,
  DashboardOverviewSkeleton,
  buildDashboardViewData,
} from "./dashboard-overview"

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode
    to: string
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  createLink:
    (Component: React.ComponentType<Record<string, unknown>>) =>
    (props: Record<string, unknown>) => <Component {...props} />,
}))

afterEach(() => {
  cleanup()
})

describe("DashboardOverview (presentacional + datos reales)", () => {
  it("renderiza los datos demo de la landing sin requerir sesión", () => {
    render(<DashboardOverview data={DEMO_DASHBOARD_VIEW_DATA} compact />)

    expect(screen.getByText("$ 8,4 M")).toBeTruthy()
    expect(screen.getByText("42")).toBeTruthy()
    expect(screen.getByText("18")).toBeTruthy()
    expect(screen.getByText("Unidad 4B")).toBeTruthy()
    expect(screen.getByText("6 respuestas pendientes")).toBeTruthy()
    expect(screen.getByText("2 casos fuera de política")).toBeTruthy()
  })

  it("construye y renderiza datos reales desde los contratos de servidor", () => {
    const viewData = buildDashboardViewData({
      kpis: {
        recoveredCents: 63470000,
        agreedCents: 118500000,
        deltaVsPrevMonthPct: 14.2,
        agreementsCount: 6,
        agreementsThisWeek: 1,
        activeConversations: 4,
        awaitingReply: 2,
      },
      monthlyRecovery: [
        {
          month: "Ago",
          period: "2026-08",
          amountCents: 25000000,
          recoveredCents: 25000000,
          agreedCents: 40000000,
        },
        {
          month: "Sep",
          period: "2026-09",
          amountCents: 38470000,
          recoveredCents: 38470000,
          agreedCents: 78500000,
        },
      ],
      agreementsByPlan: [
        { installments: 1, count: 2, totalCents: 20000000 },
        { installments: 2, count: 2, totalCents: 45000000 },
        { installments: 3, count: 2, totalCents: 53500000 },
      ],
      recentAgreements: [
        {
          agreementId: "c0000000-0000-4000-8000-000000000001",
          negotiationId: "a0000000-0000-4000-8000-000000000007",
          debtorId: "d0000000-0000-4000-8000-000000000007",
          debtorAlias: "Unidad 6B",
          debtorFullName: "Valeria Acosta",
          groupLabel: "Sarmiento 912",
          concept: "Expensas ordinarias may–ago 2026",
          amountCents: 23000000,
          installments: 3,
          status: "agreed",
          activityAt: "2026-11-04T12:00:00Z",
        },
      ],
      attentionItems: [
        {
          negotiationId: "a0000000-0000-4000-8000-000000000009",
          kind: "out_of_policy_request",
          debtorAlias: "Unidad PB-B",
          groupLabel: "México 1456",
          concept: "Expensas 2025–26",
          occurredAt: "2026-11-07T10:00:00Z",
          detail: { requested_installments: 12, max_installments: 3 },
        },
      ],
    })

    render(<DashboardOverview data={viewData} interactive />)

    expect(screen.getByText(/634\.700/)).toBeTruthy()
    expect(screen.getByText(/1,2 M comprometido en actas/)).toBeTruthy()
    expect(screen.getByText("1 esta semana")).toBeTruthy()
    expect(screen.getByText("2 esperan respuesta")).toBeTruthy()
    expect(screen.getByText("Unidad 6B")).toBeTruthy()
    expect(
      screen.getByText(
        "Unidad PB-B · México 1456 pidió condiciones fuera de política"
      )
    ).toBeTruthy()
    expect(screen.getByText(/Solicitó 12 cuotas \(máximo 3\)/)).toBeTruthy()
  })

  it("muestra estados vacíos cuando una organización recién empieza y no tiene actividad", () => {
    const emptyData = buildDashboardViewData({
      kpis: {
        recoveredCents: 0,
        agreedCents: 0,
        deltaVsPrevMonthPct: null,
        agreementsCount: 0,
        agreementsThisWeek: 0,
        activeConversations: 0,
        awaitingReply: 0,
      },
      monthlyRecovery: [
        {
          month: "Oct",
          period: "2026-10",
          amountCents: 0,
          recoveredCents: 0,
          agreedCents: 0,
        },
      ],
      agreementsByPlan: [],
      recentAgreements: [],
      attentionItems: [],
    })

    render(<DashboardOverview data={emptyData} interactive />)

    expect(
      screen.getByText(
        "Todavía no hay cobros ni acuerdos registrados en este período."
      )
    ).toBeTruthy()
    expect(
      screen.getByText(
        "Todavía no hay acuerdos cerrados para distribuir por plan."
      )
    ).toBeTruthy()
    expect(
      screen.getByText(
        "Todavía no se cerraron acuerdos ni hay propuestas pendientes."
      )
    ).toBeTruthy()
    expect(
      screen.getByText(
        "No hay conversaciones escaladas ni pedidos fuera de política pendientes."
      )
    ).toBeTruthy()
  })

  it("renderiza el skeleton de carga", () => {
    render(<DashboardOverviewSkeleton />)
    expect(
      screen.getByLabelText("Cargando contenido del dashboard")
    ).toBeTruthy()
  })
})
