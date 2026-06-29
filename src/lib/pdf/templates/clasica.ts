import type { Outline, Section } from "@/lib/orchestrator/parser";
import type { BrandConfig, RenderOptions } from "./types";
import { hexToRgb, mdToHtml, shouldShowImage } from "./shared";

export function buildClasica(
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
      ? `<div class="section-image"><img src="${s.imageUrl}" alt="${s.title}" loading="eager" /></div>`
      : "";
    return `
    <div class="section page-break">
      <div class="section-header">
        <span class="eyebrow">${nombreNegocio} · Capítulo ${String(i + 1).padStart(2, "0")}</span>
        <h2 class="section-title">${s.title}</h2>
        ${s.subtitle ? `<p class="section-subtitle">${s.subtitle}</p>` : ""}
      </div>
      ${imgBlock}
      <div class="section-content">${content}</div>
      ${opts.marcaDeAgua ? `<div class="wm-footer">Creado con FoxPDF · foxpdf.cloud</div>` : ""}
    </div>`;
  }).join("\n");

  const backMatter = urlNegocio || footerTexto ? `
  <div class="page-break back-matter">
    ${logoUrl ? `<img class="back-logo" src="${logoUrl}" alt="${nombreNegocio}" />` : ""}
    <h3 class="back-name">${nombreNegocio}</h3>
    ${urlNegocio ? `<p class="back-url">${urlNegocio}</p>` : ""}
    ${footerTexto ? `<p class="back-footer">${footerTexto}</p>` : ""}
  </div>` : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
@page { margin:0; size:A4; }
:root {
  --p:${colorPrimario}; --s:${colorSecundario}; --a:${colorAcento}; --rp:${rgb};
  --text:#1a1a2e; --muted:#64748b; --bg:#fff; --soft:#f8fafc; --border:#e2e8f0;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{font-family:'Inter',sans-serif;color:var(--text);background:var(--bg);font-size:11pt;line-height:1.75;}

.cover{width:100%;height:100vh;background:linear-gradient(135deg,var(--p) 0%,var(--s) 100%);
  display:flex;flex-direction:column;justify-content:center;align-items:flex-start;
  padding:80px;position:relative;overflow:hidden;page-break-after:always;}
.cover::before{content:'';position:absolute;top:-100px;right:-100px;width:500px;height:500px;
  border-radius:50%;background:rgba(255,255,255,.05);}
.cover::after{content:'';position:absolute;bottom:-50px;right:100px;width:300px;height:300px;
  border-radius:50%;background:rgba(255,255,255,.08);}
.cover-brand{display:flex;align-items:center;gap:12px;margin-bottom:60px;z-index:1;}
.cover-brand img{width:48px;height:48px;object-fit:contain;border-radius:8px;
  background:rgba(255,255,255,.15);padding:4px;}
.cover-brand-name{color:rgba(255,255,255,.8);font-size:14pt;font-weight:500;letter-spacing:.5px;}
.cover-tag{background:rgba(255,255,255,.15);color:white;font-size:8pt;font-weight:700;
  letter-spacing:3px;text-transform:uppercase;padding:6px 16px;border-radius:20px;
  margin-bottom:24px;display:inline-block;z-index:1;}
.cover-title{font-family:'Playfair Display',serif;font-size:42pt;font-weight:800;color:white;
  line-height:1.12;margin-bottom:20px;z-index:1;max-width:700px;}
.cover-line{width:60px;height:4px;background:var(--a);border-radius:2px;margin:24px 0;z-index:1;}
.cover-subtitle{font-size:15pt;color:rgba(255,255,255,.75);font-weight:300;
  max-width:600px;z-index:1;line-height:1.5;}
.cover-date{position:absolute;bottom:60px;left:80px;color:rgba(255,255,255,.45);font-size:9.5pt;z-index:1;}
.wm-cover{position:absolute;bottom:24px;right:80px;color:rgba(255,255,255,.5);font-size:8pt;letter-spacing:1px;z-index:2;}

.toc{padding:80px;page-break-after:always;min-height:100vh;}
.toc-eyebrow{font-size:8.5pt;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:var(--p);margin-bottom:12px;}
.toc-heading{font-family:'Playfair Display',serif;font-size:28pt;font-weight:700;color:var(--text);margin-bottom:48px;}
.toc-item{display:flex;align-items:baseline;gap:16px;padding:14px 0;border-bottom:1px solid var(--border);}
.toc-num{font-size:9.5pt;font-weight:700;color:var(--p);opacity:.55;min-width:28px;}
.toc-title{font-size:12pt;font-weight:500;color:var(--text);}

.page-break{page-break-before:always;}
.section{padding:80px 90px;min-height:100vh;}
.section-header{margin-bottom:36px;}
.eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:8pt;font-weight:700;
  letter-spacing:3px;text-transform:uppercase;color:var(--p);margin-bottom:18px;}
.eyebrow::before{content:'';width:22px;height:2px;background:var(--p);display:inline-block;}
.section-title{font-family:'Playfair Display',serif;font-size:30pt;font-weight:800;
  color:var(--text);line-height:1.13;margin-bottom:12px;letter-spacing:-.3px;}
.section-subtitle{font-size:13pt;color:var(--muted);font-weight:400;line-height:1.5;max-width:88%;}

/* Imagen clásica: redondeada, sombra con color de marca, overlay degradado en la base */
.section-image{margin:8px 0 40px;border-radius:14px;overflow:hidden;position:relative;
  border:1px solid rgba(var(--rp),.18);
  box-shadow:0 12px 40px rgba(var(--rp),.18),0 2px 8px rgba(0,0,0,.07);}
.section-image img{width:100%;height:auto;display:block;}
.section-image::after{content:'';position:absolute;bottom:0;left:0;right:0;height:35%;
  background:linear-gradient(to top,rgba(var(--rp),.13),transparent);pointer-events:none;}

.section-content{font-size:11.5pt;line-height:1.82;}
.section-content p{margin-bottom:18px;color:var(--text);text-align:justify;hyphens:auto;}
.section-content>p:first-of-type{font-size:13pt;line-height:1.72;}
.section-content h3{font-family:'Inter',sans-serif;font-size:14pt;font-weight:700;color:var(--text);
  margin:34px 0 14px;padding-left:14px;border-left:3px solid var(--a);line-height:1.3;}
.section-content h4{font-size:12pt;font-weight:700;color:var(--p);margin:24px 0 10px;}
.section-content ul,.section-content ol{margin:14px 0 20px 4px;padding-left:22px;}
.section-content li{margin-bottom:10px;color:var(--text);padding-left:6px;}
.section-content li::marker{color:var(--p);}
.section-content strong{font-weight:700;}
.section-content em{color:var(--muted);font-style:italic;}
.section-content code{background:var(--soft);border:1px solid var(--border);border-radius:4px;
  padding:2px 6px;font-family:'Courier New',monospace;font-size:10pt;color:var(--s);}
.section-content blockquote{background:linear-gradient(135deg,rgba(var(--rp),.06),rgba(var(--rp),.02));
  border-left:4px solid var(--p);border-radius:0 8px 8px 0;padding:18px 22px;margin:22px 0;
  font-style:italic;color:var(--text);}
.section-content .pull-quote{font-family:'Playfair Display',serif;font-size:15pt;font-style:italic;
  color:var(--p);border:none;background:none;text-align:center;padding:24px 32px;margin:28px 0;
  position:relative;}
.section-content .pull-quote::before{content:'“';font-size:48pt;color:var(--p);opacity:.18;
  position:absolute;top:-10px;left:0;line-height:1;font-family:'Playfair Display',serif;}
.section-content .callout-tip{background:rgba(var(--rp),.06);border-left:3px solid var(--a);
  padding:14px 18px;margin:20px 0;border-radius:0 8px 8px 0;display:flex;gap:10px;font-size:11pt;}
.section-content .callout-warn{background:#fff7ed;border-left:3px solid #f97316;
  padding:14px 18px;margin:20px 0;border-radius:0 8px 8px 0;display:flex;gap:10px;font-size:11pt;}
.section-content .callout-stat{background:var(--soft);border-left:3px solid var(--p);
  padding:14px 18px;margin:20px 0;border-radius:0 8px 8px 0;display:flex;gap:10px;font-size:11pt;}
.ci{flex-shrink:0;}
.wm-footer{text-align:center;font-size:7.5pt;color:var(--muted);opacity:.5;margin-top:40px;
  padding-top:12px;border-top:1px solid var(--border);letter-spacing:.5px;}
.back-matter{display:flex;flex-direction:column;align-items:center;justify-content:center;
  min-height:100vh;padding:80px;text-align:center;background:var(--soft);}
.back-logo{width:80px;height:80px;object-fit:contain;border-radius:12px;margin-bottom:24px;}
.back-name{font-family:'Playfair Display',serif;font-size:24pt;font-weight:800;color:var(--text);margin-bottom:12px;}
.back-url{font-size:12pt;color:var(--p);margin-bottom:16px;}
.back-footer{font-size:11pt;color:var(--muted);max-width:500px;line-height:1.65;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}.section{padding:60px 70px;}}
</style>
</head>
<body>
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
  ${opts.marcaDeAgua ? `<div class="wm-cover">Creado con FoxPDF · foxpdf.cloud</div>` : ""}
</div>
<div class="toc">
  <p class="toc-eyebrow">Contenido</p>
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
