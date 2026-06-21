import { callTextModel } from "./models";
import { parseWrittenSection, type Section, type SectionOutline, type BookContext } from "./parser";

const INTEGRATOR_SYSTEM = `Eres un Editor Senior y Revisor de Contenido. Recibes un capítulo borrador escrito por un agente escritor y tu trabajo es:

1. REVISAR la calidad, coherencia y profundidad del contenido
2. EXPANDIR si el contenido es más corto que el target (añade ejemplos, casos, explicaciones)
3. ELIMINAR cualquier repetición de contenido ya cubierto en capítulos anteriores
4. MEJORAR las transiciones entre párrafos y subtítulos
5. VERIFICAR que los subtítulos internos sean únicos y descriptivos
6. REFINAR el image_prompt si existe

REGLAS:
- El contenido final debe alcanzar el target de páginas especificado (~500 palabras por página)
- Si el borrador está completo y bien escrito, haz ajustes mínimos — no reescribas sin necesidad
- Si hay repeticiones de capítulos anteriores, reemplaza esa sección con contenido único y complementario
- Mantén el tono y estilo del documento
- NO añadas frases de relleno ni introducciones genéricas
- Los subtítulos internos ### deben ser concretos y únicos en el libro entero

FORMATO DE RESPUESTA (etiquetas XML suaves):
<title>Título del capítulo</title>
<subtitle>Subtítulo del capítulo</subtitle>
<content>
Contenido final revisado y expandido en markdown. Mínimo target_words palabras.
</content>
<image_prompt>Prompt refinado para imagen (si aplica). Cinematográfico, detallado, concreto.</image_prompt>
<image_complexity>none|simple|complex|data|technical</image_complexity>`;

export async function integrateChapter(
  draft: Section & { chapterSummary: string },
  section: SectionOutline,
  bookContext: BookContext,
  integratorModel: string,
  maxTokens: number
): Promise<Section> {
  const targetWords = section.targetPages * 500;
  const currentWordCount = draft.content.split(/\s+/).length;

  const previousChapters = bookContext.completedChapters.length > 0
    ? `Capítulos anteriores ya escritos:\n${
        bookContext.completedChapters.map((c) => `- "${c.title}": ${c.summary}`).join("\n")
      }`
    : "Este es el primer capítulo.";

  const userPrompt = `
LIBRO: "${bookContext.bookTitle}"
TONO: ${bookContext.tone}
${previousChapters}

══════════════════════════════════════════
CAPÍTULO A REVISAR: "${section.title}"
Target: ${section.targetPages} página(s) (~${targetWords} palabras)
Palabras actuales en el borrador: ~${currentWordCount}
Imagen requerida: ${section.imageNeeded ? `Sí (complejidad: ${section.imageComplexity})` : "No"}
══════════════════════════════════════════

BORRADOR DEL ESCRITOR:
---
Título: ${draft.title}
Subtítulo: ${draft.subtitle}
${draft.imagePrompt ? `Image prompt: ${draft.imagePrompt}` : ""}

${draft.content}
---

${currentWordCount < targetWords * 0.8
  ? `⚠️ El borrador tiene ~${currentWordCount} palabras pero el target es ~${targetWords}. EXPANDE el contenido con más ejemplos, casos prácticos y desarrollo de los puntos clave.`
  : "El borrador tiene una extensión adecuada. Revisa calidad y elimina repeticiones si las hay."}

Devuelve el capítulo final en el formato XML especificado.
`;

  const raw = await callTextModel(integratorModel, INTEGRATOR_SYSTEM, userPrompt, maxTokens);
  const integrated = parseWrittenSection(raw, section.order);

  // Fallback: si el integrador devuelve algo vacío, usamos el draft
  if (!integrated.content || integrated.content.length < 200) {
    return {
      order:           draft.order,
      title:           draft.title,
      subtitle:        draft.subtitle,
      content:         draft.content,
      imagePrompt:     draft.imagePrompt,
      imageComplexity: draft.imageComplexity,
    };
  }

  if (!integrated.title) integrated.title = draft.title;
  if (!integrated.subtitle) integrated.subtitle = draft.subtitle;
  if (!integrated.imagePrompt && draft.imagePrompt) integrated.imagePrompt = draft.imagePrompt;
  if (integrated.imageComplexity === "none" && section.imageNeeded) {
    integrated.imageComplexity = section.imageComplexity;
  }

  return integrated;
}
