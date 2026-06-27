import LegalShell from "@/components/marketing/LegalShell";
import { EMPRESA } from "@/components/marketing/Footer";

export const metadata = {
  title: "Términos y Condiciones — FoxPDF",
  description: "Términos de uso del servicio FoxPDF.",
};

export default function TerminosPage() {
  return (
    <LegalShell titulo="Términos y Condiciones" actualizado="Enero 2026">
      <p>
        Bienvenido a <strong>{EMPRESA.nombre}</strong>. Estos Términos y Condiciones regulan el uso de nuestra
        plataforma disponible en {EMPRESA.dominio}, operada por <strong>{EMPRESA.dueno}</strong> (RUC {EMPRESA.ruc}).
        Al crear una cuenta o usar el servicio aceptas estos términos en su totalidad.
      </p>

      <h2>1. Descripción del servicio</h2>
      <p>
        FoxPDF es una plataforma que permite generar ebooks, guías y documentos profesionales mediante inteligencia
        artificial. El usuario proporciona un tema o contexto y la plataforma produce un documento estructurado con
        texto e imágenes.
      </p>

      <h2>2. Cuenta de usuario</h2>
      <ul>
        <li>Eres responsable de mantener la confidencialidad de tus credenciales de acceso.</li>
        <li>Debes proporcionar información veraz y mantenerla actualizada.</li>
        <li>Eres responsable de toda actividad que ocurra en tu cuenta.</li>
        <li>Debes tener al menos 18 años para usar el servicio.</li>
      </ul>

      <h2>3. Uso aceptable</h2>
      <p>Al usar FoxPDF te comprometes a NO:</p>
      <ul>
        <li>Generar contenido ilegal, difamatorio, fraudulento, violento o que incite al odio.</li>
        <li>Infringir derechos de propiedad intelectual de terceros.</li>
        <li>Crear material que viole la privacidad o derechos de otras personas.</li>
        <li>Intentar vulnerar, sobrecargar o dañar la plataforma o su infraestructura.</li>
        <li>Revender o redistribuir el servicio sin autorización expresa.</li>
      </ul>

      <h2>4. Propiedad del contenido</h2>
      <p>
        Conservas todos los derechos sobre el contenido que generas con FoxPDF. Eres el propietario de los documentos
        que creas y puedes usarlos comercialmente. Eres el único responsable del uso que hagas del contenido generado
        y de verificar que cumpla con las leyes aplicables.
      </p>

      <h2>5. Propiedad intelectual de la plataforma</h2>
      <p>
        El software, diseño, marca, logotipos y demás elementos de FoxPDF son propiedad de su titular y están
        protegidos por las leyes de propiedad intelectual. No se concede ningún derecho sobre ellos salvo el uso
        normal del servicio.
      </p>

      <h2>6. Contenido generado por IA</h2>
      <p>
        El contenido es generado por modelos de inteligencia artificial y puede contener imprecisiones. FoxPDF no
        garantiza la exactitud, integridad o idoneidad del contenido para un fin específico. Recomendamos revisar y
        editar el material antes de publicarlo o distribuirlo.
      </p>

      <h2>7. Planes y pagos</h2>
      <p>
        Ofrecemos un plan gratuito y planes de pago con mayores capacidades. Los precios y características pueden
        cambiar; cualquier cambio se comunicará con antelación. Los pagos, cuando apliquen, se procesan mediante
        proveedores seguros.
      </p>

      <h2>8. Disponibilidad y cambios</h2>
      <p>
        Nos esforzamos por mantener el servicio disponible, pero no garantizamos un funcionamiento ininterrumpido.
        Podemos modificar, suspender o discontinuar funciones en cualquier momento, procurando avisar cuando sea posible.
      </p>

      <h2>9. Limitación de responsabilidad</h2>
      <p>
        En la máxima medida permitida por la ley, FoxPDF no será responsable por daños indirectos, incidentales o
        consecuentes derivados del uso o imposibilidad de uso del servicio, ni por el contenido generado por los usuarios.
      </p>

      <h2>10. Terminación</h2>
      <p>
        Podemos suspender o cerrar cuentas que incumplan estos términos. Puedes cerrar tu cuenta en cualquier momento
        solicitándolo según nuestra <a href="/eliminacion-datos">política de eliminación de datos</a>.
      </p>

      <h2>11. Ley aplicable</h2>
      <p>
        Estos términos se rigen por las leyes de la República del Perú. Cualquier controversia se someterá a la
        jurisdicción de los tribunales competentes de Perú.
      </p>

      <h2>12. Contacto</h2>
      <p>
        Para consultas sobre estos términos, escríbenos a <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a> o
        llámanos al +51 {EMPRESA.celular}.
      </p>
    </LegalShell>
  );
}
