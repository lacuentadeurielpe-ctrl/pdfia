import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Métricas globales para el dashboard del admin.
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const admin = createAdminClient();
  const hace30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: authData }, { data: subs }, { count: totalEbooks }, { count: ebooks30 }, { data: pagos }] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from("suscripciones").select("plan, ilimitado"),
    admin.from("pdfs_generados").select("*", { count: "exact", head: true }),
    admin.from("pdfs_generados").select("*", { count: "exact", head: true }).gte("created_at", hace30),
    admin.from("pagos").select("monto_soles, estado"),
  ]);

  const porPlan: Record<string, number> = {};
  let ilimitados = 0;
  for (const s of subs ?? []) {
    if (s.ilimitado) ilimitados++;
    porPlan[s.plan] = (porPlan[s.plan] ?? 0) + 1;
  }

  const aprobados = (pagos ?? []).filter((p) => p.estado === "aprobado" || p.estado === "approved");
  const ingresos = aprobados.reduce((sum, p) => sum + Number(p.monto_soles ?? 0), 0);

  return NextResponse.json({
    totalUsuarios: authData.users.length,
    nuevos30: authData.users.filter((u) => new Date(u.created_at) >= new Date(hace30)).length,
    ilimitados,
    porPlan,
    totalEbooks: totalEbooks ?? 0,
    ebooks30: ebooks30 ?? 0,
    ingresos,
    pagosAprobados: aprobados.length,
  });
}
