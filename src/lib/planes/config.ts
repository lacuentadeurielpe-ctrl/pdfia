// ════════════════════════════════════════════════════════════════════
//  PLAN INTERNO — Configuración técnica de FoxPDF
//  Aquí vive TODA la mecánica: créditos, modelos de IA, límites y costos.
//  El "plan externo" (lo que ve el cliente) se deriva de esto.
// ════════════════════════════════════════════════════════════════════

import type { Calidad, ViaImagen } from "@/lib/orchestrator/models";

export type PlanId = "gratis" | "creador" | "estudio";

// ── Costo en CRÉDITOS de cada acción ──
// El texto es casi gratis; las imágenes son el costo real. Por eso:
export const COSTO_CREDITOS = {
  ebookBase:   1, // el texto completo de un ebook (cualquier calidad)
  imagenFlash: 1, // cada imagen estándar/avanzado (gemini-2.5-flash-image ≈ $0.04)
  imagenPro:   3, // cada imagen premium (gemini-3-pro-image ≈ $0.13, ~3x)
} as const;

export interface PlanInterno {
  id:                 PlanId;
  nombre:             string;
  precioSoles:        number;
  creditos:           number;          // créditos por ciclo mensual
  calidades:          Calidad[];       // calidades de texto permitidas
  permiteImagenes:    boolean;
  viaImagenPorCalidad: Record<Calidad, ViaImagen | null>;
  capitulosMax:       number;
  marcaDeAgua:        boolean;          // true = lleva "Creado con FoxPDF"
  marcaPersonalizada: boolean;          // true = puede usar su logo/colores
  historialDias:      number | null;    // null = ilimitado
  soporte:            "comunidad" | "email" | "prioritario" | "dedicado";
  // Números "externos" derivados, para mostrar en la web:
  externos: {
    ebooksSinImagen: number;            // = creditos / ebookBase
    ebooksConImagen: number;            // = creditos / (base + 5·imagenFlash)
  };
}

// Helper para derivar los números externos desde los créditos
function derivarExternos(creditos: number) {
  const costoConImagen = COSTO_CREDITOS.ebookBase + 5 * COSTO_CREDITOS.imagenFlash; // ~6
  return {
    ebooksSinImagen: Math.floor(creditos / COSTO_CREDITOS.ebookBase),
    ebooksConImagen: Math.floor(creditos / costoConImagen),
  };
}

export const PLANES: Record<PlanId, PlanInterno> = {
  gratis: {
    id: "gratis",
    nombre: "Gratis",
    precioSoles: 0,
    creditos: 8,
    calidades: ["estandar"],
    permiteImagenes: false,
    viaImagenPorCalidad: { estandar: null, avanzado: null, premium: null },
    capitulosMax: 5,
    marcaDeAgua: true,
    marcaPersonalizada: false,
    historialDias: 7,
    soporte: "comunidad",
    externos: derivarExternos(8),
  },
  creador: {
    id: "creador",
    nombre: "Creador",
    precioSoles: 49,
    creditos: 180,
    calidades: ["estandar", "avanzado"],
    permiteImagenes: true,
    viaImagenPorCalidad: { estandar: "flash", avanzado: "flash", premium: null },
    capitulosMax: 12,
    marcaDeAgua: false,
    marcaPersonalizada: true,
    historialDias: null,
    soporte: "prioritario",
    externos: derivarExternos(180),
  },
  estudio: {
    id: "estudio",
    nombre: "Estudio",
    precioSoles: 119,
    creditos: 550,
    calidades: ["estandar", "avanzado", "premium"],
    permiteImagenes: true,
    viaImagenPorCalidad: { estandar: "flash", avanzado: "flash", premium: "pro" },
    capitulosMax: 15,
    marcaDeAgua: false,
    marcaPersonalizada: true,
    historialDias: null,
    soporte: "dedicado",
    externos: derivarExternos(550),
  },
};

// ── DEV UNLOCK ──────────────────────────────────────────────────────
// Pon a false cuando quieras volver a conectar los planes reales.
export const DEV_UNLOCK_ALL = true;

// Plan con todo desbloqueado — usado por DEV_UNLOCK_ALL y por usuarios "ilimitado" del admin.
export const PLAN_DEV_UNLOCKED: PlanInterno = {
  id:                  "estudio",
  nombre:              "Ilimitado",
  precioSoles:         0,
  creditos:            9999,
  calidades:           ["estandar", "avanzado", "premium"],
  permiteImagenes:     true,
  viaImagenPorCalidad: { estandar: "flash", avanzado: "flash", premium: "pro" },
  capitulosMax:        15,
  marcaDeAgua:         false,
  marcaPersonalizada:  true,
  historialDias:       null,
  soporte:             "dedicado",
  externos:            derivarExternos(9999),
};

export function getPlan(id: string | null | undefined): PlanInterno {
  if (DEV_UNLOCK_ALL) return PLAN_DEV_UNLOCKED;
  return PLANES[(id ?? "gratis") as PlanId] ?? PLANES.gratis;
}

// ── Cálculo de costo en créditos de un ebook ──
// modoImagenes define cuántas imágenes se generan realmente:
//   "ninguna"  → 0 imágenes
//   "alternadas" → una cada dos capítulos (~50%)
//   "todas"    → una por capítulo (peor caso)
export function costoEstimado(
  calidad: Calidad,
  conImagenes: boolean,
  numCapitulos: number,
  modoImagenes: "ninguna" | "alternadas" | "todas" = "todas"
): number {
  let costo = COSTO_CREDITOS.ebookBase;
  if (conImagenes && modoImagenes !== "ninguna") {
    const via = calidad === "premium" ? "pro" : "flash";
    const costoImg = via === "pro" ? COSTO_CREDITOS.imagenPro : COSTO_CREDITOS.imagenFlash;
    const imgs = modoImagenes === "alternadas" ? Math.ceil(numCapitulos / 2) : numCapitulos;
    costo += imgs * costoImg;
  }
  return costo;
}

// Real (después de generar): cobra solo por las imágenes que de verdad se crearon.
export function costoReal(
  calidad: Calidad,
  imagenesGeneradas: number
): number {
  const via = calidad === "premium" ? "pro" : "flash";
  const costoImg = via === "pro" ? COSTO_CREDITOS.imagenPro : COSTO_CREDITOS.imagenFlash;
  return COSTO_CREDITOS.ebookBase + imagenesGeneradas * costoImg;
}
