"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Image, BookOpen, Mic2 } from "lucide-react";

const MODELOS = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", desc: "Rápido y eficiente", badge: "Recomendado" },
  { id: "gemini-2.5-pro",   label: "Gemini 2.5 Pro",   desc: "Mayor razonamiento", badge: "Premium" },
  { id: "deepseek-chat",    label: "DeepSeek Chat",    desc: "Muy económico",      badge: "Barato" },
  { id: "claude-sonnet-4-6",label: "Claude Sonnet",    desc: "Alta calidad",       badge: "Potente" },
];

const TONOS = ["profesional", "educativo", "creativo", "técnico", "divulgativo", "motivacional"];

export default function CrearPDFForm() {
  const router = useRouter();
  const [contexto, setContexto] = useState("");
  const [titulo, setTitulo] = useState("");
  const [modelo, setModelo] = useState("gemini-2.5-flash");
  const [capitulos, setCapitulos] = useState(5);
  const [tono, setTono] = useState("profesional");
  const [incluirImagenes, setIncluirImagenes] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contexto.trim()) { setError("Describe el tema de tu documento."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pdf/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, contexto, modelo, capitulos, tono, incluirImagenes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al iniciar la generación");
      router.push(`/generar/${data.proyectoId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

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

      {/* Modelo IA */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <label className="block text-white font-semibold mb-4">Modelo de IA para el texto</label>
        <div className="grid grid-cols-2 gap-3">
          {MODELOS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setModelo(m.id)}
              className={`text-left p-4 rounded-xl border transition-colors ${
                modelo === m.id
                  ? "border-indigo-500 bg-indigo-600/10"
                  : "border-gray-700 hover:border-gray-600 bg-gray-800"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-medium text-sm">{m.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  m.badge === "Recomendado" ? "bg-indigo-600/30 text-indigo-300" :
                  m.badge === "Premium"     ? "bg-purple-600/30 text-purple-300" :
                  m.badge === "Barato"      ? "bg-emerald-600/30 text-emerald-300" :
                                              "bg-orange-600/30 text-orange-300"
                }`}>{m.badge}</span>
              </div>
              <p className="text-gray-500 text-xs">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Config */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <label className="block text-white font-semibold mb-4">Configuración del documento</label>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              <BookOpen className="w-3.5 h-3.5 inline mr-1" />
              Número de capítulos
            </label>
            <div className="flex items-center gap-3">
              <input type="range" min={3} max={12} value={capitulos}
                onChange={(e) => setCapitulos(+e.target.value)}
                className="flex-1 accent-indigo-500" />
              <span className="text-white font-bold w-6 text-center">{capitulos}</span>
            </div>
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
            <div className="w-9 h-9 bg-pink-600/20 rounded-lg flex items-center justify-center">
              <Image className="w-4 h-4 text-pink-400" aria-label="Imágenes IA" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Imágenes generadas por IA</p>
              <p className="text-gray-500 text-xs">
                El director decidirá qué modelo usar según la complejidad de cada sección
              </p>
            </div>
          </div>
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
        </div>
        {incluirImagenes && (
          <div className="mt-4 bg-gray-800 rounded-xl p-3 text-xs text-gray-400">
            <span className="text-yellow-400 font-semibold">Director IA:</span>{" "}
            Usará <span className="text-white">gemini-2.5-flash-preview-image-generation</span> por defecto.
            Para secciones con datos o gráficos precisos, escalará a{" "}
            <span className="text-white">gemini-3-pro-image</span> automáticamente.
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !contexto.trim()}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500
                   disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-bold
                   py-4 rounded-2xl transition-colors text-base"
      >
        <Sparkles className="w-5 h-5" />
        {loading ? "Iniciando orquestador..." : "Generar PDF con IA"}
      </button>
    </form>
  );
}
