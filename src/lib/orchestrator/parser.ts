// Parser tolerante a etiquetas XML suaves — nunca rompe aunque el contenido tenga < > o caracteres raros

export type ImageComplexity = "none" | "simple" | "complex" | "data" | "technical";

export interface SectionOutline {
  order: number;
  title: string;
  subtitle: string;
  theme: string;
  keyPoints: string[];
  imageNeeded: boolean;
  imageComplexity: ImageComplexity;
}

export interface Outline {
  bookTitle: string;
  bookSubtitle: string;
  tone: string;
  style: string;
  sections: SectionOutline[];
}

export interface Section {
  order: number;
  title: string;
  subtitle: string;
  content: string;
  imagePrompt: string;
  imageComplexity: ImageComplexity;
  imageUrl?: string;
}

// Extrae el contenido de la PRIMERA ocurrencia de <tag>...</tag>
export function extractTag(text: string, tag: string): string {
  const s = text.indexOf(`<${tag}>`);
  const e = text.indexOf(`</${tag}>`, s);
  if (s === -1 || e === -1) return "";
  return text.slice(s + tag.length + 2, e).trim();
}

// Extrae TODAS las ocurrencias de <tag>...</tag>
export function extractAllTags(text: string, tag: string): string[] {
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

const VALID_COMPLEXITIES: ImageComplexity[] = ["none", "simple", "complex", "data", "technical"];

function toComplexity(raw: string): ImageComplexity {
  const v = raw.toLowerCase().trim() as ImageComplexity;
  return VALID_COMPLEXITIES.includes(v) ? v : "simple";
}

export function parseOutline(text: string): Outline {
  const bookTitle    = extractTag(text, "book_title")    || extractTag(text, "titulo") || "Documento";
  const bookSubtitle = extractTag(text, "book_subtitle") || extractTag(text, "subtitulo") || "";
  const tone         = extractTag(text, "tone")          || "profesional";
  const style        = extractTag(text, "style")         || "moderno";

  const blocks = extractAllTags(text, "section");
  const sections: SectionOutline[] = blocks.map((block, i) => {
    const keyPointsRaw = extractTag(block, "key_points");
    const keyPoints = keyPointsRaw
      .split("\n")
      .map((l) => l.replace(/^[-•*\d.]\s*/, "").trim())
      .filter(Boolean);
    return {
      order:           i,
      title:           extractTag(block, "title")            || `Capítulo ${i + 1}`,
      subtitle:        extractTag(block, "subtitle")         || "",
      theme:           extractTag(block, "theme")            || "",
      keyPoints,
      imageNeeded:     extractTag(block, "image_needed")     !== "false",
      imageComplexity: toComplexity(extractTag(block, "image_complexity") || "simple"),
    };
  });

  return { bookTitle, bookSubtitle, tone, style, sections };
}

export function parseWrittenSection(text: string, order: number): Section {
  return {
    order,
    title:           extractTag(text, "title")           || `Sección ${order + 1}`,
    subtitle:        extractTag(text, "subtitle")        || "",
    content:         extractTag(text, "content")         || text,
    imagePrompt:     extractTag(text, "image_prompt")    || "",
    imageComplexity: toComplexity(extractTag(text, "image_complexity") || "none"),
  };
}

// Elimina secciones con títulos duplicados (case-insensitive)
export function deduplicateSections(sections: Section[]): Section[] {
  const seen = new Set<string>();
  return sections
    .sort((a, b) => a.order - b.order)
    .filter((s) => {
      const key = s.title.toLowerCase().replace(/\s+/g, " ").trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
