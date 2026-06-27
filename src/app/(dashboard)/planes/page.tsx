import { createClient } from "@/lib/supabase/server";
import { getOrCreateSuscripcion } from "@/lib/planes/creditos";
import PlanesCards from "@/components/planes/PlanesCards";
import { Zap } from "lucide-react";

export default async function PlanesPage({
  searchParams,
}: {
  searchParams: Promise<{ pago?: string; plan?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { suscripcion, plan, disponibles } = await getOrCreateSuscripcion(user!.id);
  const { pago, plan: planActivado } = await searchParams;

  const cicloFin = new Date(suscripcion.ciclo_fin).toLocaleDateString("es-PE", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Planes y créditos</h1>
        <p className="text-gray-400 text-sm mt-1">Elige el plan que mejor se adapte a tu flujo de trabajo.</p>
      </div>

      {/* Mensaje post-pago */}
      {pago === "exitoso" && planActivado && (
        <div className="mb-6 bg-emerald-950 border border-emerald-700 rounded-2xl px-5 py-4 flex items-center gap-3">
          <Zap className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-emerald-300 font-semibold">¡Pago exitoso! Tu plan ha sido activado.</p>
            <p className="text-emerald-500 text-sm">Ahora tienes acceso a todas las funciones del plan {planActivado}.</p>
          </div>
        </div>
      )}
      {pago === "fallido" && (
        <div className="mb-6 bg-red-950 border border-red-800 rounded-2xl px-5 py-4">
          <p className="text-red-400 font-semibold">El pago no se pudo completar. Intenta nuevamente.</p>
        </div>
      )}
      {pago === "pendiente" && (
        <div className="mb-6 bg-yellow-950 border border-yellow-800 rounded-2xl px-5 py-4">
          <p className="text-yellow-400 font-semibold">Pago en proceso. Recibirás confirmación pronto.</p>
        </div>
      )}

      {/* Resumen del plan actual */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-8 flex flex-wrap gap-6 items-center">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Plan actual</p>
          <p className="text-white font-bold text-xl">{plan.nombre}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Créditos disponibles</p>
          <p className="text-white font-bold text-xl">
            {disponibles} <span className="text-gray-500 font-normal text-sm">/ {suscripcion.creditos_totales}</span>
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Ciclo termina</p>
          <p className="text-white font-bold">{cicloFin}</p>
        </div>
        <div className="flex-1 min-w-48">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{suscripcion.creditos_usados} usados</span>
            <span>{disponibles} restantes</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (suscripcion.creditos_usados / suscripcion.creditos_totales) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <PlanesCards planActual={plan.id} />
    </div>
  );
}
