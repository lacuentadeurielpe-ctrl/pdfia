import type { TemplateName } from "./types";

/**
 * Proporción NATIVA de imagen por plantilla — la que se le pide a Gemini.
 * Como la imagen se genera ya en esta forma, no hay recorte posterior.
 * Cada plantilla tiene su propio carácter visual.
 *
 * Editorial alterna según la posición del capítulo (índice 0-based):
 *   - par   → 4:5 vertical (flota junto al texto, estilo revista)
 *   - impar → 16:9 horizontal (a sangre, cinematográfica)
 *
 * Ratios soportados por gemini-2.5-flash-image: 21:9, 16:9, 4:3, 3:2,
 * 1:1, 9:16, 3:4, 2:3, 5:4, 4:5.
 */
export function imageAspectRatio(plantilla: TemplateName, index: number): string {
  switch (plantilla) {
    case "clasica":     return "3:2";
    case "minimalista": return "4:3";
    case "editorial":   return index % 2 === 0 ? "4:5" : "16:9";
    case "tecnico":     return "16:9";
    case "negocios":    return "16:9";
    default:            return "16:9";
  }
}

/** true si la proporción es más alta que ancha (orientación vertical). */
export function esVertical(aspectRatio: string): boolean {
  const [w, h] = aspectRatio.split(":").map(Number);
  return h > w;
}
