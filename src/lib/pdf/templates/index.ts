import type { Outline, Section } from "@/lib/orchestrator/parser";
import type { BrandConfig, RenderOptions, TemplateName } from "./types";
import { buildClasica } from "./clasica";
import { buildMinimalista } from "./minimalista";
import { buildEditorial } from "./editorial";
import { buildTecnico } from "./tecnico";
import { buildNegocios } from "./negocios";
import { buildRevista } from "./revista";
import { buildLujo } from "./lujo";
import { buildManuscrito } from "./manuscrito";

export type { BrandConfig, RenderOptions, TemplateName, ModoImagenes } from "./types";

const BUILDERS: Record<TemplateName, (o: Outline, s: Section[], b: BrandConfig, r: RenderOptions) => string> = {
  clasica:     buildClasica,
  minimalista: buildMinimalista,
  editorial:   buildEditorial,
  tecnico:     buildTecnico,
  negocios:    buildNegocios,
  revista:     buildRevista,
  lujo:        buildLujo,
  manuscrito:  buildManuscrito,
};

export function buildPDFHtml(
  outline: Outline,
  sections: Section[],
  brand: BrandConfig,
  opts: RenderOptions | boolean,
  plantilla: TemplateName = "clasica"
): string {
  // Backward compat: si opts es boolean (marcaDeAgua del código viejo)
  const options: RenderOptions = typeof opts === "boolean"
    ? { marcaDeAgua: opts, modoImagenes: "todas" }
    : opts;

  const builder = BUILDERS[plantilla] ?? BUILDERS.clasica;
  return builder(outline, sections, brand, options);
}
