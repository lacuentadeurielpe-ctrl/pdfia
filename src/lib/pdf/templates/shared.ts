import type { ModoImagenes } from "./types";

export function hexToRgb(hex: string): string {
  const c = hex.replace("#", "");
  return `${parseInt(c.slice(0, 2), 16)}, ${parseInt(c.slice(2, 4), 16)}, ${parseInt(c.slice(4, 6), 16)}`;
}

export function shouldShowImage(modoImagenes: ModoImagenes, index: number, imageUrl?: string): boolean {
  if (!imageUrl) return false;
  if (modoImagenes === "ninguna") return false;
  if (modoImagenes === "alternadas" && index % 2 !== 0) return false;
  return true;
}

// Formato inline (negrita, cursiva, código) — se aplica dentro de cada bloque.
function inline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

/**
 * Convierte el markdown del capítulo en HTML de BLOQUES VÁLIDOS.
 * Parser por líneas: cada subtítulo, lista, cita o callout es su propio
 * elemento de bloque; el texto normal se agrupa en párrafos <p>.
 * Evita el HTML inválido de meter bloques dentro de un <p>.
 */
export function mdToHtml(text: string): string {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let para: string[] = [];   // buffer de líneas de párrafo
  let list: string[] = [];   // buffer de <li>
  let listType: "ul" | "ol" | null = null;

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(" ").trim())}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (list.length && listType) {
      out.push(`<${listType}>${list.join("")}</${listType}>`);
      list = [];
      listType = null;
    }
  };
  const flushAll = () => { flushPara(); flushList(); };

  for (const raw of lines) {
    const line = raw.trim();

    // Línea en blanco → cierra el párrafo y la lista actuales
    if (!line) { flushAll(); continue; }

    // Callouts
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^> 💡 (.+)$/))) { flushAll(); out.push(`<div class="callout-tip"><span class="ci">💡</span><span>${inline(m[1])}</span></div>`); continue; }
    if ((m = line.match(/^> ⚠️ (.+)$/))) { flushAll(); out.push(`<div class="callout-warn"><span class="ci">⚠️</span><span>${inline(m[1])}</span></div>`); continue; }
    if ((m = line.match(/^> 📊 (.+)$/))) { flushAll(); out.push(`<div class="callout-stat"><span class="ci">📊</span><span>${inline(m[1])}</span></div>`); continue; }
    // Pull quote ("...") y cita normal
    if ((m = line.match(/^> "(.+)"$/))) { flushAll(); out.push(`<blockquote class="pull-quote">${inline(m[1])}</blockquote>`); continue; }
    if ((m = line.match(/^> (.+)$/)))   { flushAll(); out.push(`<blockquote>${inline(m[1])}</blockquote>`); continue; }

    // Subtítulos
    if ((m = line.match(/^### (.+)$/)))   { flushAll(); out.push(`<h3>${inline(m[1])}</h3>`); continue; }
    if ((m = line.match(/^#{1,2} (.+)$/))) { flushAll(); out.push(`<h4>${inline(m[1])}</h4>`); continue; }

    // Lista con viñetas
    if ((m = line.match(/^[-*] (.+)$/))) {
      flushPara();
      if (listType !== "ul") { flushList(); listType = "ul"; }
      list.push(`<li>${inline(m[1])}</li>`);
      continue;
    }
    // Lista numerada
    if ((m = line.match(/^\d+\.\s+(.+)$/))) {
      flushPara();
      if (listType !== "ol") { flushList(); listType = "ol"; }
      list.push(`<li>${inline(m[1])}</li>`);
      continue;
    }

    // Texto normal → párrafo
    flushList();
    para.push(line);
  }

  flushAll();
  return out.join("\n");
}
