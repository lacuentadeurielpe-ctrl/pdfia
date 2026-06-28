import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { FoxLogo } from "@/components/marketing/FoxLogo";
import {
  Sparkles, FileText, ImageIcon, Layers, Zap, ShieldCheck,
  Wand2, BookOpen, Check, ArrowRight, Star, Brain, Palette,
  X, CreditCard, RefreshCw, Lock, Users, TrendingUp, Clock,
  Target, Mic2, Globe, ChevronRight, Crown, BarChart3,
  PenTool, Eye, Cpu, Lightbulb, Package, MessageSquare,
} from "lucide-react";

export const metadata = {
  title: "FoxPDF — Crea ebooks y documentos profesionales con IA",
  description:
    "FoxPDF genera ebooks, guías y documentos profesionales con inteligencia artificial multi-agente. De una idea a un PDF listo para vender en minutos.",
};

/* ─────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────── */

const STATS = [
  { value: "1,200+", label: "Ebooks generados" },
  { value: "340+",   label: "Creadores activos" },
  { value: "5 min",  label: "Promedio por ebook" },
  { value: "98%",    label: "Satisfacción" },
];

const FEATURES = [
  { icon: Brain,      title: "IA Multi-Agente",        desc: "Un Director planifica, varios Escritores redactan en paralelo y un Editor de continuidad asegura coherencia total.", tag: "Core" },
  { icon: ImageIcon,  title: "Imágenes originales",     desc: "Gemini genera ilustraciones únicas por capítulo, integradas automáticamente. Sin stock, sin licencias.", tag: "IA" },
  { icon: Palette,    title: "Tu marca y colores",       desc: "Sube tu logo, elige tus colores y define el estilo. Todos tus documentos salen con tu identidad.", tag: "Personalización" },
  { icon: Layers,     title: "Estructura inteligente",  desc: "El Director decide la arquitectura óptima del documento según el tema, sin plantillas rígidas.", tag: "Core" },
  { icon: ShieldCheck,title: "Memoria de continuidad",  desc: "Cada capítulo conoce el anterior: sin repeticiones, con referencias cruzadas y narrativa fluida.", tag: "Calidad" },
  { icon: Zap,        title: "Listo en 5 minutos",      desc: "De un párrafo de contexto a un ebook completo y descargable. Velocidad real, no promesas.", tag: "Velocidad" },
  { icon: Globe,      title: "Cualquier idioma",         desc: "Genera en español, inglés, portugués o cualquier idioma que entienda la IA. Mismo proceso.", tag: "Idiomas" },
  { icon: Target,     title: "Audiencia específica",     desc: "Define a quién va dirigido y el tono cambia: técnico, divulgativo, motivacional, educativo.", tag: "Personalización" },
  { icon: BarChart3,  title: "Calidad escalable",        desc: "Desde Claude Haiku hasta Opus. Elige entre velocidad económica o profundidad máxima por capítulo.", tag: "Calidad" },
];

const AGENTES = [
  { icon: Lightbulb, color: "blue",   title: "Director",   role: "Claude", desc: "Analiza el contexto, define la estructura del ebook y asigna tareas específicas a cada escritor." },
  { icon: PenTool,   color: "indigo", title: "Escritores", role: "DeepSeek", desc: "Uno por capítulo, redactan en profundidad con el contexto del capítulo anterior para garantizar coherencia." },
  { icon: Eye,       color: "purple", title: "Editor",     role: "Claude", desc: "Revisa la continuidad del documento completo, elimina repeticiones y ajusta el tono final." },
  { icon: ImageIcon, color: "pink",   title: "Ilustrador", role: "Gemini",  desc: "Genera imágenes únicas para cada capítulo, alineadas con el contenido y el estilo visual elegido." },
];

const CASOS_USO = [
  {
    icon: Mic2,     color: "orange",
    titulo: "Coaches y consultores",
    desc:   "Convierte tu metodología en un ebook que vendes como producto digital, lead magnet o material de onboarding.",
    ejemplos: ["Guía de productividad", "Manual de ventas", "Programa de coaching"],
  },
  {
    icon: Package,  color: "indigo",
    titulo: "Agencias digitales",
    desc:   "Produce materiales de valor para tus clientes a escala: propuestas, informes, guías de marca, recursos de capacitación.",
    ejemplos: ["Reportes de campaña", "Guías de marca", "Materiales de formación"],
  },
  {
    icon: TrendingUp, color: "emerald",
    titulo: "Infoproductores",
    desc:   "Genera ebooks, cursos escritos y guías para vender en tu tienda digital o como bonus de tus programas.",
    ejemplos: ["Cursos escritos", "Guías prácticas", "Bonus para programas"],
  },
  {
    icon: Globe,    color: "purple",
    titulo: "Empresas y startups",
    desc:   "Crea documentación interna, propuestas de valor, presentaciones de producto y materiales para inversores.",
    ejemplos: ["Manuales internos", "Propuestas comerciales", "Whitepapers"],
  },
];

const COMPARATIVA = {
  headers: ["Método tradicional", "FoxPDF con IA"],
  rows: [
    { item: "Tiempo de producción",  tradicional: "3-10 días",     foxpdf: "5 minutos" },
    { item: "Costo por ebook",       tradicional: "S/ 500 - 2000", foxpdf: "Desde S/ 0.38" },
    { item: "Imágenes originales",   tradicional: "Licencia extra", foxpdf: "Incluidas" },
    { item: "Escalabilidad",         tradicional: "Muy limitada",   foxpdf: "Ilimitada" },
    { item: "Coherencia narrativa",  tradicional: "Depende del redactor", foxpdf: "Garantizada por IA" },
    { item: "Tu marca en el PDF",    tradicional: "Costo de diseño",foxpdf: "Automático" },
  ],
};

const TESTIMONIOS = [
  {
    nombre:  "Sofía Reyes",
    rol:     "Coach de negocios, Lima",
    avatar:  "SR",
    color:   "orange",
    texto:   "En 3 horas tenía 8 ebooks listos para vender en mi tienda. Antes contratar un redactor me costaba semanas y S/800 por pieza. FoxPDF cambió completamente mi modelo de negocio.",
    stars:   5,
  },
  {
    nombre:  "Carlos Mendoza",
    rol:     "Director de Agencia Digital, Arequipa",
    avatar:  "CM",
    color:   "indigo",
    texto:   "Producimos materiales para 12 clientes simultáneamente. La calidad del contenido es consistente, los ebooks tienen coherencia real entre capítulos y las imágenes son originales. Increíble.",
    stars:   5,
  },
  {
    nombre:  "Valentina Torres",
    rol:     "Infoproductora, Bogotá",
    avatar:  "VT",
    color:   "emerald",
    texto:   "Lo que más me sorprende es que no se nota que es IA. Cada capítulo recuerda al anterior, hay fluidez, y las imágenes son perfectas. Mis clientes piensan que contrato diseñadores.",
    stars:   5,
  },
];

const PLANES = [
  {
    id: "gratis",     nombre: "Gratis",       precio: "S/ 0",   periodo: "/mes", destacado: false, badge: null,         color: "gray",
    ebooksMes: "5",
    desc: "Ideal para probar FoxPDF sin compromiso.",
    includes: ["5 créditos/mes", "Calidad Estándar (Claude Haiku)", "Hasta 5 capítulos por ebook", "Historial 7 días", "Licencia comercial"],
    excludes: ["Imágenes IA", "Tu marca y colores", "Calidad Avanzado / Premium"],
  },
  {
    id: "emprendedor", nombre: "Emprendedor", precio: "S/ 45",  periodo: "/mes", destacado: false, badge: null,         color: "indigo",
    ebooksMes: "120",
    desc: "Para creadores que venden contenido digital.",
    includes: ["120 créditos/mes", "Calidad Estándar + Avanzado", "Imágenes IA incluidas (Gemini Flash)", "Hasta 10 capítulos", "Historial ilimitado", "Tu marca, logo y colores", "Soporte por email", "Licencia comercial"],
    excludes: ["Calidad Premium (Claude Opus)", "Imágenes IA Pro"],
  },
  {
    id: "profesional", nombre: "Profesional", precio: "S/ 89",  periodo: "/mes", destacado: true,  badge: "MÁS POPULAR", color: "orange",
    ebooksMes: "300",
    desc: "Para agencias y creadores de contenido premium.",
    includes: ["300 créditos/mes", "Todas las calidades (Estándar · Avanzado · Premium)", "Imágenes IA Pro (Gemini alta calidad)", "Hasta 12 capítulos", "Historial ilimitado", "Tu marca, logo y colores", "Soporte prioritario", "Licencia comercial"],
    excludes: [],
  },
  {
    id: "agencia",    nombre: "Agencia",      precio: "S/ 189", periodo: "/mes", destacado: false, badge: "PARA EQUIPOS", color: "amber",
    ebooksMes: "750",
    desc: "Volumen máximo para equipos y agencias digitales.",
    includes: ["750 créditos/mes", "Todas las calidades (Estándar · Avanzado · Premium)", "Imágenes IA Pro (máxima calidad)", "Hasta 15 capítulos", "Historial ilimitado", "Tu marca, logo y colores", "Soporte dedicado", "Licencia comercial"],
    excludes: [],
  },
];

const FAQS = [
  { q: "¿Qué tipo de documentos puedo crear?",           a: "Ebooks, guías, manuales, cursos escritos, propuestas comerciales, whitepapers y cualquier documento estructurado por capítulos. Tú das el tema y el objetivo; la IA construye el contenido completo." },
  { q: "¿Las imágenes son realmente originales?",        a: "Sí. Gemini genera cada imagen específicamente para ese capítulo y ese contenido, por lo que son únicas y no requieren licencias de stock ni te exponen a problemas de copyright." },
  { q: "¿Cuánto tiempo tarda en generarse?",             a: "Entre 3 y 15 minutos dependiendo del número de capítulos, la calidad elegida y si incluyes imágenes. El plan Estándar sin imágenes es el más rápido (~3-5 min)." },
  { q: "¿Puedo usar el contenido para venderlo?",        a: "Sí. Todos los planes incluyen licencia comercial. Puedes vender los ebooks, usarlos como lead magnets, incluirlos en cursos de pago o distribuirlos como material de tu negocio sin restricciones." },
  { q: "¿Qué pasa si se me acaban los créditos?",        a: "Puedes subir de plan en cualquier momento desde tu panel. Los créditos no usados no se acumulan al siguiente mes, pero tu plan se renueva automáticamente el primero de cada mes." },
  { q: "¿Puedo poner mi propia marca?",                  a: "Por supuesto. En Ajustes configuras tu logo, paleta de colores y nombre de negocio una sola vez, y se aplican automáticamente a todos tus documentos." },
  { q: "¿Mis datos y contenido están seguros?",          a: "Sí. Todo se transmite cifrado y tu contenido no se usa para entrenar ningún modelo. Puedes solicitar la eliminación de tus datos en cualquier momento desde nuestra política de privacidad." },
  { q: "¿Qué significa 'calidad' (Estándar / Avanzado / Premium)?", a: "Está vinculado al modelo de IA que planifica el documento: Haiku (rápido, excelente), Sonnet (más detallado, mayor razonamiento) u Opus (máxima profundidad y coherencia). El escritor DeepSeek es el mismo para todos." },
];

/* ─────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────── */

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuth = !!user;

  const ACCENTS = {
    gray:   { ring: "border-gray-700",     glow: "",                                   btn: "border border-gray-700 hover:border-gray-500 text-white",        badge: "bg-gray-700 text-gray-300",       num: "text-gray-400"   },
    indigo: { ring: "border-indigo-700",   glow: "",                                   btn: "border border-indigo-600 hover:bg-indigo-600 text-white",        badge: "bg-indigo-700 text-indigo-200",   num: "text-indigo-400" },
    orange: { ring: "border-orange-500/70",glow: "shadow-2xl shadow-orange-600/20",    btn: "bg-orange-600 hover:bg-orange-500 text-white",                   badge: "bg-orange-600 text-white",        num: "text-orange-400" },
    amber:  { ring: "border-amber-600/60", glow: "",                                   btn: "border border-amber-600 hover:bg-amber-600/20 text-amber-300",  badge: "bg-amber-700/60 text-amber-300",  num: "text-amber-400"  },
  } as const;

  const CASO_COLORS: Record<string, string> = {
    orange:  "bg-orange-500/10 text-orange-400",
    indigo:  "bg-indigo-500/10 text-indigo-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    purple:  "bg-purple-500/10 text-purple-400",
  };

  const AGENTE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    blue:   { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/30" },
    indigo: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/30" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
    pink:   { bg: "bg-pink-500/10",   text: "text-pink-400",   border: "border-pink-500/30" },
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar isAuth={isAuth} />

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-orange-600/12 rounded-full blur-[130px]" />
          <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-amber-600/6 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-20 pb-28 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-orange-300 text-xs font-semibold tracking-wide">IA MULTI-AGENTE · DIRECTOR + ESCRITORES + ILUSTRADOR</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold text-white leading-[1.05] tracking-tight">
              Convierte una idea en un{" "}
              <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                ebook profesional
              </span>{" "}
              en 5 minutos
            </h1>
            <p className="text-gray-300 text-lg mt-6 leading-relaxed max-w-xl">
              Un equipo de agentes de IA escribe, ilustra y diseña documentos completos con tu marca.
              Sin diseñadores, sin redactores, sin semanas de espera.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-9">
              <Link
                href={isAuth ? "/dashboard" : "/registro"}
                className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold px-7 py-4 rounded-xl transition-colors shadow-lg shadow-orange-600/25 text-base"
              >
                {isAuth ? "Ir al panel" : "Empezar gratis"}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-600 text-white font-semibold px-7 py-4 rounded-xl transition-colors text-base"
              >
                Ver cómo funciona
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-400">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-orange-500" /> Sin tarjeta para empezar</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-orange-500" /> Licencia comercial incluida</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-orange-500" /> Cancela cuando quieras</span>
            </div>
          </div>

          {/* Mockup generación */}
          <div className="relative">
            <div className="absolute -inset-4 bg-orange-600/5 rounded-3xl blur-xl" />
            <div className="relative bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl">
              {/* Header del mockup */}
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-800">
                <FoxLogo className="w-7 h-7" />
                <span className="text-white font-bold text-sm">Fox<span className="text-orange-500">PDF</span></span>
                <span className="ml-auto text-xs text-gray-600 bg-gray-800 px-2.5 py-1 rounded-full">Generando...</span>
              </div>

              {/* Agentes activos */}
              <div className="space-y-2.5 mb-4">
                {[
                  { emoji: "🎬", label: "Director", status: "Estructuró 8 capítulos",    done: true },
                  { emoji: "✍️", label: "Escritor 1", status: "Cap. 1 completo · 2.100 palabras", done: true },
                  { emoji: "✍️", label: "Escritor 2", status: "Redactando Cap. 3...",     done: false },
                  { emoji: "🎨", label: "Ilustrador", status: "Generando imagen Cap. 2",  done: false },
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-2.5">
                    <span className="text-base">{a.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-300">{a.label}</p>
                      <p className="text-xs text-gray-500 truncate">{a.status}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.done ? "bg-emerald-500" : "bg-orange-500 animate-pulse"}`} />
                  </div>
                ))}
              </div>

              {/* Progreso */}
              <div className="bg-gray-800 rounded-xl px-4 py-3 mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Progreso del documento</span>
                  <span className="text-orange-400 font-semibold">62%</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full w-[62%] bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
                </div>
              </div>

              {/* Preview del resultado */}
              <div className="bg-orange-600/10 border border-orange-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
                <FileText className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <div>
                  <p className="text-orange-300 text-xs font-semibold">Vista previa disponible</p>
                  <p className="text-gray-500 text-xs">Guía de Marketing Digital — Cap. 1-2 listos</p>
                </div>
                <Star className="w-4 h-4 text-amber-400 ml-auto flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS
      ══════════════════════════════════════ */}
      <section className="border-y border-gray-800/60 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-white">{s.value}</p>
                <p className="text-gray-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CÓMO FUNCIONA
      ══════════════════════════════════════ */}
      <section id="como-funciona" className="max-w-7xl mx-auto px-5 lg:px-8 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-orange-400 text-xs font-bold tracking-widest uppercase mb-3">PROCESO</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Tres pasos. Cero complicaciones.</h2>
          <p className="text-gray-400 mt-4 text-lg">No necesitas saber de diseño ni de redacción.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Línea conectora (decorativa) */}
          <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
          {[
            { n: "01", icon: Lightbulb, title: "Describe tu idea",   desc: "Escribe de qué trata tu documento, el tono y la audiencia. Cuanto más detalle, mejor el resultado. Puedes incluso subir una imagen con un listado de temas." },
            { n: "02", icon: Cpu,       title: "La IA trabaja",      desc: "El Director planifica la estructura, los Escritores redactan capítulo a capítulo con memoria del anterior, y el Ilustrador genera imágenes únicas." },
            { n: "03", icon: FileText,  title: "Descarga tu PDF",    desc: "Obtén un ebook profesional con tu marca, imágenes propias y diseño limpio. Listo para vender, regalar o publicar sin editar nada." },
          ].map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.n} className="relative bg-gray-900 border border-gray-800 hover:border-orange-500/30 rounded-2xl p-8 transition-colors group">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                    <Icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <span className="text-3xl font-extrabold text-orange-500/25">{p.n}</span>
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{p.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════
          AGENTES IA
      ══════════════════════════════════════ */}
      <section className="bg-gray-900/40 border-y border-gray-800/60">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-orange-400 text-xs font-bold tracking-widest uppercase mb-3">TECNOLOGÍA</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Un equipo de IA trabaja por ti
            </h2>
            <p className="text-gray-400 mt-4 text-lg">
              No es un solo modelo generando texto. Son cuatro agentes especializados coordinados en tiempo real.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {AGENTES.map((a) => {
              const Icon   = a.icon;
              const colors = AGENTE_COLORS[a.color];
              return (
                <div key={a.title} className={`border ${colors.border} bg-gray-900 rounded-2xl p-6`}>
                  <div className={`w-11 h-11 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-white font-bold">{a.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} font-medium`}>{a.role}</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{a.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Flujo visual */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-400">
            {["Tu idea", "Director", "Escritores ×N", "Editor", "Ilustrador", "PDF final"].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full font-medium ${
                  step === "Tu idea" || step === "PDF final"
                    ? "bg-orange-500/15 text-orange-300 border border-orange-500/20"
                    : "bg-gray-800 text-gray-300"
                }`}>{step}</span>
                {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-gray-700 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CARACTERÍSTICAS
      ══════════════════════════════════════ */}
      <section id="caracteristicas" className="max-w-7xl mx-auto px-5 lg:px-8 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-orange-400 text-xs font-bold tracking-widest uppercase mb-3">CARACTERÍSTICAS</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Todo lo que necesitas para crear
          </h2>
          <p className="text-gray-400 mt-4 text-lg">Un sistema completo que reemplaza a un equipo entero de redacción y diseño.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-gray-900 border border-gray-800 hover:border-orange-500/30 rounded-2xl p-6 transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 bg-orange-500/10 rounded-xl flex items-center justify-center group-hover:bg-orange-500/15 transition-colors">
                    <Icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">{f.tag}</span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════
          CASOS DE USO
      ══════════════════════════════════════ */}
      <section className="bg-gray-900/30 border-y border-gray-800/60">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-orange-400 text-xs font-bold tracking-widest uppercase mb-3">PARA QUIÉN</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Hecho para quienes crean y venden conocimiento
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CASOS_USO.map((c) => {
              const Icon = c.icon;
              const colorCls = CASO_COLORS[c.color] ?? "bg-gray-800 text-gray-400";
              return (
                <div key={c.titulo} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col">
                  <div className={`w-10 h-10 rounded-xl ${colorCls} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-white font-bold mb-2">{c.titulo}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed flex-1">{c.desc}</p>
                  <div className="mt-4 pt-4 border-t border-gray-800 space-y-1.5">
                    {c.ejemplos.map((e) => (
                      <div key={e} className="flex items-center gap-2 text-xs text-gray-500">
                        <ChevronRight className="w-3 h-3 text-orange-600/50" />
                        {e}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIOS
      ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-orange-400 text-xs font-bold tracking-widest uppercase mb-3">TESTIMONIOS</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Creadores que ya lo usan
          </h2>
          <p className="text-gray-400 mt-4 text-lg">Lo que dicen quienes producen contenido con FoxPDF.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIOS.map((t) => {
            const AVATAR_COLORS: Record<string, string> = {
              orange:  "bg-orange-500",
              indigo:  "bg-indigo-500",
              emerald: "bg-emerald-500",
            };
            return (
              <div key={t.nombre} className="bg-gray-900 border border-gray-800 rounded-2xl p-7 flex flex-col">
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed flex-1">&ldquo;{t.texto}&rdquo;</p>
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-800">
                  <div className={`w-9 h-9 rounded-full ${AVATAR_COLORS[t.color] ?? "bg-gray-700"} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.nombre}</p>
                    <p className="text-gray-500 text-xs">{t.rol}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════
          COMPARATIVA
      ══════════════════════════════════════ */}
      <section className="bg-gray-900/30 border-y border-gray-800/60">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 py-24">
          <div className="text-center mb-14">
            <span className="inline-block text-orange-400 text-xs font-bold tracking-widest uppercase mb-3">COMPARATIVA</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Por qué FoxPDF vs el método tradicional
            </h2>
          </div>
          <div className="rounded-2xl overflow-hidden border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-6 py-4 text-gray-400 font-medium bg-gray-900 w-1/3">Criterio</th>
                  <th className="px-6 py-4 text-gray-400 font-medium bg-gray-900 text-center">Método tradicional</th>
                  <th className="px-6 py-4 text-white font-bold bg-orange-600/10 text-center border-l border-orange-500/20">
                    <span className="flex items-center justify-center gap-1.5"><FoxLogo className="w-4 h-4" /> FoxPDF</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARATIVA.rows.map((row, i) => (
                  <tr key={row.item} className={`border-b border-gray-800/60 ${i % 2 === 0 ? "bg-gray-900/40" : "bg-gray-900/20"}`}>
                    <td className="px-6 py-4 text-gray-300 font-medium">{row.item}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 text-gray-500">
                        <X className="w-3.5 h-3.5 text-red-700" /> {row.tradicional}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center bg-orange-600/5 border-l border-orange-500/10">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <Check className="w-3.5 h-3.5" /> {row.foxpdf}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PRECIOS
      ══════════════════════════════════════ */}
      <section id="precios" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-orange-600/5 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-5 text-orange-300 text-xs font-semibold tracking-wide">
              <CreditCard className="w-3.5 h-3.5" /> PRECIOS SIMPLES, SIN SORPRESAS
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Paga solo por lo que usas.<br />
              <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                Los créditos se renuevan cada mes.
              </span>
            </h2>
            <p className="text-gray-400 mt-5 text-lg max-w-xl mx-auto">
              Un crédito = un ebook sin imágenes. Las imágenes IA suman créditos según la calidad. Sin contratos, sin letra chica.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {[
              { label: "1 ebook (sin imágenes)", costo: "1 crédito" },
              { label: "imagen Flash por capítulo",  costo: "+ 1 crédito" },
              { label: "imagen Pro por capítulo",    costo: "+ 3 créditos" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-4 py-2">
                <span className="text-white font-bold text-sm">{item.costo}</span>
                <span className="text-gray-500 text-xs">·</span>
                <span className="text-gray-400 text-xs">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
            {PLANES.map((plan) => {
              const colorAccent = ACCENTS[plan.color as keyof typeof ACCENTS];
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl flex flex-col border-2 ${colorAccent.ring} ${colorAccent.glow} ${
                    plan.destacado
                      ? "bg-gradient-to-b from-orange-950/50 via-gray-900 to-gray-900"
                      : "bg-gray-900"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                      <span className={`text-xs font-bold px-4 py-1 rounded-full ${colorAccent.badge}`}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="p-6 pb-0">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">{plan.nombre}</p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl font-black text-white">{plan.precio}</span>
                      <span className="text-gray-500 text-sm">{plan.periodo}</span>
                    </div>
                    <p className="text-gray-400 text-xs mb-4">{plan.desc}</p>

                    <div className="rounded-xl bg-gray-800/60 border border-gray-700/50 px-4 py-3 mb-5 text-center">
                      <p className="text-gray-500 text-xs mb-1">hasta</p>
                      <p className={`text-2xl font-black ${colorAccent.num}`}>{plan.ebooksMes} PDFs</p>
                      <p className="text-gray-500 text-xs mt-0.5">al mes (sin imágenes)</p>
                    </div>

                    <Link
                      href={isAuth ? (plan.id === "gratis" ? "/dashboard" : "/planes") : "/registro"}
                      className={`w-full text-center font-bold py-3 rounded-xl transition-colors block mb-5 text-sm ${colorAccent.btn}`}
                    >
                      {plan.id === "gratis" ? "Empezar gratis" : `Elegir ${plan.nombre}`}
                    </Link>
                  </div>

                  <div className="mx-6 border-t border-gray-800 mb-5" />

                  <div className="px-6 pb-6 flex-1 flex flex-col">
                    <ul className="space-y-2.5 flex-1">
                      {plan.includes.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-gray-300">
                          <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                      {plan.excludes.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                          <X className="w-3.5 h-3.5 text-gray-700 flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500">
            <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-gray-600" /> Pago seguro vía MercadoPago</span>
            <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 text-gray-600" /> Créditos se renuevan el 1 de cada mes</span>
            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-gray-600" /> Cancela cuando quieras</span>
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-gray-600" /> Licencia comercial en todos los planes</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FAQ
      ══════════════════════════════════════ */}
      <section className="bg-gray-900/30 border-y border-gray-800/60">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-24">
          <div className="text-center mb-14">
            <span className="inline-block text-orange-400 text-xs font-bold tracking-widest uppercase mb-3">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl px-6 py-5 transition-colors">
                <summary className="flex items-center justify-between cursor-pointer text-white font-medium list-none gap-4">
                  <span>{faq.q}</span>
                  <span className="text-orange-500 group-open:rotate-45 transition-transform text-xl leading-none flex-shrink-0">+</span>
                </summary>
                <p className="text-gray-400 text-sm mt-4 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-24">
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-600 to-amber-500 rounded-3xl px-8 py-20 text-center">
          {/* Decoración */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-[80px]" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full blur-[60px]" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <Users className="w-3.5 h-3.5 text-white/80" />
              <span className="text-white/90 text-xs font-semibold">340+ creadores ya generan con FoxPDF</span>
            </div>
            <Wand2 className="w-10 h-10 text-white/90 mx-auto mb-5" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Tu próximo ebook empieza hoy
            </h2>
            <p className="text-white/85 text-lg mt-4 leading-relaxed">
              Únete a los creadores que ya producen documentos profesionales con IA.
              Empieza gratis — sin tarjeta, sin compromisos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-9">
              <Link
                href={isAuth ? "/dashboard" : "/registro"}
                className="inline-flex items-center justify-center gap-2 bg-white text-orange-700 font-bold px-8 py-4 rounded-xl hover:bg-orange-50 transition-colors shadow-lg text-base"
              >
                <BookOpen className="w-5 h-5" />
                {isAuth ? "Ir al panel" : "Crear mi primer ebook gratis"}
              </Link>
              <a
                href="#precios"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-base"
              >
                Ver planes
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-white/70 text-sm">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> 5 ebooks gratis</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Sin tarjeta</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Cancela cuando quieras</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
