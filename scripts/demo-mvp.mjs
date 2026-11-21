// Recorrido automático del MVP para grabar el video de demo (UADE Startup).
//
// Abre un Chrome visible y recorre el caso de uso completo sobre la app real:
// dashboard → reglas → deudor → generar link → portal del deudor (verificación,
// negociación con el agente y aceptación) → conversación → acta del acuerdo.
//
// Uso (con `pnpm db:start` y `pnpm dev` corriendo, y la base recién reseteada):
//   pnpm demo:mvp
//
// Variables opcionales:
//   DEMO_BASE_URL   URL de la app (por defecto http://localhost:3000)
//   DEMO_DEBTOR     Unidad a negociar (por defecto "Unidad 10D", la única del seed sin negociación)
//   DEMO_SPEED      Multiplicador de las pausas: 0.5 = más rápido, 2 = más lento (por defecto 1)
//   DEMO_STEP=1     Espera Enter en la terminal antes de cada escena (para ir al ritmo de la narración)
//   DEMO_BROWSER    "chrome" (por defecto, usa tu Chrome instalado) o "chromium" (el de Playwright)

import { chromium } from "playwright"
import readline from "node:readline/promises"

const BASE_URL = process.env.DEMO_BASE_URL ?? "http://localhost:3000"
const DEBTOR = process.env.DEMO_DEBTOR ?? "Unidad 10D"
const SPEED = Number(process.env.DEMO_SPEED ?? 1) || 1
const STEP = process.env.DEMO_STEP === "1"
const BROWSER = process.env.DEMO_BROWSER ?? "chrome"

const EMAIL = "demo@pacta.ai"
const PASSWORD = "demo1234"
const DNI_LAST_3 = "123"

// Lo que escribe el deudor. El segundo mensaje se manda solo si el agente
// todavía no dejó una propuesta para aceptar.
const DEBTOR_MESSAGES = [
  "Hola, me llegó el link. No llego a pagar todo junto, ¿lo puedo pagar en 12 cuotas?",
  "Entiendo. Entonces hagámoslo con la mayor cantidad de cuotas que se pueda.",
  "Sí, dejame la propuesta así la acepto.",
]

const VIEWPORT = { width: 1440, height: 900 }
const TYPING_DELAY_MS = 45
const AGENT_TIMEOUT_MS = 120_000

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const wait = (ms) => new Promise((r) => setTimeout(r, ms * SPEED))

function log(message) {
  console.log(`\x1b[36m▸\x1b[0m ${message}`)
}

async function scene(title) {
  console.log(`\n\x1b[1m── ${title}\x1b[0m`)
  if (STEP) await rl.question("   (Enter para continuar) ")
}

// Cursor visible: Playwright mueve un mouse virtual que no aparece en la
// grabación de pantalla, así que dibujamos uno dentro de la página.
const CURSOR_SCRIPT = `
  (() => {
    if (window.__demoCursor) return
    window.__demoCursor = true
    const install = () => {
      const dot = document.createElement("div")
      dot.id = "__demo-cursor"
      Object.assign(dot.style, {
        position: "fixed", left: "0", top: "0", width: "22px", height: "22px",
        marginLeft: "-11px", marginTop: "-11px", borderRadius: "50%",
        background: "rgba(99, 102, 241, 0.35)", border: "2px solid rgba(79, 70, 229, 0.9)",
        boxShadow: "0 0 0 4px rgba(99, 102, 241, 0.15)", pointerEvents: "none",
        zIndex: "2147483647", transition: "transform 120ms ease, background 120ms ease",
        transform: "translate(-100px, -100px)",
      })
      document.documentElement.appendChild(dot)
      let x = -100, y = -100
      document.addEventListener("mousemove", (e) => {
        x = e.clientX; y = e.clientY
        dot.style.transform = "translate(" + x + "px, " + y + "px)"
      }, true)
      document.addEventListener("mousedown", () => {
        dot.style.transform = "translate(" + x + "px, " + y + "px) scale(0.7)"
        dot.style.background = "rgba(79, 70, 229, 0.6)"
      }, true)
      document.addEventListener("mouseup", () => {
        dot.style.transform = "translate(" + x + "px, " + y + "px)"
        dot.style.background = "rgba(99, 102, 241, 0.35)"
      }, true)
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", install)
    } else install()
  })()
`

/** Mueve el cursor de forma visible hasta el elemento y hace clic. */
async function click(page, locator, { pause = 400 } = {}) {
  await locator.waitFor({ state: "visible" })
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
      steps: 25,
    })
    await wait(pause)
  }
  await locator.click()
}

/** Lleva el cursor a un elemento sin hacer clic (para señalarlo). */
async function point(page, locator, ms = 1200) {
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
      steps: 25,
    })
  }
  await wait(ms)
}

async function type(page, locator, text) {
  await click(page, locator, { pause: 200 })
  await locator.pressSequentially(text, { delay: TYPING_DELAY_MS })
}

/** Scroll suave del contenedor que corresponda (ventana o panel con overflow). */
async function smoothScroll(page, distance, durationMs = 2500) {
  await page.evaluate(
    async ({ distance, durationMs }) => {
      const scrollable = (el) => {
        while (el && el !== document.body) {
          const style = getComputedStyle(el)
          if (
            /(auto|scroll)/.test(style.overflowY) &&
            el.scrollHeight > el.clientHeight
          )
            return el
          el = el.parentElement
        }
        return null
      }
      const center = document.elementFromPoint(
        window.innerWidth / 2,
        window.innerHeight / 2
      )
      const target = scrollable(center)
      const start = target ? target.scrollTop : window.scrollY
      const t0 = performance.now()
      await new Promise((resolve) => {
        const tick = (now) => {
          const p = Math.min(1, (now - t0) / durationMs)
          const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
          const y = start + distance * eased
          if (target) target.scrollTop = y
          else window.scrollTo(0, y)
          if (p < 1) requestAnimationFrame(tick)
          else resolve()
        }
        requestAnimationFrame(tick)
      })
    },
    { distance, durationMs: durationMs * SPEED }
  )
}

async function sidebar(page, name) {
  await click(page, page.getByRole("link", { name, exact: true }).first())
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {})
}

// ---------------------------------------------------------------------------
// Recorrido
// ---------------------------------------------------------------------------

async function main() {
  const browser = await chromium.launch({
    headless: false,
    channel: BROWSER === "chrome" ? "chrome" : undefined,
    args: [
      `--window-size=${VIEWPORT.width},${VIEWPORT.height + 120}`,
      "--window-position=0,0",
    ],
  })
  const context = await browser.newContext({
    viewport: VIEWPORT,
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
    colorScheme: "light",
  })
  context.setDefaultTimeout(30_000)
  await context.addInitScript(CURSOR_SCRIPT)
  const admin = await context.newPage()

  // --- Preparación (antes de grabar) ---------------------------------------
  log(`Iniciando sesión en ${BASE_URL} como ${EMAIL}…`)
  await admin.goto(`${BASE_URL}/login`)
  // En `pnpm dev` la primera carga tarda; si se hace clic antes de que React
  // hidrate, el formulario recarga la página. Por eso se reintenta.
  for (let attempt = 1; ; attempt++) {
    await admin
      .waitForLoadState("networkidle", { timeout: 5_000 })
      .catch(() => {})
    if (/\/dashboard/.test(admin.url())) break
    await admin.locator("#email").fill(EMAIL)
    await admin.locator("#password").fill(PASSWORD)
    await admin.getByRole("button", { name: "Ingresar" }).click()
    const ok = await admin
      .waitForURL(/\/dashboard/, { timeout: 15_000 })
      .then(() => true)
      .catch(() => false)
    if (ok) break
    if (attempt === 3)
      throw new Error(
        "No se pudo iniciar sesión. ¿Están corriendo `pnpm db:start` y `pnpm dev`?"
      )
  }
  await admin
    .waitForLoadState("networkidle", { timeout: 5_000 })
    .catch(() => {})
  // Precarga las pantallas del recorrido para que en la grabación abran rápido.
  for (const path of [
    "/reglas",
    "/deudores",
    "/conversaciones",
    "/dashboard",
  ]) {
    await admin.goto(`${BASE_URL}${path}`)
    await admin
      .waitForLoadState("networkidle", { timeout: 5_000 })
      .catch(() => {})
  }

  console.log(
    "\n\x1b[1;32m✔ Listo para grabar.\x1b[0m Empezá la grabación de pantalla y presioná Enter."
  )
  await rl.question("")
  await wait(1500)

  // --- 1. Dashboard ---------------------------------------------------------
  await scene("1. Dashboard")
  await admin.mouse.move(VIEWPORT.width / 2, VIEWPORT.height / 2, { steps: 10 })
  await wait(2500)
  await smoothScroll(admin, 350, 2000)
  await wait(1500)
  await smoothScroll(admin, -350, 1200)
  await wait(800)

  // --- 2. Reglas del agente -------------------------------------------------
  await scene("2. Reglas del agente")
  await sidebar(admin, "Reglas del agente")
  await wait(1200)
  await point(admin, admin.getByLabel("Cantidad máxima de cuotas"), 1500)
  await point(admin, admin.getByLabel("Anticipo mínimo (%)"), 1300)
  await point(admin, admin.getByLabel("Intereses en cuotas (%)"), 1300)
  await point(admin, admin.getByLabel("Derivar a una persona desde ($)"), 1800)

  // --- 3. Deudor y link de negociación --------------------------------------
  await scene("3. Deudor → Negociar → link")
  await sidebar(admin, "Deudores")
  await wait(1000)
  const search = admin.getByLabel("Buscar deudores")
  await type(admin, search, DEBTOR.replace(/^Unidad\s+/i, ""))
  await wait(900)
  await click(admin, admin.getByRole("link", { name: DEBTOR, exact: true }))
  await admin.waitForURL(/\/deudores\/[^/]+$/)
  await wait(2000)

  const negotiate = admin.getByRole("button", { name: "Negociar" }).first()
  if (!(await negotiate.isVisible().catch(() => false))) {
    throw new Error(
      `${DEBTOR} no tiene una deuda abierta para negociar. Corré \`pnpm db:reset\` y volvé a empezar.`
    )
  }
  await click(admin, negotiate)
  await wait(1800)
  await click(admin, admin.getByRole("button", { name: "Generar link" }))
  const linkInput = admin.getByRole("textbox", { name: "Link de negociación" })
  await linkInput.waitFor()
  const link = await linkInput.inputValue()
  log(`Link generado: ${link}`)
  await point(admin, linkInput, 1200)
  await click(admin, admin.getByRole("button", { name: "Copiar link" }))
  await wait(1500)
  await click(admin, admin.getByRole("button", { name: "Listo" }))
  await wait(800)

  // --- 4. Portal del deudor -------------------------------------------------
  await scene("4. Portal del deudor")
  const debtor = await context.newPage()
  await debtor.goto(link)
  await debtor.bringToFront()
  await wait(2500)
  await type(debtor, debtor.locator("#dni-last-3"), DNI_LAST_3)
  await wait(600)
  await click(debtor, debtor.getByRole("button", { name: "Continuar al chat" }))

  const textarea = debtor.locator("#debtor-message")
  await textarea.waitFor()
  await debtor.waitForFunction(
    () => !document.querySelector("#debtor-message")?.disabled
  )
  await wait(2500)

  const acceptButton = debtor.getByRole("button", {
    name: "Acepto los términos del plan de pago",
  })

  for (const [index, message] of DEBTOR_MESSAGES.entries()) {
    if (index > 0 && (await acceptButton.isVisible().catch(() => false))) break
    await type(debtor, textarea, message)
    await wait(500)
    await debtor.keyboard.press("Enter")
    log(`Deudor: ${message}`)
    log("Esperando la respuesta del agente (recortá esta espera al editar)…")
    // Espera a que arranque y termine la respuesta en streaming.
    await debtor
      .getByRole("button", { name: "Enviando mensaje" })
      .waitFor({ state: "visible", timeout: 10_000 })
      .catch(() => {})
    await debtor
      .getByRole("button", { name: "Enviar mensaje" })
      .waitFor({ state: "attached", timeout: AGENT_TIMEOUT_MS })
    await debtor
      .waitForLoadState("networkidle", { timeout: 5_000 })
      .catch(() => {})
    await wait(6000) // tiempo para leer la respuesta
  }

  if (!(await acceptButton.isVisible().catch(() => false))) {
    throw new Error(
      "El agente no dejó una propuesta para aceptar. Corré `pnpm db:reset` y probá otra toma."
    )
  }
  await point(debtor, debtor.getByLabel("Propuesta de plan de pago"), 3500)
  await click(debtor, acceptButton, { pause: 800 })
  await debtor.getByText("Acuerdo registrado").waitFor({
    timeout: AGENT_TIMEOUT_MS,
  })
  await point(debtor, debtor.getByLabel("Acuerdo de pago confirmado"), 4000)

  // --- 5. Conversación en el panel ------------------------------------------
  await scene("5. Conversación en el panel")
  await admin.bringToFront()
  await sidebar(admin, "Conversaciones")
  await wait(1200)
  const row = admin.getByRole("link", { name: new RegExp(DEBTOR) }).first()
  await click(admin, row)
  await admin.waitForURL(/\/conversaciones\/[^/]+$/)
  await admin
    .waitForLoadState("networkidle", { timeout: 5_000 })
    .catch(() => {})
  await wait(2500)
  await smoothScroll(admin, 500, 2500)
  await wait(1500)

  // --- 6. Acta del acuerdo --------------------------------------------------
  await scene("6. Acta del acuerdo")
  await click(
    admin,
    admin.getByRole("link", { name: "Ver acta del acuerdo" }).first()
  )
  await admin.waitForURL(/\/acuerdos\/[^/]+$/)
  await admin
    .waitForLoadState("networkidle", { timeout: 5_000 })
    .catch(() => {})
  await wait(2500)
  await smoothScroll(admin, 600, 3000)
  await wait(1200)
  await point(admin, admin.getByText("Hash SHA-256 de la conversación"), 2500)
  await smoothScroll(admin, -2000, 1500)
  await point(admin, admin.getByRole("button", { name: /Imprimir/ }), 3000)

  console.log(
    "\n\x1b[1;32m✔ Recorrido terminado.\x1b[0m Detené la grabación y presioná Enter para cerrar el navegador."
  )
  console.log(
    "   Para otra toma: `pnpm db:reset` (el deudor vuelve a quedar sin negociación)."
  )
  await rl.question("")
  await browser.close()
}

main()
  .catch((error) => {
    console.error(`\n\x1b[31m✖ ${error.message}\x1b[0m`)
    console.error(
      "   El navegador queda abierto para que veas dónde se cortó. Ctrl+C para salir."
    )
  })
  .finally(() => rl.close())
