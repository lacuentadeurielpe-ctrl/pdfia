"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FoxLogo } from "@/components/marketing/FoxLogo";
import { Eye, EyeOff, Loader2, Check, Sparkles, ImageIcon, FileText } from "lucide-react";

const BENEFICIOS = [
  { icon: Sparkles,  text: "IA multi-agente que escribe y estructura por ti" },
  { icon: ImageIcon, text: "Imágenes originales generadas por Gemini" },
  { icon: FileText,  text: "PDF profesional listo para vender en minutos" },
  { icon: Check,     text: "Tu marca, tus colores, tu logo en cada documento" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      const msg = err.message.toLowerCase();
      if (msg.includes("email not confirmed")) {
        setError("Debes confirmar tu correo antes de ingresar. Revisa tu bandeja de entrada (y la carpeta spam).");
      } else if (msg.includes("invalid login") || msg.includes("invalid credentials") || msg.includes("user not found")) {
        setError("Correo o contraseña incorrectos. Verifica tus datos.");
      } else {
        setError(err.message);
      }
      setLoading(false);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Correo electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="tu@email.com"
          className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-white
                     placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1
                     focus:ring-orange-500/50 transition-all text-sm"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-gray-300">Contraseña</label>
          <Link href="/recuperar-password" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 pr-11 text-white
                       placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1
                       focus:ring-orange-500/50 transition-all text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/60 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500
                   disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold
                   py-3 rounded-xl transition-colors text-sm shadow-lg shadow-orange-600/20"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Ingresando..." : "Iniciar sesión"}
      </button>

      <p className="text-center text-gray-500 text-sm pt-1">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
          Regístrate gratis
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* ── Panel izquierdo — Brand ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border-r border-gray-800 p-12 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-600/8 rounded-full blur-[100px] -z-0" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-600/6 rounded-full blur-[80px] -z-0" />

        {/* Logo */}
        <Link href="/" className="relative z-10 inline-flex items-center gap-3">
          <FoxLogo className="w-10 h-10" />
          <span className="text-2xl font-extrabold text-white">Fox<span className="text-orange-500">PDF</span></span>
        </Link>

        {/* Contenido central */}
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
            Genera ebooks<br />
            <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              que se venden solos.
            </span>
          </h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            Un equipo de agentes IA escribe, ilustra y diseña tus documentos completos. De una idea a un PDF profesional en minutos.
          </p>
          <ul className="space-y-4">
            {BENEFICIOS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-gray-300 text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer de confianza */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Empieza gratis · Sin tarjeta · Cancela cuando quieras</span>
          </div>
        </div>
      </div>

      {/* ── Panel derecho — Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        {/* Logo móvil */}
        <Link href="/" className="lg:hidden inline-flex items-center gap-2.5 mb-8">
          <FoxLogo className="w-9 h-9" />
          <span className="text-2xl font-extrabold text-white">Fox<span className="text-orange-500">PDF</span></span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Bienvenido de vuelta</h1>
            <p className="text-gray-400 text-sm mt-1">Ingresa a tu panel de creación</p>
          </div>

          <Suspense fallback={
            <div className="space-y-5 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-11 bg-gray-800 rounded-xl" />)}
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-8 text-xs text-gray-700">
          <Link href="/" className="hover:text-gray-500 transition-colors">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
