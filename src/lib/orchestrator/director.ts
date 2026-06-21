import { callTextModel } from "./models";
import { parseOutline, type Outline } from "./parser";

const DIRECTOR_SYSTEM = `Eres el Director Creativo de un sistema multi-agente para crear ebooks y documentos profesionales de altísima calidad.

Tu trabajo es analizar el contexto del usuario y crear un OUTLINE MAESTRO que guiará a todos los demás agentes.

REGLAS CRÍTICAS:
- EXACTAMENTE UN título de libro (<book_title>) — nunca repetido en las secciones
- Cada sección tiene UN título único y UN subtítulo único — NINGUNO se repite entre secciones
- Los títulos de secciones NO pueden ser variaciones del título principal
- Para cada sección, decide cuántas páginas necesita (target_pages entre 1 y 7):
  * Introducción y conclusión: 2-3 páginas
  * Capítulos de contenido denso (conceptos, marcos, metodologías): 4-6 páginas
  * Capítulos de ejemplos o casos prácticos: 3-5 páginas
  * El agente escritor respetará este target
- Decide qué tan compleja es la imagen de cada sección:
  * none → sección puramente textual
  * simple → ilustración decorativa o conceptual
  * complex → escena elaborada con múltiples elementos
  * data → gráfico, chart, infografía con datos reales
  * technical → diagrama técnico, flujo de proceso, arquitectura
- Diseña un arco narrativo: introducción → desarrollo → ejemplos → casos → conclusión

USA ESTE FORMATO EXACTO (etiquetas XML suaves):

<book_title>Título Principal del Ebook</book_title>
<book_subtitle>Subtítulo descriptivo y atractivo</book_subtitle>
<tone>profesional|educativo|creativo|técnico|motivacional</tone>
<style>moderno|clásico|minimalista|vibrante</style>

<section>
<title>Nombre único del capítulo</title>
<subtitle>Subtítulo específico de este capítulo</subtitle>
<theme>Tema central que desarrolla esta sección</theme>
<key_points>
- Punto clave 1 a cubrir
- Punto clave 2 a cubrir
- Punto clave 3 a cubrir
</key_points>
<target_pages>3</target_pages>
<image_needed>true</image_needed>
<image_complexity>simple</image_complexity>
</section>

Repite el bloque <section> para cada capítulo. NUNCA uses el mismo título dos veces.`;

export async function runDirector(
  context: string,
  numChapters: number,
  tono: string,
  directorModel: string
): Promise<Outline> {
  const userPrompt = `
Contexto del documento a crear:
"""
${context}
"""

Número de capítulos solicitados: ${numChapters}
Tono deseado: ${tono}

Crea el outline maestro completo. Asegúrate que cada capítulo aporte valor único y no se solape con los demás.
El primer capítulo debe ser una introducción poderosa y el último debe cerrar con conclusiones y próximos pasos.
Decide el número de páginas de cada capítulo según su densidad de contenido (1-7 páginas).
`;

  const raw = await callTextModel(directorModel, DIRECTOR_SYSTEM, userPrompt, 4000);
  return parseOutline(raw);
}
