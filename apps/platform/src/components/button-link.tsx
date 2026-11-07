import { createLink } from "@tanstack/react-router"
import type { VariantProps } from "class-variance-authority"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AnchorButtonProps = React.ComponentProps<"a"> &
  VariantProps<typeof buttonVariants>

function AnchorButton({
  className,
  variant,
  size,
  ...props
}: AnchorButtonProps) {
  return (
    <a
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

/**
 * Link de navegación con estilo de botón. Usar en lugar de
 * `<Button render={<Link />}>`: conserva la semántica de enlace (<a>) y los
 * props tipados de TanStack Router (`to`, `params`, `search`).
 */
export const ButtonLink = createLink(AnchorButton)
