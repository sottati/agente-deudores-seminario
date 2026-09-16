import { ShaderGradient } from "@/components/ui/shader-gradient"
import { useResolvedDark } from "@/hooks/use-resolved-dark"

/** Rose / neutral washes derived from the app primary (oklch hue ~4°). */
const LIGHT_COLORS = ["#e7b5bf", "#edcddb", "#f5f5f8", "#e3e3f2"]
/** Deeper rose and slate tones for dark mode. */
const DARK_COLORS = ["#792440", "#501f38", "#322523", "#2c2b41"]

export function HeroShaderGradient({ className }: { className?: string }) {
  const isDark = useResolvedDark()

  return (
    <ShaderGradient
      className={className}
      colors={isDark ? DARK_COLORS : LIGHT_COLORS}
      speed={0.2}
      theme="auto"
    />
  )
}
