import LegalShell from "@/components/marketing/LegalShell";
import { EMPRESA } from "@/components/marketing/Footer";

export const metadata = {
  title: "Política de Cookies — FoxPDF",
  description: "Cómo FoxPDF utiliza cookies y tecnologías similares.",
};

export default function CookiesPage() {
  return (
    <LegalShell titulo="Política de Cookies" actualizado="Enero 2026">
      <p>
        Esta Política de Cookies explica cómo <strong>{EMPRESA.nombre}</strong> ({EMPRESA.dominio}) utiliza cookies y
        tecnologías similares cuando visitas o usas nuestra plataforma.
      </p>

      <h2>1. ¿Qué son las cookies?</h2>
      <p>
        Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web.
        Permiten que el sitio recuerde tus acciones y preferencias durante un periodo de tiempo.
      </p>

      <h2>2. Cookies que utilizamos</h2>
      <ul>
        <li><strong>Cookies esenciales:</strong> necesarias para el funcionamiento del sitio, como mantener tu sesión iniciada de forma segura. Sin ellas, el servicio no funciona correctamente.</li>
        <li><strong>Cookies de preferencias:</strong> recuerdan opciones como idioma o configuración de tu cuenta.</li>
        <li><strong>Cookies analíticas:</strong> nos ayudan a entender cómo se usa la plataforma para mejorarla. Son anónimas y agregadas.</li>
      </ul>

      <h2>3. Cookies de terceros</h2>
      <p>
        Algunos servicios que integramos (como autenticación o análisis) pueden establecer sus propias cookies.
        No controlamos estas cookies; te recomendamos revisar las políticas de privacidad de dichos proveedores.
      </p>

      <h2>4. Cómo gestionar las cookies</h2>
      <p>
        Puedes configurar tu navegador para bloquear o eliminar cookies. Ten en cuenta que si bloqueas las cookies
        esenciales, es posible que algunas funciones de la plataforma no estén disponibles, como el inicio de sesión.
      </p>
      <p>
        La mayoría de navegadores permiten gestionar cookies desde su configuración de privacidad (Chrome, Firefox,
        Safari, Edge, etc.).
      </p>

      <h2>5. Cambios a esta política</h2>
      <p>
        Podemos actualizar esta Política de Cookies. Publicaremos los cambios en esta página con la fecha de revisión.
      </p>

      <h2>6. Contacto</h2>
      <p>
        Si tienes dudas sobre el uso de cookies, escríbenos a <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a>.
      </p>
    </LegalShell>
  );
}
