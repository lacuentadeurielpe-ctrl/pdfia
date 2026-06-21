"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Circle, Loader2, AlertCircle, Download, Sparkles, FileText } from "lucide-react";

interface Proyecto {
  id: string;
  titulo: string;
  contexto: string;
  estado: string;
  modelo_ia: string;
  num_capitulos: number;
  tono: string;
  incluir_imagenes: boolean;
}

interface LogEntry {
  message: string;
  ts: string;
  phase: string;
}

const FASES = [
  { key: "planificando",        label: "Planificando" },
  { key: "escribiendo",         label: "Escribiendo" },
  { key: "editando",            label: "Editando" },
  { key: "generando_imagenes",  label: "Imágenes IA" },
  { key: "ensamblando",         label: "Ensamblando" },
  { key: "completado",          label: "¡Listo!" },
];

const FASE_ORDER = FASES.map((f) => f.key);

export default function GeneradorClient({
  proyecto,
  previewUrl,
}: {
  proyecto: Proyecto;
  previewUrl?: string | null;
}) {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [phase, setPhase] = useState<string>(proyecto.estado);
  const [progress, setProgress] = useState(proyecto.estado === "completado" ? 100 : 0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(previewUrl ?? null);
  const [pdfTitulo, setPdfTitulo] = useState<string>(proyecto.titulo || "");
  const [iniciado, setIniciado] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const isFinished = phase === "completado" || phase === "error";
  const faseIdx = FASE_ORDER.indexOf(phase);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (iniciado || isFinished) return;
    setIniciado(true);

    const source = new EventSource(`/api/pdf/generar/${proyecto.id}`);

    source.onmessage = (e) => {
      try {
        const ev = JSON.parse(e.data) as {
          phase: string;
          message: string;
          progress: number;
          data?: { pdfUrl?: string; titulo?: string };
        };

        setPhase(ev.phase);
        setProgress(ev.progress);

        setLogs((prev) => [
          ...prev,
          { message: ev.message, ts: new Date().toLocaleTimeString("es-PE"), phase: ev.phase },
        ]);

        if (ev.phase === "completado" && ev.data?.pdfUrl) {
          setPdfUrl(ev.data.pdfUrl);
          setPdfTitulo(ev.data.titulo ?? pdfTitulo);
          source.close();
        }

        if (ev.phase === "error") {
          setErrorMsg(ev.message);
          source.close();
        }
      } catch {}
    };

    source.onerror = () => {
      if (phase !== "completado") {
        setLogs((prev) => [...prev, {
          message: "⚠️ Conexión interrumpida con el servidor",
          ts: new Date().toLocaleTimeString("es-PE"),
          phase: "error",
        }]);
      }
      source.close();
    };

    return () => source.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyecto.id]);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">{pdfTitulo || proyecto.titulo}</h1>
        </div>
        <p className="text-gray-400 text-sm ml-8">
          {proyecto.num_capitulos} capítulos · {proyecto.modelo_ia} · tono {proyecto.tono}
          {proyecto.incluir_imagenes ? " · imágenes IA activadas" : ""}
        </p>
      </div>

      {/* Progress stepper */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          {FASES.map((fase, i) => {
            const done = i < faseIdx || phase === "completado";
            const active = i === faseIdx && phase !== "completado" && phase !== "error";
            return (
              <div key={fase.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                    done    ? "bg-emerald-600" :
                    active  ? "bg-indigo-600" :
                    phase === "error" && i === faseIdx ? "bg-red-700" :
                              "bg-gray-800 border border-gray-700"
                  }`}>
                    {done ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : active ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : phase === "error" && i === faseIdx ? (
                      <AlertCircle className="w-4 h-4 text-white" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <p className={`text-xs mt-2 text-center max-w-16 leading-tight ${
                    done || active ? "text-white" : "text-gray-600"
                  }`}>{fase.label}</p>
                </div>
                {i < FASES.length - 1 && (
                  <div className={`h-px w-6 mx-1.5 mb-5 transition-colors duration-500 ${
                    done ? "bg-emerald-600" : "bg-gray-700"
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Barra de progreso */}
        <div className="mt-5 bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1.5 text-right">{progress}%</p>
      </div>

      {/* Log terminal */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-white font-medium text-sm">Orquestador multi-agente</span>
          </div>
          {!isFinished && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">En vivo</span>
            </div>
          )}
        </div>

        <div className="h-80 overflow-y-auto p-4 font-mono space-y-1.5">
          {logs.length === 0 && (
            <div className="flex items-center gap-2 text-gray-600 text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              Conectando con el orquestador...
            </div>
          )}
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-2 text-xs leading-relaxed">
              <span className="text-gray-600 flex-shrink-0 tabular-nums">{log.ts}</span>
              <span className={`flex-shrink-0 ${
                log.phase === "error"      ? "text-red-400" :
                log.phase === "completado" ? "text-emerald-400" :
                log.phase === "editando"   ? "text-yellow-400" :
                log.phase === "generando_imagenes" ? "text-pink-400" :
                                             "text-indigo-400"
              }`}>▸</span>
              <span className="text-gray-200">{log.message}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Resultado final — PDF listo */}
      {phase === "completado" && pdfUrl && (
        <div className="bg-emerald-950 border border-emerald-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold">¡Tu ebook está listo!</p>
                <p className="text-emerald-400 text-sm">Generado con sistema multi-agente IA</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href={`/preview/${proyecto.id}?print=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500
                           text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Abrir y guardar PDF
              </a>
              <a
                href={`/preview/${proyecto.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600
                           text-white px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                <FileText className="w-4 h-4" />
                Solo ver
              </a>
              <button
                onClick={() => router.push("/crear")}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5
                           rounded-xl text-sm transition-colors"
              >
                Crear otro
              </button>
            </div>
          </div>
          <div className="bg-emerald-900/40 rounded-xl px-4 py-3 text-xs text-emerald-300">
            💡 <span className="font-semibold">Para guardar como PDF:</span> haz clic en
            &quot;Abrir y guardar PDF&quot; → el diálogo de impresión se abrirá automáticamente →
            selecciona <span className="font-semibold">Guardar como PDF</span> como destino.
          </div>
        </div>
      )}

      {/* Error */}
      {phase === "error" && (
        <div className="bg-red-950 border border-red-800 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-medium text-sm">Error durante la generación</p>
            {errorMsg && <p className="text-red-400/80 text-xs mt-1">{errorMsg}</p>}
            <button
              onClick={() => router.push("/crear")}
              className="mt-3 text-xs bg-red-900 hover:bg-red-800 text-red-200 px-4 py-2 rounded-lg transition-colors"
            >
              Volver a intentar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
