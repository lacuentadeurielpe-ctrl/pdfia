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

export function mdToHtml(text: string): string {
  return text
    .replace(/^> 💡 (.+)$/gm, '<div class="callout-tip"><span class="ci">💡</span><span>$1</span></div>')
    .replace(/^> ⚠️ (.+)$/gm, '<div class="callout-warn"><span class="ci">⚠️</span><span>$1</span></div>')
    .replace(/^> 📊 (.+)$/gm, '<div class="callout-stat"><span class="ci">📊</span><span>$1</span></div>')
    .replace(/^> "(.+?)"$/gm, '<blockquote class="pull-quote">$1</blockquote>')
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h4>$1</h4>")
    .replace(/^# (.+)$/gm, "<h4>$1</h4>")
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n\n/g, "</p><p>")
    .trim();
}
