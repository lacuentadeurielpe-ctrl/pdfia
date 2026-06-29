"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Image, BookOpen, Mic2, Zap, Star, Crown, Lock, AlertTriangle, Palette, Check } from "lucide-react";
import Link from "next/link";
import type { TemplateName, ModoImagenes } from "@/lib/pdf/templates/index";
import TemplatePreviewModal from "./TemplatePreviewModal";
import TemplateCoverThumbnail from "./TemplateCoverThumbnail";

const CALIDADES = [
  {
    id:    "estandar",
    label: "Estándar",
    desc:  "Claude Haiku planifica, DeepSeek escribe. Cada capítulo conoce el anterior. Excelente calidad.",
    icon:  Zap,
    badge: "Recomendado",
    time:  "~3-5 min",
    color: "indigo",
    detail: "Haiku · ~2000 palabras/cap",
  },
  {
    id:    "avanzado",
    label: "Avanzado",
    desc:  "Claude Sonnet planifica con mayor razonamiento. Capítulos más largos y detallados.",
    icon:  Star,
    badge: "Popular",
    time:  "~5-8 min",
    color: "purple",
    detail: "Sonnet · ~3000 palabras/cap",
  },
  {
    id:    "premium",
    label: "Premium",
    desc:  "Claude Opus planifica. DeepSeek escribe capítulos de máxima densidad y profundidad.",
    icon:  Crown,
    badge: "Pro",
    time:  "~8-12 min",
    color: "amber",
    detail: "Opus · ~4000 palabras/cap",
  },
] as const;

const TONOS = ["profesional", "educativo", "creativo", "técnico", "divulgativo", "motivacional"];

const TEMPLATES: { id: TemplateName; label: string; desc: string; tag: string }[] = [
  { id: "clasica",     label: "Clásica",     desc: "Portada degradada, bordes redondeados, sombra de marca",      tag: "Versátil" },
  { id: "minimalista", label: "Minimalista", desc: "Blanco puro, borde izquierdo, drop cap, tipografía elegante", tag: "Clean"    },
  { id: "editorial",   label: "Editorial",   desc: "Folio, drop cap, imágenes flotadas, estilo magazine",         tag: "Premium"  },
  { id: "tecnico",     label: "Técnico",     desc: "Dark navy, sidebar, fuente monoespaciada, estilo doc",        tag: "Premium"  },
  { id: "negocios",    label: "Negocios",    desc: "Header corporativo, barra de stats, estilo ejecutivo",        tag: "Premium"  },
  { id: "revista",     label: "Revista",     desc: "Tipografía condensada, 2 columnas, color bloque, magazine",   tag: "Premium"  },
  { id: "lujo",        label: "Lujo",        desc: "Cormorant Garamond, marco dorado, márgenes amplísimos",       tag: "Premium"  },
  { id: "manuscrito",  label: "Manuscrito",  desc: "EB Garamond, sangría literaria, ornamentos, folio clásico",   tag: "Premium"  },
];

const MODOS_IMAGEN: { id: ModoImagenes; label: string; desc: string; creditos: string }[] = [
  { id: "ninguna",    label: "Sin imágenes",  desc: "Solo texto. Máxima velocidad y ahorro de créditos.",       creditos: "0 extra"                    },
  { id: "alternadas", label: "Alternadas",    desc: "Una imagen cada dos capítulos. Balance calidad/costo.",    creditos: "~50% menos"                 },
  { id: "todas",      label: "Todas",         desc: "Una imagen por capítulo. La experiencia más visual.",      creditos: "+1 por capítulo"            },
];

interface PlanInfo {
  id:             string;
  nombre:         string;
  calidades:      string[];
  permiteImagenes: boolean;
  capitulosMax:   number;
  creditos: {
    disponibles: number;
    totales:     number;
  };
}

export default function CrearPDFForm() {
  const router = useRouter();
  const [contexto, setContexto]             = useState("");
  const [titulo, setTitulo]                 = useState("");
  const [calidad, setCalidad]               = useState<"estandar" | "avanzado" | "premium">("estandar");
  const [capitulos, setCapitulos]           = useState(5);
  const [tono, setTono]                     = useState("profesional");
  const [incluirImagenes, setIncluirImagenes] = useState(true);
  const [plantilla, setPlantilla]             = useState<TemplateName>("clasica");
  const [modoImagenes, setModoImagenes]       = useState<ModoImagenes>("todas");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateName | null>(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState("");
  const [planInfo, setPlanInfo]             = useState<PlanInfo | null>(null);

  useEffect(() => {
    fetch("/api/planes/estado")
      .then((r) => r.json())
      .then((data) => {
        if (data.plan) {
          setPlanInfo({
            id:              data.plan.id,
            nombre:          data.plan.nombre,
            calidades:       data.plan.calidades,
            permiteImagenes: data.plan.permiteImagenes,
            capitulosMax:    data.plan.capitulosMax,
            creditos: {
              disponibles: data.creditos.disponibles,
              totales:     data.creditos.totales,
            },
          });
          // Ajustar si los valores actuales superan el plan
          if (!data.plan.calidades.includes(calidad)) setCalidad("estandar");
          if (!data.plan.permiteImagenes) { setIncluirImagenes(false); setModoImagenes("ninguna"); }
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capMax    = planInfo?.capitulosMax ?? 15;
  const capActual = Math.min(capitulos, capMax);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contexto.trim()) { setError("Describe el tema de tu documento."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pdf/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo, contexto, calidad, capitulos: capActual, tono,
          incluirImagenes: modoImagenes !== "ninguna",
          plantilla,
          modoImagenes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al iniciar la generación");
      router.push(`/generar/${data.proyectoId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  }

  // Créditos disponibles y costo estimado
  const imgsEstimadas = modoImagenes === "ninguna" ? 0 : modoImagenes === "alternadas" ? Math.ceil(capActual / 2) : capActual;
  const costoEstimadoActual = 1 + (planInfo?.permiteImagenes ? imgsEstimadas : 0);
  const creditosDisp  = planInfo?.creditos.disponibles ?? null;
  const sinCreditos   = creditosDisp !== null && creditosDisp < costoEstimadoActual;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Banner de créditos */}
      {planInfo && (
        <div className={`flex items-center justify-between rounded-2xl px-5 py-3 border ${
          sinCreditos
            ? "bg-red-950 border-red-800"
            : creditosDisp !== null && creditosDisp <= 3
              ? "bg-amber-950 border-amber-800"
              : "bg-gray-900 border-gray-800"
        }`}>
          <div className="flex items-center gap-2">
            {sinCreditos && <AlertTriangle className="w-4 h-4 text-red-400" />}
            <span className={`text-sm font-medium ${sinCreditos ? "text-red-400" : "text-gray-300"}`}>
              Plan <strong>{planInfo.nombre}</strong> ·{" "}
              <span className={sinCreditos ? "text-red-400" : "text-white"}>
                {creditosDisp} créditos disponibles
              </span>
              {!sinCreditos && (
                <span className="text-gray-500"> · Este ebook costará ~{costoEstimadoActual} crédito{costoEstimadoActual !== 1 ? "s" : ""}</span>
              )}
            </span>
          </div>
          <Link href="/planes" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex-shrink-0">
            {sinCreditos ? "Renovar plan →" : "Ver planes →"}
          </Link>
        </div>
      )}

      {/* Contexto principal */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <label className="block text-white font-semibold mb-1">
          ¿Sobre qué es tu documento?
        </label>
        <p className="text-gray-500 text-xs mb-4">
          Sé específico: tema, audiencia, objetivo, datos clave que quieres incluir.
        </p>
        <textarea
          value={contexto}
          onChange={(e) => setContexto(e.target.value)}
          rows={6}
          maxLength={3000}
          placeholder="Ej: Quiero un ebook completo sobre marketing digital para restaurantes en Perú. Debe incluir estrategias de redes sociales, delivery apps, fotografía de alimentos y casos de éxito. Audiencia: dueños de restaurantes con poco conocimiento digital."
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white
                     placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1
                     focus:ring-indigo-500 text-sm resize-none"
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-600">Más detalle = mejor resultado</span>
          <span className="text-xs text-gray-600">{contexto.length}/3000</span>
        </div>
      </div>

      {/* Título opcional */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <label className="block text-white font-semibold mb-1">Título del documento</label>
        <p className="text-gray-500 text-xs mb-3">Opcional — si lo dejas vacío, la IA lo generará</p>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white
                     placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm"
          placeholder="Ej: Guía de Marketing Digital para Restaurantes 2026"
        />
      </div>

      {/* Calidad */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <label className="block text-white font-semibold mb-1">Calidad del documento</label>
        <p className="text-gray-500 text-xs mb-4">
          Todos los niveles producen contenido profesional. Mayor calidad = más profundidad y tiempo.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {CALIDADES.map((c) => {
            const Icon      = c.icon;
            const selected  = calidad === c.id;
            const bloqueado = planInfo && !planInfo.calidades.includes(c.id);
            const colorMap  = {
              indigo: { border: "border-indigo-500 bg-indigo-600/10", badge: "bg-indigo-600/30 text-indigo-300", icon: "text-indigo-400" },
              purple: { border: "border-purple-500 bg-purple-600/10", badge: "bg-purple-600/30 text-purple-300", icon: "text-purple-400" },
              amber:  { border: "border-amber-500  bg-amber-600/10",  badge: "bg-amber-600/30  text-amber-300",  icon: "text-amber-400"  },
            };
            const colors = colorMap[c.color];
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => !bloqueado && setCalidad(c.id)}
                disabled={!!bloqueado}
                className={`relative text-left p-4 rounded-xl border transition-colors ${
                  bloqueado
                    ? "border-gray-800 bg-gray-900 opacity-50 cursor-not-allowed"
                    : selected
                      ? colors.border
                      : "border-gray-700 hover:border-gray-600 bg-gray-800"
                }`}
              >
                {bloqueado && (
                  <div className="absolute top-2 right-2">
                    <Lock className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 ${selected && !bloqueado ? colors.icon : "text-gray-500"}`} />
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selected && !bloqueado ? colors.badge : "bg-gray-700 text-gray-400"
                  }`}>{c.badge}</span>
                </div>
                <p className="text-white font-semibold text-sm mb-1">{c.label}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{c.desc}</p>
                <p className={`text-xs mt-2 font-medium ${selected && !bloqueado ? colors.icon : "text-gray-600"}`}>
                  {c.time} · {c.detail}
                </p>
                {bloqueado && (
                  <p className="text-xs text-indigo-400 mt-1">
                    <Link href="/planes" onClick={(e) => e.stopPropagation()}>Mejorar plan →</Link>
                  </p>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-3 bg-gray-800 rounded-xl px-4 py-3 text-xs text-gray-400">
          <span className="text-white font-medium">Motor multi-IA:</span>{" "}
          Claude (planificación) · DeepSeek (redacción) · Gemini (imágenes)
        </div>
      </div>

      {/* Config */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <label className="block text-white font-semibold mb-4">Configuración del documento</label>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              <BookOpen className="w-3.5 h-3.5 inline mr-1" />
              Capítulos ({capActual} / máx {capMax})
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={3}
                max={capMax}
                value={capActual}
                onChange={(e) => setCapitulos(+e.target.value)}
                className="flex-1 accent-indigo-500"
              />
              <span className="text-white font-bold w-6 text-center">{capActual}</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Tu plan permite hasta {capMax} capítulos</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              <Mic2 className="w-3.5 h-3.5 inline mr-1" />
              Tono del documento
            </label>
            <select
              value={tono}
              onChange={(e) => setTono(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5
                         text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              {TONOS.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Plantilla — galería estilo Shopify */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-4 h-4 text-indigo-400" />
          <label className="text-white font-semibold">Plantilla visual</label>
        </div>
        <p className="text-gray-500 text-xs mb-4">
          Haz clic en una plantilla para seleccionarla. Los colores de tu marca se aplican en todas.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TEMPLATES.map((t) => {
            const sel = plantilla === t.id;
            const tagColor =
              t.tag === "Premium" ? { bg: "bg-amber-600/20", text: "text-amber-300" } :
              t.tag === "Clean"   ? { bg: "bg-emerald-600/20", text: "text-emerald-300" } :
                                    { bg: "bg-gray-700", text: "text-gray-400" };
            return (
              <div key={t.id} className="flex flex-col group">
                {/* Card thumbnail */}
                <div
                  className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ring-2 ${
                    sel
                      ? "ring-indigo-500 shadow-lg shadow-indigo-500/25"
                      : "ring-gray-700 hover:ring-indigo-400/60 hover:shadow-md hover:shadow-indigo-500/10"
                  }`}
                  style={{ aspectRatio: "210 / 297" }}
                  onClick={() => setPreviewTemplate(t.id)}
                >
                  <TemplateCoverThumbnail template={t.id} />
                  {/* Checkmark cuando está seleccionada */}
                  {sel && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {/* Overlay sutil al hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none" />
                </div>
                {/* Nombre + tag */}
                <div className="mt-1.5 px-0.5 flex items-center justify-between">
                  <span className={`text-xs font-semibold truncate ${sel ? "text-indigo-300" : "text-gray-300"}`}>
                    {t.label}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ml-1 flex-shrink-0 ${tagColor.bg} ${tagColor.text}`}>
                    {t.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modo de imágenes IA */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <Image className="w-4 h-4 text-pink-400" aria-label="Imágenes IA" />
          <label className="text-white font-semibold">Imágenes IA</label>
        </div>
        <p className="text-gray-500 text-xs mb-4">
          Generadas por Gemini. Cada imagen gasta 1 crédito.
        </p>
        {planInfo && !planInfo.permiteImagenes ? (
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl border border-gray-700">
            <Lock className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <p className="text-gray-500 text-sm">
              No disponible en tu plan ·{" "}
              <Link href="/planes" className="text-indigo-400 hover:text-indigo-300">Mejorar →</Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {MODOS_IMAGEN.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setModoImagenes(m.id); setIncluirImagenes(m.id !== "ninguna"); }}
                className={`text-left p-3 rounded-xl border transition-colors ${
                  modoImagenes === m.id
                    ? "border-pink-500 bg-pink-600/10"
                    : "border-gray-700 hover:border-gray-600 bg-gray-800"
                }`}
              >
                <p className={`font-semibold text-sm mb-1 ${modoImagenes === m.id ? "text-pink-300" : "text-white"}`}>
                  {m.label}
                </p>
                <p className="text-gray-500 text-xs leading-relaxed">{m.desc}</p>
                <p className={`text-xs mt-2 font-medium ${modoImagenes === m.id ? "text-pink-400" : "text-gray-600"}`}>
                  {m.creditos}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
          {error.includes("crédito") && (
            <Link href="/planes" className="ml-2 text-indigo-400 hover:text-indigo-300 underline">
              Ver planes →
            </Link>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !contexto.trim() || sinCreditos}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500
                   disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-bold
                   py-4 rounded-2xl transition-colors text-base"
      >
        <Sparkles className="w-5 h-5" />
        {loading ? "Iniciando orquestador..." : sinCreditos ? "Sin créditos disponibles" : "Generar ebook con IA"}
      </button>

      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          selected={plantilla}
          onSelect={(t) => { setPlantilla(t); setPreviewTemplate(t); }}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </form>
  );
}
