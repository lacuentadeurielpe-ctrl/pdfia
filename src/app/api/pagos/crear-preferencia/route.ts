import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { crearPreferencia } from "@/lib/pagos/mercadopago";
import type { PlanId } from "@/lib/planes/config";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { planId } = await req.json() as { planId: PlanId };
  if (!planId) return NextResponse.json({ error: "planId requerido" }, { status: 400 });

  try {
    const preferencia = await crearPreferencia({
      userId:    user.id,
      userEmail: user.email ?? "",
      planId,
    });

    return NextResponse.json({
      preferenceId: preferencia.id,
      initPoint:    preferencia.init_point,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al crear preferencia";
    console.error("[crear-preferencia]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
