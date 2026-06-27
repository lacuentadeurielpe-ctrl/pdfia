import LegalShell from "@/components/marketing/LegalShell";
import { EMPRESA } from "@/components/marketing/Footer";

export const metadata = {
  title: "Eliminación de Datos — FoxPDF",
  description: "Cómo solicitar la eliminación de tu cuenta y datos personales en FoxPDF.",
};

export default function EliminacionDatosPage() {
  return (
    <LegalShell titulo="Instrucciones para Eliminación de Datos" actualizado="Enero 2026">
      <p>
        En <strong>{EMPRESA.nombre}</strong> respetamos tu derecho a controlar tu información personal. En esta página
        te explicamos cómo solicitar la eliminación de tu cuenta y de todos los datos asociados a ella.
      </p>

      <h2>¿Qué datos se eliminan?</h2>
      <ul>
        <li>Tu cuenta y credenciales de acceso.</li>
        <li>Tu información de perfil (nombre, correo electrónico).</li>
        <li>La configuración de tu negocio (logo, colores, nombre comercial).</li>
        <li>Los documentos y ebooks que hayas generado y almacenado.</li>
        <li>Cualquier dato recibido de proveedores de inicio de sesión social (por ejemplo, Facebook).</li>
      </ul>

      <h2>Cómo solicitar la eliminación</h2>
      <p>Puedes solicitar la eliminación de tus datos de cualquiera de estas formas:</p>
      <ol>
        <li>
          <strong>Por correo electrónico:</strong> envía un mensaje a{" "}
          <a href={`mailto:${EMPRESA.email}?subject=Solicitud%20de%20eliminación%20de%20datos`}>{EMPRESA.email}</a>{" "}
          desde la dirección asociada a tu cuenta, con el asunto "Solicitud de eliminación de datos".
        </li>
        <li>
          <strong>Desde el formulario de contacto:</strong> completa nuestro{" "}
          <a href="/contacto">formulario de contacto</a> indicando que deseas eliminar tu cuenta y tus datos.
        </li>
      </ol>

      <h2>Plazo de eliminación</h2>
      <p>
        Procesaremos tu solicitud y eliminaremos tus datos personales en un plazo máximo de <strong>30 días</strong>{" "}
        desde su recepción. Te enviaremos una confirmación una vez completado el proceso.
      </p>
      <p>
        Es posible que conservemos cierta información durante un periodo limitado cuando sea estrictamente necesario
        para cumplir obligaciones legales, resolver disputas o hacer cumplir nuestros acuerdos. Esa información se
        elimina una vez cumplido dicho fin.
      </p>

      <h2>Eliminación de datos vinculados a Facebook</h2>
      <p>
        Si iniciaste sesión usando Facebook y deseas que eliminemos los datos obtenidos a través de ese servicio,
        puedes hacerlo mediante cualquiera de los métodos anteriores. También puedes revocar el acceso de la
        aplicación desde la configuración de tu cuenta de Facebook, en la sección "Aplicaciones y sitios web".
      </p>

      <h2>Contacto</h2>
      <p>
        Para cualquier consulta sobre la eliminación de tus datos, contáctanos:
      </p>
      <ul>
        <li><strong>Correo:</strong> <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a></li>
        <li><strong>Teléfono:</strong> +51 {EMPRESA.celular}</li>
        <li><strong>Responsable:</strong> {EMPRESA.dueno} — RUC {EMPRESA.ruc}</li>
      </ul>
    </LegalShell>
  );
}
