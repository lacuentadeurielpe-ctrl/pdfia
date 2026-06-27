import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/marketing/Navbar";
import Footer, { EMPRESA } from "@/components/marketing/Footer";
import { FoxLogo } from "@/components/marketing/FoxLogo";
import { Target, Heart, Zap } from "lucide-react";

export const metadata = {
  title: "Nosotros — FoxPDF",
  description: "Conoce la historia y la misión de FoxPDF.",
};

const VALORES = [
  { icon: Zap,    title: "Simplicidad",  desc: "Creemos que crear contenido profesional no debería requerir un equipo entero. Lo hacemos accesible para todos." },
  { icon: Heart,  title: "Calidad",      desc: "Cada documento que sale de FoxPDF debe verse y leerse como algo hecho por profesionales." },
  { icon: Target, title: "Resultados",   desc: "Nos enfocamos en que nuestros usuarios produzcan material que realmente puedan usar y vender." },
];

export default async function NosotrosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar isAuth={!!user} />

      <section className="max-w-3xl mx-auto px-5 lg:px-8 py-20 text-center">
        <FoxLogo className="w-16 h-16 mx-auto mb-6" />
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Sobre Fox<span className="text-orange-500">PDF</span>
        </h1>
        <p className="text-gray-300 text-lg mt-6 leading-relaxed">
          FoxPDF nació con una idea simple: que cualquier persona o negocio pueda transformar sus ideas en
          documentos profesionales sin necesidad de saber de diseño ni de escritura. Combinamos varios agentes de
          inteligencia artificial que trabajan juntos —como un verdadero equipo editorial— para producir ebooks,
          guías y materiales con la identidad de tu marca.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-5 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {VALORES.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-7 text-center">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{v.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 lg:px-8 pb-24">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-5">Datos de la empresa</h2>
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <dt className="text-gray-500">Razón / Responsable</dt>
              <dd className="text-white font-medium mt-0.5">{EMPRESA.dueno}</dd>
            </div>
            <div>
              <dt className="text-gray-500">RUC</dt>
              <dd className="text-white font-medium mt-0.5">{EMPRESA.ruc}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Correo</dt>
              <dd className="text-white font-medium mt-0.5">
                <a href={`mailto:${EMPRESA.email}`} className="hover:text-orange-400 transition-colors">{EMPRESA.email}</a>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Teléfono</dt>
              <dd className="text-white font-medium mt-0.5">+51 {EMPRESA.celular}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Dirección</dt>
              <dd className="text-white font-medium mt-0.5">{EMPRESA.direccion}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Sitio web</dt>
              <dd className="text-white font-medium mt-0.5">{EMPRESA.dominio}</dd>
            </div>
          </dl>
        </div>
      </section>

      <Footer />
    </div>
  );
}
