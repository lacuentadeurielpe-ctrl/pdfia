import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { obtenerPago } from "@/lib/pagos/mercadopago";
import { cambiarPlan } from "@/lib/planes/creditos";
import { PLANES, type PlanId } from "@/lib/planes/config";
import { createHmac } from "crypto";

export const dynamic = "force-dynamic";

// Verifica la firma HMAC que MercadoPago envía en x-signature
function verificarFirma(req: NextRequest, body: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true; // si no está configurado, no bloqueamos (dev)

  const signature = req.headers.get("x-signature") ?? "";
  const requestId = req.headers.get("x-request-id") ?? "";

  const tsMatch = signature.match(/ts=([^,]+)/);
  const v1Match = signature.match(/v1=([^,]+)/);
  if (!tsMatch || !v1Match) return false;

  const ts = tsMatch[1];
  const v1 = v1Match[1];

  // Cadena a firmar según documentación MP
  const dataId = JSON.parse(body)?.data?.id ?? "";
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  return expected === v1;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!verificarFirma(req, rawBody)) {
    console.warn("[webhook-mp] Firma inválida");
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  let event: { type?: string; data?: { id?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  // Solo procesamos pagos
  if (event.type !== "payment") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const paymentId = event.data?.id;
  if (!paymentId) return NextResponse.json({ error: "Sin ID de pago" }, { status: 400 });

  try {
    const pago = await obtenerPago(String(paymentId));
    const admin = createAdminClient();

    // Evitar doble procesamiento
    const { data: existing } = await admin
      .from("pagos")
      .select("id")
      .eq("mp_payment_id", String(paymentId))
      .single();

    if (existing) {
      return NextResponse.json({ ok: true, skipped: "ya_procesado" });
    }

    const userId  = pago.metadata?.user_id as string | undefined ?? pago.external_reference ?? "";
    const planId  = pago.metadata?.plan_id as PlanId | undefined;
    const monto   = pago.transaction_amount ?? 0;
    const estado  = pago.status ?? "unknown";

    // Registrar el pago
    await admin.from("pagos").insert({
      user_id:         userId,
      plan_id:         planId ?? "desconocido",
      mp_payment_id:   String(paymentId),
      mp_preference_id: (pago as unknown as Record<string, unknown>).preference_id as string ?? null,
      monto_soles:     monto,
      estado,
      metadata:        pago as unknown as Record<string, unknown>,
    });

    // Activar el plan si el pago fue aprobado
    if (estado === "approved" && planId && PLANES[planId]) {
      await cambiarPlan(userId, planId);
      console.log(`[webhook-mp] Plan ${planId} activado para ${userId}`);
    }

    return NextResponse.json({ ok: true, estado });
  } catch (err) {
    console.error("[webhook-mp] Error procesando pago:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
