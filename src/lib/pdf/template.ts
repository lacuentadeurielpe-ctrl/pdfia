import type { Section } from "@/lib/orchestrator/parser";
import type { Outline } from "@/lib/orchestrator/parser";

interface BrandConfig {
  nombreNegocio: string;
  logoUrl: string | null;
  colorPrimario: string;
  colorSecundario: string;
  colorAcento: string;
}

// Convierte markdown básico a HTML
function mdToHtml(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h4>$1</h4>")
    .replace(/^# (.+)$/gm, "<h4>$1</h4>")
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hul])(.+)$/gm, "$1")
    .trim();
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export function buildPDFHtml(
  outline: Outline,
  sections: Section[],
  brand: BrandConfig,
  marcaDeAgua: boolean = false
): string {
  const { colorPrimario, colorSecundario, colorAcento, nombreNegocio, logoUrl } = brand;
  const rgbPrimario = hexToRgb(colorPrimario);

  const tocItems = sections
    .map((s, i) => `<div class="toc-item"><span class="toc-num">${String(i + 1).padStart(2, "0")}</span><span class="toc-title">${s.title}</span></div>`)
    .join("");

  const sectionHtml = sections
    .map((s, i) => {
      const contentHtml = mdToHtml(s.content);
      const imageBlock = s.imageUrl
        ? `<div class="section-image"><img src="${s.imageUrl}" alt="${s.title}" /></div>`
        : "";
      return `
    <div class="section page-break">
      <div class="section-header">
        <span class="section-eyebrow">${nombreNegocio} · Capítulo ${String(i + 1).padStart(2, "0")}</span>
        <h2 class="section-title">${s.title}</h2>
        ${s.subtitle ? `<p class="section-subtitle">${s.subtitle}</p>` : ""}
      </div>
      ${imageBlock}
      <div class="section-content"><p>${contentHtml}</p></div>
      ${marcaDeAgua ? `<div class="wm-footer">Creado con FoxPDF · foxpdf.cloud</div>` : ""}
    </div>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');

  /* Sin margen de página → Chrome no dibuja la URL/fecha/título en los bordes */
  @page { margin: 0; size: A4; }

  :root {
    --primary:   ${colorPrimario};
    --secondary: ${colorSecundario};
    --accent:    ${colorAcento};
    --rgb-primary: ${rgbPrimario};
    --text:      #1a1a2e;
    --text-muted: #64748b;
    --bg:        #ffffff;
    --bg-soft:   #f8fafc;
    --border:    #e2e8f0;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', sans-serif;
    color: var(--text);
    background: var(--bg);
    font-size: 11pt;
    line-height: 1.7;
  }

  /* ── PORTADA ── */
  .cover {
    width: 100%;
    height: 100vh;
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 80px;
    position: relative;
    overflow: hidden;
    page-break-after: always;
  }
  .cover::before {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
  }
  .cover::after {
    content: '';
    position: absolute;
    bottom: -50px;
    right: 100px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
  }
  .cover-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 60px;
    z-index: 1;
  }
  .cover-brand img {
    width: 48px;
    height: 48px;
    object-fit: contain;
    border-radius: 8px;
    background: rgba(255,255,255,0.15);
    padding: 4px;
  }
  .cover-brand-name {
    color: rgba(255,255,255,0.8);
    font-size: 14pt;
    font-weight: 500;
    letter-spacing: 0.5px;
  }
  .cover-tag {
    background: rgba(255,255,255,0.15);
    color: white;
    font-size: 9pt;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 6px 16px;
    border-radius: 20px;
    margin-bottom: 24px;
    display: inline-block;
    z-index: 1;
  }
  .cover-title {
    font-family: 'Playfair Display', serif;
    font-size: 42pt;
    font-weight: 800;
    color: white;
    line-height: 1.15;
    margin-bottom: 20px;
    z-index: 1;
    max-width: 700px;
  }
  .cover-subtitle {
    font-size: 16pt;
    color: rgba(255,255,255,0.75);
    font-weight: 300;
    max-width: 600px;
    z-index: 1;
    line-height: 1.5;
  }
  .cover-line {
    width: 60px;
    height: 4px;
    background: var(--accent);
    border-radius: 2px;
    margin: 24px 0;
    z-index: 1;
  }
  .cover-date {
    position: absolute;
    bottom: 60px;
    left: 80px;
    color: rgba(255,255,255,0.5);
    font-size: 10pt;
    z-index: 1;
  }

  /* ── TABLA DE CONTENIDOS ── */
  .toc {
    padding: 80px;
    page-break-after: always;
    min-height: 100vh;
  }
  .toc-header {
    font-size: 9pt;
    font-weight: 700;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--primary);
    margin-bottom: 12px;
  }
  .toc-title {
    font-family: 'Playfair Display', serif;
    font-size: 28pt;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 50px;
  }
  .toc-item {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding: 14px 0;
    border-bottom: 1px solid var(--border);
  }
  .toc-num {
    font-size: 10pt;
    font-weight: 700;
    color: var(--primary);
    opacity: 0.6;
    min-width: 28px;
  }
  .toc-title {
    font-size: 12pt;
    font-weight: 500;
    color: var(--text);
    margin-bottom: 0;
  }

  /* ── SECCIONES (minimalista) ── */
  .page-break { page-break-before: always; }

  .section {
    padding: 80px 90px;
    min-height: 100vh;
  }
  .section-header {
    margin-bottom: 36px;
  }
  .section-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 8.5pt;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--primary);
    margin-bottom: 18px;
  }
  .section-eyebrow::before {
    content: '';
    width: 24px;
    height: 2px;
    background: var(--primary);
    display: inline-block;
  }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 30pt;
    font-weight: 800;
    color: var(--text);
    line-height: 1.15;
    margin-bottom: 12px;
    letter-spacing: -0.5px;
  }
  .section-subtitle {
    font-size: 13.5pt;
    color: var(--text-muted);
    font-weight: 400;
    line-height: 1.5;
    max-width: 90%;
  }
  /* imagen: se muestra COMPLETA, respetando su proporción */
  .section-image {
    margin: 0 0 40px 0;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(var(--rgb-primary), 0.10);
    background: var(--bg-soft);
  }
  .section-image img {
    width: 100%;
    height: auto;
    display: block;
  }
  .section-content {
    font-size: 11.5pt;
    line-height: 1.8;
  }
  .section-content p {
    margin-bottom: 18px;
    color: var(--text);
    text-align: justify;
    hyphens: auto;
  }
  /* primer párrafo destacado tipo "lead" */
  .section-content > p:first-of-type {
    font-size: 13pt;
    color: var(--text);
    line-height: 1.7;
  }
  .section-content h3 {
    font-family: 'Inter', sans-serif;
    font-size: 14pt;
    font-weight: 700;
    color: var(--text);
    margin: 34px 0 14px 0;
    padding-left: 14px;
    border-left: 3px solid var(--accent);
    line-height: 1.3;
  }
  .section-content h4 {
    font-size: 12pt;
    font-weight: 700;
    color: var(--primary);
    margin: 24px 0 10px 0;
  }
  .section-content ul, .section-content ol {
    margin: 14px 0 20px 4px;
    padding-left: 22px;
  }
  .section-content li {
    margin-bottom: 10px;
    color: var(--text);
    padding-left: 6px;
  }
  .section-content li::marker {
    color: var(--primary);
  }
  .section-content strong {
    font-weight: 700;
    color: var(--text);
  }
  .section-content em {
    color: var(--text-muted);
    font-style: italic;
  }
  .section-content code {
    background: var(--bg-soft);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 2px 6px;
    font-family: 'Courier New', monospace;
    font-size: 10pt;
    color: var(--secondary);
  }

  /* ── QUOTE CALLOUT ── */
  .callout {
    background: linear-gradient(135deg, rgba(var(--rgb-primary), 0.06), rgba(var(--rgb-primary), 0.02));
    border-left: 4px solid var(--primary);
    border-radius: 0 8px 8px 0;
    padding: 20px 24px;
    margin: 24px 0;
  }

  /* ── MARCA DE AGUA (plan gratuito) ── */
  .wm-cover {
    position: absolute;
    bottom: 24px;
    right: 80px;
    color: rgba(255,255,255,0.6);
    font-size: 9pt;
    letter-spacing: 1px;
    z-index: 2;
  }
  .wm-footer {
    text-align: center;
    font-size: 8pt;
    color: var(--text-muted);
    opacity: 0.55;
    margin-top: 36px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
    letter-spacing: 0.5px;
  }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .section { padding: 60px 70px; }
  }
</style>
</head>
<body>

<!-- PORTADA -->
<div class="cover">
  <div class="cover-brand">
    ${logoUrl ? `<img src="${logoUrl}" alt="${nombreNegocio}" />` : ""}
    <span class="cover-brand-name">${nombreNegocio}</span>
  </div>
  <div class="cover-tag">Ebook Profesional</div>
  <h1 class="cover-title">${outline.bookTitle}</h1>
  <div class="cover-line"></div>
  <p class="cover-subtitle">${outline.bookSubtitle}</p>
  <div class="cover-date">${new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long" })}</div>
  ${marcaDeAgua ? `<div class="wm-cover">Creado con FoxPDF · foxpdf.cloud</div>` : ""}
</div>

<!-- TABLA DE CONTENIDOS -->
<div class="toc">
  <p class="toc-header">Contenido</p>
  <h2 class="toc-title">Índice</h2>
  ${tocItems}
</div>

<!-- SECCIONES -->
${sectionHtml}


<script>
  // Auto-print si viene con ?print=1 en la URL
  if (typeof window !== 'undefined' && window.location.search.includes('print=1')) {
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 800);
    });
  }
</script>
</body>
</html>`;
}
