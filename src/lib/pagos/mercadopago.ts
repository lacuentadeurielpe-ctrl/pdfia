import MercadoPagoConfig, { Preference, Payment } from "mercadopago";
import { PLANES, type PlanId } from "@/lib/planes/config";

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN!;

function getClient() {
  return new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
}

export interface PreferenciaInput {
  userId:    string;
  userEmail: string;
  planId:    PlanId;
}

export async function crearPreferencia(input: PreferenciaInput) {
  const plan = PLANES[input.planId];
  if (!plan || plan.precioSoles === 0) throw new Error("Plan no válido para pago");

  const client = getClient();
  const preference = new Preference(client);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://foxpdf.cloud";

  const result = await preference.create({
    body: {
      items: [
        {
          id:          plan.id,
          title:       `FoxPDF — Plan ${plan.nombre}`,
          description: `Suscripción mensual FoxPDF Plan ${plan.nombre}`,
          quantity:    1,
          unit_price:  plan.precioSoles,
          currency_id: "PEN",
        },
      ],
      payer: { email: input.userEmail },
      back_urls: {
        success: `${baseUrl}/planes?pago=exitoso&plan=${plan.id}`,
        failure: `${baseUrl}/planes?pago=fallido`,
        pending: `${baseUrl}/planes?pago=pendiente`,
      },
      auto_return:       "approved",
      notification_url:  `${baseUrl}/api/pagos/webhook`,
      external_reference: input.userId,          // user_id para recuperarlo en el webhook
      metadata: {
        user_id: input.userId,
        plan_id: plan.id,
      },
      statement_descriptor: "FoxPDF",
    },
  });

  return result;
}

// Obtiene el detalle de un pago MP (para verificar estado en el webhook)
export async function obtenerPago(paymentId: string) {
  const client = getClient();
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
}
