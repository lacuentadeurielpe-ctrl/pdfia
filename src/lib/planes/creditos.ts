// ════════════════════════════════════════════════════════════════════
//  Lógica de créditos (servidor) — verificar, descontar y renovar
//  Usa el admin client (ignora RLS) porque corre en rutas de servidor.
// ════════════════════════════════════════════════════════════════════

import { createAdminClient } from "@/lib/supabase/admin";
import { getPlan, type PlanId, type PlanInterno } from "./config";

export interface Suscripcion {
  user_id:          string;
  plan:             PlanId;
  creditos_totales: number;
  creditos_usados:  number;
  ciclo_inicio:     string;
  ciclo_fin:        string;
}

export interface EstadoCreditos {
  suscripcion:  Suscripcion;
  plan:         PlanInterno;
  disponibles:  number;
}

/**
 * Obtiene la suscripción del usuario. La crea (plan gratis) si no existe,
 * y renueva el ciclo automáticamente si ya venció (reset perezoso).
 */
export async function getOrCreateSuscripcion(userId: string): Promise<EstadoCreditos> {
  const admin = createAdminClient();

  // 1. Buscar suscripción existente
  let { data: sus } = await admin
    .from("suscripciones")
    .select("user_id, plan, creditos_totales, creditos_usados, ciclo_inicio, ciclo_fin")
    .eq("user_id", userId)
    .single();

  // 2. Crear si no existe (plan gratis) — upsert para evitar error en concurrent requests
  if (!sus) {
    const gratis = getPlan("gratis");
    const ahora = new Date();
    const fin = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);
    const { data: nueva } = await admin
      .from("suscripciones")
      .upsert(
        {
          user_id:          userId,
          plan:             "gratis",
          creditos_totales: gratis.creditos,
          creditos_usados:  0,
          ciclo_inicio:     ahora.toISOString(),
          ciclo_fin:        fin.toISOString(),
        },
        { onConflict: "user_id", ignoreDuplicates: true }
      )
      .select("user_id, plan, creditos_totales, creditos_usados, ciclo_inicio, ciclo_fin")
      .single();
    // Si ignoreDuplicates=true y ya existía, re-fetch
    if (!nueva) {
      const { data: refetch } = await admin
        .from("suscripciones")
        .select("user_id, plan, creditos_totales, creditos_usados, ciclo_inicio, ciclo_fin")
        .eq("user_id", userId)
        .single();
      sus = refetch;
    } else {
      sus = nueva;
    }
  }

  let suscripcion = sus as Suscripcion;

  // 3. Renovar ciclo si venció (reset perezoso)
  if (new Date(suscripcion.ciclo_fin).getTime() < Date.now()) {
    const plan = getPlan(suscripcion.plan);
    const ahora = new Date();
    const fin = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);
    const { data: renovada } = await admin
      .from("suscripciones")
      .update({
        creditos_totales: plan.creditos,
        creditos_usados:  0,
        ciclo_inicio:     ahora.toISOString(),
        ciclo_fin:        fin.toISOString(),
        updated_at:       ahora.toISOString(),
      })
      .eq("user_id", userId)
      .select("user_id, plan, creditos_totales, creditos_usados, ciclo_inicio, ciclo_fin")
      .single();
    if (renovada) suscripcion = renovada as Suscripcion;
  }

  const plan = getPlan(suscripcion.plan);
  const disponibles = Math.max(0, suscripcion.creditos_totales - suscripcion.creditos_usados);

  return { suscripcion, plan, disponibles };
}

/**
 * Verifica si el usuario tiene suficientes créditos para un costo estimado.
 */
export async function verificarCreditos(
  userId: string,
  costoEstimado: number
): Promise<{ ok: boolean; disponibles: number; plan: PlanInterno }> {
  const { disponibles, plan } = await getOrCreateSuscripcion(userId);
  return { ok: disponibles >= costoEstimado, disponibles, plan };
}

/**
 * Descuenta créditos tras una generación — update atómico vía RPC (evita race condition).
 */
export async function descontarCreditos(userId: string, cantidad: number): Promise<void> {
  if (cantidad <= 0) return;
  const admin = createAdminClient();
  const { error } = await admin.rpc("incrementar_creditos_usados", {
    uid: userId,
    cantidad,
  });
  if (error) console.error("[creditos] Error descontando créditos:", error.message);
}

/**
 * Cambia el plan del usuario y reinicia su ciclo de créditos.
 * (Se llama cuando paga / actualiza plan.)
 */
export async function cambiarPlan(userId: string, nuevoPlan: PlanId): Promise<void> {
  const admin = createAdminClient();
  const plan = getPlan(nuevoPlan);
  const ahora = new Date();
  const fin = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);
  // upsert por si aún no tiene suscripción
  await admin
    .from("suscripciones")
    .upsert({
      user_id:          userId,
      plan:             nuevoPlan,
      creditos_totales: plan.creditos,
      creditos_usados:  0,
      ciclo_inicio:     ahora.toISOString(),
      ciclo_fin:        fin.toISOString(),
      updated_at:       ahora.toISOString(),
    }, { onConflict: "user_id" });
}
