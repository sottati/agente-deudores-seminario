import { useSyncExternalStore } from "react"

import { resolveDark } from "@/components/ui/shader-gradient"

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  })

  const media = window.matchMedia("(prefers-color-scheme: dark)")
  media.addEventListener("change", onStoreChange)

  return () => {
    observer.disconnect()
    media.removeEventListener("change", onStoreChange)
  }
}

export function useResolvedDark() {
  return useSyncExternalStore(
    subscribe,
    () => resolveDark("auto"),
    () => false
  )
}
