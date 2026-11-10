// Preferencia de tema del usuario. Se guarda en este navegador y se aplica
// como clase `dark` en <html>, que activa los colores de docs/identidad_visual.md
// definidos en src/styles.css.

export type ThemePreference = "light" | "dark" | "system"

export const THEME_STORAGE_KEY = "pacta-theme"

export const themePreferenceLabel: Record<ThemePreference, string> = {
  light: "Claro",
  dark: "Oscuro",
  system: "Sistema",
}

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system"
}

export function getThemePreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isThemePreference(stored) ? stored : "system"
  } catch {
    return "system"
  }
}

export function applyThemePreference(preference: ThemePreference) {
  const dark =
    preference === "dark" ||
    (preference === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", dark)
}

export function setThemePreference(preference: ThemePreference) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // Sin almacenamiento (modo privado o bloqueado): aplica solo a esta pestaña.
  }
  applyThemePreference(preference)
}

/**
 * Se ejecuta en <head> antes del primer pintado para evitar el destello claro.
 * También sigue los cambios del sistema operativo mientras la preferencia sea
 * "Sistema".
 */
export const themeInitScript = `(function () {
  var key = ${JSON.stringify(THEME_STORAGE_KEY)};
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  function apply() {
    var pref = "system";
    try { pref = localStorage.getItem(key) || "system"; } catch (e) {}
    var dark = pref === "dark" || (pref !== "light" && media.matches);
    document.documentElement.classList.toggle("dark", dark);
  }
  apply();
  media.addEventListener("change", apply);
})();`
