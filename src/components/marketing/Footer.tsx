import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { FoxLogo } from "./FoxLogo";

export const EMPRESA = {
  nombre:    "FoxPDF",
  dueno:     "Uriel Orlando Gómez Villanueva",
  ruc:       "10708796714",
  email:     "admin@foxpdf.cloud",
  celular:   "976420879",
  direccion: "Salaverry, Perú",
  dominio:   "foxpdf.cloud",
};

export default function Footer() {
  return (
    <footer className="border-t border-gray-800/60 bg-gray-950">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Marca */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <FoxLogo className="w-8 h-8" />
              <span className="text-lg font-extrabold text-white">
                Fox<span className="text-orange-500">PDF</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Crea ebooks y documentos profesionales con inteligencia artificial multi-agente.
              De una idea a un PDF listo para vender en minutos.
            </p>
          </div>

          {/* Producto */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Producto</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#caracteristicas" className="text-gray-400 hover:text-white transition-colors">Características</Link></li>
              <li><Link href="/#como-funciona" className="text-gray-400 hover:text-white transition-colors">Cómo funciona</Link></li>
              <li><Link href="/#precios" className="text-gray-400 hover:text-white transition-colors">Precios</Link></li>
              <li><Link href="/registro" className="text-gray-400 hover:text-white transition-colors">Crear cuenta</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacidad" className="text-gray-400 hover:text-white transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/terminos" className="text-gray-400 hover:text-white transition-colors">Términos y Condiciones</Link></li>
              <li><Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Política de Cookies</Link></li>
              <li><Link href="/eliminacion-datos" className="text-gray-400 hover:text-white transition-colors">Eliminación de datos</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Contacto</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <a href={`mailto:${EMPRESA.email}`} className="hover:text-white transition-colors">{EMPRESA.email}</a>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <a href={`tel:+51${EMPRESA.celular}`} className="hover:text-white transition-colors">+51 {EMPRESA.celular}</a>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                {EMPRESA.direccion}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800/60 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs text-center md:text-left">
            © {new Date().getFullYear()} {EMPRESA.nombre} · RUC {EMPRESA.ruc} · Todos los derechos reservados.
          </p>
          <p className="text-gray-600 text-xs">{EMPRESA.dominio}</p>
        </div>
      </div>
    </footer>
  );
}
