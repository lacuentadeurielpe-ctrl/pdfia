import { callTextModel } from "./models";
import type { SectionOutline, Outline, BookContext } from "./parser";

const RESEARCHER_SYSTEM = `Eres un Investigador experto. Tu misión es recopilar material de investigación rico y específico para un capítulo de un ebook profesional.

Debes proporcionar:
1. Hechos concretos, estadísticas y datos relevantes al tema
2. Ejemplos reales y casos prácticos específicos (con nombres, empresas, situaciones reales)
3. Conceptos clave con definiciones claras
4. Técnicas, metodologías o marcos de referencia aplicables
5. Errores comunes o mitos a desmentir
6. Citas o perspectivas de expertos (reales o representativas)

RESTRICCIONES:
- Solo investiga el tema de ESTE capítulo, no de los demás
- No inventes estadísticas — si no sabes un dato exacto, describe el fenómeno cualitativamente
- Sé específico: "las empresas que implementan X logran Y" es mejor que "X es importante"
- El escritor usará estos puntos como base — hazlos accionables y concretos`;

export async function researchChapter(
  section: SectionOutline,
  outline: Outline,
  bookContext: BookContext,
  writerModel: string,
  maxTokens: number
): Promise<string> {
  const coveredTopics = bookContext.completedChapters.length > 0
    ? `\nTemas YA CUBIERTOS en capítulos anteriores (no repetir):\n${
        bookContext.completedChapters.map((c) => `- ${c.title}: ${c.summary}`).join("\n")
      }`
    : "";

  const userPrompt = `
LIBRO: "${outline.bookTitle}" — ${outline.bookSubtitle}
TONO: ${outline.tone}

CAPÍTULO A INVESTIGAR (${section.order + 1} de ${outline.sections.length}):
- Título: ${section.title}
- Subtítulo: ${section.subtitle}
- Tema central: ${section.theme}
- Puntos clave a cubrir:
${section.keyPoints.map((p) => `  • ${p}`).join("\n")}
- Extensión objetivo: ${section.targetPages} página(s)
${coveredTopics}

Proporciona investigación rica y específica que el escritor usará para construir este capítulo.
Incluye ejemplos concretos, datos, técnicas prácticas y perspectivas relevantes.
Organiza la información de forma clara pero no es necesario que ya sea prosa final.
`;

  return await callTextModel(writerModel, RESEARCHER_SYSTEM, userPrompt, maxTokens);
}
