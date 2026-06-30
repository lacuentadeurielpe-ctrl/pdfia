import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANES } from "@/lib/planes/config";
import type { PlanId } from "@/lib/planes/config";
import { sendEmail } from "@/lib/email/sender";
import { emailPlanReactivado } from "@/lib/email/templates";

export const dynamic = "force-dynamic";

// Reactiva un plan que estaba en cancelación pendiente (antes de que venza el ciclo)
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("suscripciones")
    .select("plan, estado, ciclo_fin")
    .eq("user_id", user.id)
    .single();

  if (!sub) return NextResponse.json({ error: "Suscripción no encontrada" }, { status: 404 });
  if (sub.estado !== "pendiente_cancelacion")
    return NextResponse.json({ error: "No hay ninguna cancelación pendiente." }, { status: 400 });

  // Si ya venció, no se puede reactivar por aquí — necesitaría nuevo pago
  if (new Date(sub.ciclo_fin) < new Date())
    return NextResponse.json({ error: "El ciclo ya venció. Renueva tu plan desde la sección Planes." }, { status: 400 });

  const { error } = await admin
    .from("suscripciones")
    .update({ estado: "activo", cancelado_en: null, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const nombre = (user.user_metadata?.nombre as string) ?? user.email ?? "Usuario";
  const planNombre = PLANES[(sub.plan as PlanId)]?.nombre ?? sub.plan;

  await sendEmail({
    to:      user.email ?? "",
    subject: "Tu plan está de vuelta — FoxPDF",
    html:    emailPlanReactivado(nombre, planNombre),
  });

  return NextResponse.json({ ok: true });
}
