import type { TemplateName, ModoImagenes } from "@/lib/pdf/templates/types";

export interface FeatureFlags {
  templatesDisponibles: TemplateName[];
  modoImagenesDisponibles: ModoImagenes[];
  marcaPersonalizada: boolean;
  footerPersonalizado: boolean;
}

// Todo habilitado — sin conexión a planes todavía.
// Para conectar: recibir PlanInterno y filtrar por sus propiedades.
// Ejemplo futuro:
//   templatesDisponibles: plan.id === "gratis" ? ["clasica","minimalista"] : [...todos]
//   modoImagenesDisponibles: plan.permiteImagenes ? ["ninguna","alternadas","todas"] : ["ninguna"]
export function getFeatureFlags(): FeatureFlags {
  return {
    templatesDisponibles:    ["clasica", "editorial", "minimalista", "tecnico", "negocios"],
    modoImagenesDisponibles: ["ninguna", "alternadas", "todas"],
    marcaPersonalizada:      true,
    footerPersonalizado:     true,
  };
}
