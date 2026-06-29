import type { Outline, Section } from "@/lib/orchestrator/parser";
import type { BrandConfig, RenderOptions } from "./types";
import { hexToRgb, mdToHtml, shouldShowImage } from "./shared";
import { imageLayout } from "./image-format";

export function buildRevista(
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
        <div class="toc-text">
          <span class="toc-title">${s.title}</span>
          ${s.subtitle ? `<span class="toc-sub">${s.subtitle}</span>` : ""}
        </div>
      </div>`)
    .join("");

  const sectionsHtml = sections.map((s, i) => {
    const content = mdToHtml(s.content);
    const showImg = shouldShowImage(opts.modoImagenes, i, s.imageUrl);
    const { layout } = imageLayout("revista", i);
    const isEven = i % 2 === 0;

    const imgBleed = showImg && !isEven
      ? `<div class="img-bleed"><img src="${s.imageUrl}" alt="${s.title}" loading="eager" /></div>`
      : "";
    const imgFloat = showImg && isEven
      ? `<div class="img-float"><img src="${s.imageUrl}" alt="${s.title}" loading="eager" /></div>`
      : "";

    return `
    <div class="section page-break">
      ${imgBleed}
      <div class="section-inner">
        <div class="page-folio">
          <span class="folio-title">${outline.bookTitle.toUpperCase()}</span>
          <span class="folio-num">${String(i + 2).padStart(2, "0")}</span>
        </div>
        <div class="chapter-label">Nº ${String(i + 1).padStart(2, "0")}</div>
        <h2 class="section-title">${s.title.toUpperCase()}</h2>
        <div class="title-rule"></div>
        ${s.subtitle ? `<p class="section-dek">${s.subtitle}</p>` : ""}
        ${imgFloat}
        <div class="section-content two-col">${content}</div>
        <div class="clearfix"></div>
        ${opts.marcaDeAgua ? `<div class="wm-footer">Creado con FoxPDF · foxpdf.cloud</div>` : ""}
      </div>
    </div>`;
  }).join("\n");

  const backMatter = urlNegocio || footerTexto ? `
  <div class="page-break back-matter">
    <div class="back-color-block"></div>
    <div class="back-body">
      ${logoUrl ? `<img class="back-logo" src="${logoUrl}" alt="${nombreNegocio}" />` : ""}
      <h3 class="back-name">${nombreNegocio.toUpperCase()}</h3>
      ${urlNegocio ? `<p class="back-url">${urlNegocio}</p>` : ""}
      ${footerTexto ? `<p class="back-footer">${footerTexto}</p>` : ""}
    </div>
  </div>` : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<style>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap');
@page{margin:0;size:A4;}
:root{
  --p:${colorPrimario};--s:${colorSecundario};--a:${colorAcento};--rp:${rgb};
  --text:#111;--muted:#555;--bg:#fff;--soft:#f4f1ea;--border:#ccc;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{font-family:'Source Sans 3',sans-serif;color:var(--text);background:var(--bg);
  font-size:10.5pt;line-height:1.72;}

/* COVER */
.cover{width:100%;height:100vh;background:var(--soft);
  display:flex;flex-direction:column;page-break-after:always;position:relative;overflow:hidden;}
.cover-top-bar{height:52px;background:var(--p);display:flex;align-items:center;padding:0 60px;
  justify-content:space-between;}
.cover-edition{font-family:'Oswald',sans-serif;font-size:10pt;color:rgba(255,255,255,.85);
  letter-spacing:3px;font-weight:500;}
.cover-brand-top{font-family:'Oswald',sans-serif;font-size:10pt;color:rgba(255,255,255,.85);
  letter-spacing:2px;}
.cover-body{flex:1;display:flex;flex-direction:column;justify-content:center;padding:60px;}
.cover-title{font-family:'Oswald',sans-serif;font-size:54pt;font-weight:700;
  color:var(--text);line-height:.9;text-transform:uppercase;margin-bottom:20px;
  max-width:640px;letter-spacing:-1px;}
.cover-rule{width:100%;height:2px;background:var(--text);margin-bottom:20px;}
.cover-subtitle{font-size:13pt;color:var(--muted);font-weight:300;line-height:1.5;max-width:560px;}
.cover-footer{padding:24px 60px;border-top:1px solid var(--border);
  display:flex;justify-content:space-between;align-items:center;}
.cover-footer-brand{font-family:'Oswald',sans-serif;font-size:9pt;
  color:var(--text);letter-spacing:2px;font-weight:500;}
.cover-cats{font-size:8pt;color:var(--muted);letter-spacing:2px;}

/* TOC */
.toc{padding:72px 80px;page-break-after:always;min-height:100vh;}
.toc-tag{font-family:'Oswald',sans-serif;font-size:8pt;letter-spacing:4px;
  color:var(--p);text-transform:uppercase;margin-bottom:8px;font-weight:500;}
.toc-heading{font-family:'Oswald',sans-serif;font-size:28pt;font-weight:700;
  color:var(--text);text-transform:uppercase;margin-bottom:4px;letter-spacing:-0.5px;}
.toc-rule{height:2px;background:var(--text);margin-bottom:40px;}
.toc-item{display:flex;align-items:flex-start;gap:16px;padding:11px 0;
  border-bottom:1px solid var(--border);}
.toc-num{font-family:'Oswald',sans-serif;font-size:11pt;font-weight:700;
  color:var(--p);min-width:26px;}
.toc-text{display:flex;flex-direction:column;gap:1px;flex:1;}
.toc-title{font-family:'Oswald',sans-serif;font-size:12pt;font-weight:600;
  color:var(--text);text-transform:uppercase;letter-spacing:.5px;}
.toc-sub{font-size:9.5pt;color:var(--muted);font-weight:300;}

/* SECTIONS */
.page-break{page-break-before:always;}
.section{min-height:100vh;position:relative;}
.img-bleed{width:100%;overflow:hidden;max-height:240px;position:relative;}
.img-bleed img{width:100%;height:auto;display:block;}
.img-bleed::after{content:'';position:absolute;bottom:0;left:0;right:0;height:60%;
  background:linear-gradient(to top,rgba(var(--rp),.3),transparent);}
.img-float{float:right;width:42%;margin:0 0 18px 24px;overflow:hidden;border-radius:4px;
  border:1px solid var(--border);}
.img-float img{width:100%;height:auto;display:block;}
.section-inner{padding:40px 80px 64px;}
.page-folio{display:flex;justify-content:space-between;align-items:center;
  padding:10px 0 16px;border-bottom:2px solid var(--text);margin-bottom:28px;}
.folio-title{font-family:'Oswald',sans-serif;font-size:7.5pt;letter-spacing:3px;
  color:var(--muted);text-transform:uppercase;font-weight:500;}
.folio-num{font-family:'Oswald',sans-serif;font-size:10pt;font-weight:700;color:var(--p);}
.chapter-label{font-family:'Oswald',sans-serif;font-size:8pt;letter-spacing:4px;
  color:var(--p);text-transform:uppercase;font-weight:600;margin-bottom:8px;}
.section-title{font-family:'Oswald',sans-serif;font-size:28pt;font-weight:700;
  color:var(--text);line-height:1;text-transform:uppercase;letter-spacing:-0.5px;margin-bottom:10px;}
.title-rule{height:2px;background:var(--p);margin-bottom:14px;}
.section-dek{font-size:13pt;color:var(--muted);font-weight:300;line-height:1.5;
  margin-bottom:20px;}

/* 2-column content */
.two-col{column-count:2;column-gap:28px;column-rule:1px solid var(--border);}
.section-content p{margin-bottom:14px;color:var(--text);text-align:justify;hyphens:auto;}
.section-content>p:first-of-type::first-letter{float:left;font-family:'Oswald',sans-serif;
  font-size:3.6em;font-weight:700;line-height:.8;color:var(--p);
  margin:4px 5px 0 0;text-transform:uppercase;}
.section-content h3{font-family:'Oswald',sans-serif;font-size:12pt;font-weight:700;
  color:var(--text);text-transform:uppercase;letter-spacing:1px;
  margin:18px 0 9px;padding-top:6px;border-top:1px solid var(--border);}
.section-content h4{font-size:10.5pt;font-weight:600;color:var(--p);margin:14px 0 6px;}
.section-content ul,.section-content ol{margin:10px 0 14px;padding-left:18px;}
.section-content li{margin-bottom:6px;color:var(--text);}
.section-content li::marker{color:var(--p);}
.section-content strong{font-weight:600;}
.section-content em{color:var(--muted);font-style:italic;}
.section-content code{background:#f4f1ea;border-radius:3px;
  padding:1px 5px;font-family:'Courier New',monospace;font-size:9.5pt;}
.section-content .pull-quote{font-family:'Oswald',sans-serif;font-size:14pt;font-weight:600;
  color:var(--text);border-top:3px solid var(--p);border-bottom:1px solid var(--border);
  padding:14px 0;margin:18px 0;text-transform:uppercase;letter-spacing:.5px;
  column-span:all;}
.section-content blockquote{font-style:italic;color:var(--muted);
  border-left:3px solid var(--p);padding:10px 14px;margin:14px 0;}
.section-content .callout-tip{background:#f0fdf4;border-left:3px solid #22c55e;
  padding:11px 14px;margin:14px 0;border-radius:0 4px 4px 0;
  display:flex;gap:8px;font-size:10pt;column-span:all;}
.section-content .callout-warn{background:#fff7ed;border-left:3px solid #f97316;
  padding:11px 14px;margin:14px 0;border-radius:0 4px 4px 0;
  display:flex;gap:8px;font-size:10pt;column-span:all;}
.section-content .callout-stat{background:var(--soft);border-left:3px solid var(--p);
  padding:11px 14px;margin:14px 0;border-radius:0 4px 4px 0;
  display:flex;gap:8px;font-size:10pt;column-span:all;}
.ci{flex-shrink:0;}
.clearfix::after{content:'';display:table;clear:both;}
.wm-footer{font-size:7.5pt;color:#aaa;margin-top:32px;padding-top:10px;
  border-top:1px solid var(--border);letter-spacing:.5px;column-span:all;text-align:center;}
.back-matter{min-height:100vh;display:flex;flex-direction:column;}
.back-color-block{height:52px;background:var(--p);}
.back-body{flex:1;display:flex;flex-direction:column;align-items:center;
  justify-content:center;padding:80px;text-align:center;background:var(--soft);}
.back-logo{width:72px;height:72px;object-fit:contain;border-radius:8px;margin-bottom:20px;}
.back-name{font-family:'Oswald',sans-serif;font-size:22pt;font-weight:700;
  color:var(--text);text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;}
.back-url{font-size:11pt;color:var(--p);margin-bottom:14px;}
.back-footer{font-size:10.5pt;color:var(--muted);max-width:460px;line-height:1.6;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .section-inner{padding:32px 64px 52px;}}
</style>
</head>
<body>
<div class="cover">
  <div class="cover-top-bar">
    <span class="cover-edition">NÚM. ${totalSections} · ${new Date().getFullYear()}</span>
    <span class="cover-brand-top">${nombreNegocio.toUpperCase()}</span>
  </div>
  <div class="cover-body">
    <h1 class="cover-title">${outline.bookTitle}</h1>
    <div class="cover-rule"></div>
    <p class="cover-subtitle">${outline.bookSubtitle}</p>
  </div>
  <div class="cover-footer">
    <span class="cover-footer-brand">${nombreNegocio.toUpperCase()}</span>
    <span class="cover-cats">ESTRATEGIA · DISEÑO · ACCIÓN</span>
  </div>
  ${opts.marcaDeAgua ? `<div style="position:absolute;bottom:80px;right:80px;font-size:7.5pt;color:#aaa;letter-spacing:1px;">Creado con FoxPDF · foxpdf.cloud</div>` : ""}
</div>
<div class="toc">
  <div class="toc-tag">Índice de contenidos</div>
  <h2 class="toc-heading">Contenido</h2>
  <div class="toc-rule"></div>
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
