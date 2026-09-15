import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { HeroShaderGradient } from "@/components/hero-shader-gradient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Ingresar | Cobro" }] }),
})

function LoginPage() {
  const navigate = useNavigate()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate({ to: "/dashboard" })
  }

  return (
    <div className="grid min-h-svh grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-2 lg:grid-rows-1">
      <aside className="relative overflow-hidden" aria-hidden="true">
        <HeroShaderGradient />
      </aside>

      <main className="flex flex-col items-center justify-center px-6 py-8 sm:px-10 sm:py-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              Iniciar sesión
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingresá con tu cuenta corporativa para acceder al panel.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nombre@empresa.com"
                autoComplete="email"
                defaultValue="demo@cobro.app"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </label>
                <button
                  type="button"
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                defaultValue="demo1234"
              />
            </div>

            <Button type="submit" className="h-10 w-full" size="lg">
              Ingresar
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            ¿No tenés cuenta?{" "}
            <button
              type="button"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Solicitar acceso
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
