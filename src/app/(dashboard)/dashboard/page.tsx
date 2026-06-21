import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Sparkles, Clock, FileText, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ count: totalPdfs }, { data: recientes }] = await Promise.all([
    supabase.from("pdfs_generados").select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase.from("pdfs_generados").select("id, titulo, created_at, modelo_ia, imagenes_generadas")
      .eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "PDFs Generados", value: totalPdfs ?? 0, icon: FileText, color: "indigo" },
    { label: "Esta semana", value: 0, icon: TrendingUp, color: "emerald" },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Bienvenido a PDFIA — tu estudio de documentos con IA</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">{label}</span>
              <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                <Icon className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/crear"
        className="flex items-center gap-4 bg-indigo-600 hover:bg-indigo-500 transition-colors
                   rounded-2xl p-6 mb-8 group"
      >
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-lg">Crear nuevo PDF con IA</p>
          <p className="text-indigo-200 text-sm">Genera ebooks completos, guías y documentos profesionales</p>
        </div>
        <div className="ml-auto text-white/40 group-hover:text-white/80 transition-colors text-2xl">→</div>
      </Link>

      {/* Recientes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">PDFs recientes</h2>
          <Link href="/historial" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
            Ver todos →
          </Link>
        </div>
        {!recientes?.length ? (
          <div className="bg-gray-900 border border-gray-800 border-dashed rounded-2xl p-10 text-center">
            <Clock className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aún no has generado ningún PDF</p>
            <Link href="/crear" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block transition-colors">
              Crear el primero →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recientes.map((pdf) => (
              <div key={pdf.id}
                className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center gap-4">
                <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{pdf.titulo}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(pdf.created_at).toLocaleDateString("es-PE")} ·{" "}
                    {pdf.modelo_ia} · {pdf.imagenes_generadas} imágenes
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
