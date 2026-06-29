import type { Outline, Section } from "@/lib/orchestrator/parser";

export type TemplateName = "clasica" | "editorial" | "minimalista" | "tecnico" | "negocios";
export type ModoImagenes = "ninguna" | "alternadas" | "todas";

export interface BrandConfig {
  nombreNegocio: string;
  logoUrl: string | null;
  colorPrimario: string;
  colorSecundario: string;
  colorAcento: string;
  urlNegocio: string;
  footerTexto: string;
}

export interface RenderOptions {
  marcaDeAgua: boolean;
  modoImagenes: ModoImagenes;
}

export type TemplateBuilder = (
  outline: Outline,
  sections: Section[],
  brand: BrandConfig,
  opts: RenderOptions
) => string;
