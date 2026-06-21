"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Circle, Loader2, AlertCircle, Download, Sparkles } from "lucide-react";

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
  agente: string;
  estado: "running" | "completed" | "error";
  mensaje: string;
  ts: string;
}

const AGENT_ICONS: Record<string, string> = {
  director: "🎬",
  planificador: "📋",
  escritor: "✍️",
  visual: "🖼️",
  editor: "🔍",
  ensamblador: "📄",
};

export default function GeneradorClient({ proyecto }: { proyecto: Proyecto }) {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [estado, setEstado] = useState(proyecto.estado);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [iniciado, setIniciado] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const esFinished = ["completado", "error"].includes(estado);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (iniciado || esFinished) return;
    setIniciado(true);

    // Iniciar generación vía SSE
    const source = new EventSource(`/api/pdf/generar/${proyecto.id}`);

    source.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "log") {
          setLogs((prev) => [...prev, {
            agente: data.agente,
            estado: data.estado,
            mensaje: data.mensaje,
            ts: new Date().toLocaleTimeString("es-PE"),
          }]);
        } else if (data.type === "estado") {
          setEstado(data.estado);
        } else if (data.type === "done") {
          setPdfUrl(data.pdfUrl);
          setEstado("completado");
          source.close();
        } else if (data.type === "error") {
          setEstado("error");
          source.close();
        }
      } catch {}
    };

    source.onerror = () => {
      setLogs((prev) => [...prev, {
        agente: "sistema",
        estado: "error",
        mensaje: "Conexión perdida con el servidor",
        ts: new Date().toLocaleTimeString("es-PE"),
      }]);
      source.close();
    };

    return () => source.close();
  }, [proyecto.id, iniciado, esFinished]);

  const FASES = [
    { key: "planificando",         label: "Planificando estructura" },
    { key: "escribiendo",          label: "Escribiendo capítulos" },
    { key: "generando_imagenes",   label: "Generando imágenes IA" },
    { key: "ensamblando",          label: "Ensamblando PDF" },
    { key: "completado",           label: "¡PDF listo!" },
  ];

  const faseIdx = FASES.findIndex((f) => f.key === estado);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{proyecto.titulo}</h1>
        <p className="text-gray-400 text-sm mt-1">
          {proyecto.num_capitulos} capítulos · {proyecto.modelo_ia} · tono {proyecto.tono}
        </p>
      </div>

      {/* Progress steps */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          {FASES.map((fase, i) => (
            <div key={fase.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  i < faseIdx
                    ? "bg-emerald-600"
                    : i === faseIdx && estado !== "completado"
                    ? "bg-indigo-600 animate-pulse"
                    : estado === "completado" && i === faseIdx
                    ? "bg-emerald-600"
                    : "bg-gray-800 border border-gray-700"
                }`}>
                  {i < faseIdx || (estado === "completado" && i <= faseIdx) ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : i === faseIdx ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <p className={`text-xs mt-2 text-center max-w-20 leading-tight ${
                  i <= faseIdx ? "text-white" : "text-gray-600"
                }`}>{fase.label}</p>
              </div>
              {i < FASES.length - 1 && (
                <div className={`h-px w-8 mx-2 mb-5 transition-colors ${
                  i < faseIdx ? "bg-emerald-600" : "bg-gray-700"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Logs */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-white font-medium text-sm">Orquestador en tiempo real</span>
          </div>
          {estado !== "completado" && estado !== "error" && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">Trabajando...</span>
            </div>
          )}
        </div>

        <div className="h-72 overflow-y-auto p-4 font-mono space-y-2">
          {logs.length === 0 && (
            <div className="flex items-center gap-2 text-gray-600 text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              Iniciando orquestador...
            </div>
          )}
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="text-gray-600 flex-shrink-0 w-16">{log.ts}</span>
              <span className="flex-shrink-0">{AGENT_ICONS[log.agente] ?? "🤖"}</span>
              <span className={`flex-shrink-0 w-24 font-semibold ${
                log.estado === "error" ? "text-red-400" :
                log.estado === "completed" ? "text-emerald-400" : "text-indigo-400"
              }`}>[{log.agente}]</span>
              <span className="text-gray-300">{log.mensaje}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Estado final */}
      {estado === "completado" && pdfUrl && (
        <div className="bg-emerald-950 border border-emerald-800 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <div>
              <p className="text-white font-bold">¡Tu PDF está listo!</p>
              <p className="text-emerald-400 text-sm">Generado exitosamente con IA multi-agente</p>
            </div>
          </div>
          <div className="flex gap-3">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white
                         font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
              <Download className="w-4 h-4" />
              Descargar PDF
            </a>
            <button onClick={() => router.push("/crear")}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl text-sm transition-colors">
              Crear otro
            </button>
          </div>
        </div>
      )}

      {estado === "error" && (
        <div className="bg-red-950 border border-red-800 rounded-2xl p-5 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">Ocurrió un error durante la generación. Revisa los logs y vuelve a intentarlo.</p>
        </div>
      )}
    </div>
  );
}
