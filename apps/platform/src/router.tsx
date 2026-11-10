import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,

    scrollRestoration: true,
    // Al pasar el mouse por un link se precargan sus datos, y se reusan al
    // hacer clic si tienen menos de 30 s (valor por defecto del router).
    defaultPreload: "intent",
  })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
