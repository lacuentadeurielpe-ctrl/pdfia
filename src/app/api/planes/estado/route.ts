import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateSuscripcion } from "@/lib/planes/creditos";

export const dynamic = "force-dynamic";

// Estado del plan y créditos del usuario actual (para el dashboard y el form de crear).
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { suscripcion, plan, disponibles } = await getOrCreateSuscripcion(user.id);

  return NextResponse.json({
    plan: {
      id:               plan.id,
      nombre:           plan.nombre,
      calidades:        plan.calidades,
      permiteImagenes:  plan.permiteImagenes,
      capitulosMax:     plan.capitulosMax,
    },
    creditos: {
      totales:     suscripcion.creditos_totales,
      usados:      suscripcion.creditos_usados,
      disponibles,
    },
    cicloFin: suscripcion.ciclo_fin,
  });
}
