import { Link } from "@tanstack/react-router"

import { cn } from "@/lib/utils"

const ISOTIPO_SRC = "/pacta-isotipo.png"

type BrandIsotipoProps = {
  className?: string
}

export function BrandIsotipo({ className }: BrandIsotipoProps) {
  return (
    <img
      src={ISOTIPO_SRC}
      alt=""
      aria-hidden
      className={cn("size-8 shrink-0 rounded-lg object-contain", className)}
    />
  )
}

type BrandLogoProps = {
  variant?: "full" | "icon"
  className?: string
  iconClassName?: string
  wordmarkClassName?: string
  asLink?: boolean
}

export function BrandLogo({
  variant = "full",
  className,
  iconClassName,
  wordmarkClassName,
  asLink = false,
}: BrandLogoProps) {
  const content = (
    <>
      <BrandIsotipo className={cn("size-7 sm:size-8", iconClassName)} />
      {variant === "full" && (
        <span
          className={cn(
            "text-sm font-semibold tracking-tight lowercase",
            wordmarkClassName
          )}
        >
          pacta.ia
        </span>
      )}
    </>
  )

  const rootClassName = cn("flex shrink-0 items-center gap-2", className)

  if (asLink) {
    return (
      <Link
        to="/"
        className={cn(
          rootClassName,
          "rounded-lg py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        aria-label="pacta.ia, inicio"
      >
        {content}
      </Link>
    )
  }

  return <div className={rootClassName}>{content}</div>
}
