import type { TemplateName } from "./types";

export type ImgLayout = "full" | "inset" | "wide" | "bleed" | "float";

/**
 * Cómo se integra la imagen de cada capítulo. Devuelve el layout (clase CSS)
 * + la proporción nativa que se le pide a Gemini (la imagen se genera ya en
 * esa forma, sin recorte posterior).
 *
 * Plantillas PREMIUM (editorial, técnico, negocios): alternan por posición
 * para dar RITMO dentro de un mismo documento (no todas iguales).
 * Plantillas base (clásica, minimalista): forma única y consistente.
 *
 * Ratios soportados por gemini-2.5-flash-image: 21:9, 16:9, 4:3, 3:2,
 * 1:1, 9:16, 3:4, 2:3, 5:4, 4:5.
 */
export function imageLayout(plantilla: TemplateName, index: number): { layout: ImgLayout; aspectRatio: string } {
  const par = index % 2 === 0;
  switch (plantilla) {
    // ── Base: una sola forma por plantilla ──
    case "clasica":     return { layout: "full",  aspectRatio: "3:2" };
    case "minimalista": return { layout: "inset", aspectRatio: "4:3" };
    // ── Premium: alternan para crear ritmo ──
    case "editorial":   return par ? { layout: "float", aspectRatio: "4:5"  } : { layout: "bleed", aspectRatio: "16:9" };
    case "tecnico":     return par ? { layout: "full",  aspectRatio: "16:9" } : { layout: "inset", aspectRatio: "4:3"  };
    case "negocios":    return par ? { layout: "full",  aspectRatio: "16:9" } : { layout: "inset", aspectRatio: "4:3"  };
    case "revista":     return par ? { layout: "float", aspectRatio: "4:5"  } : { layout: "bleed", aspectRatio: "16:9" };
    case "lujo":        return { layout: "inset", aspectRatio: "4:3" };
    case "manuscrito":  return { layout: "inset", aspectRatio: "4:3" };
    default:            return { layout: "full", aspectRatio: "16:9" };
  }
}

/** Proporción nativa a pedirle a Gemini para el capítulo (usado al generar). */
export function imageAspectRatio(plantilla: TemplateName, index: number): string {
  return imageLayout(plantilla, index).aspectRatio;
}

/** true si la proporción es más alta que ancha (orientación vertical). */
export function esVertical(aspectRatio: string): boolean {
  const [w, h] = aspectRatio.split(":").map(Number);
  return h > w;
}
