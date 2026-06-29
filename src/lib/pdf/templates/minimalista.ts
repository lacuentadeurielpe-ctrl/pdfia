import type { Outline, Section } from "@/lib/orchestrator/parser";
import type { BrandConfig, RenderOptions } from "./types";
import { hexToRgb, mdToHtml, shouldShowImage } from "./shared";

export function buildMinimalista(
  outline: Outline,
  sections: Section[],
  brand: BrandConfig,
  opts: RenderOptions
): string {
  const { colorPrimario, colorSecundario, colorAcento, nombreNegocio, logoUrl, urlNegocio, footerTexto } = brand;
  const rgb = hexToRgb(colorPrimario);

  const tocItems = sections
    .map((s, i) => `
      <div class="toc-item">
        <span class="toc-num">${String(i + 1).padStart(2, "0")}</span>
        <span class="toc-title">${s.title}</span>
      </div>`)
    .join("");

  const sectionsHtml = sections.map((s, i) => {
    const content = mdToHtml(s.content);
    const showImg = shouldShowImage(opts.modoImagenes, i, s.imageUrl);
    const imgBlock = showImg
      ? `<figure class="section-image"><img src="${s.imageUrl}" alt="${s.title}" loading="eager" /></figure>`
      : "";
    return `
    <div class="section page-break">
      <div class="chapter-label">Capítulo ${String(i + 1).padStart(2, "0")}</div>
      <h2 class="section-title">${s.title}</h2>
      <div class="title-rule"></div>
      ${s.subtitle ? `<p class="section-subtitle">${s.subtitle}</p>` : ""}
      ${imgBlock}
      <div class="section-content drop-cap"><p>${content}</p></div>
      ${opts.marcaDeAgua ? `<div class="wm-footer">Creado con FoxPDF · foxpdf.cloud</div>` : ""}
    </div>`;
  }).join("\n");

  const backMatter = urlNegocio || footerTexto ? `
  <div class="page-break back-matter">
    ${logoUrl
      ? `<img class="back-logo" src="${logoUrl}" alt="${nombreNegocio}" />`
      : `<div class="back-circle"></div>`}
    <h3 class="back-name">${nombreNegocio}</h3>
    ${urlNegocio ? `<p class="back-url">${urlNegocio}</p>` : ""}
    ${footerTexto ? `<p class="back-footer">${footerTexto}</p>` : ""}
  </div>` : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<style>
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap');
@page{margin:0;size:A4;}
:root{
  --p:${colorPrimario};--s:${colorSecundario};--a:${colorAcento};--rp:${rgb};
  --text:#0f0f0f;--muted:#6b7280;--bg:#fff;--border:#e5e7eb;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{font-family:'Lora',serif;color:var(--text);background:var(--bg);font-size:11.5pt;line-height:1.85;}

/* COVER — blanco puro, borde izquierdo de color, tipografía protagonista */
.cover{width:100%;height:100vh;background:#fff;display:flex;flex-direction:column;
  justify-content:center;align-items:flex-start;padding:100px 90px 80px;
  border-left:5px solid var(--p);page-break-after:always;position:relative;}
.cover-tag{font-size:7.5pt;color:var(--muted);letter-spacing:4px;text-transform:uppercase;
  margin-bottom:48px;font-family:'Lora',serif;}
.cover-title{font-family:'Libre Baskerville',serif;font-size:44pt;font-weight:700;
  color:#0f0f0f;line-height:1.1;margin-bottom:32px;max-width:640px;}
.cover-rule{width:100%;height:1px;background:#e5e7eb;margin-bottom:28px;}
.cover-subtitle{font-family:'Lora',serif;font-size:14pt;color:var(--muted);
  line-height:1.65;max-width:560px;font-style:italic;}
.cover-brand{position:absolute;bottom:72px;left:100px;display:flex;align-items:center;gap:10px;}
.cover-brand img{width:36px;height:36px;object-fit:contain;border-radius:6px;}
.cover-brand-name{font-size:10pt;color:var(--muted);font-family:'Lora',serif;}
.cover-year{position:absolute;bottom:72px;right:90px;font-size:9pt;color:#d1d5db;letter-spacing:1px;}
.wm-cover{position:absolute;top:40px;right:90px;font-size:7pt;color:var(--muted);opacity:.45;letter-spacing:1px;}

/* TOC */
.toc{padding:100px 90px;page-break-after:always;min-height:100vh;}
.toc-label{font-size:7.5pt;color:var(--muted);letter-spacing:4px;text-transform:uppercase;
  margin-bottom:16px;font-family:'Lora',serif;}
.toc-heading{font-family:'Libre Baskerville',serif;font-size:28pt;font-weight:700;
  color:#0f0f0f;margin-bottom:56px;}
.toc-item{display:flex;align-items:baseline;gap:16px;padding:14px 0;border-bottom:1px solid #f3f4f6;}
.toc-num{font-size:9pt;font-weight:700;color:var(--p);opacity:.45;min-width:28px;
  font-family:'Libre Baskerville',serif;}
.toc-title{font-size:12pt;color:#0f0f0f;font-family:'Lora',serif;}

/* SECTIONS */
.page-break{page-break-before:always;}
.section{padding:100px 90px;min-height:100vh;}
.chapter-label{font-size:7.5pt;color:var(--muted);letter-spacing:3px;text-transform:uppercase;
  margin-bottom:16px;font-family:'Lora',serif;}
.section-title{font-family:'Libre Baskerville',serif;font-size:32pt;font-weight:700;
  color:#0f0f0f;line-height:1.15;margin-bottom:16px;}
.title-rule{width:48px;height:2px;background:var(--p);margin-bottom:20px;}
.section-subtitle{font-size:13.5pt;color:var(--muted);font-style:italic;
  line-height:1.6;margin-bottom:32px;max-width:88%;}

/* Imagen minimalista: centrada al 78%, borde fino, sombra suave, leve desaturación */
.section-image{width:78%;margin:4px auto 44px;display:block;overflow:hidden;
  border:1px solid #dde1e7;
  box-shadow:0 8px 32px rgba(0,0,0,.09),0 1px 4px rgba(0,0,0,.05);}
.section-image img{width:100%;height:auto;display:block;filter:grayscale(8%) contrast(1.02);}

/* DROP CAP en el primer párrafo */
.drop-cap>p:first-of-type::first-letter{
  font-family:'Libre Baskerville',serif;font-size:4.2em;font-weight:700;
  float:left;line-height:.78;margin:.08em .12em 0 0;color:var(--p);}

/* CONTENT */
.section-content{font-size:11.5pt;line-height:1.85;}
.section-content p{margin-bottom:20px;color:var(--text);text-align:justify;hyphens:auto;}
.section-content h3{font-family:'Libre Baskerville',serif;font-size:14pt;font-weight:700;
  color:#0f0f0f;margin:36px 0 14px;}
.section-content h4{font-size:12pt;font-weight:600;color:var(--p);margin:24px 0 10px;
  font-family:'Libre Baskerville',serif;}
.section-content ul,.section-content ol{margin:14px 0 20px 4px;padding-left:22px;}
.section-content li{margin-bottom:10px;}
.section-content li::marker{color:var(--p);}
.section-content strong{font-weight:700;}
.section-content em{font-style:italic;color:var(--muted);}
.section-content code{font-family:'Courier New',monospace;font-size:10pt;background:#f9fafb;
  padding:2px 6px;border:1px solid #e5e7eb;border-radius:3px;}
/* Pull quote — centrado, elegante, comillas tipográficas */
.section-content .pull-quote{font-family:'Libre Baskerville',serif;font-size:15pt;font-style:italic;
  color:#0f0f0f;text-align:center;padding:32px 48px;margin:36px 0;
  border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;line-height:1.6;}
.section-content .pull-quote::before{content:'“';font-size:36pt;color:var(--p);
  opacity:.3;display:block;line-height:.8;margin-bottom:8px;}
.section-content blockquote{font-style:italic;color:var(--muted);
  padding:0 0 0 20px;border-left:2px solid #e5e7eb;margin:20px 0;}
.section-content .callout-tip{background:#f0fdf4;border-left:3px solid #22c55e;
  padding:14px 18px;margin:20px 0;border-radius:0 6px 6px 0;display:flex;gap:10px;font-size:11pt;}
.section-content .callout-warn{background:#fff7ed;border-left:3px solid #f97316;
  padding:14px 18px;margin:20px 0;border-radius:0 6px 6px 0;display:flex;gap:10px;font-size:11pt;}
.section-content .callout-stat{background:#f8fafc;border-left:3px solid var(--p);
  padding:14px 18px;margin:20px 0;border-radius:0 6px 6px 0;display:flex;gap:10px;font-size:11pt;}
.ci{flex-shrink:0;}
.wm-footer{text-align:center;font-size:7pt;color:var(--muted);opacity:.4;margin-top:48px;
  padding-top:12px;border-top:1px solid #f3f4f6;letter-spacing:.5px;}
.back-matter{display:flex;flex-direction:column;align-items:center;justify-content:center;
  min-height:100vh;padding:80px;text-align:center;border-left:5px solid var(--p);}
.back-circle{width:72px;height:72px;border-radius:50%;border:3px solid var(--p);margin-bottom:24px;}
.back-logo{width:72px;height:72px;object-fit:contain;border-radius:50%;margin-bottom:24px;}
.back-name{font-family:'Libre Baskerville',serif;font-size:22pt;font-weight:700;
  color:#0f0f0f;margin-bottom:12px;}
.back-url{font-size:11pt;color:var(--p);margin-bottom:16px;font-style:italic;}
.back-footer{font-size:11pt;color:var(--muted);max-width:480px;line-height:1.7;font-style:italic;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}.section{padding:80px 70px;}}
</style>
</head>
<body>
<div class="cover">
  <div class="cover-tag">Documento Profesional</div>
  <h1 class="cover-title">${outline.bookTitle}</h1>
  <div class="cover-rule"></div>
  <p class="cover-subtitle">${outline.bookSubtitle}</p>
  <div class="cover-brand">
    ${logoUrl ? `<img src="${logoUrl}" alt="${nombreNegocio}" />` : ""}
    <span class="cover-brand-name">${nombreNegocio}</span>
  </div>
  <span class="cover-year">${new Date().getFullYear()}</span>
  ${opts.marcaDeAgua ? `<div class="wm-cover">FoxPDF</div>` : ""}
</div>
<div class="toc">
  <p class="toc-label">Contenido</p>
  <h2 class="toc-heading">Índice</h2>
  ${tocItems}
</div>
${sectionsHtml}
${backMatter}
<script>
if(typeof window!=='undefined'&&window.location.search.includes('print=1'))
  window.addEventListener('load',()=>setTimeout(()=>window.print(),800));
</script>
</body>
</html>`;
}
