import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANES } from "@/lib/planes/config";
import type { PlanId } from "@/lib/planes/config";
import { sendEmail } from "@/lib/email/sender";
import { emailPlanCancelado } from "@/lib/email/templates";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("suscripciones")
    .select("plan, ciclo_fin, estado, ilimitado")
    .eq("user_id", user.id)
    .single();

  if (!sub) return NextResponse.json({ error: "Suscripción no encontrada" }, { status: 404 });

  // No cancelar si ya está en proceso de cancelación o en plan gratis
  if (sub.plan === "gratis")
    return NextResponse.json({ error: "El plan Gratis no tiene suscripción activa." }, { status: 400 });
  if (sub.estado === "pendiente_cancelacion")
    return NextResponse.json({ error: "Ya tienes una cancelación en proceso." }, { status: 400 });

  const { error } = await admin
    .from("suscripciones")
    .update({
      estado:       "pendiente_cancelacion",
      cancelado_en: new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Email de confirmación
  const nombre = (user.user_metadata?.nombre as string) ?? user.email ?? "Usuario";
  const planNombre = PLANES[(sub.plan as PlanId)]?.nombre ?? sub.plan;
  const fechaVencimiento = new Date(sub.ciclo_fin).toLocaleDateString("es-PE", {
    day: "numeric", month: "long", year: "numeric",
  });

  await sendEmail({
    to:      user.email ?? "",
    subject: "Tu plan fue cancelado — FoxPDF",
    html:    emailPlanCancelado(nombre, planNombre, fechaVencimiento),
  });

  return NextResponse.json({
    ok: true,
    mensaje: `Tu plan quedará activo hasta el ${fechaVencimiento}. Luego pasará a Gratis automáticamente.`,
    cicloFin: sub.ciclo_fin,
  });
}
