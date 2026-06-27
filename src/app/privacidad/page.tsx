import LegalShell from "@/components/marketing/LegalShell";
import { EMPRESA } from "@/components/marketing/Footer";

export const metadata = {
  title: "Política de Privacidad — FoxPDF",
  description: "Cómo FoxPDF recopila, usa y protege tu información personal.",
};

export default function PrivacidadPage() {
  return (
    <LegalShell titulo="Política de Privacidad" actualizado="Enero 2026">
      <p>
        En <strong>{EMPRESA.nombre}</strong> ({EMPRESA.dominio}), operado por <strong>{EMPRESA.dueno}</strong> (RUC {EMPRESA.ruc}),
        valoramos y respetamos tu privacidad. Esta Política de Privacidad describe qué información recopilamos,
        cómo la usamos, con quién la compartimos y los derechos que tienes sobre tus datos personales.
      </p>
      <p>
        Al usar nuestra plataforma aceptas las prácticas descritas en este documento. Si no estás de acuerdo,
        por favor no utilices nuestros servicios.
      </p>

      <h2>1. Información que recopilamos</h2>
      <p>Recopilamos los siguientes tipos de información:</p>
      <ul>
        <li><strong>Datos de cuenta:</strong> nombre, dirección de correo electrónico y contraseña cifrada al registrarte.</li>
        <li><strong>Contenido que generas:</strong> los temas, descripciones y documentos que creas con nuestra herramienta.</li>
        <li><strong>Datos de tu negocio:</strong> logo, colores y nombre comercial que configuras para personalizar tus documentos.</li>
        <li><strong>Datos de uso:</strong> información técnica como tipo de navegador, páginas visitadas e interacciones, para mejorar el servicio.</li>
        <li><strong>Datos de inicio de sesión social:</strong> si te registras mediante Facebook u otro proveedor, recibimos tu nombre y correo según los permisos que autorices.</li>
      </ul>

      <h2>2. Cómo usamos tu información</h2>
      <ul>
        <li>Para crear, mantener y operar tu cuenta.</li>
        <li>Para generar los documentos y ebooks que solicitas.</li>
        <li>Para personalizar tus documentos con la identidad de tu negocio.</li>
        <li>Para comunicarnos contigo sobre tu cuenta, soporte o novedades del servicio.</li>
        <li>Para mejorar, proteger y desarrollar nuestra plataforma.</li>
        <li>Para cumplir con obligaciones legales aplicables.</li>
      </ul>

      <h2>3. Inteligencia artificial y proveedores</h2>
      <p>
        Para generar contenido utilizamos servicios de inteligencia artificial de terceros (proveedores de modelos
        de lenguaje e imágenes). El texto que ingresas puede ser procesado por estos proveedores únicamente con el
        fin de generar tu documento. No vendemos tu contenido ni lo usamos para entrenar modelos sin tu consentimiento.
      </p>

      <h2>4. Cómo compartimos tu información</h2>
      <p>No vendemos tu información personal. Solo la compartimos en estos casos:</p>
      <ul>
        <li><strong>Proveedores de servicios:</strong> infraestructura, almacenamiento y procesamiento de IA necesarios para operar (por ejemplo, alojamiento y bases de datos seguras).</li>
        <li><strong>Obligación legal:</strong> cuando la ley lo exija o para proteger derechos, seguridad o propiedad.</li>
        <li><strong>Con tu consentimiento:</strong> cuando autorices expresamente compartir información.</li>
      </ul>

      <h2>5. Almacenamiento y seguridad</h2>
      <p>
        Tus datos se almacenan en servidores seguros con cifrado en tránsito. Aplicamos medidas técnicas y
        organizativas razonables para proteger tu información contra acceso no autorizado, pérdida o alteración.
        Ninguna transmisión por internet es 100% segura, pero trabajamos para protegerte con los mejores estándares.
      </p>

      <h2>6. Tus derechos</h2>
      <p>Tienes derecho a:</p>
      <ul>
        <li>Acceder a los datos personales que tenemos sobre ti.</li>
        <li>Rectificar información inexacta o incompleta.</li>
        <li>Solicitar la eliminación de tu cuenta y tus datos (ver <a href="/eliminacion-datos">Eliminación de datos</a>).</li>
        <li>Oponerte o limitar ciertos tratamientos de tus datos.</li>
        <li>Retirar tu consentimiento en cualquier momento.</li>
      </ul>
      <p>
        Para ejercer cualquiera de estos derechos, escríbenos a <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a>.
      </p>

      <h2>7. Retención de datos</h2>
      <p>
        Conservamos tu información mientras tu cuenta esté activa o sea necesaria para prestarte el servicio.
        Cuando solicites la eliminación, borraremos tus datos personales salvo aquellos que debamos conservar por
        obligaciones legales.
      </p>

      <h2>8. Menores de edad</h2>
      <p>
        Nuestro servicio no está dirigido a menores de 18 años. No recopilamos conscientemente datos de menores.
        Si crees que un menor nos ha proporcionado información, contáctanos para eliminarla.
      </p>

      <h2>9. Cambios a esta política</h2>
      <p>
        Podemos actualizar esta Política de Privacidad ocasionalmente. Publicaremos la versión actualizada en esta
        página con su fecha de revisión. Te recomendamos revisarla periódicamente.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Si tienes preguntas sobre esta política o el tratamiento de tus datos, contáctanos:
      </p>
      <ul>
        <li><strong>Responsable:</strong> {EMPRESA.dueno}</li>
        <li><strong>RUC:</strong> {EMPRESA.ruc}</li>
        <li><strong>Correo:</strong> <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a></li>
        <li><strong>Teléfono:</strong> +51 {EMPRESA.celular}</li>
        <li><strong>Dirección:</strong> {EMPRESA.direccion}</li>
      </ul>
    </LegalShell>
  );
}
