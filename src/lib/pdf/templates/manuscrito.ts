import type { Outline, Section } from "@/lib/orchestrator/parser";
import type { BrandConfig, RenderOptions } from "./types";
import { hexToRgb, mdToHtml, shouldShowImage } from "./shared";

export function buildManuscrito(
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
        <div class="toc-num-row">
          <span class="toc-rom">${["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV"][i] ?? String(i+1)}</span>
          <span class="toc-sep">.</span>
        </div>
        <span class="toc-title">${s.title}</span>
      </div>`)
    .join("");

  const sectionsHtml = sections.map((s, i) => {
    const content = mdToHtml(s.content);
    const showImg = shouldShowImage(opts.modoImagenes, i, s.imageUrl);
    const imgBlock = showImg
      ? `<div class="section-image">
          <img src="${s.imageUrl}" alt="${s.title}" loading="eager" />
          <div class="img-caption">— ${s.title} —</div>
         </div>`
      : "";
    const isRight = i % 2 === 0;
    return `
    <div class="section page-break">
      <div class="page-folio">
        ${isRight
          ? `<span></span><span class="folio-num">· ${String(i + 2).padStart(2, "0")} ·</span><span class="folio-right">${outline.bookTitle}</span>`
          : `<span class="folio-left">${s.title}</span><span class="folio-num">· ${String(i + 2).padStart(2, "0")} ·</span><span></span>`
        }
      </div>
      <div class="section-inner">
        <div class="chapter-label">Capítulo ${["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV"][i] ?? String(i+1)}</div>
        <h2 class="section-title">${s.title}</h2>
        <div class="title-orn">❧</div>
        ${s.subtitle ? `<p class="section-subtitle">${s.subtitle}</p>` : ""}
        ${imgBlock}
        <div class="section-content">${content}</div>
        ${opts.marcaDeAgua ? `<div class="wm-footer">Creado con FoxPDF · foxpdf.cloud</div>` : ""}
      </div>
    </div>`;
  }).join("\n");

  const backMatter = urlNegocio || footerTexto ? `
  <div class="page-break back-matter">
    <div class="back-content">
      ${logoUrl ? `<img class="back-logo" src="${logoUrl}" alt="${nombreNegocio}" />` : ""}
      <div class="back-orn">❦ ❦ ❦</div>
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
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');
@page{margin:0;size:A4;}
:root{
  --p:${colorPrimario};--s:${colorSecundario};--a:${colorAcento};--rp:${rgb};
  --text:#2a2419;--muted:#6a5d45;--bg:#faf6ec;--soft:#f0e8d4;--border:#d8d0bd;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{font-family:'EB Garamond',serif;color:var(--text);background:var(--bg);
  font-size:12pt;line-height:1.85;}

/* COVER — clásico literario, centrado */
.cover{width:100%;height:100vh;background:var(--bg);display:flex;flex-direction:column;
  align-items:center;justify-content:center;page-break-after:always;position:relative;
  padding:80px 100px;}
.cover-top-orn{font-size:14pt;color:var(--muted);text-align:center;
  letter-spacing:8px;margin-bottom:48px;opacity:.6;}
.cover-label{font-size:8pt;letter-spacing:5px;color:var(--muted);
  text-transform:uppercase;text-align:center;margin-bottom:20px;}
.cover-title{font-size:36pt;font-weight:500;color:var(--text);
  line-height:1.08;text-align:center;margin-bottom:16px;}
.cover-rule{width:56px;height:1px;background:var(--border);margin:0 auto 16px;}
.cover-subtitle{font-size:14pt;font-style:italic;color:var(--muted);
  text-align:center;line-height:1.55;margin-bottom:0;}
.cover-bottom-orn{position:absolute;bottom:72px;left:0;right:0;
  text-align:center;font-size:11pt;color:var(--muted);letter-spacing:4px;}
.cover-brand{position:absolute;bottom:40px;left:0;right:0;
  text-align:center;font-size:8pt;color:var(--border);letter-spacing:3px;}
.wm-cover{position:absolute;bottom:20px;right:60px;font-size:7pt;color:var(--border);}

/* TOC */
.toc{min-height:100vh;page-break-after:always;padding:88px 104px;}
.toc-title-orn{text-align:center;font-size:12pt;color:var(--muted);
  letter-spacing:4px;margin-bottom:16px;}
.toc-heading{font-size:22pt;font-weight:500;text-align:center;color:var(--text);
  margin-bottom:8px;}
.toc-rule{width:40px;height:1px;background:var(--border);margin:12px auto 40px;}
.toc-item{display:flex;align-items:baseline;gap:12px;padding:10px 0;
  border-bottom:1px solid var(--soft);}
.toc-num-row{min-width:32px;}
.toc-rom{font-style:italic;color:var(--muted);font-size:10.5pt;}
.toc-sep{color:var(--border);}
.toc-title{font-size:12pt;color:var(--text);flex:1;}

/* SECTIONS */
.page-break{page-break-before:always;}
.section{min-height:100vh;}
.page-folio{display:flex;justify-content:space-between;align-items:center;
  padding:12px 80px;border-bottom:1px solid var(--border);font-size:8.5pt;
  color:var(--muted);font-style:italic;}
.folio-left,.folio-right{letter-spacing:.3px;}
.folio-num{font-style:normal;letter-spacing:2px;color:var(--muted);}
.section-inner{padding:52px 96px 80px;}
.chapter-label{font-size:9pt;letter-spacing:4px;color:var(--muted);
  text-transform:uppercase;text-align:center;margin-bottom:14px;font-style:normal;}
.section-title{font-size:24pt;font-weight:500;color:var(--text);
  line-height:1.1;text-align:center;margin-bottom:8px;}
.title-orn{text-align:center;font-size:12pt;color:var(--muted);
  margin-bottom:28px;letter-spacing:4px;}
.section-subtitle{font-size:12.5pt;font-style:italic;color:var(--muted);
  text-align:center;line-height:1.5;margin-bottom:32px;}

/* Imagen manuscrito: centrada, borde clásico */
.section-image{width:72%;margin:8px auto 36px;overflow:hidden;position:relative;
  border:1px solid var(--border);}
.section-image img{width:100%;height:auto;display:block;}
.img-caption{font-style:italic;font-size:9pt;color:var(--muted);
  text-align:center;padding:7px 12px;border-top:1px solid var(--soft);}

/* CONTENT — párrafos con sangría, sin espacio entre ellos (estilo libro) */
.section-content{font-size:12pt;line-height:1.85;}
.section-content p{color:var(--text);text-align:justify;hyphens:auto;
  text-indent:1.5em;margin-bottom:0;}
.section-content>p:first-of-type{text-indent:0;}
.section-content>p:first-of-type::first-letter{float:left;
  font-size:3.8em;font-weight:500;line-height:.78;color:var(--p);
  margin:6px 5px 0 0;}
.section-content h3{font-size:13.5pt;font-weight:600;color:var(--text);
  text-align:center;margin:32px 0 6px;letter-spacing:.5px;}
.section-content h3::before{content:'· ';color:var(--muted);}
.section-content h3::after{content:' ·';color:var(--muted);}
.section-content h4{font-size:12pt;font-weight:500;font-style:italic;
  color:var(--muted);text-align:center;margin:24px 0 12px;}
.section-content ul,.section-content ol{margin:16px 0 20px;padding-left:28px;
  text-indent:0;}
.section-content li{margin-bottom:8px;color:var(--text);}
.section-content li::marker{color:var(--p);}
.section-content strong{font-weight:600;}
.section-content em{font-style:italic;color:var(--muted);}
.section-content code{background:var(--soft);border-radius:3px;
  padding:1px 5px;font-family:'Courier New',monospace;font-size:10pt;}
.section-content .pull-quote{font-size:14pt;font-style:italic;color:var(--muted);
  text-align:center;padding:20px 48px;margin:28px 0;text-indent:0;
  border-top:1px solid var(--border);border-bottom:1px solid var(--border);}
.section-content blockquote{font-style:italic;color:var(--muted);
  border-left:2px solid var(--border);padding:10px 20px;margin:20px 0;
  text-indent:0;}
.section-content .callout-tip{background:var(--soft);border-left:2px solid var(--a);
  padding:13px 18px;margin:20px 0;display:flex;gap:10px;font-size:11pt;
  text-indent:0;}
.section-content .callout-warn{background:var(--soft);border-left:2px solid #c97310;
  padding:13px 18px;margin:20px 0;display:flex;gap:10px;font-size:11pt;
  text-indent:0;}
.section-content .callout-stat{background:var(--soft);border-left:2px solid var(--p);
  padding:13px 18px;margin:20px 0;display:flex;gap:10px;font-size:11pt;
  text-indent:0;}
.ci{flex-shrink:0;}
.wm-footer{font-size:7.5pt;color:var(--border);margin-top:40px;text-align:center;
  letter-spacing:.5px;}
.back-matter{min-height:100vh;background:var(--bg);display:flex;
  align-items:center;justify-content:center;}
.back-content{text-align:center;padding:80px;}
.back-logo{width:72px;height:72px;object-fit:contain;border-radius:50%;
  border:1px solid var(--border);margin-bottom:20px;}
.back-orn{font-size:11pt;color:var(--muted);letter-spacing:8px;margin-bottom:20px;}
.back-name{font-size:20pt;font-weight:500;color:var(--text);margin-bottom:10px;}
.back-rule{width:40px;height:1px;background:var(--border);margin:10px auto 16px;}
.back-url{font-size:10.5pt;font-style:italic;color:var(--p);margin-bottom:14px;}
.back-footer{font-size:10.5pt;color:var(--muted);max-width:460px;line-height:1.7;
  font-style:italic;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .section-inner{padding:40px 80px 64px;}}
</style>
</head>
<body>
<div class="cover">
  <div class="cover-top-orn">— ❦ —</div>
  <div class="cover-label">${nombreNegocio} presenta</div>
  <h1 class="cover-title">${outline.bookTitle}</h1>
  <div class="cover-rule"></div>
  <p class="cover-subtitle">${outline.bookSubtitle}</p>
  <div class="cover-bottom-orn">· · ·</div>
  <div class="cover-brand">${nombreNegocio} · ${new Date().getFullYear()}</div>
  ${opts.marcaDeAgua ? `<div class="wm-cover">Creado con FoxPDF · foxpdf.cloud</div>` : ""}
</div>
<div class="toc">
  <div class="toc-title-orn">· · ·</div>
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
