// ════════════════════════════════════════════════════════════════════
//  Email sender — usa Resend si RESEND_API_KEY está configurado,
//  si no registra en consola (modo dev / sin credenciales).
//  Para activar: agrega RESEND_API_KEY en Vercel env vars.
// ════════════════════════════════════════════════════════════════════

export interface EmailPayload {
  to:      string;
  subject: string;
  html:    string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Sin credenciales → solo log (desarrollo / sin Resend aún)
    console.log(`[email] Para: ${payload.to} | Asunto: ${payload.subject}`);
    console.log(`[email] (RESEND_API_KEY no configurado — email no enviado)`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method:  "POST",
    headers: {
      Authorization:  `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:    "FoxPDF <noreply@foxpdf.cloud>",
      to:      [payload.to],
      subject: payload.subject,
      html:    payload.html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[email] Error Resend:", err);
  }
}
