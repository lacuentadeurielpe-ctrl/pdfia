import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { FoxLogo } from "@/components/marketing/FoxLogo";
import {
  Sparkles, FileText, ImageIcon, Layers, Zap, ShieldCheck,
  Wand2, BookOpen, Check, ArrowRight, Star, Brain, Palette,
} from "lucide-react";

export const metadata = {
  title: "FoxPDF — Crea ebooks y documentos profesionales con IA",
  description:
    "FoxPDF genera ebooks, guías y documentos profesionales con inteligencia artificial multi-agente. De una idea a un PDF listo para vender en minutos.",
};

const FEATURES = [
  { icon: Brain,      title: "IA Multi-Agente",        desc: "Un equipo de agentes (director, escritores, editor) colabora para crear contenido coherente y profundo, capítulo por capítulo." },
  { icon: ImageIcon,  title: "Imágenes generadas",     desc: "Ilustraciones únicas creadas con IA para cada capítulo, integradas automáticamente en tu documento." },
  { icon: Palette,    title: "Tu marca, tus colores",  desc: "Personaliza logo, colores y estilo. Cada PDF sale con la identidad de tu negocio." },
  { icon: Layers,     title: "Estructura inteligente", desc: "La IA decide la extensión y el orden ideal de cada capítulo según el tema, sin plantillas rígidas." },
  { icon: ShieldCheck,title: "Sin repeticiones",       desc: "Memoria de continuidad entre capítulos: nada se repite y todo fluye como un libro real." },
  { icon: Zap,        title: "Listo en minutos",       desc: "De un párrafo de contexto a un ebook completo y descargable como PDF en pocos minutos." },
];

const PASOS = [
  { n: "01", title: "Describe tu idea",   desc: "Escribe de qué trata tu documento, el tono y la audiencia. Mientras más detalle, mejor el resultado." },
  { n: "02", title: "La IA trabaja",      desc: "El equipo de agentes planifica, investiga, escribe e ilustra cada capítulo de forma coordinada." },
  { n: "03", title: "Descarga tu PDF",    desc: "Obtén un ebook profesional con tu marca, listo para vender, regalar o publicar." },
];

const PLANES = [
  {
    nombre: "Gratis", precio: "S/ 0", periodo: "/mes", destacado: false,
    badge: null,
    desc: "Para probar y crear tus primeros ebooks.",
    features: ["~5 ebooks/mes", "Calidad Estándar", "Hasta 5 capítulos", "Historial 7 días", "Marca de agua FoxPDF", "Licencia comercial"],
  },
  {
    nombre: "Emprendedor", precio: "S/ 45", periodo: "/mes", destacado: false,
    badge: null,
    desc: "Para creadores que publican contenido regularmente.",
    features: ["~20 ebooks/mes", "Calidad Estándar + Avanzado", "Imágenes IA incluidas", "Hasta 10 capítulos", "Historial ilimitado", "Tu marca y colores", "Licencia comercial"],
  },
  {
    nombre: "Profesional", precio: "S/ 89", periodo: "/mes", destacado: true,
    badge: "MÁS POPULAR",
    desc: "Para agencias y creadores de contenido premium.",
    features: ["~50 ebooks/mes", "Calidad Estándar + Avanzado + Premium", "Imágenes IA de alta calidad", "Hasta 12 capítulos", "Historial ilimitado", "Tu marca y colores", "Soporte prioritario", "Licencia comercial"],
  },
  {
    nombre: "Agencia", precio: "S/ 189", periodo: "/mes", destacado: false,
    badge: null,
    desc: "Volumen máximo para equipos y agencias digitales.",
    features: ["~125 ebooks/mes", "Todas las calidades", "Imágenes IA máxima calidad", "Hasta 15 capítulos", "Historial ilimitado", "Tu marca y colores", "Soporte dedicado", "Licencia comercial"],
  },
];

const FAQS = [
  { q: "¿Qué tipo de documentos puedo crear?", a: "Ebooks, guías, manuales, cursos, propuestas y cualquier documento estructurado por capítulos. Tú das el tema y la IA construye el contenido completo." },
  { q: "¿Las imágenes son originales?", a: "Sí. Cada imagen se genera con inteligencia artificial específicamente para tu contenido, así que son únicas y no requieren licencias de stock." },
  { q: "¿Puedo usar mi propia marca?", a: "Por supuesto. Configura tu logo, colores y nombre de negocio una vez y se aplicarán automáticamente a todos tus documentos." },
  { q: "¿En qué formato obtengo el resultado?", a: "Obtienes un documento listo para abrir e imprimir o guardar como PDF directamente desde tu navegador, con un diseño profesional." },
  { q: "¿Mis datos están seguros?", a: "Sí. Ciframos la comunicación y nunca compartimos tu contenido. Puedes leer nuestra Política de Privacidad y solicitar la eliminación de tus datos cuando quieras." },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuth = !!user;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar isAuth={isAuth} />

      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-orange-600/15 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-orange-300 text-xs font-semibold tracking-wide">IA MULTI-AGENTE PARA CREADORES</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
              Convierte una idea en un{" "}
              <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">ebook profesional</span>{" "}
              en minutos
            </h1>
            <p className="text-gray-300 text-lg mt-6 leading-relaxed max-w-xl">
              FoxPDF usa un equipo de agentes de inteligencia artificial para escribir, ilustrar y diseñar
              documentos completos con tu marca. Sin diseñadores, sin escritores, sin complicaciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link href={isAuth ? "/dashboard" : "/registro"}
                className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-600/25">
                {isAuth ? "Ir al panel" : "Empezar gratis"}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/#como-funciona"
                className="inline-flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-600 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors">
                Ver cómo funciona
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-8 text-sm text-gray-400">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-orange-500" /> Sin tarjeta para empezar</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-orange-500" /> Cancela cuando quieras</span>
            </div>
          </div>

          {/* Mockup */}
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-5">
                <FoxLogo className="w-7 h-7" />
                <span className="text-white font-bold text-sm">Fox<span className="text-orange-500">PDF</span></span>
                <span className="ml-auto flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-gray-700" />
                  <span className="w-3 h-3 rounded-full bg-gray-700" />
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                </span>
              </div>
              <div className="space-y-3">
                {["🎬 Director planificando estructura...", "✍️ Escribiendo capítulo 2/5...", "🎨 Generando imágenes con IA...", "📄 Ensamblando documento final..."].map((t, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3">
                    <div className={`w-2 h-2 rounded-full ${i < 3 ? "bg-emerald-500" : "bg-orange-500 animate-pulse"}`} />
                    <span className="text-gray-300 text-sm">{t}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 bg-orange-600/10 border border-orange-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-400" />
                <span className="text-orange-300 text-sm font-medium">Tu ebook está listo</span>
                <Star className="w-4 h-4 text-amber-400 ml-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section id="caracteristicas" className="max-w-7xl mx-auto px-5 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Todo lo que necesitas para crear</h2>
          <p className="text-gray-400 mt-4 text-lg">Un sistema completo que reemplaza a un equipo de redacción y diseño.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-orange-500/30 transition-colors">
                <div className="w-11 h-11 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ───── CÓMO FUNCIONA ───── */}
      <section id="como-funciona" className="bg-gray-900/30 border-y border-gray-800/60">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Tres pasos. Cero complicaciones.</h2>
            <p className="text-gray-400 mt-4 text-lg">No necesitas saber de diseño ni de escritura.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PASOS.map((p) => (
              <div key={p.n} className="relative bg-gray-900 border border-gray-800 rounded-2xl p-7">
                <span className="text-5xl font-extrabold text-orange-500/20">{p.n}</span>
                <h3 className="text-white font-semibold text-lg mt-2 mb-2">{p.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PRECIOS ───── */}
      <section id="precios" className="max-w-7xl mx-auto px-5 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Planes y precios</h2>
          <p className="text-gray-400 mt-4 text-lg">Todos los planes incluyen licencia comercial. Los créditos se renuevan cada mes.</p>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
          {PLANES.map((plan) => (
            <div key={plan.nombre}
              className={`relative rounded-2xl p-6 flex flex-col ${
                plan.destacado
                  ? "bg-gradient-to-b from-orange-600/10 to-gray-900 border-2 border-orange-500/40"
                  : "bg-gray-900 border border-gray-800"
              }`}>
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </span>
              )}
              <h3 className="text-white font-bold text-lg">{plan.nombre}</h3>
              <div className="mt-3 mb-1 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">{plan.precio}</span>
                <span className="text-gray-400 text-sm">{plan.periodo}</span>
              </div>
              <p className="text-gray-400 text-sm mb-5">{plan.desc}</p>
              <ul className="space-y-2.5 mb-7 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={isAuth ? (plan.precio === "S/ 0" ? "/dashboard" : "/planes") : "/registro"}
                className={`text-center font-semibold py-3 rounded-xl transition-colors ${
                  plan.destacado
                    ? "bg-orange-600 hover:bg-orange-500 text-white"
                    : "border border-gray-700 hover:border-gray-600 text-white"
                }`}>
                {plan.precio === "S/ 0" ? "Empezar gratis" : "Elegir plan"}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-600 mt-6">
          Pagos seguros vía MercadoPago · Precios en soles peruanos (PEN) · Cancela cuando quieras
        </p>
      </section>

      {/* ───── FAQ ───── */}
      <section className="bg-gray-900/30 border-y border-gray-800/60">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group bg-gray-900 border border-gray-800 rounded-2xl px-6 py-5">
                <summary className="flex items-center justify-between cursor-pointer text-white font-medium list-none">
                  {faq.q}
                  <span className="text-orange-500 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="text-gray-400 text-sm mt-3 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA FINAL ───── */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-24">
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 to-amber-600 rounded-3xl px-8 py-16 text-center">
          <div className="relative z-10 max-w-2xl mx-auto">
            <Wand2 className="w-10 h-10 text-white/90 mx-auto mb-5" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Tu próximo ebook empieza hoy
            </h2>
            <p className="text-white/85 text-lg mt-4">
              Únete a los creadores que ya producen documentos profesionales con IA. Empieza gratis, sin tarjeta.
            </p>
            <Link href={isAuth ? "/dashboard" : "/registro"}
              className="inline-flex items-center gap-2 bg-white text-orange-700 font-bold px-8 py-4 rounded-xl mt-8 hover:bg-orange-50 transition-colors">
              <BookOpen className="w-5 h-5" />
              {isAuth ? "Ir al panel" : "Crear mi primer ebook"}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
