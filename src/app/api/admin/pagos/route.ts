import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Pagos de MercadoPago + registro de auditoría del admin.
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const admin = createAdminClient();
  const [{ data: pagos }, { data: acciones }, { data: authData }] = await Promise.all([
    admin.from("pagos").select("id, user_id, plan_id, monto_soles, estado, created_at").order("created_at", { ascending: false }).limit(100),
    admin.from("admin_acciones").select("accion, target_user_id, detalle, created_at").order("created_at", { ascending: false }).limit(50),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const emailMap = new Map((authData?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  return NextResponse.json({
    pagos: (pagos ?? []).map((p) => ({ ...p, email: emailMap.get(p.user_id) ?? "—" })),
    acciones: (acciones ?? []).map((a) => ({ ...a, email: a.target_user_id ? (emailMap.get(a.target_user_id) ?? "—") : "—" })),
  });
}
