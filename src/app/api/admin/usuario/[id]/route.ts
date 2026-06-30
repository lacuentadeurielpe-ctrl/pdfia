import { NextResponse } from "next/server";
import { getAdminSession, logAccion } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANES, type PlanId } from "@/lib/planes/config";

export const dynamic = "force-dynamic";

// Detalle completo de un cliente.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: authUser }, { data: sub }, { data: ebooks }, { data: pagos }, { data: acciones }, { data: config }] = await Promise.all([
    admin.auth.admin.getUserById(id),
    admin.from("suscripciones").select("*").eq("user_id", id).maybeSingle(),
    admin.from("pdfs_generados").select("id, titulo, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
    admin.from("pagos").select("id, plan_id, monto_soles, estado, created_at").eq("user_id", id).order("created_at", { ascending: false }),
    admin.from("admin_acciones").select("accion, detalle, created_at").eq("target_user_id", id).order("created_at", { ascending: false }).limit(20),
    admin.from("configuraciones_negocio").select("nombre_negocio").eq("user_id", id).maybeSingle(),
  ]);

  const u = authUser?.user;
  if (!u) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  return NextResponse.json({
    usuario: {
      id: u.id,
      email: u.email ?? "",
      nombre: (u.user_metadata?.nombre as string) ?? "",
      negocio: config?.nombre_negocio ?? "",
      creadoEl: u.created_at,
      ultimoLogin: u.last_sign_in_at ?? null,
      confirmado: !!u.email_confirmed_at,
    },
    suscripcion: sub ?? null,
    planNombre: sub ? (PLANES[sub.plan as PlanId]?.nombre ?? sub.plan) : "Gratis",
    ebooks: ebooks ?? [],
    pagos: pagos ?? [],
    acciones: acciones ?? [],
  });
}

// Acciones del admin sobre un cliente: cambiar plan, ilimitado, créditos.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  const admin = createAdminClient();
  const body = await req.json();
  const { accion } = body as { accion: string };

  const ahora = new Date().toISOString();

  // Asegura que exista la suscripción
  const { data: existente } = await admin.from("suscripciones").select("user_id").eq("user_id", id).maybeSingle();
  if (!existente) {
    const fin = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await admin.from("suscripciones").insert({ user_id: id, plan: "gratis", creditos_totales: 5, creditos_usados: 0, ciclo_inicio: ahora, ciclo_fin: fin });
  }

  if (accion === "plan") {
    const nuevoPlan = body.plan as PlanId;
    const plan = PLANES[nuevoPlan];
    if (!plan) return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
    const fin = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await admin.from("suscripciones").update({
      plan: nuevoPlan, creditos_totales: plan.creditos, creditos_usados: 0,
      ciclo_inicio: ahora, ciclo_fin: fin, origen: "manual", updated_at: ahora,
    }).eq("user_id", id);
    await logAccion(session.userId, "cambiar_plan", id, { plan: nuevoPlan });

  } else if (accion === "ilimitado") {
    const valor = !!body.valor;
    await admin.from("suscripciones").update({ ilimitado: valor, origen: valor ? "manual" : "auto", updated_at: ahora }).eq("user_id", id);
    await logAccion(session.userId, valor ? "activar_ilimitado" : "quitar_ilimitado", id, {});

  } else if (accion === "creditos") {
    const modo = body.modo as "sumar" | "fijar";
    const cantidad = Math.max(0, parseInt(String(body.cantidad), 10) || 0);
    if (modo === "sumar") {
      await admin.rpc("admin_sumar_creditos", { p_user_ids: [id], p_cantidad: cantidad });
    } else {
      await admin.from("suscripciones").update({ creditos_totales: cantidad, creditos_usados: 0, origen: "regalo", updated_at: ahora }).eq("user_id", id);
    }
    await logAccion(session.userId, "ajustar_creditos", id, { modo, cantidad });

  } else {
    return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
