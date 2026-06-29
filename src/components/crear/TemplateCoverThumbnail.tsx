"use client";
import React from "react";
import type { TemplateName } from "@/lib/pdf/templates/index";

const P = "#6366f1";
const S = "#8b5cf6";
const A = "#f59e0b";

export function Lines({ widths, color = "#e2e8f0", height = 3, gap = 4 }: { widths: number[]; color?: string; height?: number; gap?: number }) {
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
    <div style={{ width:"100%", height:"100%", background:`linear-gradient(135deg,${P} 0%,${S} 100%)`, position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"center", padding:"18px 20px" }}>
      <div style={{ position:"absolute", top:-50, right:-50, width:130, height:130, borderRadius:"50%", background:"rgba(255,255,255,.06)" }} />
      <div style={{ position:"absolute", bottom:-25, right:20, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,.09)" }} />
      <div style={{ color:"rgba(255,255,255,.65)", fontSize:5, fontWeight:600, letterSpacing:2, marginBottom:10 }}>FOXPDF</div>
      <div style={{ background:"rgba(255,255,255,.18)", color:"white", fontSize:5, padding:"2px 7px", borderRadius:10, display:"inline-block", marginBottom:10, letterSpacing:2 }}>GUÍA 2026</div>
      <div style={{ color:"white", fontSize:14, fontWeight:800, lineHeight:1.2, fontFamily:"Georgia,serif", marginBottom:8 }}>Título del<br/>Documento</div>
      <div style={{ width:22, height:2, background:A, borderRadius:1, marginBottom:8 }} />
      <div style={{ color:"rgba(255,255,255,.6)", fontSize:6, lineHeight:1.5 }}>Subtítulo descriptivo del<br/>contenido aquí</div>
    </div>
  );
}

function CoverMinimalista() {
  return (
    <div style={{ width:"100%", height:"100%", background:"#fff", borderLeft:`4px solid ${P}`, display:"flex", flexDirection:"column", justifyContent:"center", padding:"18px 16px", position:"relative" }}>
      <div style={{ color:"#94a3b8", fontSize:5, fontWeight:600, letterSpacing:2, marginBottom:12, textTransform:"uppercase" }}>FOXPDF · 2026</div>
      <div style={{ color:"#1e293b", fontSize:14, fontWeight:700, fontFamily:"Georgia,serif", lineHeight:1.25, marginBottom:10 }}>Título del<br/>Documento</div>
      <div style={{ width:20, height:1, background:P, marginBottom:10 }} />
      <div style={{ color:"#64748b", fontSize:6, lineHeight:1.6 }}>Subtítulo descriptivo del<br/>contenido del documento</div>
      <div style={{ position:"absolute", bottom:16, left:16, color:"#cbd5e1", fontSize:5 }}>foxpdf.cloud</div>
    </div>
  );
}

function CoverEditorial() {
  return (
    <div style={{ width:"100%", height:"100%", background:`linear-gradient(160deg,#1e293b 0%,#0f172a 100%)`, position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"16px 18px" }}>
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", fontSize:90, fontWeight:900, color:"rgba(255,255,255,.04)", fontFamily:"Georgia,serif", lineHeight:1, userSelect:"none" }}>F</div>
      <div style={{ position:"absolute", top:14, right:14, width:28, height:28, border:`1px solid ${P}`, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:14, height:14, borderRadius:"50%", background:`${P}88` }} />
      </div>
      <div style={{ color:"#94a3b8", fontSize:5, letterSpacing:2, marginBottom:8 }}>FOXPDF · EDICIÓN EJECUTIVA</div>
      <div style={{ color:"#f1f5f9", fontSize:13, fontWeight:800, fontFamily:"Georgia,serif", lineHeight:1.2, marginBottom:6 }}>Título del<br/>Documento</div>
      <div style={{ width:18, height:2, background:A, marginBottom:6 }} />
      <div style={{ color:"#64748b", fontSize:6 }}>Subtítulo del contenido aquí</div>
    </div>
  );
}

function CoverTecnico() {
  return (
    <div style={{ width:"100%", height:"100%", background:"#0f172a", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"center", padding:"18px 20px" }}>
      <div style={{ position:"absolute", top:8, left:8, color:`${P}88`, fontSize:9, fontFamily:"monospace" }}>{"["}</div>
      <div style={{ position:"absolute", top:8, right:8, color:`${P}88`, fontSize:9, fontFamily:"monospace" }}>{"]"}</div>
      <div style={{ position:"absolute", bottom:8, left:8, color:`${P}88`, fontSize:9, fontFamily:"monospace" }}>{"["}</div>
      <div style={{ position:"absolute", bottom:8, right:8, color:`${P}88`, fontSize:9, fontFamily:"monospace" }}>{"]"}</div>
      <div style={{ color:P, fontSize:5, fontFamily:"monospace", marginBottom:10, letterSpacing:1 }}>// FOXPDF · DOC v1.0</div>
      <div style={{ width:16, height:1, background:P, marginBottom:10 }} />
      <div style={{ color:"#e2e8f0", fontSize:13, fontWeight:700, fontFamily:"monospace", lineHeight:1.3, marginBottom:8 }}>{">"} Título del<br/>{"  "}Documento</div>
      <div style={{ color:"#475569", fontSize:5, fontFamily:"monospace" }}>tipo: guía-técnica | caps: 8</div>
    </div>
  );
}

function CoverNegocios() {
  return (
    <div style={{ width:"100%", height:"100%", background:"#0f172a", display:"flex", flexDirection:"column" }}>
      <div style={{ flex:1, padding:"16px 18px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
        <div style={{ color:"#94a3b8", fontSize:5, letterSpacing:3, marginBottom:10, textTransform:"uppercase", fontFamily:"sans-serif", fontWeight:600 }}>Reporte Ejecutivo · 2026</div>
        <div style={{ color:"#f1f5f9", fontSize:13, fontWeight:900, lineHeight:1.2, marginBottom:6, fontFamily:"sans-serif" }}>Título del<br/>Documento</div>
        <div style={{ width:18, height:2, background:A, borderRadius:1, marginBottom:6 }} />
        <div style={{ color:"#64748b", fontSize:6 }}>Subtítulo descriptivo aquí</div>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:10 }}>
          <div style={{ width:14, height:14, borderRadius:3, background:"rgba(255,255,255,.08)" }} />
          <div style={{ color:"#475569", fontSize:5.5, fontWeight:600 }}>FoxPDF</div>
        </div>
      </div>
      <div style={{ background:"#1e293b", padding:"8px 18px", display:"flex", justifyContent:"space-around" }}>
        {[["8","CAPS"],["100%","ACCIÓN"],["2026","ED."]].map(([n,l]) => (
          <div key={l} style={{ textAlign:"center" }}>
            <div style={{ color:A, fontSize:8, fontWeight:900 }}>{n}</div>
            <div style={{ color:"#475569", fontSize:4.5, letterSpacing:1 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ height:2, background:`linear-gradient(90deg,${A},${P},${S})` }} />
    </div>
  );
}

function CoverRevista() {
  return (
    <div style={{ width:"100%", height:"100%", background:"#f4f1ea", fontFamily:"sans-serif", display:"flex", flexDirection:"column" }}>
      <div style={{ height:38, background:P, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px" }}>
        <span style={{ color:"rgba(255,255,255,.8)", fontSize:6, letterSpacing:3, fontWeight:600 }}>NÚM. 07 · 2026</span>
        <span style={{ color:"rgba(255,255,255,.8)", fontSize:6, letterSpacing:2, fontWeight:600 }}>FOXPDF</span>
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"14px 18px" }}>
        <div style={{ fontSize:22, fontWeight:900, color:"#111", lineHeight:.9, textTransform:"uppercase", letterSpacing:-1, marginBottom:8 }}>Marca<br/>que<br/>vende</div>
        <div style={{ height:2, background:"#111", marginBottom:8 }} />
        <div style={{ fontSize:7, color:"#555", fontWeight:300 }}>Estrategia para creadores</div>
      </div>
      <div style={{ padding:"8px 14px", borderTop:"1px solid #ccc", display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontSize:5.5, letterSpacing:2, color:"#555" }}>FOXPDF</span>
        <span style={{ fontSize:5.5, letterSpacing:1, color:"#999" }}>ESTRATEGIA</span>
      </div>
    </div>
  );
}

function CoverLujo() {
  const gold = "#b8924f";
  return (
    <div style={{ width:"100%", height:"100%", background:"#f7f4ee", position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ position:"absolute", inset:10, border:`1px solid ${gold}` }} />
      <div style={{ position:"absolute", inset:14, border:"0.5px solid #e9e0ce" }} />
      <div style={{ textAlign:"center", padding:"0 28px", position:"relative", zIndex:1 }}>
        <div style={{ fontSize:5.5, letterSpacing:5, color:gold, textTransform:"uppercase", marginBottom:12, fontWeight:500 }}>FOXPDF</div>
        <div style={{ fontFamily:"Georgia,serif", fontSize:17, color:"#1a1a1a", letterSpacing:2, lineHeight:1.2, marginBottom:8, fontWeight:500 }}>Atelier<br/>Digital</div>
        <div style={{ width:30, height:1, background:gold, margin:"0 auto 8px" }} />
        <div style={{ fontFamily:"Georgia,serif", fontStyle:"italic", fontSize:7.5, color:"#7a6a4a" }}>la elegancia del detalle</div>
      </div>
      <div style={{ position:"absolute", bottom:24, left:0, right:0, textAlign:"center", fontSize:5.5, letterSpacing:3, color:"#9a8a6a" }}>MMXXVI</div>
    </div>
  );
}

function CoverManuscrito() {
  return (
    <div style={{ width:"100%", height:"100%", background:"#faf6ec", fontFamily:"Georgia,serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"16px 20px", position:"relative" }}>
      <div style={{ fontSize:9, letterSpacing:4, color:"#8a7a55", marginBottom:20 }}>— ❦ —</div>
      <div style={{ fontSize:7, letterSpacing:4, color:"#9a8a6a", textTransform:"uppercase", marginBottom:14 }}>FoxPDF presenta</div>
      <div style={{ fontSize:18, color:"#2a2419", textAlign:"center", lineHeight:1.2, marginBottom:8 }}>Cartas a un<br/>joven autor</div>
      <div style={{ width:36, height:1, background:"#d8d0bd", margin:"8px auto" }} />
      <div style={{ fontStyle:"italic", fontSize:8, color:"#6a5d45", textAlign:"center" }}>reflexiones sobre el oficio</div>
      <div style={{ position:"absolute", bottom:28, fontSize:6.5, letterSpacing:3, color:"#9a8a6a" }}>· · ·</div>
    </div>
  );
}

const COVER_MAP: Record<TemplateName, () => React.ReactElement> = {
  clasica:     CoverClasica,
  minimalista: CoverMinimalista,
  editorial:   CoverEditorial,
  tecnico:     CoverTecnico,
  negocios:    CoverNegocios,
  revista:     CoverRevista,
  lujo:        CoverLujo,
  manuscrito:  CoverManuscrito,
};

export default function TemplateCoverThumbnail({ template }: { template: TemplateName }) {
  const Cover = COVER_MAP[template] ?? COVER_MAP.clasica;
  return <Cover />;
}
