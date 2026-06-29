import type { Outline, Section } from "@/lib/orchestrator/parser";
import type { BrandConfig, RenderOptions } from "./types";
import { hexToRgb, mdToHtml, shouldShowImage } from "./shared";

export function buildTecnico(
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
        <div class="toc-dot"></div>
        <div class="toc-text">
          <span class="toc-num">// ${String(i + 1).padStart(2, "0")}</span>
          <span class="toc-title">${s.title}</span>
        </div>
      </div>`)
    .join("");

  const sectionsHtml = sections.map((s, i) => {
    const content = mdToHtml(s.content);
    const showImg = shouldShowImage(opts.modoImagenes, i, s.imageUrl);
    const imgBlock = showImg
      ? `<div class="section-image">
          <div class="img-top-bar"></div>
          <div class="img-label">// FIGURA ${String(i + 1).padStart(2, "0")}</div>
          <img src="${s.imageUrl}" alt="${s.title}" loading="eager" />
         </div>`
      : "";
    return `
    <div class="section page-break">
      <div class="sidebar">
        ${sections.map((_, j) => `<div class="sidebar-dot ${j === i ? "active" : ""}"></div>`).join('<div class="sidebar-line"></div>')}
      </div>
      <div class="section-body">
        <div class="chapter-label">// CAPÍTULO ${String(i + 1).padStart(2, "0")}</div>
        <h2 class="section-title">${s.title}</h2>
        ${s.subtitle ? `<p class="section-subtitle">${s.subtitle}</p>` : ""}
        ${imgBlock}
        <div class="section-content"><p>${content}</p></div>
        ${opts.marcaDeAgua ? `<div class="wm-footer">// Creado con FoxPDF · foxpdf.cloud</div>` : ""}
      </div>
    </div>`;
  }).join("\n");

  const backMatter = urlNegocio || footerTexto ? `
  <div class="page-break back-matter">
    ${logoUrl ? `<img class="back-logo" src="${logoUrl}" alt="${nombreNegocio}" />` : ""}
    <div class="back-mono">// FIN DE DOCUMENTO</div>
    <h3 class="back-name">${nombreNegocio}</h3>
    ${urlNegocio ? `<p class="back-url">${urlNegocio}</p>` : ""}
    ${footerTexto ? `<p class="back-footer">${footerTexto}</p>` : ""}
  </div>` : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@300;400;500;600;700&display=swap');
@page{margin:0;size:A4;}
:root{
  --p:${colorPrimario};--s:${colorSecundario};--a:${colorAcento};--rp:${rgb};
  --text:#e2e8f0;--muted:#64748b;--dark:#0f172a;--dark2:#1e293b;--border:#1e3a5f;
  --bg-body:#f8fafc;
}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Inter',sans-serif;color:#1e293b;background:var(--bg-body);
  font-size:11pt;line-height:1.75;}

/* COVER — dark navy, estilo terminal */
.cover{width:100%;height:100vh;background:var(--dark);
  display:flex;flex-direction:column;justify-content:center;
  padding:80px;position:relative;overflow:hidden;page-break-after:always;}
.cover-corner-tl{position:absolute;top:40px;left:40px;width:32px;height:32px;
  border-top:2px solid var(--a);border-left:2px solid var(--a);}
.cover-corner-br{position:absolute;bottom:40px;right:40px;width:32px;height:32px;
  border-bottom:2px solid var(--s);border-right:2px solid var(--s);}
.cover-tag{font-family:'JetBrains Mono',monospace;font-size:8pt;color:var(--a);
  letter-spacing:1px;margin-bottom:32px;}
.cover-title{font-family:'JetBrains Mono',monospace;font-size:28pt;font-weight:700;
  color:#f1f5f9;line-height:1.25;margin-bottom:28px;max-width:620px;}
.cover-rule{width:100%;height:1px;background:var(--border);margin-bottom:24px;}
.cover-subtitle{font-family:'JetBrains Mono',monospace;font-size:9.5pt;color:#64748b;
  line-height:1.7;max-width:560px;}
.cover-brand{display:flex;align-items:center;gap:10px;margin-top:48px;}
.cover-brand img{width:32px;height:32px;object-fit:contain;border-radius:4px;
  background:rgba(255,255,255,.08);padding:3px;}
.cover-brand-name{font-family:'JetBrains Mono',monospace;font-size:9pt;color:#475569;}
.wm-cover{position:absolute;bottom:24px;right:80px;font-family:'JetBrains Mono',monospace;
  font-size:7pt;color:#334155;letter-spacing:1px;}

/* TOC — dark sidebar + lista con dots */
.toc{display:flex;min-height:100vh;page-break-after:always;}
.toc-sidebar{width:56px;background:var(--dark);flex-shrink:0;
  display:flex;flex-direction:column;align-items:center;padding-top:60px;gap:10px;}
.toc-sidebar-dot{width:6px;height:6px;background:var(--a);border-radius:50%;}
.toc-sidebar-line{width:1px;height:20px;background:var(--border);}
.toc-body{flex:1;padding:60px 72px 60px 48px;}
.toc-tag{font-family:'JetBrains Mono',monospace;font-size:7.5pt;color:var(--a);
  letter-spacing:2px;margin-bottom:12px;}
.toc-heading{font-family:'Inter',sans-serif;font-size:22pt;font-weight:700;
  color:#0f172a;margin-bottom:40px;border-left:3px solid var(--p);padding-left:12px;}
.toc-item{display:flex;align-items:flex-start;gap:12px;padding:12px 0;
  border-bottom:1px solid #e2e8f0;}
.toc-dot{width:6px;height:6px;border-radius:50%;background:var(--p);
  margin-top:6px;flex-shrink:0;}
.toc-text{display:flex;flex-direction:column;gap:2px;}
.toc-num{font-family:'JetBrains Mono',monospace;font-size:8pt;color:var(--a);letter-spacing:1px;}
.toc-title{font-size:11.5pt;font-weight:500;color:#0f172a;}

/* SECTIONS */
.page-break{page-break-before:always;}
.section{display:flex;min-height:100vh;}

/* Sidebar navigation */
.sidebar{width:56px;background:var(--dark);flex-shrink:0;
  display:flex;flex-direction:column;align-items:center;padding-top:60px;gap:8px;}
.sidebar-dot{width:7px;height:7px;border-radius:50%;background:var(--border);flex-shrink:0;}
.sidebar-dot.active{background:var(--a);box-shadow:0 0 6px rgba(var(--rp),.5);}
.sidebar-line{width:1px;height:22px;background:var(--border);}

.section-body{flex:1;padding:60px 72px 60px 48px;}
.chapter-label{font-family:'JetBrains Mono',monospace;font-size:7.5pt;color:var(--a);
  letter-spacing:2px;margin-bottom:12px;}
.section-title{font-size:22pt;font-weight:700;color:#0f172a;line-height:1.25;
  margin-bottom:10px;border-left:3px solid var(--p);padding-left:12px;}
.section-subtitle{font-size:12pt;color:#475569;font-weight:400;line-height:1.5;
  margin-bottom:24px;padding-left:15px;}

/* Imagen técnico: borde oscuro, barra gradiente arriba, label monoespacio, desaturada */
.section-image{border:1px solid var(--border);border-radius:6px;overflow:hidden;
  margin:24px 0 32px;position:relative;}
.img-top-bar{height:3px;background:linear-gradient(90deg,var(--a),var(--p));}
.img-label{background:var(--dark);color:var(--a);
  font-family:'JetBrains Mono',monospace;font-size:7pt;padding:5px 12px;letter-spacing:1px;}
.section-image img{width:100%;height:auto;display:block;
  filter:saturate(65%) brightness(88%) contrast(1.05);}

/* CONTENT */
.section-content{font-size:11pt;line-height:1.78;}
.section-content p{margin-bottom:16px;color:#1e293b;text-align:justify;hyphens:auto;}
.section-content>p:first-of-type{font-size:12.5pt;line-height:1.7;}
.section-content h3{font-family:'Inter',sans-serif;font-size:13pt;font-weight:700;
  color:#0f172a;margin:28px 0 12px;border-left:3px solid var(--a);padding-left:10px;}
.section-content h4{font-size:11.5pt;font-weight:600;color:var(--p);margin:20px 0 8px;
  font-family:'JetBrains Mono',monospace;}
.section-content ul,.section-content ol{margin:12px 0 18px 4px;padding-left:20px;}
.section-content li{margin-bottom:9px;color:#1e293b;padding-left:4px;}
.section-content li::marker{color:var(--a);}
.section-content strong{font-weight:700;}
.section-content em{color:#475569;font-style:italic;}
.section-content code{background:var(--dark2);border:1px solid var(--border);border-radius:4px;
  padding:2px 7px;font-family:'JetBrains Mono',monospace;font-size:9.5pt;color:var(--a);}
.section-content blockquote{background:var(--dark2);border-left:3px solid var(--p);
  padding:14px 18px;margin:20px 0;color:#94a3b8;font-family:'JetBrains Mono',monospace;
  font-size:10.5pt;border-radius:0 4px 4px 0;}
.section-content .pull-quote{font-size:13pt;font-style:italic;color:#0f172a;
  border-left:4px solid var(--a);padding:16px 20px;margin:24px 0;
  background:#f0f9ff;border-radius:0 6px 6px 0;}
.section-content .callout-tip{background:#f0fdf4;border-left:3px solid #22c55e;
  padding:13px 17px;margin:18px 0;border-radius:0 6px 6px 0;display:flex;gap:9px;font-size:11pt;}
.section-content .callout-warn{background:#fff7ed;border-left:3px solid #f97316;
  padding:13px 17px;margin:18px 0;border-radius:0 6px 6px 0;display:flex;gap:9px;font-size:11pt;}
.section-content .callout-stat{background:#f1f5f9;border-left:3px solid var(--p);
  padding:13px 17px;margin:18px 0;border-radius:0 6px 6px 0;display:flex;gap:9px;font-size:11pt;}
.ci{flex-shrink:0;}
.wm-footer{font-family:'JetBrains Mono',monospace;font-size:7pt;color:#94a3b8;
  margin-top:36px;padding-top:10px;border-top:1px solid #e2e8f0;letter-spacing:.5px;}
.back-matter{display:flex;flex-direction:column;align-items:center;justify-content:center;
  min-height:100vh;padding:80px;text-align:center;background:var(--dark);}
.back-logo{width:72px;height:72px;object-fit:contain;border-radius:8px;
  background:rgba(255,255,255,.08);padding:8px;margin-bottom:24px;}
.back-mono{font-family:'JetBrains Mono',monospace;font-size:8pt;color:var(--a);
  letter-spacing:2px;margin-bottom:20px;}
.back-name{font-size:20pt;font-weight:700;color:#f1f5f9;margin-bottom:12px;}
.back-url{font-size:11pt;color:var(--a);margin-bottom:16px;font-family:'JetBrains Mono',monospace;}
.back-footer{font-size:10.5pt;color:#64748b;max-width:480px;line-height:1.65;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .section-body{padding:48px 60px 48px 40px;}}
</style>
</head>
<body>
<div class="cover">
  <div class="cover-corner-tl"></div>
  <div class="cover-corner-br"></div>
  <div class="cover-tag">// DOCUMENTACIÓN · ${new Date().getFullYear()}</div>
  <h1 class="cover-title">${outline.bookTitle}</h1>
  <div class="cover-rule"></div>
  <p class="cover-subtitle">$ ${outline.bookSubtitle}</p>
  <div class="cover-brand">
    ${logoUrl ? `<img src="${logoUrl}" alt="${nombreNegocio}" />` : ""}
    <span class="cover-brand-name">// ${nombreNegocio}</span>
  </div>
  ${opts.marcaDeAgua ? `<div class="wm-cover">// FoxPDF · foxpdf.cloud</div>` : ""}
</div>
<div class="toc">
  <div class="toc-sidebar">
    <div class="toc-sidebar-dot"></div>
    <div class="toc-sidebar-line"></div>
    <div class="toc-sidebar-dot"></div>
  </div>
  <div class="toc-body">
    <div class="toc-tag">// ÍNDICE DE CONTENIDOS</div>
    <h2 class="toc-heading">Contenido</h2>
    ${tocItems}
  </div>
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
