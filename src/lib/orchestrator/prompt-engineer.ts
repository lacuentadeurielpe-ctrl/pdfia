import { callTextModel } from "./models";
import { extractTag, type SectionOutline, type Outline } from "./parser";

const PE_SYSTEM = `Eres un Ingeniero de Prompts experto en crear instrucciones perfectas para agentes escritores.
Tu trabajo es convertir el outline de una sección en un prompt rico y detallado que garantice el mejor contenido posible.
El prompt debe ser específico, inspirador y dejar claro qué hace única a esta sección vs las demás.
Responde SOLO con el prompt listo para usar, sin explicaciones adicionales.`;

export async function buildWriterPrompt(
  outline: Outline,
  section: SectionOutline,
  modelStr: string
): Promise<string> {
  const allTitles = outline.sections.map((s, i) => `${i + 1}. ${s.title}`).join("\n");

  const userPrompt = `
DOCUMENTO COMPLETO: "${outline.bookTitle}" — ${outline.bookSubtitle}
TONO: ${outline.tone} | ESTILO: ${outline.style}

TODAS LAS SECCIONES DEL DOCUMENTO (para que NO repitas contenido de otras):
${allTitles}

SECCIÓN QUE DEBES DESARROLLAR (número ${section.order + 1} de ${outline.sections.length}):
- Título: ${section.title}
- Subtítulo: ${section.subtitle}
- Tema central: ${section.theme}
- Puntos clave a cubrir:
${section.keyPoints.map((p) => `  • ${p}`).join("\n")}
- ¿Necesita imagen?: ${section.imageNeeded ? `Sí (complejidad: ${section.imageComplexity})` : "No"}

Crea un prompt detallado y poderoso para el agente escritor de esta sección. El prompt debe:
1. Explicar exactamente qué escribir y cómo estructurarlo
2. Indicar el tono, longitud esperada y profundidad
3. Señalar ejemplos, datos o casos concretos que incluir
4. Especificar que el contenido debe ser ÚNICO y no repetir lo de otras secciones
5. Si necesita imagen, describir qué imagen ilustraría mejor este capítulo
`;

  return await callTextModel(modelStr, PE_SYSTEM, userPrompt, 1500);
}
