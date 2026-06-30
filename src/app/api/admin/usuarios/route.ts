import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANES } from "@/lib/planes/config";

export const dynamic = "force-dynamic";

// Lista todos los usuarios con su plan, créditos y nº de ebooks.
export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const admin = createAdminClient();
  const url = new URL(req.url);
  const buscar = (url.searchParams.get("buscar") ?? "").toLowerCase().trim();
  const filtroPlan = url.searchParams.get("plan") ?? "";

  // 1. Usuarios de auth
  const { data: authData, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 2. Suscripciones y conteo de ebooks
  const [{ data: subs }, { data: pdfs }] = await Promise.all([
    admin.from("suscripciones").select("user_id, plan, creditos_totales, creditos_usados, ciclo_fin, ilimitado, origen"),
    admin.from("pdfs_generados").select("user_id"),
  ]);

  const subMap = new Map((subs ?? []).map((s) => [s.user_id, s]));
  const pdfCount = new Map<string, number>();
  for (const p of pdfs ?? []) pdfCount.set(p.user_id, (pdfCount.get(p.user_id) ?? 0) + 1);

  let usuarios = authData.users.map((u) => {
    const sub = subMap.get(u.id);
    const planId = sub?.plan ?? "gratis";
    return {
      id:           u.id,
      email:        u.email ?? "",
      nombre:       (u.user_metadata?.nombre as string) ?? "",
      creadoEl:     u.created_at,
      ultimoLogin:  u.last_sign_in_at ?? null,
      confirmado:   !!u.email_confirmed_at,
      plan:         planId,
      planNombre:   PLANES[planId as keyof typeof PLANES]?.nombre ?? planId,
      ilimitado:    sub?.ilimitado ?? false,
      origen:       sub?.origen ?? "auto",
      creditosTotales:  sub?.creditos_totales ?? 0,
      creditosUsados:   sub?.creditos_usados ?? 0,
      creditosDisponibles: sub?.ilimitado ? 9999 : Math.max(0, (sub?.creditos_totales ?? 0) - (sub?.creditos_usados ?? 0)),
      cicloFin:     sub?.ciclo_fin ?? null,
      ebooks:       pdfCount.get(u.id) ?? 0,
    };
  });

  if (buscar) usuarios = usuarios.filter((u) => u.email.toLowerCase().includes(buscar) || u.nombre.toLowerCase().includes(buscar));
  if (filtroPlan) usuarios = usuarios.filter((u) => filtroPlan === "ilimitado" ? u.ilimitado : u.plan === filtroPlan);

  usuarios.sort((a, b) => new Date(b.creadoEl).getTime() - new Date(a.creadoEl).getTime());

  return NextResponse.json({ usuarios, total: usuarios.length });
}
