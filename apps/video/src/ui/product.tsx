/**
 * Piezas de la UI de pacta.ai controladas por frame. Replican el marcado de
 * apps/platform (how-it-works, dashboard-preview, debtor-chat) pero sin estado
 * ni timers, para que cada frame del render sea determinístico.
 */
import {
  BotIcon,
  DashboardSquare02Icon,
  MessageMultiple02Icon,
  Settings02Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

import { Isotipo } from "./stage"

export function AgentAvatar() {
  return (
    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
      <HugeiconsIcon icon={BotIcon} className="size-3.5" strokeWidth={2} />
    </div>
  )
}

export function ChatBubble({
  from,
  time,
  children,
}: {
  from: "agent" | "debtor"
  time: string
  children: ReactNode
}) {
  const isAgent = from === "agent"
  return (
    <div
      className={cn("flex gap-2", isAgent ? "justify-start" : "justify-end")}
    >
      {isAgent && <AgentAvatar />}
      <div className="max-w-[82%] space-y-1">
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-xs leading-relaxed",
            isAgent
              ? "rounded-tl-sm bg-muted text-foreground"
              : "rounded-tr-sm bg-primary text-primary-foreground"
          )}
        >
          {children}
        </div>
        <p
          className={cn(
            "px-1 text-[0.65rem] text-muted-foreground",
            isAgent ? "text-left" : "text-right"
          )}
        >
          {time}
        </p>
      </div>
    </div>
  )
}

/** Indicador "escribiendo" con rebote calculado por frame. */
export function TypingBubble({ frame }: { frame: number }) {
  return (
    <div className="flex gap-2">
      <AgentAvatar />
      <div className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2.5">
        <span className="inline-flex gap-1">
          {[0, 5, 10].map((offset) => (
            <span
              key={offset}
              className="size-1.5 rounded-full bg-muted-foreground/60"
              style={{
                transform: `translateY(${-Math.max(0, Math.sin(((frame - offset) / 18) * Math.PI * 2)) * 3}px)`,
              }}
            />
          ))}
        </span>
      </div>
    </div>
  )
}

/** Mensaje que entra empujando a los anteriores (truco grid 0fr → 1fr). */
export function Grow({ p, children }: { p: number; children: ReactNode }) {
  if (p <= 0) return null
  return (
    <div style={{ display: "grid", gridTemplateRows: `${p}fr` }}>
      <div
        style={{
          minHeight: 0,
          overflow: "hidden",
          opacity: p,
          transform: `translateY(${(1 - p) * 10}px)`,
        }}
      >
        <div className="pb-3">{children}</div>
      </div>
    </div>
  )
}

export function Slider({
  label,
  display,
  percent,
}: {
  label: string
  display: string
  percent: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{display}</span>
      </div>
      <div className="relative flex h-5 items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            style={{ width: `${percent}%` }}
          />
          <div
            className="absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow-sm"
            style={{ left: `calc(${percent}% - 7px)` }}
          />
        </div>
      </div>
    </div>
  )
}

const navItems = [
  { title: "Dashboard", icon: DashboardSquare02Icon },
  { title: "Conversaciones", icon: MessageMultiple02Icon },
  { title: "Deudores", icon: UserMultipleIcon },
]

const footerItems = [
  { title: "Reglas del agente", icon: BotIcon },
  { title: "Configuración", icon: Settings02Icon },
]

/** Réplica de PreviewSidebar (dashboard-preview.tsx). */
export function AppSidebar({ active = "Dashboard" }: { active?: string }) {
  return (
    <aside className="flex w-52 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="border-b p-2">
        <div className="flex items-center gap-2 rounded-lg px-2 py-2">
          <Isotipo size={32} style={{ borderRadius: 8 }} />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold lowercase">
              pacta.ai
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              Consorcios del Sur
            </span>
          </span>
        </div>
      </div>
      <div className="flex-1 p-2">
        <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
          Principal
        </p>
        <div className="mt-1 space-y-0.5">
          {navItems.map((item) => (
            <div
              key={item.title}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-2 text-sm",
                item.title === active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              <HugeiconsIcon
                icon={item.icon}
                className="size-4"
                strokeWidth={2}
              />
              <span className="truncate">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-0.5 border-t p-2">
        {footerItems.map((item) => (
          <div
            key={item.title}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-2 text-sm",
              item.title === active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <HugeiconsIcon
              icon={item.icon}
              className="size-4"
              strokeWidth={2}
            />
            <span className="truncate">{item.title}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 rounded-lg px-2 py-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold">
            A
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-medium">
              Administración
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              Consorcios del Sur
            </span>
          </span>
        </div>
      </div>
    </aside>
  )
}
