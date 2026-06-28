import { createClient } from "@/lib/supabase/server";
import { getOrCreateSuscripcion } from "@/lib/planes/creditos";
import { FileText, Download, Sparkles, Lock } from "lucide-react";
import Link from "next/link";

export default async function HistorialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { plan } = await getOrCreateSuscripcion(user!.id);
  const historialDias = plan.historialDias; // null = ilimitado

  // Corte de fecha para planes con historial limitado
  const cutoff = historialDias
    ? new Date(Date.now() - historialDias * 24 * 60 * 60 * 1000).toISOString()
    : null;

  // Traer todos (para contar totales) — visible vs. oculto según plan
  const { data: todos } = await supabase
    .from("pdfs_generados")
    .select("id, titulo, created_at, modelo_ia, imagenes_generadas, num_paginas, proyecto_id")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const pdfs = todos ?? [];
  const visibles = cutoff ? pdfs.filter((p) => p.created_at >= cutoff) : pdfs;
  const bloqueados = cutoff ? pdfs.filter((p) => p.created_at < cutoff) : [];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Historial de PDFs</h1>
          <p className="text-gray-400 text-sm mt-1">
            {visibles.length} documento{visibles.length !== 1 ? "s" : ""} disponible{visibles.length !== 1 ? "s" : ""}
            {historialDias ? ` · Plan ${plan.nombre}: últimos ${historialDias} días` : ""}
          </p>
        </div>
        <Link href="/crear"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white
                     font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <Sparkles className="w-4 h-4" />
          Crear nuevo
        </Link>
      </div>

      {/* Aviso de historial limitado */}
      {historialDias && bloqueados.length > 0 && (
        <div className="mb-5 bg-amber-950/50 border border-amber-700/50 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-amber-300 text-sm">
              Tienes <strong>{bloqueados.length} PDF{bloqueados.length > 1 ? "s" : ""} anteriores</strong> que no se muestran en el plan gratuito.
              Mejora tu plan para acceder a historial ilimitado.
            </p>
          </div>
          <Link href="/planes"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex-shrink-0 transition-colors">
            Ver planes →
          </Link>
        </div>
      )}

      {!visibles.length ? (
        <div className="bg-gray-900 border border-gray-800 border-dashed rounded-2xl p-16 text-center">
          <FileText className="w-10 h-10 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">Aún no has generado ningún PDF</p>
          <Link href="/crear" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block transition-colors">
            Crear el primero →
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {visibles.map((pdf) => (
            <div key={pdf.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-5 hover:border-gray-700 transition-colors">
              <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-600/20 rounded-xl
                              flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{pdf.titulo}</p>
                <p className="text-gray-500 text-xs mt-0.5 truncate">
                  {new Date(pdf.created_at).toLocaleDateString("es-PE", {
                    day: "2-digit", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-gray-600">{pdf.modelo_ia}</span>
                  {pdf.imagenes_generadas > 0 && (
                    <span className="text-xs text-emerald-500">✦ {pdf.imagenes_generadas} imágenes IA</span>
                  )}
                  {pdf.num_paginas && (
                    <span className="text-xs text-gray-600">{pdf.num_paginas} págs</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`/preview/${pdf.proyecto_id}?print=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500
                             text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Guardar PDF
                </a>
                <a
                  href={`/preview/${pdf.proyecto_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700
                             text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Ver
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
