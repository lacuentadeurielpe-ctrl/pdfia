import { callTextModel } from "./models";
import { deduplicateSections, type Section } from "./parser";

const EDITOR_SYSTEM = `Eres un Editor Jefe especializado en documentos profesionales.
Tu trabajo es revisar un conjunto de secciones escritas por diferentes agentes y:
1. Detectar repeticiones de ideas o frases entre secciones
2. Verificar que cada sección aporte valor único
3. Asegurarte que los subtítulos sean distintos entre sí
4. Devolver una lista de títulos y subtítulos finales corregidos

Responde en formato XML suave:
<corrections>
<section>
<order>0</order>
<title>Título final corregido</title>
<subtitle>Subtítulo final corregido</subtitle>
</section>
...
</corrections>

Si una sección está bien, repite su título/subtítulo sin cambios.
Si hay un duplicado, modifica el SEGUNDO para que sea distinto.`;

export async function runEditor(sections: Section[], modelStr: string): Promise<Section[]> {
  // Primero deduplicar por título exacto
  let deduped = deduplicateSections(sections);

  // Luego pedir al Editor IA que revise subtítulos y similitudes
  const outline = deduped
    .map((s) => `<section><order>${s.order}</order><title>${s.title}</title><subtitle>${s.subtitle}</subtitle></section>`)
    .join("\n");

  const userPrompt = `Revisa estas secciones y corrige títulos/subtítulos duplicados o demasiado similares:\n${outline}`;

  try {
    const raw = await callTextModel(modelStr, EDITOR_SYSTEM, userPrompt, 2000);

    // Aplicar correcciones
    const correctionBlocks = extractAllTagsEditor(raw, "section");
    const corrections = new Map<number, { title: string; subtitle: string }>();

    for (const block of correctionBlocks) {
      const order = parseInt(extractTagEditor(block, "order") || "-1");
      const title = extractTagEditor(block, "title");
      const subtitle = extractTagEditor(block, "subtitle");
      if (order >= 0 && title) corrections.set(order, { title, subtitle });
    }

    deduped = deduped.map((s) => {
      const correction = corrections.get(s.order);
      if (correction) return { ...s, title: correction.title, subtitle: correction.subtitle };
      return s;
    });
  } catch {
    // Si el editor falla, devolvemos lo deduplicado sin correcciones IA
  }

  return deduped;
}

function extractTagEditor(text: string, tag: string): string {
  const s = text.indexOf(`<${tag}>`);
  const e = text.indexOf(`</${tag}>`, s);
  if (s === -1 || e === -1) return "";
  return text.slice(s + tag.length + 2, e).trim();
}

function extractAllTagsEditor(text: string, tag: string): string[] {
  const results: string[] = [];
  let pos = 0;
  const open = `<${tag}>`, close = `</${tag}>`;
  while (true) {
    const s = text.indexOf(open, pos);
    if (s === -1) break;
    const e = text.indexOf(close, s);
    if (e === -1) break;
    results.push(text.slice(s + open.length, e).trim());
    pos = e + close.length;
  }
  return results;
}
