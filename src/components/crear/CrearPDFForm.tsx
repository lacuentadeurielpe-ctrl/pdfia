"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Image, BookOpen, Mic2, Zap, Star, Crown, Lock, AlertTriangle } from "lucide-react";
import Link from "next/link";

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
          if (!data.plan.permiteImagenes) setIncluirImagenes(false);
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
        body: JSON.stringify({ titulo, contexto, calidad, capitulos: capActual, tono, incluirImagenes }),
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
  const costoEstimadoActual = 1 + (incluirImagenes && planInfo?.permiteImagenes ? capActual : 0);
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

      {/* Imágenes IA */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              planInfo && !planInfo.permiteImagenes ? "bg-gray-800" : "bg-pink-600/20"
            }`}>
              <Image
                className={`w-4 h-4 ${planInfo && !planInfo.permiteImagenes ? "text-gray-600" : "text-pink-400"}`}
                aria-label="Imágenes IA"
              />
            </div>
            <div>
              <p className={`font-semibold text-sm ${planInfo && !planInfo.permiteImagenes ? "text-gray-500" : "text-white"}`}>
                Imágenes generadas por IA
              </p>
              {planInfo && !planInfo.permiteImagenes ? (
                <p className="text-gray-600 text-xs">
                  No disponible en tu plan ·{" "}
                  <Link href="/planes" className="text-indigo-400 hover:text-indigo-300">Mejorar →</Link>
                </p>
              ) : (
                <p className="text-gray-500 text-xs">
                  Gemini generará una imagen por capítulo · +1 crédito/imagen
                </p>
              )}
            </div>
          </div>
          {planInfo && !planInfo.permiteImagenes ? (
            <Lock className="w-5 h-5 text-gray-700" />
          ) : (
            <button
              type="button"
              onClick={() => setIncluirImagenes(!incluirImagenes)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                incluirImagenes ? "bg-indigo-600" : "bg-gray-700"
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                incluirImagenes ? "translate-x-7" : "translate-x-1"
              }`} />
            </button>
          )}
        </div>
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
    </form>
  );
}
