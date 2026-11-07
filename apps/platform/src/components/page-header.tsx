import { SidebarTrigger } from "@/components/ui/sidebar"

type PageHeaderProps = {
  title: string
  children?: React.ReactNode
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/95 px-2 backdrop-blur md:px-4 print:hidden">
      <SidebarTrigger aria-label="Abrir o cerrar navegación" />
      <div className="h-4 w-px bg-border" />
      <h1 className="truncate text-sm font-medium">{title}</h1>
      {children ? (
        <div className="ml-auto flex items-center gap-2">{children}</div>
      ) : null}
    </header>
  )
}

export function PageBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-2 md:p-4 lg:p-6">
      {children}
    </div>
  )
}
