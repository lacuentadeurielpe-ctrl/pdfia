import { createClient } from "@/lib/supabase/server";
import { FileText, Download, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function HistorialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: pdfs } = await supabase
    .from("pdfs_generados")
    .select("*, proyectos_pdf(contexto)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Historial de PDFs</h1>
          <p className="text-gray-400 text-sm mt-1">{pdfs?.length ?? 0} documentos generados</p>
        </div>
        <Link href="/crear"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white
                     font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <Sparkles className="w-4 h-4" />
          Crear nuevo
        </Link>
      </div>

      {!pdfs?.length ? (
        <div className="bg-gray-900 border border-gray-800 border-dashed rounded-2xl p-16 text-center">
          <FileText className="w-10 h-10 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">Aún no has generado ningún PDF</p>
          <Link href="/crear" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block transition-colors">
            Crear el primero →
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {pdfs.map((pdf) => (
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
                    hour: "2-digit", minute: "2-digit"
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
