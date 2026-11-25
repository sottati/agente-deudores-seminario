import { loadFont as loadGeist } from "@remotion/google-fonts/Geist"
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono"

const geist = loadGeist("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
})
const geistMono = loadGeistMono("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
})

export const fontSans = `${geist.fontFamily}, 'Geist Variable', sans-serif`
export const fontMono = `${geistMono.fontFamily}, ui-monospace, monospace`
