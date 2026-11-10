import type { ReactNode } from "react"

// Negrita (**x** o __x__) y cursiva (*x* o _x_). El texto se renderiza como
// nodos de React, nunca como HTML, así que no hay riesgo de inyección.
const INLINE_MARKDOWN =
  /\*\*(.+?)\*\*|__(.+?)__|\*(?!\s)(.+?)(?<!\s)\*|(?<![\p{L}\p{N}])_(?!\s)(.+?)(?<!\s)_(?![\p{L}\p{N}])/gu

/** Muestra el texto de un mensaje del chat con negrita y cursiva de Markdown. */
export function ChatText({ text }: { text: string }) {
  const nodes: Array<ReactNode> = []
  let last = 0
  for (const match of text.matchAll(INLINE_MARKDOWN)) {
    const index = match.index
    if (index > last) nodes.push(text.slice(last, index))
    const [whole] = match
    const bold = whole.startsWith("**") || whole.startsWith("__")
    const marker = bold ? 2 : 1
    const inner = whole.slice(marker, -marker)
    nodes.push(
      bold ? (
        <strong key={index} className="font-semibold">
          {inner}
        </strong>
      ) : (
        <em key={index}>{inner}</em>
      )
    )
    last = index + match[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return <>{nodes}</>
}
