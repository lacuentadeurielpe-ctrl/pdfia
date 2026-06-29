import type { Outline, Section } from "@/lib/orchestrator/parser";
import type { BrandConfig, RenderOptions } from "./types";
import { hexToRgb, mdToHtml, shouldShowImage } from "./shared";

export function buildEditorial(
  outline: Outline,
  sections: Section[],
  brand: BrandConfig,
  opts: RenderOptions
): string {
  const { colorPrimario, colorSecundario, colorAcento, nombreNegocio, logoUrl, urlNegocio, footerTexto } = brand;
  const rgb = hexToRgb(colorPrimario);
  const monogram = nombreNegocio.charAt(0).toUpperCase();

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
    const isEven = i % 2 === 0;

    // Imágenes en par (even): flotan a la derecha con texto alrededor
    // Imágenes en impar (odd): full-bleed antes del header, efecto cinematográfico
    let imgFloatRight = "";
    let imgBleedBefore = "";
    if (showImg) {
      if (isEven) {
        imgFloatRight = `
          <div class="img-float-right">
            <img src="${s.imageUrl}" alt="${s.title}" loading="eager" />
          </div>`;
      } else {
        imgBleedBefore = `
          <div class="img-bleed">
            <img src="${s.imageUrl}" alt="${s.title}" loading="eager" />
          </div>`;
      }
    }

    return `
    <div class="section page-break">
      ${imgBleedBefore}
      <div class="section-inner">
        <div class="dec-num">${String(i + 1).padStart(2, "0")}</div>
        <div class="eyebrow">Capítulo ${String(i + 1).padStart(2, "0")}</div>
        <div class="accent-bar"></div>
        <h2 class="section-title">${s.title}</h2>
        ${s.subtitle ? `<p class="section-subtitle">${s.subtitle}</p>` : ""}
        ${imgFloatRight}
        <div class="section-content"><p>${content}</p></div>
        <div class="clearfix"></div>
        ${opts.marcaDeAgua ? `<div class="wm-footer">Creado con FoxPDF · foxpdf.cloud</div>` : ""}
      </div>
    </div>`;
  }).join("\n");

  const backMatter = urlNegocio || footerTexto ? `
  <div class="page-break back-matter">
    ${logoUrl ? `<img class="back-logo" src="${logoUrl}" alt="${nombreNegocio}" />` : ""}
    <h3 class="back-name">${nombreNegocio}</h3>
    ${urlNegocio ? `<p class="back-url">${urlNegocio}</p>` : ""}
    ${footerTexto ? `<p class="back-footer">${footerTexto}</p>` : ""}
    <div class="back-accent-bar"></div>
  </div>` : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
@page{margin:0;size:A4;}
:root{
  --p:${colorPrimario};--s:${colorSecundario};--a:${colorAcento};--rp:${rgb};
  --text:#1e1b4b;--muted:#64748b;--bg:#fff;--soft:#fafaf9;--border:#e2e8f0;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{font-family:'Source Sans 3',sans-serif;color:var(--text);background:var(--bg);
  font-size:11.5pt;line-height:1.78;}

/* COVER — oscuro, monograma grande decorativo, barra degradada inferior */
.cover{width:100%;height:100vh;background:linear-gradient(160deg,var(--p) 0%,var(--s) 100%);
  display:flex;flex-direction:column;justify-content:flex-end;
  padding:80px;position:relative;overflow:hidden;page-break-after:always;}
.cover-monogram{position:absolute;top:-5%;right:-3%;font-size:280px;font-weight:800;
  color:rgba(255,255,255,.04);line-height:1;font-family:'Playfair Display',serif;
  letter-spacing:-8px;user-select:none;}
.cover-eyebrow{font-size:7.5pt;color:rgba(255,255,255,.6);letter-spacing:4px;
  text-transform:uppercase;margin-bottom:20px;font-weight:600;}
.cover-title{font-family:'Playfair Display',serif;font-size:38pt;font-weight:800;
  color:white;line-height:1.12;margin-bottom:20px;max-width:680px;}
.cover-accent-bar{width:56px;height:4px;background:var(--a);
  border-radius:2px;margin:20px 0;}
.cover-subtitle{font-size:14pt;color:rgba(255,255,255,.65);
  line-height:1.55;max-width:600px;font-weight:300;}
.cover-brand{display:flex;align-items:center;gap:10px;margin-top:48px;}
.cover-brand img{width:36px;height:36px;object-fit:contain;border-radius:6px;
  background:rgba(255,255,255,.15);padding:3px;}
.cover-brand-name{color:rgba(255,255,255,.7);font-size:11pt;font-weight:500;}
.cover-footer-bar{position:absolute;bottom:0;left:0;right:0;height:5px;
  background:linear-gradient(90deg,var(--a),var(--s),var(--p));}
.wm-cover{position:absolute;bottom:18px;right:80px;color:rgba(255,255,255,.45);
  font-size:7.5pt;letter-spacing:1px;z-index:2;}

/* TOC — 2 columnas con subtítulo */
.toc{padding:80px 90px;page-break-after:always;min-height:100vh;}
.toc-eyebrow{font-size:7.5pt;font-weight:700;letter-spacing:4px;text-transform:uppercase;
  color:var(--p);margin-bottom:12px;}
.toc-heading{font-family:'Playfair Display',serif;font-size:26pt;font-weight:800;
  color:var(--text);margin-bottom:48px;}
.toc-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 40px;}
.toc-item{display:flex;align-items:flex-start;gap:14px;padding:12px 0;
  border-bottom:1px solid var(--border);}
.toc-num{font-size:9pt;font-weight:800;color:var(--p);opacity:.45;min-width:24px;
  padding-top:2px;font-family:'Playfair Display',serif;}
.toc-text{display:flex;flex-direction:column;gap:2px;}
.toc-title{font-size:11.5pt;font-weight:600;color:var(--text);}
.toc-sub{font-size:9.5pt;color:var(--muted);font-weight:400;}

/* SECTIONS */
.page-break{page-break-before:always;}
.section{min-height:100vh;position:relative;}
.section-inner{padding:80px 90px;position:relative;}

/* Número decorativo de capítulo — watermark detrás del título */
.dec-num{position:absolute;top:40px;right:60px;font-family:'Playfair Display',serif;
  font-size:120pt;font-weight:800;color:rgba(var(--rp),.06);
  line-height:1;user-select:none;z-index:0;}
.eyebrow{font-size:7.5pt;font-weight:700;letter-spacing:4px;text-transform:uppercase;
  color:var(--p);margin-bottom:10px;position:relative;z-index:1;}
.accent-bar{width:40px;height:3px;background:var(--a);border-radius:2px;margin-bottom:16px;position:relative;z-index:1;}
.section-title{font-family:'Playfair Display',serif;font-size:28pt;font-weight:800;
  color:var(--text);line-height:1.15;margin-bottom:12px;position:relative;z-index:1;}
.section-subtitle{font-size:13pt;color:var(--muted);font-weight:400;line-height:1.5;
  margin-bottom:24px;max-width:85%;position:relative;z-index:1;}

/* Imagen par (even): flota a la derecha, texto la rodea — efecto magazine */
.img-float-right{float:right;width:44%;margin:0 0 20px 28px;border-radius:10px;overflow:hidden;
  border:1px solid rgba(0,0,0,.1);
  box-shadow:0 10px 40px rgba(0,0,0,.18),0 2px 8px rgba(0,0,0,.08);
  shape-outside:border-box;position:relative;z-index:1;}
.img-float-right img{width:100%;height:auto;display:block;}
.clearfix::after{content:'';display:table;clear:both;}

/* Imagen impar (odd): full-bleed antes del header, cinematográfica — imagen 16:9 completa, sin recorte */
.img-bleed{width:100%;overflow:hidden;position:relative;margin-bottom:0;}
.img-bleed img{width:100%;height:auto;display:block;}
.img-bleed::after{content:'';position:absolute;bottom:0;left:0;right:0;height:55%;
  background:linear-gradient(to top,rgba(var(--rp),.45),transparent);pointer-events:none;}

/* CONTENT */
.section-content{font-size:11.5pt;line-height:1.78;position:relative;z-index:1;}
.section-content p{margin-bottom:18px;color:var(--text);text-align:justify;hyphens:auto;}
.section-content>p:first-of-type{font-size:13pt;line-height:1.7;font-weight:400;}
.section-content h3{font-family:'Playfair Display',serif;font-size:14pt;font-weight:700;
  color:var(--text);margin:32px 0 13px;}
.section-content h4{font-size:12pt;font-weight:600;color:var(--p);margin:22px 0 10px;}
.section-content ul,.section-content ol{margin:14px 0 20px 4px;padding-left:22px;}
.section-content li{margin-bottom:10px;color:var(--text);padding-left:4px;}
.section-content li::marker{color:var(--a);}
.section-content strong{font-weight:700;}
.section-content em{color:var(--muted);font-style:italic;}
.section-content code{background:#f5f3ff;border:1px solid #ede9fe;border-radius:4px;
  padding:2px 6px;font-family:'Courier New',monospace;font-size:10pt;color:var(--s);}
/* Pull quote — borde izquierdo con acento, fondo cálido */
.section-content .pull-quote{font-family:'Playfair Display',serif;font-size:14.5pt;font-style:italic;
  color:var(--text);border-left:4px solid var(--a);background:#fefce8;
  padding:20px 24px;margin:28px 0;border-radius:0 8px 8px 0;line-height:1.6;}
.section-content blockquote{font-style:italic;color:var(--muted);
  border-left:3px solid var(--border);padding:12px 20px;margin:20px 0;}
.section-content .callout-tip{background:rgba(var(--rp),.06);border-left:3px solid var(--a);
  padding:14px 18px;margin:20px 0;border-radius:0 8px 8px 0;display:flex;gap:10px;font-size:11pt;}
.section-content .callout-warn{background:#fff7ed;border-left:3px solid #f97316;
  padding:14px 18px;margin:20px 0;border-radius:0 8px 8px 0;display:flex;gap:10px;font-size:11pt;}
.section-content .callout-stat{background:var(--soft);border-left:3px solid var(--p);
  padding:14px 18px;margin:20px 0;border-radius:0 8px 8px 0;display:flex;gap:10px;font-size:11pt;}
.ci{flex-shrink:0;}
.wm-footer{text-align:center;font-size:7.5pt;color:var(--muted);opacity:.45;margin-top:40px;
  padding-top:12px;border-top:1px solid var(--border);letter-spacing:.5px;}
.back-matter{display:flex;flex-direction:column;align-items:center;justify-content:center;
  min-height:100vh;padding:80px;text-align:center;
  background:linear-gradient(160deg,var(--p) 0%,var(--s) 100%);position:relative;}
.back-logo{width:80px;height:80px;object-fit:contain;border-radius:12px;
  background:rgba(255,255,255,.15);padding:8px;margin-bottom:24px;}
.back-name{font-family:'Playfair Display',serif;font-size:24pt;font-weight:800;
  color:white;margin-bottom:12px;}
.back-url{font-size:12pt;color:rgba(255,255,255,.75);margin-bottom:16px;}
.back-footer{font-size:11pt;color:rgba(255,255,255,.6);max-width:500px;line-height:1.65;}
.back-accent-bar{position:absolute;bottom:0;left:0;right:0;height:5px;
  background:linear-gradient(90deg,var(--a),var(--s),var(--p));}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .section-inner{padding:60px 70px;}.dec-num{font-size:100pt;}}
</style>
</head>
<body>
<div class="cover">
  <div class="cover-monogram">${monogram}</div>
  <div class="cover-eyebrow">${nombreNegocio} · Edición ${new Date().getFullYear()}</div>
  <h1 class="cover-title">${outline.bookTitle}</h1>
  <div class="cover-accent-bar"></div>
  <p class="cover-subtitle">${outline.bookSubtitle}</p>
  <div class="cover-brand">
    ${logoUrl ? `<img src="${logoUrl}" alt="${nombreNegocio}" />` : ""}
    <span class="cover-brand-name">${nombreNegocio}</span>
  </div>
  <div class="cover-footer-bar"></div>
  ${opts.marcaDeAgua ? `<div class="wm-cover">Creado con FoxPDF · foxpdf.cloud</div>` : ""}
</div>
<div class="toc">
  <p class="toc-eyebrow">Contenido</p>
  <h2 class="toc-heading">Índice</h2>
  <div class="toc-grid">${tocItems}</div>
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
