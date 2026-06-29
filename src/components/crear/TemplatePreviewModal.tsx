"use client";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { TemplateName } from "@/lib/pdf/templates/index";

const TEMPLATES_ORDER: TemplateName[] = ["clasica", "minimalista", "editorial", "tecnico", "negocios"];

const TEMPLATE_META: Record<TemplateName, { label: string; desc: string; tag: string; tagColor: string }> = {
  clasica:     { label: "Clásica",     desc: "Portada con degradado de marca, imágenes con sombra y bordes redondeados. Versátil para cualquier tema.",         tag: "Versátil", tagColor: "#6366f1" },
  minimalista: { label: "Minimalista", desc: "Fondo blanco, borde izquierdo de acento, drop cap en primer párrafo. Elegante y limpio.",                          tag: "Clean",    tagColor: "#10b981" },
  editorial:   { label: "Editorial",   desc: "Portada oscura con monograma, imágenes flotadas estilo revista, número de capítulo decorativo.",                    tag: "Premium",  tagColor: "#f59e0b" },
  tecnico:     { label: "Técnico",     desc: "Dark navy, sidebar de navegación, fuente monoespaciada. Ideal para documentación, guías y manuales.",              tag: "Premium",  tagColor: "#f59e0b" },
  negocios:    { label: "Negocios",    desc: "Header corporativo por página, barra de stats en portada, estilo ejecutivo. Para reportes y propuestas formales.", tag: "Premium",  tagColor: "#f59e0b" },
};

/* ─── Thumbnails CSS ─────────────────────────────────────────── */

const P = "#6366f1";
const S = "#8b5cf6";
const A = "#f59e0b";

function Lines({ widths, color = "#e2e8f0", height = 3, gap = 4 }: { widths: number[]; color?: string; height?: number; gap?: number }) {
  return (
    <>
      {widths.map((w, i) => (
        <div key={i} style={{ height, background: color, borderRadius: 2, marginBottom: gap, width: `${w}%` }} />
      ))}
    </>
  );
}

function CoverClasica() {
  return (
    <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${P} 0%, ${S} 100%)`, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", padding: "18px 20px" }}>
      <div style={{ position: "absolute", top: -50, right: -50, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
      <div style={{ position: "absolute", bottom: -25, right: 20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,.09)" }} />
      <div style={{ color: "rgba(255,255,255,.65)", fontSize: 5, fontWeight: 600, letterSpacing: 2, marginBottom: 10 }}>FOXPDF</div>
      <div style={{ background: "rgba(255,255,255,.18)", color: "white", fontSize: 5, padding: "2px 7px", borderRadius: 10, display: "inline-block", marginBottom: 10, letterSpacing: 2 }}>GUÍA 2026</div>
      <div style={{ color: "white", fontSize: 14, fontWeight: 800, lineHeight: 1.2, fontFamily: "Georgia,serif", marginBottom: 8 }}>Título del<br />Documento</div>
      <div style={{ width: 22, height: 2, background: A, borderRadius: 1, marginBottom: 8 }} />
      <div style={{ color: "rgba(255,255,255,.6)", fontSize: 6, lineHeight: 1.5 }}>Subtítulo descriptivo del<br />contenido aquí</div>
    </div>
  );
}

function ContentClasica() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", padding: "14px 16px" }}>
      <div style={{ color: P, fontSize: 5, fontWeight: 700, letterSpacing: 2, marginBottom: 5, textTransform: "uppercase" }}>FOXPDF · CAP. 01</div>
      <div style={{ color: "#1a1a2e", fontSize: 11, fontWeight: 800, fontFamily: "Georgia,serif", marginBottom: 3 }}>Nombre del Capítulo</div>
      <div style={{ color: "#64748b", fontSize: 6, marginBottom: 8 }}>Subtítulo descriptivo</div>
      <div style={{ width: "100%", height: 38, borderRadius: 6, marginBottom: 10, background: `linear-gradient(135deg,${P}22,${S}22)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${P}18` }}>
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${P}40` }} />
      </div>
      <Lines widths={[100, 94, 87, 100, 91, 82, 100, 93, 76, 100]} />
    </div>
  );
}

function CoverMinimalista() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", borderLeft: `4px solid ${P}`, display: "flex", flexDirection: "column", justifyContent: "center", padding: "18px 16px", position: "relative" }}>
      <div style={{ color: "#94a3b8", fontSize: 5, fontWeight: 700, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>FOXPDF · 2026</div>
      <div style={{ color: "#1e293b", fontSize: 14, fontWeight: 700, fontFamily: "Georgia,serif", lineHeight: 1.25, marginBottom: 10 }}>Título del<br />Documento</div>
      <div style={{ width: 20, height: 1, background: P, marginBottom: 10 }} />
      <div style={{ color: "#64748b", fontSize: 6, lineHeight: 1.6 }}>Subtítulo descriptivo del<br />contenido del documento</div>
      <div style={{ position: "absolute", bottom: 16, left: 16, color: "#cbd5e1", fontSize: 5 }}>foxpdf.cloud</div>
    </div>
  );
}

function ContentMinimalista() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", padding: "14px 16px", borderLeft: `3px solid ${P}22` }}>
      <div style={{ color: "#94a3b8", fontSize: 5, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>Capítulo 01</div>
      <div style={{ color: "#1e293b", fontSize: 11, fontWeight: 700, fontFamily: "Georgia,serif", marginBottom: 8 }}>Nombre del Capítulo</div>
      <div style={{ color: "#1e293b", fontSize: 8, fontWeight: 700, fontFamily: "Georgia,serif", float: "left", lineHeight: 1, marginRight: 2, marginTop: 1 }}>P</div>
      <Lines widths={[100, 93, 86, 100]} color="#334155" height={3} gap={3} />
      <div style={{ clear: "both" }} />
      <div style={{ width: "80%", height: 28, background: "#f8fafc", border: `1px solid #e2e8f0`, borderRadius: 4, margin: "8px 0 8px 10%" }} />
      <Lines widths={[100, 91, 84, 100, 95, 78]} height={3} gap={3} />
      <div style={{ borderLeft: `2px solid ${P}`, paddingLeft: 6, margin: "8px 0" }}>
        <Lines widths={[85, 75]} color="#64748b" height={3} gap={3} />
      </div>
      <Lines widths={[100, 90]} height={3} gap={3} />
    </div>
  );
}

function CoverEditorial() {
  return (
    <div style={{ width: "100%", height: "100%", background: `linear-gradient(160deg,#1e293b 0%,#0f172a 100%)`, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "16px 18px" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 90, fontWeight: 900, color: "rgba(255,255,255,.04)", fontFamily: "Georgia,serif", lineHeight: 1, userSelect: "none" }}>F</div>
      <div style={{ position: "absolute", top: 14, right: 14, width: 28, height: 28, border: `1px solid ${P}`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 14, height: 14, borderRadius: "50%", background: `${P}88` }} />
      </div>
      <div style={{ color: "#94a3b8", fontSize: 5, letterSpacing: 2, marginBottom: 8 }}>FOXPDF · EDICIÓN EJECUTIVA</div>
      <div style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 800, fontFamily: "Georgia,serif", lineHeight: 1.2, marginBottom: 6 }}>Título del<br />Documento</div>
      <div style={{ width: 18, height: 2, background: A, marginBottom: 6 }} />
      <div style={{ color: "#64748b", fontSize: 6 }}>Subtítulo del contenido aquí</div>
    </div>
  );
}

function ContentEditorial() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", padding: "12px 14px", position: "relative" }}>
      <div style={{ position: "absolute", top: 8, right: 10, fontSize: 28, fontWeight: 900, color: `${P}12`, fontFamily: "Georgia,serif", lineHeight: 1 }}>01</div>
      <div style={{ color: P, fontSize: 5, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>CAPÍTULO 01</div>
      <div style={{ color: "#1e293b", fontSize: 10, fontWeight: 800, fontFamily: "Georgia,serif", marginBottom: 6 }}>Nombre del Capítulo</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1 }}>
          <Lines widths={[100, 92, 85, 100, 90, 78]} height={3} gap={3} />
        </div>
        <div style={{ width: 44, height: 55, background: `linear-gradient(135deg,${P}22,${S}22)`, borderRadius: 3, flexShrink: 0 }} />
      </div>
      <Lines widths={[100, 94, 88, 100, 91, 83, 100, 92]} height={3} gap={3} />
    </div>
  );
}

function CoverTecnico() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#0f172a", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", padding: "18px 20px" }}>
      <div style={{ position: "absolute", top: 8, left: 8, color: `${P}88`, fontSize: 9, fontFamily: "monospace" }}>{"["}</div>
      <div style={{ position: "absolute", top: 8, right: 8, color: `${P}88`, fontSize: 9, fontFamily: "monospace" }}>{"]"}</div>
      <div style={{ position: "absolute", bottom: 8, left: 8, color: `${P}88`, fontSize: 9, fontFamily: "monospace" }}>{"["}</div>
      <div style={{ position: "absolute", bottom: 8, right: 8, color: `${P}88`, fontSize: 9, fontFamily: "monospace" }}>{"]"}</div>
      <div style={{ color: `${P}`, fontSize: 5, fontFamily: "monospace", marginBottom: 10, letterSpacing: 1 }}>// FOXPDF · DOC v1.0</div>
      <div style={{ width: 16, height: 1, background: P, marginBottom: 10 }} />
      <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 700, fontFamily: "monospace", lineHeight: 1.3, marginBottom: 8 }}>{">"} Título del<br />{"  "}Documento</div>
      <div style={{ color: "#475569", fontSize: 5, fontFamily: "monospace" }}>tipo: guía-técnica | caps: 8</div>
    </div>
  );
}

function ContentTecnico() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: 28, background: "#0f172a", padding: "12px 6px", display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
        {[true, false, false, false, false].map((active, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: active ? P : "#334155" }} />
            <div style={{ height: 2, flex: 1, background: active ? `${P}88` : "#1e293b", borderRadius: 1 }} />
          </div>
        ))}
      </div>
      {/* Content */}
      <div style={{ flex: 1, padding: "10px 12px" }}>
        <div style={{ color: P, fontSize: 5, fontFamily: "monospace", marginBottom: 5, letterSpacing: 1 }}>// CAP. 01</div>
        <div style={{ color: "#0f172a", fontSize: 9, fontWeight: 700, fontFamily: "monospace", marginBottom: 6 }}>Nombre del Capítulo</div>
        <div style={{ width: "100%", height: 30, background: "#0f172a", borderRadius: 3, marginBottom: 7, borderTop: `2px solid ${P}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 6px" }}>
            <div style={{ color: `${P}aa`, fontSize: 4, fontFamily: "monospace" }}>// FIGURA 1</div>
          </div>
        </div>
        <Lines widths={[100, 90, 82, 100, 94, 86, 100, 88]} color="#334155" height={2} gap={3} />
      </div>
    </div>
  );
}

function CoverNegocios() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#0f172a", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "16px 18px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ color: "#94a3b8", fontSize: 5, letterSpacing: 3, marginBottom: 10, textTransform: "uppercase", fontFamily: "sans-serif", fontWeight: 600 }}>Reporte Ejecutivo · 2026</div>
        <div style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 900, lineHeight: 1.2, marginBottom: 6, fontFamily: "sans-serif" }}>Título del<br />Documento</div>
        <div style={{ width: 18, height: 2, background: A, borderRadius: 1, marginBottom: 6 }} />
        <div style={{ color: "#64748b", fontSize: 6 }}>Subtítulo descriptivo aquí</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: "rgba(255,255,255,.08)" }} />
          <div style={{ color: "#475569", fontSize: 5.5, fontWeight: 600 }}>FoxPDF</div>
        </div>
      </div>
      <div style={{ background: "#1e293b", padding: "8px 18px", display: "flex", justifyContent: "space-around" }}>
        {[["8","CAPS"], ["100%","ACCIÓN"], ["2026","EDICIÓN"]].map(([n, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ color: A, fontSize: 8, fontWeight: 900 }}>{n}</div>
            <div style={{ color: "#475569", fontSize: 4.5, letterSpacing: 1 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 2, background: `linear-gradient(90deg,${A},${P},${S})` }} />
    </div>
  );
}

function ContentNegocios() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "#0f172a", padding: "5px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,.1)" }} />
          <div style={{ color: "#94a3b8", fontSize: 5, fontWeight: 700 }}>FoxPDF</div>
        </div>
        <div style={{ color: "#475569", fontSize: 4.5, letterSpacing: 1 }}>CAP. 01 / 08</div>
      </div>
      <div style={{ height: 2, background: `linear-gradient(90deg,${A},${P})`, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: "10px 14px" }}>
        <div style={{ color: "#0f172a", fontSize: 9, fontWeight: 900, fontFamily: "sans-serif", marginBottom: 4 }}>Nombre del Capítulo</div>
        <div style={{ color: "#64748b", fontSize: 6, marginBottom: 8 }}>Subtítulo del capítulo</div>
        <div style={{ width: "100%", height: 30, borderRadius: 4, background: `linear-gradient(135deg,${P}18,${S}18)`, marginBottom: 8, position: "relative" }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${A},${P})` }} />
        </div>
        <Lines widths={[100, 93, 85, 100, 91, 82, 100, 94, 77]} height={3} gap={3} />
      </div>
    </div>
  );
}

const COVER_MAP: Record<TemplateName, () => JSX.Element> = {
  clasica:     CoverClasica,
  minimalista: CoverMinimalista,
  editorial:   CoverEditorial,
  tecnico:     CoverTecnico,
  negocios:    CoverNegocios,
};

const CONTENT_MAP: Record<TemplateName, () => JSX.Element> = {
  clasica:     ContentClasica,
  minimalista: ContentMinimalista,
  editorial:   ContentEditorial,
  tecnico:     ContentTecnico,
  negocios:    ContentNegocios,
};

/* ─── Modal ──────────────────────────────────────────────────── */

interface Props {
  template: TemplateName;
  onClose: () => void;
  onSelect: (t: TemplateName) => void;
  selected: TemplateName;
}

const PAGE_W = 180;
const PAGE_H = Math.round(PAGE_W * 1.414);

export default function TemplatePreviewModal({ template, onClose, onSelect, selected }: Props) {
  const idx = TEMPLATES_ORDER.indexOf(template);
  const prev = TEMPLATES_ORDER[idx - 1] ?? null;
  const next = TEMPLATES_ORDER[idx + 1] ?? null;
  const meta = TEMPLATE_META[template];
  const Cover   = COVER_MAP[template];
  const Content = CONTENT_MAP[template];
  const isSelected = selected === template;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.75)" }}
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-lg">{meta.label}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: `${meta.tagColor}22`, color: meta.tagColor }}>
              {meta.tag}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pages preview */}
        <div className="flex items-center justify-center gap-8 px-6 py-6">
          {/* Nav prev */}
          <button
            onClick={() => prev && onSelect(prev)}
            disabled={!prev}
            className="p-2 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Pages */}
          <div className="flex gap-3">
            {/* Portada */}
            <div>
              <p className="text-xs text-gray-500 text-center mb-2">Portada</p>
              <div style={{ width: PAGE_W, height: PAGE_H, borderRadius: 6, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.08)" }}>
                <Cover />
              </div>
            </div>
            {/* Contenido */}
            <div>
              <p className="text-xs text-gray-500 text-center mb-2">Contenido</p>
              <div style={{ width: PAGE_W, height: PAGE_H, borderRadius: 6, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.08)" }}>
                <Content />
              </div>
            </div>
          </div>

          {/* Nav next */}
          <button
            onClick={() => next && onSelect(next)}
            disabled={!next}
            className="p-2 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Indicadores */}
        <div className="flex justify-center gap-1.5 pb-2">
          {TEMPLATES_ORDER.map((t) => (
            <button key={t} onClick={() => onSelect(t)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${t === template ? "bg-indigo-400" : "bg-gray-700 hover:bg-gray-600"}`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between gap-3">
          <p className="text-gray-400 text-sm flex-1">{meta.desc}</p>
          <button
            onClick={() => { onSelect(template); onClose(); }}
            className={`flex-shrink-0 px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isSelected
                ? "bg-indigo-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
          >
            {isSelected ? "✓ Seleccionada" : "Usar esta plantilla"}
          </button>
        </div>
      </div>
    </div>
  );
}
