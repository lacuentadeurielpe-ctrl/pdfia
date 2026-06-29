import type { Outline, Section } from "@/lib/orchestrator/parser";
import type { BrandConfig, RenderOptions } from "./types";
import { hexToRgb, mdToHtml, shouldShowImage } from "./shared";

export function buildLujo(
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
        <span class="toc-sep">—</span>
        <span class="toc-title">${s.title}</span>
      </div>`)
    .join("");

  const sectionsHtml = sections.map((s, i) => {
    const content = mdToHtml(s.content);
    const showImg = shouldShowImage(opts.modoImagenes, i, s.imageUrl);
    const imgBlock = showImg
      ? `<div class="section-image">
          <img src="${s.imageUrl}" alt="${s.title}" loading="eager" />
          <div class="img-caption">${s.title}</div>
         </div>`
      : "";
    return `
    <div class="section page-break">
      <div class="page-folio">
        <span class="folio-left">${outline.bookTitle}</span>
        <span class="folio-num">· ${String(i + 2).padStart(2, "0")} ·</span>
        <span class="folio-right">${nombreNegocio}</span>
      </div>
      <div class="section-inner">
        <div class="chapter-label">Capítulo ${String(i + 1).padStart(2, "0")}</div>
        <div class="chapter-orn">❦</div>
        <h2 class="section-title">${s.title}</h2>
        <div class="title-rule"></div>
        ${s.subtitle ? `<p class="section-subtitle">${s.subtitle}</p>` : ""}
        ${imgBlock}
        <div class="section-content">${content}</div>
        ${opts.marcaDeAgua ? `<div class="wm-footer">Creado con FoxPDF · foxpdf.cloud</div>` : ""}
      </div>
    </div>`;
  }).join("\n");

  const backMatter = urlNegocio || footerTexto ? `
  <div class="page-break back-matter">
    <div class="back-frame">
      ${logoUrl ? `<img class="back-logo" src="${logoUrl}" alt="${nombreNegocio}" />` : ""}
      <div class="back-orn">❦</div>
      <h3 class="back-name">${nombreNegocio}</h3>
      <div class="back-rule"></div>
      ${urlNegocio ? `<p class="back-url">${urlNegocio}</p>` : ""}
      ${footerTexto ? `<p class="back-footer">${footerTexto}</p>` : ""}
    </div>
  </div>` : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Source+Sans+3:wght@300;400;500&display=swap');
@page{margin:0;size:A4;}
:root{
  --p:${colorPrimario};--s:${colorSecundario};--a:${colorAcento};--rp:${rgb};
  --text:#1a1a1a;--muted:#7a6a4a;--bg:#f7f4ee;--soft:#eee9dc;--border:#c8bc9a;--gold:#b8924f;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{font-family:'Source Sans 3',sans-serif;color:var(--text);background:var(--bg);
  font-size:11pt;line-height:1.82;}

/* COVER — marco fino, centrado, lujo */
.cover{width:100%;height:100vh;background:var(--bg);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  page-break-after:always;position:relative;}
.cover-frame{position:absolute;inset:20px;border:1px solid var(--gold);}
.cover-frame-inner{position:absolute;inset:26px;border:0.5px solid var(--border);}
.cover-content{text-align:center;padding:0 80px;position:relative;z-index:1;}
.cover-top-label{font-size:7.5pt;letter-spacing:6px;color:var(--gold);
  text-transform:uppercase;margin-bottom:40px;font-weight:500;}
.cover-title{font-family:'Cormorant Garamond',serif;font-size:38pt;font-weight:600;
  color:var(--text);line-height:1.1;margin-bottom:20px;letter-spacing:.5px;}
.cover-rule{width:48px;height:1px;background:var(--gold);margin:0 auto 20px;}
.cover-subtitle{font-family:'Cormorant Garamond',serif;font-size:14pt;font-style:italic;
  color:var(--muted);line-height:1.6;margin-bottom:0;}
.cover-bottom{position:absolute;bottom:52px;left:0;right:0;text-align:center;z-index:1;}
.cover-brand-name{font-size:8pt;letter-spacing:4px;color:var(--muted);text-transform:uppercase;}
.wm-cover{position:absolute;bottom:24px;right:60px;font-size:7pt;color:var(--border);letter-spacing:1px;}

/* TOC */
.toc{min-height:100vh;page-break-after:always;display:flex;flex-direction:column;
  align-items:center;justify-content:center;padding:80px 100px;}
.toc-orn{text-align:center;font-size:18pt;color:var(--gold);margin-bottom:16px;}
.toc-heading{font-family:'Cormorant Garamond',serif;font-size:24pt;font-weight:600;
  text-align:center;color:var(--text);margin-bottom:6px;letter-spacing:1px;}
.toc-rule{width:48px;height:1px;background:var(--gold);margin:12px auto 40px;}
.toc-item{display:flex;align-items:baseline;gap:10px;padding:10px 0;
  border-bottom:1px solid var(--soft);}
.toc-num{font-family:'Cormorant Garamond',serif;font-size:10pt;color:var(--gold);
  font-style:italic;min-width:20px;}
.toc-sep{color:var(--border);font-size:9pt;}
.toc-title{font-family:'Cormorant Garamond',serif;font-size:12pt;color:var(--text);flex:1;}

/* SECTIONS */
.page-break{page-break-before:always;}
.section{min-height:100vh;}
.page-folio{display:flex;justify-content:space-between;align-items:center;
  padding:14px 80px;border-bottom:1px solid var(--border);
  font-size:8pt;color:var(--muted);}
.folio-left,.folio-right{font-style:italic;letter-spacing:.5px;}
.folio-num{font-family:'Cormorant Garamond',serif;font-size:10pt;color:var(--gold);
  letter-spacing:1px;}
.section-inner{padding:52px 100px 80px;}
.chapter-label{font-size:8pt;letter-spacing:4px;color:var(--gold);
  text-transform:uppercase;text-align:center;margin-bottom:12px;font-weight:500;}
.chapter-orn{text-align:center;font-size:16pt;color:var(--gold);margin-bottom:16px;
  line-height:1;}
.section-title{font-family:'Cormorant Garamond',serif;font-size:26pt;font-weight:600;
  color:var(--text);line-height:1.12;text-align:center;margin-bottom:10px;letter-spacing:.5px;}
.title-rule{width:40px;height:1px;background:var(--gold);margin:0 auto 20px;}
.section-subtitle{font-family:'Cormorant Garamond',serif;font-size:13pt;font-style:italic;
  color:var(--muted);text-align:center;line-height:1.55;margin-bottom:36px;}

/* Imagen lujo: centrada, pequeña, elegante */
.section-image{width:65%;margin:8px auto 36px;overflow:hidden;position:relative;
  border:1px solid var(--border);}
.section-image img{width:100%;height:auto;display:block;}
.img-caption{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:9pt;
  color:var(--muted);text-align:center;padding:6px 12px;border-top:1px solid var(--soft);}

/* CONTENT */
.section-content{font-size:11pt;line-height:1.82;}
.section-content p{margin-bottom:20px;color:var(--text);text-align:justify;hyphens:auto;}
.section-content>p:first-of-type::first-letter{float:left;
  font-family:'Cormorant Garamond',serif;font-size:4em;font-weight:600;
  line-height:.76;color:var(--p);margin:6px 6px 0 0;}
.section-content h3{font-family:'Cormorant Garamond',serif;font-size:15pt;font-weight:600;
  color:var(--text);text-align:center;margin:36px 0 6px;letter-spacing:.5px;}
.section-content h3::before,.section-content h3::after{content:'· ';color:var(--gold);}
.section-content h4{font-size:11.5pt;font-weight:600;color:var(--muted);
  margin:22px 0 10px;font-style:italic;}
.section-content ul,.section-content ol{margin:14px 0 20px;padding-left:24px;}
.section-content li{margin-bottom:10px;color:var(--text);}
.section-content li::marker{color:var(--gold);}
.section-content strong{font-weight:600;}
.section-content em{color:var(--muted);font-style:italic;}
.section-content code{background:var(--soft);border-radius:3px;
  padding:2px 6px;font-family:'Courier New',monospace;font-size:9.5pt;}
.section-content .pull-quote{font-family:'Cormorant Garamond',serif;font-size:15pt;
  font-style:italic;color:var(--muted);text-align:center;
  padding:24px 48px;margin:28px 0;border-top:1px solid var(--border);
  border-bottom:1px solid var(--border);line-height:1.6;}
.section-content blockquote{font-style:italic;color:var(--muted);
  border-left:2px solid var(--gold);padding:12px 20px;margin:20px 0;}
.section-content .callout-tip{background:rgba(255,255,255,.7);border-left:2px solid var(--a);
  padding:14px 20px;margin:20px 0;border-radius:0 4px 4px 0;
  display:flex;gap:10px;font-size:10.5pt;}
.section-content .callout-warn{background:rgba(255,255,255,.7);border-left:2px solid #f97316;
  padding:14px 20px;margin:20px 0;border-radius:0 4px 4px 0;
  display:flex;gap:10px;font-size:10.5pt;}
.section-content .callout-stat{background:var(--soft);border-left:2px solid var(--p);
  padding:14px 20px;margin:20px 0;border-radius:0 4px 4px 0;
  display:flex;gap:10px;font-size:10.5pt;}
.ci{flex-shrink:0;}
.wm-footer{text-align:center;font-size:7.5pt;color:var(--border);margin-top:40px;
  padding-top:12px;border-top:1px solid var(--soft);letter-spacing:.5px;}
.back-matter{min-height:100vh;background:var(--bg);display:flex;
  align-items:center;justify-content:center;}
.back-frame{text-align:center;padding:60px 80px;border:1px solid var(--gold);
  margin:40px;width:100%;}
.back-logo{width:72px;height:72px;object-fit:contain;border-radius:50%;
  border:1px solid var(--gold);padding:6px;margin-bottom:20px;}
.back-orn{font-size:16pt;color:var(--gold);margin-bottom:16px;}
.back-name{font-family:'Cormorant Garamond',serif;font-size:22pt;font-weight:600;
  color:var(--text);margin-bottom:12px;}
.back-rule{width:40px;height:1px;background:var(--gold);margin:12px auto;}
.back-url{font-size:11pt;color:var(--gold);margin-bottom:14px;}
.back-footer{font-size:10.5pt;color:var(--muted);line-height:1.65;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .section-inner{padding:40px 80px 64px;}}
</style>
</head>
<body>
<div class="cover">
  <div class="cover-frame"></div>
  <div class="cover-frame-inner"></div>
  <div class="cover-content">
    <div class="cover-top-label">${nombreNegocio}</div>
    <h1 class="cover-title">${outline.bookTitle}</h1>
    <div class="cover-rule"></div>
    <p class="cover-subtitle">${outline.bookSubtitle}</p>
  </div>
  <div class="cover-bottom">
    <span class="cover-brand-name">MMXXVI · ${new Date().getFullYear()}</span>
  </div>
  ${opts.marcaDeAgua ? `<div class="wm-cover">Creado con FoxPDF · foxpdf.cloud</div>` : ""}
</div>
<div class="toc">
  <div class="toc-orn">❦</div>
  <h2 class="toc-heading">Índice</h2>
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
