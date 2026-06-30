import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANES } from "@/lib/planes/config";
import type { PlanId } from "@/lib/planes/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = createAdminClient();
  const [{ data: sub }, { data: pagos }, { data: metodos }] = await Promise.all([
    admin.from("suscripciones").select("*").eq("user_id", user.id).single(),
    admin.from("pagos").select("id, plan_id, monto_soles, estado, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    admin.from("metodos_pago").select("*").eq("user_id", user.id).eq("activo", true),
  ]);

  const planId = (sub?.plan ?? "gratis") as PlanId;
  const planInfo = PLANES[planId] ?? PLANES.gratis;

  return NextResponse.json({
    usuario: {
      id:     user.id,
      email:  user.email ?? "",
      nombre: (user.user_metadata?.nombre as string) ?? "",
    },
    suscripcion: sub ?? null,
    planInfo: {
      id:      planInfo.id,
      nombre:  planInfo.nombre,
      precio:  planInfo.precioSoles,
    },
    pagos:    pagos ?? [],
    metodos:  metodos ?? [],
  });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { nombre } = await req.json();
  if (!nombre?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, nombre: nombre.trim() },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
