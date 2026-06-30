// ════════════════════════════════════════════════════════════════════
//  Autorización de SUPERADMIN (server-only)
//  Doble verificación: env var de respaldo (no te puedes auto-bloquear)
//  + tabla admin_roles (para nombrar otros admins desde el panel).
//  Todas las rutas /admin y /api/admin deben llamar a getAdminSession().
// ════════════════════════════════════════════════════════════════════

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const ENV_ADMINS = (process.env.SUPERADMIN_EMAILS ?? "lacuentadeurielpe@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function esAdmin(userId: string, email?: string | null): Promise<boolean> {
  if (email && ENV_ADMINS.includes(email.toLowerCase())) return true;
  const admin = createAdminClient();
  const { data } = await admin
    .from("admin_roles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

export interface AdminSession {
  userId: string;
  email: string;
}

/** Devuelve la sesión admin, o null si no hay sesión o no es admin. */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (!(await esAdmin(user.id, user.email))) return null;
  return { userId: user.id, email: user.email ?? "" };
}

/** Registra una acción en la auditoría (admin_acciones). */
export async function logAccion(
  adminId: string,
  accion: string,
  targetUserId: string | null,
  detalle: Record<string, unknown>
): Promise<void> {
  const admin = createAdminClient();
  await admin.from("admin_acciones").insert({
    admin_id: adminId,
    accion,
    target_user_id: targetUserId,
    detalle,
  });
}
