import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/marketing/Navbar";
import Footer, { EMPRESA } from "@/components/marketing/Footer";
import ContactForm from "@/components/marketing/ContactForm";
import { Mail, Phone, MapPin, Building2 } from "lucide-react";

export const metadata = {
  title: "Contacto — FoxPDF",
  description: "Ponte en contacto con el equipo de FoxPDF.",
};

export default async function ContactoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar isAuth={!!user} />

      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Hablemos</h1>
          <p className="text-gray-400 mt-4 text-lg">
            ¿Tienes una pregunta, sugerencia o quieres eliminar tus datos? Escríbenos y te responderemos pronto.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Datos de contacto */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Información de contacto</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-xs">Correo</p>
                    <a href={`mailto:${EMPRESA.email}`} className="text-white hover:text-orange-400 transition-colors">{EMPRESA.email}</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-xs">Teléfono</p>
                    <a href={`tel:+51${EMPRESA.celular}`} className="text-white hover:text-orange-400 transition-colors">+51 {EMPRESA.celular}</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-xs">Dirección</p>
                    <p className="text-white">{EMPRESA.direccion}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-xs">Responsable</p>
                    <p className="text-white">{EMPRESA.dueno}</p>
                    <p className="text-gray-500 text-xs mt-0.5">RUC {EMPRESA.ruc}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Formulario */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
