import { callTextModel } from "./models";
import { parseWrittenSection, type Section, type SectionOutline, type Outline, type BookContext } from "./parser";

const WRITER_SYSTEM = `Eres un escritor experto en crear contenido de alta calidad para ebooks y documentos profesionales.

REGLAS ABSOLUTAS:
- Escribe contenido SUSTANCIAL, profundo y genuinamente útil — sin relleno
- Cada página debe equivaler a ~500 palabras bien desarrolladas
- Estructura interna clara: usa subtítulos (###), listas, ejemplos, casos prácticos
- USA MARKDOWN para estructura: **negrita** para conceptos clave, *cursiva* para énfasis, ### para subtítulos internos
- Los subtítulos internos (###) deben ser únicos y descriptivos, nunca genéricos como "Introducción" o "Conclusión"
- NO repitas el título del capítulo ni del libro dentro del contenido
- NO uses frases de relleno: "En este capítulo veremos...", "Como mencionamos antes...", "En resumen..."
- Ve directo al valor: abre con un dato potente, una pregunta provocadora o un caso real
- Si necesitas imagen, el image_prompt debe ser CINEMATOGRÁFICO y DETALLADO (mínimo 3 oraciones)

FORMATO DE RESPUESTA (etiquetas XML suaves — obligatorio):
<title>Título exacto de esta sección</title>
<subtitle>Subtítulo de la sección</subtitle>
<content>
Todo el contenido en markdown aquí. Respeta el target de páginas indicado (~500 palabras por página).
</content>
<image_prompt>Descripción ultra-detallada de la imagen. Estilo visual, colores, composición, elementos específicos, ambiente. Mínimo 3 oraciones. Escena concreta, no abstracta.</image_prompt>
<image_complexity>none|simple|complex|data|technical</image_complexity>
<chapter_summary>Resumen de 1-2 oraciones de qué cubre este capítulo (para el contexto de los capítulos siguientes).</chapter_summary>`;

export async function writeSection(
  section: SectionOutline,
  outline: Outline,
  bookContext: BookContext,
  research: string,
  writerModel: string,
  maxTokens: number
): Promise<Section & { chapterSummary: string }> {
  const targetWords = section.targetPages * 500;
  const previousChapters = bookContext.completedChapters.length > 0
    ? `\nCapítulos ya escritos (NO repitas su contenido):\n${
        bookContext.completedChapters.map((c) => `- Cap ${c.order + 1} "${c.title}": ${c.summary}`).join("\n")
      }`
    : "";

  const allTitles = outline.sections.map((s, i) => `${i + 1}. ${s.title}`).join("\n");

  const userPrompt = `
LIBRO: "${outline.bookTitle}" — ${outline.bookSubtitle}
TONO: ${outline.tone} | ESTILO: ${outline.style}

TODOS LOS CAPÍTULOS DEL LIBRO (no repetir contenido de otros):
${allTitles}
${previousChapters}

══════════════════════════════════════════
CAPÍTULO A ESCRIBIR: "${section.title}"
Subtítulo: ${section.subtitle}
Tema central: ${section.theme}
Puntos clave obligatorios:
${section.keyPoints.map((p) => `  • ${p}`).join("\n")}

TARGET: ${section.targetPages} páginas (~${targetWords} palabras mínimo)
Imagen: ${section.imageNeeded ? `Sí (complejidad: ${section.imageComplexity})` : "No"}
══════════════════════════════════════════

INVESTIGACIÓN RECOPILADA PARA ESTE CAPÍTULO:
${research}
══════════════════════════════════════════

Usa la investigación anterior como base. Escribe un capítulo completo, denso y valioso.
Desarrolla cada punto clave con profundidad real — ejemplos concretos, casos prácticos, técnicas aplicables.
No uses el research textualmente — interpreta, sintetiza y elabora con tu propio estilo editorial.
Asegúrate de llegar al target de ${targetWords} palabras.
`;

  const raw = await callTextModel(writerModel, WRITER_SYSTEM, userPrompt, maxTokens);
  const parsed = parseWrittenSection(raw, section.order);

  const chapterSummary = extractTagLocal(raw, "chapter_summary") ||
    `Cubre ${section.keyPoints.slice(0, 2).join(" y ")}`;

  if (!parsed.title || parsed.title === `Sección ${section.order + 1}`) {
    parsed.title = section.title;
  }
  if (!parsed.subtitle) parsed.subtitle = section.subtitle;
  if (!parsed.imageComplexity || parsed.imageComplexity === "none") {
    parsed.imageComplexity = section.imageNeeded ? section.imageComplexity : "none";
  }

  return { ...parsed, chapterSummary };
}

function extractTagLocal(text: string, tag: string): string {
  const s = text.indexOf(`<${tag}>`);
  const e = text.indexOf(`</${tag}>`, s);
  if (s === -1 || e === -1) return "";
  return text.slice(s + tag.length + 2, e).trim();
}
