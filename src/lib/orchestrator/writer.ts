import { callTextModel } from "./models";
import { parseWrittenSection, type Section, type SectionOutline } from "./parser";

const WRITER_SYSTEM = `Eres un escritor experto en crear contenido de alta calidad para ebooks y documentos profesionales.

REGLAS ABSOLUTAS:
- Escribe contenido SUSTANCIAL, útil y valioso — no relleno ni frases vacías
- Usa ejemplos concretos, datos reales y casos prácticos cuando sea posible
- El contenido debe fluir naturalmente, con párrafos bien conectados
- USA MARKDOWN para estructura interna: **negrita**, *cursiva*, listas, bloques de código si aplica
- NO repitas el título principal del libro dentro del contenido
- NO incluyas introducción genérica tipo "En este capítulo veremos..." — ve directo al valor
- Si necesitas imagen, el image_prompt debe ser CINEMATOGRÁFICO y DETALLADO (mínimo 3 oraciones)

FORMATO DE RESPUESTA (etiquetas XML suaves — obligatorio):
<title>Título exacto de esta sección</title>
<subtitle>Subtítulo de la sección</subtitle>
<content>
Todo el contenido en markdown aquí. Mínimo 400 palabras, máximo 800.
</content>
<image_prompt>Descripción ultra-detallada de la imagen ideal para esta sección. Estilo visual, colores, composición, elementos específicos, mood. Mínimo 3 oraciones.</image_prompt>
<image_complexity>none|simple|complex|data|technical</image_complexity>`;

export async function writeSection(
  writerPrompt: string,
  section: SectionOutline,
  modelStr: string
): Promise<Section> {
  const userPrompt = `
INSTRUCCIONES DEL INGENIERO DE PROMPTS:
${writerPrompt}

DATOS DE LA SECCIÓN:
- Título: ${section.title}
- Subtítulo: ${section.subtitle}
- Imagen requerida: ${section.imageNeeded ? `Sí (complejidad: ${section.imageComplexity})` : "No"}

Escribe ahora el contenido completo de esta sección. Que sea extraordinario.
`;

  const raw = await callTextModel(modelStr, WRITER_SYSTEM, userPrompt, 3000);
  const parsed = parseWrittenSection(raw, section.order);

  // Si el escritor no puso título, usamos el del outline
  if (!parsed.title || parsed.title === `Sección ${section.order + 1}`) {
    parsed.title = section.title;
  }
  if (!parsed.subtitle) parsed.subtitle = section.subtitle;
  if (!parsed.imageComplexity || parsed.imageComplexity === "none") {
    parsed.imageComplexity = section.imageNeeded ? section.imageComplexity : "none";
  }

  return parsed;
}
