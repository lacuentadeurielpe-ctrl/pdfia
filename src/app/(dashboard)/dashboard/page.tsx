import { createClient } from "@/lib/supabase/server";
import { getOrCreateSuscripcion } from "@/lib/planes/creditos";
import Link from "next/link";
import { Sparkles, Clock, FileText, TrendingUp, CreditCard, AlertTriangle } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fecha de inicio de la semana actual
  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
  inicioSemana.setHours(0, 0, 0, 0);

  const [
    { count: totalPdfs },
    { count: estaSemana },
    { data: recientes },
    estadoCreditos,
  ] = await Promise.all([
    supabase
      .from("pdfs_generados")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("pdfs_generados")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .gte("created_at", inicioSemana.toISOString()),
    supabase
      .from("pdfs_generados")
      .select("id, titulo, created_at, modelo_ia, imagenes_generadas")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(5),
    getOrCreateSuscripcion(user!.id),
  ]);

  const { plan, disponibles, suscripcion } = estadoCreditos;
  const creditosPct = suscripcion.creditos_totales > 0
    ? Math.min(100, Math.round((disponibles / suscripcion.creditos_totales) * 100))
    : 0;
  const pocosCreditos = creditosPct <= 20;

  const cicloFin = new Date(suscripcion.ciclo_fin).toLocaleDateString("es-PE", {
    day: "numeric", month: "short",
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Bienvenido a FoxPDF — tu estudio de documentos con IA</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">PDFs Generados</span>
            <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{totalPdfs ?? 0}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Esta semana</span>
            <div className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{estaSemana ?? 0}</p>
        </div>
      </div>

      {/* Widget de créditos */}
      <div className={`bg-gray-900 border rounded-2xl p-5 mb-6 ${pocosCreditos ? "border-amber-700" : "border-gray-800"}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Créditos del plan</span>
            {pocosCreditos && (
              <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-950 border border-amber-800 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" /> Pocos créditos
              </span>
            )}
          </div>
          <Link href="/planes" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            {pocosCreditos ? "Renovar →" : "Ver planes →"}
          </Link>
        </div>
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-3xl font-bold text-white">{disponibles}</span>
            <span className="text-gray-500 text-sm ml-1">/ {suscripcion.creditos_totales} créditos</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Plan <span className="text-white font-medium">{plan.nombre}</span></p>
            <p className="text-xs text-gray-600">Renueva {cicloFin}</p>
          </div>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              creditosPct > 50 ? "bg-emerald-500" :
              creditosPct > 20 ? "bg-amber-500" : "bg-red-500"
            }`}
            style={{ width: `${creditosPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          1 crédito = 1 ebook sin imágenes · con imágenes flash = +1 crédito/img · con imágenes pro = +3 créditos/img
        </p>
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
              <Link
                key={pdf.id}
                href={`/preview/${pdf.id}`}
                className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl
                           px-5 py-4 flex items-center gap-4 transition-colors group"
              >
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
                <span className="text-gray-600 group-hover:text-gray-400 text-sm transition-colors">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
