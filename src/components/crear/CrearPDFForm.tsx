"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, Image as ImageIcon, BookOpen, Mic2, Zap, Star, Crown,
  Lock, AlertTriangle, Palette, Check, ChevronDown,
} from "lucide-react";
import Link from "next/link";
import type { TemplateName, ModoImagenes } from "@/lib/pdf/templates/index";
import TemplatePreviewModal from "./TemplatePreviewModal";
import TemplateCoverThumbnail from "./TemplateCoverThumbnail";

/* ── Datos estáticos ───────────────────────────────────────────── */

const CALIDADES = [
  {
    id:    "estandar",
    label: "Estándar",
    badge: "Recomendado",
    tiempo: "~3-5 min",
    palabras: "~2 000 palabras/cap",
    beneficio: "Excelente calidad. Rápido y eficiente para la mayoría de temas.",
    icon:  Zap,
    color: "indigo" as const,
  },
  {
    id:    "avanzado",
    label: "Avanzado",
    badge: "Más profundo",
    tiempo: "~5-8 min",
    palabras: "~3 000 palabras/cap",
    beneficio: "Capítulos más largos y detallados. Mayor razonamiento y cohesión.",
    icon:  Star,
    color: "purple" as const,
  },
  {
    id:    "premium",
    label: "Premium",
    badge: "Máxima calidad",
    tiempo: "~8-12 min",
    palabras: "~4 000 palabras/cap",
    beneficio: "Máxima densidad y profundidad. Para contenido de alto valor.",
    icon:  Crown,
    color: "amber" as const,
  },
] as const;

const TONOS = ["profesional","educativo","creativo","técnico","divulgativo","motivacional"];

// Capítulos disponibles como chips — más intuitivo que un slider
const CAPS_OPCIONES = [3, 5, 7, 10, 12, 15];

const TEMPLATES: { id: TemplateName; label: string; tag: string; soloPlanes: boolean }[] = [
  { id: "clasica",     label: "Clásica",     tag: "Versátil", soloPlanes: false },
  { id: "minimalista", label: "Minimalista", tag: "Clean",    soloPlanes: false },
  { id: "editorial",   label: "Editorial",   tag: "Premium",  soloPlanes: true  },
  { id: "tecnico",     label: "Técnico",     tag: "Premium",  soloPlanes: true  },
  { id: "negocios",    label: "Negocios",    tag: "Premium",  soloPlanes: true  },
  { id: "revista",     label: "Revista",     tag: "Premium",  soloPlanes: true  },
  { id: "lujo",        label: "Lujo",        tag: "Premium",  soloPlanes: true  },
  { id: "manuscrito",  label: "Manuscrito",  tag: "Premium",  soloPlanes: true  },
];

const MODOS_IMAGEN: { id: ModoImagenes; label: string; desc: string; creditos: string }[] = [
  { id: "ninguna",    label: "Sin imágenes",  desc: "Solo texto. Más rápido y barato.",           creditos: "0 extra"         },
  { id: "alternadas", label: "Alternadas",    desc: "Una imagen cada 2 caps. Balance ideal.",     creditos: "~50% menos"      },
  { id: "todas",      label: "Todas",         desc: "Una por capítulo. Máximo impacto visual.",  creditos: "+1 por capítulo" },
];

interface PlanInfo {
  id: string; nombre: string; calidades: string[];
  permiteImagenes: boolean; capitulosMax: number;
  creditos: { disponibles: number; totales: number };
}

/* ── Componente ────────────────────────────────────────────────── */

export default function CrearPDFForm() {
  const router = useRouter();

  const [contexto,       setContexto]       = useState("");
  const [titulo,         setTitulo]         = useState("");
  const [showTitulo,     setShowTitulo]     = useState(false);
  const [calidad,        setCalidad]        = useState<"estandar"|"avanzado"|"premium">("estandar");
  const [capitulos,      setCapitulos]      = useState(5);
  const [tono,           setTono]           = useState("profesional");
  const [incluirImagenes,setIncluirImagenes]= useState(true);
  const [plantilla,      setPlantilla]      = useState<TemplateName>("clasica");
  const [modoImagenes,   setModoImagenes]   = useState<ModoImagenes>("todas");
  const [previewTemplate,setPreviewTemplate]= useState<TemplateName|null>(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [planInfo,       setPlanInfo]       = useState<PlanInfo|null>(null);

  useEffect(() => {
    fetch("/api/planes/estado")
      .then(r => r.json())
      .then(data => {
        if (!data.plan) return;
        setPlanInfo({
          id: data.plan.id, nombre: data.plan.nombre,
          calidades: data.plan.calidades,
          permiteImagenes: data.plan.permiteImagenes,
          capitulosMax: data.plan.capitulosMax,
          creditos: { disponibles: data.creditos.disponibles, totales: data.creditos.totales },
        });
        if (!data.plan.calidades.includes(calidad)) setCalidad("estandar");
        if (!data.plan.permiteImagenes) { setIncluirImagenes(false); setModoImagenes("ninguna"); }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capMax    = planInfo?.capitulosMax ?? 15;
  const capActual = Math.min(capitulos, capMax);
  const esGratis  = planInfo?.id === "gratis";

  // Créditos y costo estimado
  const imgsEstimadas =
    modoImagenes === "ninguna" ? 0 :
    modoImagenes === "alternadas" ? Math.ceil(capActual / 2) : capActual;
  const costoEstimadoActual = 1 + (planInfo?.permiteImagenes ? imgsEstimadas : 0);
  const creditosDisp = planInfo?.creditos.disponibles ?? null;
  const sinCreditos  = creditosDisp !== null && creditosDisp < costoEstimadoActual;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contexto.trim()) { setError("Describe el tema de tu ebook."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/pdf/crear", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo, contexto, calidad, capitulos: capActual, tono,
          incluirImagenes: modoImagenes !== "ninguna",
          plantilla, modoImagenes,
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

  const colorMap = {
    indigo: { ring: "border-indigo-500 bg-indigo-600/10", badge: "bg-indigo-600/30 text-indigo-300", icon: "text-indigo-400" },
    purple: { ring: "border-purple-500 bg-purple-600/10", badge: "bg-purple-600/30 text-purple-300", icon: "text-purple-400" },
    amber:  { ring: "border-amber-500  bg-amber-600/10",  badge: "bg-amber-600/30  text-amber-300",  icon: "text-amber-400"  },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Banner de créditos ──────────────────────────────────── */}
      {planInfo && (
        <div className={`flex items-center justify-between rounded-2xl px-5 py-3 border ${
          sinCreditos
            ? "bg-red-950 border-red-800"
            : creditosDisp !== null && creditosDisp <= 3
              ? "bg-amber-950 border-amber-800"
              : "bg-gray-900 border-gray-800"
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            {sinCreditos && <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />}
            <span className={`text-sm font-medium truncate ${sinCreditos ? "text-red-400" : "text-gray-300"}`}>
              Plan <strong>{planInfo.nombre}</strong> ·{" "}
              <span className={sinCreditos ? "text-red-400" : "text-white"}>
                {creditosDisp} créditos
              </span>
              {!sinCreditos && (
                <span className="text-gray-500"> · Este ebook costará ~{costoEstimadoActual} crédito{costoEstimadoActual !== 1 ? "s" : ""}</span>
              )}
            </span>
          </div>
          <Link href="/planes" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex-shrink-0 ml-3">
            {sinCreditos ? "Renovar →" : "Ver planes →"}
          </Link>
        </div>
      )}

      {/* ── 1. Tema del ebook ──────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <label className="block text-white font-semibold mb-1">¿Sobre qué es tu ebook?</label>
        <p className="text-gray-500 text-xs mb-3">
          Cuanta más información des, mejor será el resultado — tema, audiencia, objetivo, datos clave.
        </p>
        <textarea
          value={contexto}
          onChange={e => setContexto(e.target.value)}
          rows={5}
          maxLength={3000}
          placeholder="Ej: Quiero un ebook sobre marketing digital para restaurantes en Perú. Incluir estrategias para redes sociales, delivery apps y fotografía de alimentos. Audiencia: dueños con poco conocimiento digital que quieren atraer más clientes."
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white
                     placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1
                     focus:ring-indigo-500/50 text-sm resize-none"
        />
        <div className="flex justify-between mt-2 mb-3">
          <span className="text-xs text-gray-600">Más detalle = mejor resultado</span>
          <span className="text-xs text-gray-600">{contexto.length}/3000</span>
        </div>

        {/* Título opcional — colapsable */}
        <button
          type="button"
          onClick={() => setShowTitulo(v => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTitulo ? "rotate-180" : ""}`} />
          {showTitulo ? "Ocultar título personalizado" : "Añadir título personalizado (opcional)"}
        </button>
        {showTitulo && (
          <div className="mt-3">
            <input
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white
                         placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm"
              placeholder="Ej: Guía de Marketing Digital para Restaurantes 2026 — si no pones nada, la IA lo inventa"
            />
          </div>
        )}
      </div>

      {/* ── 2. Plantilla visual ────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-4 h-4 text-indigo-400" />
          <label className="text-white font-semibold">Plantilla visual</label>
        </div>
        <p className="text-gray-500 text-xs mb-4">
          Define el diseño del PDF. Tus colores y logo se aplican automáticamente en todas.
          {esGratis && <span className="text-amber-400 ml-1">· Las premium requieren plan Creador o Estudio.</span>}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TEMPLATES.map(t => {
            const sel      = plantilla === t.id;
            const bloqueada = esGratis && t.soloPlanes;
            const tagColor =
              t.tag === "Premium" ? { bg: "bg-amber-600/20", text: "text-amber-300" } :
              t.tag === "Clean"   ? { bg: "bg-emerald-600/20", text: "text-emerald-300" } :
                                    { bg: "bg-gray-700", text: "text-gray-400" };
            return (
              <div key={t.id} className={`flex flex-col group ${bloqueada ? "opacity-50" : ""}`}>
                <div
                  className={`relative rounded-xl overflow-hidden transition-all duration-200 ring-2 ${
                    bloqueada
                      ? "ring-gray-800 cursor-not-allowed"
                      : sel
                        ? "ring-indigo-500 shadow-lg shadow-indigo-500/25 cursor-pointer"
                        : "ring-gray-700 hover:ring-indigo-400/60 cursor-pointer"
                  }`}
                  style={{ aspectRatio: "210 / 297" }}
                  onClick={() => !bloqueada && setPreviewTemplate(t.id)}
                >
                  <TemplateCoverThumbnail template={t.id} />
                  {sel && !bloqueada && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {bloqueada && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none" />
                </div>
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
        {esGratis && (
          <p className="mt-3 text-center">
            <Link href="/planes" className="text-xs text-indigo-400 hover:text-indigo-300">
              Desbloquear las 6 plantillas premium → Creador desde S/49/mes
            </Link>
          </p>
        )}
      </div>

      {/* ── 3. Calidad del contenido ───────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <label className="block text-white font-semibold mb-1">Calidad del contenido</label>
        <p className="text-gray-500 text-xs mb-4">Todos producen contenido profesional. Mayor calidad = más profundidad y tiempo.</p>
        <div className="grid grid-cols-3 gap-3">
          {CALIDADES.map(c => {
            const Icon      = c.icon;
            const sel       = calidad === c.id;
            const bloqueado = planInfo && !planInfo.calidades.includes(c.id);
            const colors    = colorMap[c.color];
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => !bloqueado && setCalidad(c.id)}
                disabled={!!bloqueado}
                className={`relative text-left p-4 rounded-xl border transition-colors ${
                  bloqueado
                    ? "border-gray-800 bg-gray-900 opacity-50 cursor-not-allowed"
                    : sel
                      ? colors.ring
                      : "border-gray-700 hover:border-gray-600 bg-gray-800"
                }`}
              >
                {bloqueado && <Lock className="absolute top-2 right-2 w-3.5 h-3.5 text-gray-600" />}
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 ${sel && !bloqueado ? colors.icon : "text-gray-500"}`} />
                  <span className={`text-xs px-2 py-0.5 rounded-full ${sel && !bloqueado ? colors.badge : "bg-gray-700 text-gray-400"}`}>
                    {c.badge}
                  </span>
                </div>
                <p className="text-white font-semibold text-sm mb-1">{c.label}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{c.beneficio}</p>
                <p className={`text-xs mt-2 font-medium ${sel && !bloqueado ? colors.icon : "text-gray-600"}`}>
                  {c.tiempo} · {c.palabras}
                </p>
                {bloqueado && (
                  <Link href="/planes" onClick={e => e.stopPropagation()} className="text-xs text-indigo-400 mt-1 block">
                    Mejorar plan →
                  </Link>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. Configuración (capítulos + tono) ───────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <label className="block text-white font-semibold mb-4">Configuración</label>
        <div className="grid grid-cols-2 gap-6">
          {/* Capítulos — chips */}
          <div>
            <label className="block text-sm text-gray-400 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Capítulos
            </label>
            <div className="flex flex-wrap gap-2">
              {CAPS_OPCIONES.filter(n => n <= capMax).map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCapitulos(n)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                    capActual === n
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800 border border-gray-700 text-gray-300 hover:border-indigo-500/60"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">Máximo {capMax} en tu plan</p>
          </div>

          {/* Tono */}
          <div>
            <label className="block text-sm text-gray-400 mb-3 flex items-center gap-1.5">
              <Mic2 className="w-3.5 h-3.5" />
              Tono
            </label>
            <select
              value={tono}
              onChange={e => setTono(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5
                         text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              {TONOS.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── 5. Imágenes IA ─────────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <ImageIcon className="w-4 h-4 text-pink-400" aria-hidden />
          <label className="text-white font-semibold">Imágenes IA</label>
        </div>
        <p className="text-gray-500 text-xs mb-4">
          Generadas por Gemini, únicas para cada capítulo. Cada imagen consume 1 crédito.
        </p>
        {planInfo && !planInfo.permiteImagenes ? (
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl border border-gray-700">
            <Lock className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <p className="text-gray-500 text-sm">
              No disponible en el plan Gratis ·{" "}
              <Link href="/planes" className="text-indigo-400 hover:text-indigo-300">Mejorar plan →</Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {MODOS_IMAGEN.map(m => (
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
                <p className={`text-xs mt-1.5 font-medium ${modoImagenes === m.id ? "text-pink-400" : "text-gray-600"}`}>
                  {m.creditos}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Error ──────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            {error}
            {error.includes("crédito") && (
              <Link href="/planes" className="ml-2 text-indigo-400 hover:text-indigo-300 underline">Ver planes →</Link>
            )}
          </span>
        </div>
      )}

      {/* ── Submit ─────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={loading || !contexto.trim() || sinCreditos}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500
                   disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-bold
                   py-4 rounded-2xl transition-colors text-base"
      >
        <Sparkles className="w-5 h-5" />
        {loading ? "Iniciando generación..." : sinCreditos ? "Sin créditos disponibles" : "Generar ebook con IA"}
      </button>

      {/* ── Preview modal ──────────────────────────────────────── */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          selected={plantilla}
          onSelect={t => { setPlantilla(t); setPreviewTemplate(t); }}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </form>
  );
}
