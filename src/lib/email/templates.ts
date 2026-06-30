// Templates HTML de email transaccional — FoxPDF

const BASE = (contenido: string) => `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:Inter,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 0">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:16px;overflow:hidden">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 40px">
          <div style="font-size:22px;font-weight:800;color:white">Fox<span style="color:#f59e0b">PDF</span></div>
        </td></tr>
        <!-- Contenido -->
        <tr><td style="padding:36px 40px;color:#e2e8f0">
          ${contenido}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid #334155;text-align:center">
          <p style="color:#475569;font-size:12px;margin:0">
            FoxPDF · <a href="https://foxpdf.cloud" style="color:#6366f1;text-decoration:none">foxpdf.cloud</a>
            · <a href="https://foxpdf.cloud/privacidad" style="color:#475569;text-decoration:none">Privacidad</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export const emailPlanCancelado = (nombre: string, planNombre: string, fechaVencimiento: string) =>
  BASE(`
    <h2 style="color:white;margin:0 0 12px;font-size:20px">Tu plan fue cancelado</h2>
    <p style="color:#94a3b8;margin:0 0 20px">Hola ${nombre},</p>
    <p style="line-height:1.7;margin:0 0 20px">
      Hemos recibido tu solicitud de cancelación. Tu plan <strong style="color:white">${planNombre}</strong>
      seguirá activo con todas sus funciones hasta el
      <strong style="color:#f59e0b">${fechaVencimiento}</strong>.
    </p>
    <p style="line-height:1.7;margin:0 0 20px;color:#94a3b8">
      Después de esa fecha, tu cuenta pasará automáticamente al plan Gratis y conservarás
      todos los ebooks que creaste.
    </p>
    <div style="background:#1e293b;border-radius:12px;padding:20px;margin:24px 0">
      <p style="margin:0 0 8px;color:#94a3b8;font-size:13px">¿Cambiaste de opinión?</p>
      <p style="margin:0;font-size:13px;line-height:1.6">
        Puedes reactivar tu plan en cualquier momento desde
        <a href="https://foxpdf.cloud/perfil" style="color:#6366f1">tu perfil</a>
        antes de que venza el ciclo.
      </p>
    </div>
    <a href="https://foxpdf.cloud" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
      Volver a FoxPDF
    </a>
  `);

export const emailPlanReactivado = (nombre: string, planNombre: string) =>
  BASE(`
    <h2 style="color:white;margin:0 0 12px;font-size:20px">¡Tu plan está de vuelta! 🎉</h2>
    <p style="color:#94a3b8;margin:0 0 20px">Hola ${nombre},</p>
    <p style="line-height:1.7;margin:0 0 20px">
      Has reactivado tu plan <strong style="color:white">${planNombre}</strong>.
      Todo sigue como estaba — tus créditos, tus ebooks y tu acceso completo.
    </p>
    <a href="https://foxpdf.cloud/crear" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
      Crear un ebook ahora
    </a>
  `);

export const emailPlanActualizado = (nombre: string, planAnterior: string, planNuevo: string, creditos: number) =>
  BASE(`
    <h2 style="color:white;margin:0 0 12px;font-size:20px">Plan actualizado con éxito ✓</h2>
    <p style="color:#94a3b8;margin:0 0 20px">Hola ${nombre},</p>
    <p style="line-height:1.7;margin:0 0 20px">
      Tu plan ha cambiado de <span style="color:#94a3b8">${planAnterior}</span> a
      <strong style="color:#f59e0b">${planNuevo}</strong>.
      Ya tienes disponibles <strong style="color:white">${creditos} créditos</strong> frescos para este ciclo.
    </p>
    <a href="https://foxpdf.cloud/crear" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
      Empezar a crear
    </a>
  `);

export const emailVencimientoProximo = (nombre: string, planNombre: string, fechaVencimiento: string, creditos: number) =>
  BASE(`
    <h2 style="color:white;margin:0 0 12px;font-size:20px">Tu plan vence pronto</h2>
    <p style="color:#94a3b8;margin:0 0 20px">Hola ${nombre},</p>
    <p style="line-height:1.7;margin:0 0 20px">
      Tu plan <strong style="color:white">${planNombre}</strong> vence el
      <strong style="color:#f59e0b">${fechaVencimiento}</strong>.
      Aún tienes <strong style="color:white">${creditos} créditos</strong> disponibles.
    </p>
    <p style="line-height:1.7;margin:0 0 24px;color:#94a3b8">
      Si cancelaste tu plan, el acceso premium terminará en esa fecha.
      Si no hiciste nada, se renovará automáticamente.
    </p>
    <a href="https://foxpdf.cloud/perfil" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
      Gestionar mi suscripción
    </a>
  `);
