import { NextResponse } from "next/server";
import { getAdminSession, logAccion } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Regala créditos a un grupo de usuarios.
// grupo: "todos" | "plan:<id>" | "ilimitado" | "lista" (con emails)
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const admin = createAdminClient();
  const { grupo, cantidad, emails } = await req.json() as { grupo: string; cantidad: number; emails?: string[] };
  const monto = Math.max(0, parseInt(String(cantidad), 10) || 0);
  if (monto <= 0) return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });

  let userIds: string[] = [];

  if (grupo === "lista") {
    const set = new Set((emails ?? []).map((e) => e.trim().toLowerCase()).filter(Boolean));
    if (set.size === 0) return NextResponse.json({ error: "Lista de correos vacía" }, { status: 400 });
    const { data: authData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    userIds = authData.users.filter((u) => u.email && set.has(u.email.toLowerCase())).map((u) => u.id);
  } else if (grupo === "todos") {
    const { data } = await admin.from("suscripciones").select("user_id");
    userIds = (data ?? []).map((s) => s.user_id);
  } else if (grupo === "ilimitado") {
    const { data } = await admin.from("suscripciones").select("user_id").eq("ilimitado", true);
    userIds = (data ?? []).map((s) => s.user_id);
  } else if (grupo.startsWith("plan:")) {
    const planId = grupo.slice(5);
    const { data } = await admin.from("suscripciones").select("user_id").eq("plan", planId);
    userIds = (data ?? []).map((s) => s.user_id);
  } else {
    return NextResponse.json({ error: "Grupo inválido" }, { status: 400 });
  }

  if (userIds.length === 0) return NextResponse.json({ ok: true, afectados: 0 });

  const { data: afectados, error } = await admin.rpc("admin_sumar_creditos", { p_user_ids: userIds, p_cantidad: monto });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAccion(session.userId, "regalo_masivo", null, { grupo, cantidad: monto, afectados: afectados ?? userIds.length });
  return NextResponse.json({ ok: true, afectados: afectados ?? userIds.length });
}
