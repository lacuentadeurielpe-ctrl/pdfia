import type { Outline, Section } from "@/lib/orchestrator/parser";
import type { BrandConfig, RenderOptions } from "./types";
import { hexToRgb, mdToHtml, shouldShowImage } from "./shared";

export function buildNegocios(
  outline: Outline,
  sections: Section[],
  brand: BrandConfig,
  opts: RenderOptions
): string {
  const { colorPrimario, colorSecundario, colorAcento, nombreNegocio, logoUrl, urlNegocio, footerTexto } = brand;
  const rgb = hexToRgb(colorPrimario);
  const totalSections = sections.length;

  const tocItems = sections
    .map((s, i) => `
      <div class="toc-item">
        <span class="toc-num">${String(i + 1).padStart(2, "0")}</span>
        <span class="toc-title">${s.title}</span>
        <span class="toc-dots"></span>
      </div>`)
    .join("");

  const sectionsHtml = sections.map((s, i) => {
    const content = mdToHtml(s.content);
    const showImg = shouldShowImage(opts.modoImagenes, i, s.imageUrl);
    const imgBlock = showImg
      ? `<div class="section-image">
          <img src="${s.imageUrl}" alt="${s.title}" loading="eager" />
          <div class="img-accent-bar"></div>
         </div>`
      : "";
    return `
    <div class="section page-break">
      <div class="page-header">
        <div class="header-brand">
          ${logoUrl ? `<img src="${logoUrl}" alt="${nombreNegocio}" class="header-logo" />` : ""}
          <span class="header-name">${nombreNegocio}</span>
        </div>
        <span class="header-chapter">Cap. ${String(i + 1).padStart(2, "0")} / ${String(totalSections).padStart(2, "0")}</span>
      </div>
      <div class="header-accent-top"></div>
      <div class="section-body">
        <h2 class="section-title">${s.title}</h2>
        ${s.subtitle ? `<p class="section-subtitle">${s.subtitle}</p>` : ""}
        ${imgBlock}
        <div class="section-content"><p>${content}</p></div>
        ${opts.marcaDeAgua ? `<div class="wm-footer">Creado con FoxPDF · foxpdf.cloud</div>` : ""}
      </div>
    </div>`;
  }).join("\n");

  const backMatter = urlNegocio || footerTexto ? `
  <div class="page-break back-matter">
    <div class="back-top">
      ${logoUrl ? `<img class="back-logo" src="${logoUrl}" alt="${nombreNegocio}" />` : ""}
      <h3 class="back-name">${nombreNegocio}</h3>
      ${urlNegocio ? `<p class="back-url">${urlNegocio}</p>` : ""}
      ${footerTexto ? `<p class="back-footer">${footerTexto}</p>` : ""}
    </div>
    <div class="back-accent-bar"></div>
  </div>` : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
@page{margin:0;size:A4;}
:root{
  --p:${colorPrimario};--s:${colorSecundario};--a:${colorAcento};--rp:${rgb};
  --text:#0f172a;--muted:#64748b;--bg:#fff;--soft:#f8fafc;--border:#e2e8f0;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{font-family:'Inter',sans-serif;color:var(--text);background:var(--bg);
  font-size:11pt;line-height:1.75;}

/* COVER — dark navy, stats en la base, acento dorado */
.cover{width:100%;height:100vh;background:var(--text);
  display:flex;flex-direction:column;
  page-break-after:always;position:relative;overflow:hidden;}
.cover-body{flex:1;padding:80px;display:flex;flex-direction:column;justify-content:center;}
.cover-tag{font-family:'Montserrat',sans-serif;font-size:7.5pt;color:#94a3b8;
  letter-spacing:4px;text-transform:uppercase;margin-bottom:36px;font-weight:600;}
.cover-title{font-family:'Montserrat',sans-serif;font-size:36pt;font-weight:900;
  color:#f1f5f9;line-height:1.12;margin-bottom:20px;max-width:660px;}
.cover-accent-line{width:48px;height:4px;background:var(--a);
  border-radius:2px;margin-bottom:24px;}
.cover-subtitle{font-size:13.5pt;color:#94a3b8;line-height:1.6;
  max-width:580px;font-weight:400;}
.cover-brand{display:flex;align-items:center;gap:10px;margin-top:40px;}
.cover-brand img{width:36px;height:36px;object-fit:contain;border-radius:6px;
  background:rgba(255,255,255,.08);padding:3px;}
.cover-brand-name{font-family:'Montserrat',sans-serif;font-size:10pt;
  color:#94a3b8;font-weight:600;}
/* Stats bar en la base de la portada */
.cover-stats{background:#1e293b;display:flex;justify-content:space-around;
  align-items:center;padding:20px 80px;}
.stat{text-align:center;}
.stat-num{display:block;font-family:'Montserrat',sans-serif;font-size:18pt;
  font-weight:900;color:var(--a);}
.stat-label{font-size:7pt;color:#475569;text-transform:uppercase;
  letter-spacing:1.5px;font-weight:600;}
.cover-accent-strip{height:4px;background:linear-gradient(90deg,var(--a),var(--p),var(--s));}
.wm-cover{position:absolute;bottom:60px;right:80px;font-size:7.5pt;
  color:#334155;letter-spacing:1px;}

/* TOC */
.toc{padding:80px;page-break-after:always;min-height:100vh;}
.toc-eyebrow{font-family:'Montserrat',sans-serif;font-size:7.5pt;font-weight:700;
  letter-spacing:4px;text-transform:uppercase;color:var(--p);margin-bottom:12px;}
.toc-heading{font-family:'Montserrat',sans-serif;font-size:26pt;font-weight:900;
  color:var(--text);margin-bottom:48px;}
.toc-item{display:flex;align-items:center;gap:12px;padding:13px 0;
  border-bottom:1px solid var(--border);}
.toc-num{font-family:'Montserrat',sans-serif;font-size:9pt;font-weight:800;
  color:var(--p);min-width:28px;}
.toc-title{font-size:12pt;font-weight:500;color:var(--text);flex:1;}
.toc-dots{flex:1;height:1px;background:repeating-linear-gradient(
  90deg,var(--border) 0,var(--border) 4px,transparent 4px,transparent 8px);}

/* SECTIONS */
.page-break{page-break-before:always;}
.section{min-height:100vh;display:flex;flex-direction:column;}

/* Header de página con logo + número de capítulo */
.page-header{background:var(--text);padding:14px 72px;display:flex;
  justify-content:space-between;align-items:center;flex-shrink:0;}
.header-brand{display:flex;align-items:center;gap:8px;}
.header-logo{width:22px;height:22px;object-fit:contain;border-radius:3px;
  background:rgba(255,255,255,.1);padding:2px;}
.header-name{font-family:'Montserrat',sans-serif;font-size:9pt;font-weight:700;color:#94a3b8;}
.header-chapter{font-family:'Montserrat',sans-serif;font-size:8pt;font-weight:600;
  color:#64748b;letter-spacing:1px;}
.header-accent-top{height:3px;background:linear-gradient(90deg,var(--a),var(--p));flex-shrink:0;}

.section-body{flex:1;padding:48px 72px 64px;}
.section-title{font-family:'Montserrat',sans-serif;font-size:24pt;font-weight:900;
  color:var(--text);line-height:1.2;margin-bottom:12px;}
.section-subtitle{font-size:13pt;color:var(--muted);line-height:1.5;margin-bottom:28px;}

/* Imagen negocios: redondeada, sombra corporativa, barra de acento en la base */
.section-image{border-radius:8px;overflow:hidden;margin:8px 0 32px;position:relative;
  border:1px solid var(--border);
  box-shadow:0 4px 20px rgba(0,0,0,.10),0 1px 4px rgba(0,0,0,.06);}
.section-image img{width:100%;height:auto;display:block;}
.img-accent-bar{height:4px;background:linear-gradient(90deg,var(--a),var(--p));}

/* CONTENT */
.section-content{font-size:11pt;line-height:1.78;}
.section-content p{margin-bottom:17px;color:var(--text);text-align:justify;hyphens:auto;}
.section-content>p:first-of-type{font-size:12.5pt;line-height:1.72;}
.section-content h3{font-family:'Montserrat',sans-serif;font-size:13.5pt;font-weight:700;
  color:var(--text);margin:30px 0 12px;}
.section-content h4{font-size:12pt;font-weight:600;color:var(--p);margin:22px 0 9px;
  font-family:'Montserrat',sans-serif;}
.section-content ul,.section-content ol{margin:12px 0 18px 4px;padding-left:20px;}
.section-content li{margin-bottom:9px;color:var(--text);padding-left:4px;}
.section-content li::marker{color:var(--a);}
.section-content strong{font-weight:700;}
.section-content em{color:var(--muted);font-style:italic;}
.section-content code{background:var(--soft);border:1px solid var(--border);border-radius:4px;
  padding:2px 6px;font-family:'Courier New',monospace;font-size:10pt;color:var(--s);}
/* Pull quote — estilo ejecutivo */
.section-content .pull-quote{font-family:'Montserrat',sans-serif;font-size:14pt;
  font-weight:600;color:var(--text);border-left:4px solid var(--a);
  padding:18px 22px;margin:24px 0;background:var(--soft);border-radius:0 6px 6px 0;
  line-height:1.5;}
.section-content blockquote{font-style:italic;color:var(--muted);
  border-left:3px solid var(--border);padding:12px 18px;margin:18px 0;}
/* Callout stat — tarjeta destacada estilo business */
.section-content .callout-stat{background:var(--text);color:#f1f5f9;
  padding:16px 20px;margin:22px 0;border-radius:8px;display:flex;gap:12px;font-size:11pt;}
.section-content .callout-stat .ci{color:var(--a);}
.section-content .callout-tip{background:#f0fdf4;border-left:3px solid #22c55e;
  padding:13px 17px;margin:18px 0;border-radius:0 6px 6px 0;display:flex;gap:9px;font-size:11pt;}
.section-content .callout-warn{background:#fff7ed;border-left:3px solid #f97316;
  padding:13px 17px;margin:18px 0;border-radius:0 6px 6px 0;display:flex;gap:9px;font-size:11pt;}
.ci{flex-shrink:0;}
.wm-footer{text-align:center;font-size:7.5pt;color:var(--muted);opacity:.45;margin-top:36px;
  padding-top:12px;border-top:1px solid var(--border);letter-spacing:.5px;}
.back-matter{display:flex;flex-direction:column;min-height:100vh;}
.back-top{flex:1;background:var(--text);display:flex;flex-direction:column;
  align-items:center;justify-content:center;padding:80px;text-align:center;}
.back-logo{width:80px;height:80px;object-fit:contain;border-radius:12px;
  background:rgba(255,255,255,.08);padding:8px;margin-bottom:24px;}
.back-name{font-family:'Montserrat',sans-serif;font-size:24pt;font-weight:900;
  color:#f1f5f9;margin-bottom:12px;}
.back-url{font-size:12pt;color:var(--a);margin-bottom:16px;}
.back-footer{font-size:11pt;color:#64748b;max-width:500px;line-height:1.65;}
.back-accent-bar{height:6px;background:linear-gradient(90deg,var(--a),var(--p),var(--s));}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .section-body{padding:40px 60px 52px;}}
</style>
</head>
<body>
<div class="cover">
  <div class="cover-body">
    <div class="cover-tag">Reporte Ejecutivo · ${new Date().getFullYear()}</div>
    <h1 class="cover-title">${outline.bookTitle}</h1>
    <div class="cover-accent-line"></div>
    <p class="cover-subtitle">${outline.bookSubtitle}</p>
    <div class="cover-brand">
      ${logoUrl ? `<img src="${logoUrl}" alt="${nombreNegocio}" />` : ""}
      <span class="cover-brand-name">${nombreNegocio}</span>
    </div>
  </div>
  <div class="cover-stats">
    <div class="stat"><span class="stat-num">${totalSections}</span><span class="stat-label">Capítulos</span></div>
    <div class="stat"><span class="stat-num">100%</span><span class="stat-label">Accionable</span></div>
    <div class="stat"><span class="stat-num">${new Date().getFullYear()}</span><span class="stat-label">Edición</span></div>
  </div>
  <div class="cover-accent-strip"></div>
  ${opts.marcaDeAgua ? `<div class="wm-cover">Creado con FoxPDF · foxpdf.cloud</div>` : ""}
</div>
<div class="toc">
  <p class="toc-eyebrow">Índice General</p>
  <h2 class="toc-heading">Contenido</h2>
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
