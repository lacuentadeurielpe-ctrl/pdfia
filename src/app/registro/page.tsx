"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FoxLogo } from "@/components/marketing/FoxLogo";
import {
  Eye, EyeOff, Loader2, Check, CheckCircle2,
  Sparkles, ImageIcon, FileText, ShieldCheck,
} from "lucide-react";

const BENEFICIOS = [
  { icon: Sparkles,    text: "IA multi-agente que escribe y estructura por ti" },
  { icon: ImageIcon,   text: "Imágenes originales generadas por Gemini" },
  { icon: FileText,    text: "PDF profesional listo para vender en minutos" },
  { icon: ShieldCheck, text: "Licencia comercial incluida en todos los planes" },
];

export default function RegistroPage() {
  const router = useRouter();

  const [nombre, setNombre]                   = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [acepta, setAcepta]                   = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState("");
  const [okConfirm, setOkConfirm]             = useState(false);

  // Indicadores de fuerza de contraseña
  const pwChecks = {
    length:   password.length >= 8,
    upper:    /[A-Z]/.test(password),
    number:   /[0-9]/.test(password),
  };
  const pwFuerza = Object.values(pwChecks).filter(Boolean).length;
  const pwColor  = pwFuerza === 0 ? "bg-gray-700" : pwFuerza === 1 ? "bg-red-500" : pwFuerza === 2 ? "bg-amber-500" : "bg-emerald-500";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) { setError("Las contraseñas no coinciden."); return; }
    if (password.length < 8)          { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    if (!acepta)                       { setError("Debes aceptar los Términos y la Política de Privacidad."); return; }

    setLoading(true);

    try {
      const supabase = createClient();

      // Race: si Supabase tarda >1.5s enviando el email, redirigimos igual (el usuario fue creado)
      const result = await Promise.race([
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nombre },
            emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL ?? "https://foxpdf.cloud"}/auth/callback`,
          },
        }),
        new Promise<{ data: null; error: null }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: null }), 1500)
        ),
      ]);

      if (result.error) {
        const msg = result.error.message ?? "";
        setError(
          msg.toLowerCase().includes("already")
            ? "Este correo ya tiene una cuenta. Inicia sesión."
            : "No se pudo crear la cuenta. Intenta de nuevo."
        );
        setLoading(false);
        return;
      }

      if (result.data?.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setOkConfirm(true);
        setLoading(false);
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* ── Panel izquierdo — Brand ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border-r border-gray-800 p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-600/8 rounded-full blur-[100px] -z-0" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-600/6 rounded-full blur-[80px] -z-0" />

        <Link href="/" className="relative z-10 inline-flex items-center gap-3">
          <FoxLogo className="w-10 h-10" />
          <span className="text-2xl font-extrabold text-white">Fox<span className="text-orange-500">PDF</span></span>
        </Link>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300 text-xs font-semibold">Empieza gratis — sin tarjeta</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
            Tu primer ebook<br />
            <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              listo en 5 minutos.
            </span>
          </h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            Crea una cuenta gratis y empieza a generar documentos profesionales con IA sin necesidad de saber diseño ni redacción.
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

        <div className="relative z-10 text-xs text-gray-600 flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>5 ebooks gratis · sin compromiso · cancela cuando quieras</span>
        </div>
      </div>

      {/* ── Panel derecho — Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
        {/* Logo móvil */}
        <Link href="/" className="lg:hidden inline-flex items-center gap-2.5 mb-8">
          <FoxLogo className="w-9 h-9" />
          <span className="text-2xl font-extrabold text-white">Fox<span className="text-orange-500">PDF</span></span>
        </Link>

        <div className="w-full max-w-sm">
          {okConfirm ? (
            /* ── Estado: email enviado ── */
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Revisa tu correo</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Enviamos un enlace de confirmación a{" "}
                <span className="text-white font-medium">{email}</span>.
                Confírmalo para activar tu cuenta.
              </p>
              <div className="mt-8 p-4 bg-gray-900 border border-gray-800 rounded-2xl text-left">
                <p className="text-xs text-gray-500 mb-2">¿No te llegó? Revisa tu carpeta de spam o</p>
                <button
                  onClick={() => setOkConfirm(false)}
                  className="text-orange-400 hover:text-orange-300 text-xs font-medium transition-colors"
                >
                  vuelve a intentarlo con otro correo →
                </button>
              </div>
              <Link href="/login" className="inline-block mt-6 text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Ir a iniciar sesión →
              </Link>
            </div>
          ) : (
            /* ── Formulario de registro ── */
            <>
              <div className="mb-7">
                <h1 className="text-2xl font-bold text-white">Crea tu cuenta gratis</h1>
                <p className="text-gray-400 text-sm mt-1">Empieza a crear ebooks profesionales hoy.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre</label>
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    placeholder="Tu nombre o el de tu negocio"
                    className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-white
                               placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1
                               focus:ring-orange-500/50 transition-all text-sm"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Correo electrónico</label>
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

                {/* Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="Mínimo 8 caracteres"
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
                  {/* Barra de fuerza */}
                  {password && (
                    <div className="mt-2 flex gap-1">
                      {[0,1,2].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < pwFuerza ? pwColor : "bg-gray-700"}`} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirmar contraseña</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Repite tu contraseña"
                    className={`w-full bg-gray-800/60 border rounded-xl px-4 py-3 text-white
                               placeholder-gray-500 focus:outline-none focus:ring-1 transition-all text-sm ${
                      confirmPassword && confirmPassword !== password
                        ? "border-red-600 focus:border-red-500 focus:ring-red-500/50"
                        : "border-gray-700 focus:border-orange-500 focus:ring-orange-500/50"
                    }`}
                  />
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-red-400 mt-1">Las contraseñas no coinciden</p>
                  )}
                </div>

                {/* Términos */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <div
                    onClick={() => setAcepta(!acepta)}
                    className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors cursor-pointer ${
                      acepta ? "bg-orange-600 border-orange-600" : "border-gray-600 hover:border-gray-500"
                    }`}
                  >
                    {acepta && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-xs text-gray-400 leading-relaxed">
                    Acepto los{" "}
                    <Link href="/terminos" className="text-orange-400 hover:text-orange-300 underline">Términos y Condiciones</Link>
                    {" "}y la{" "}
                    <Link href="/privacidad" className="text-orange-400 hover:text-orange-300 underline">Política de Privacidad</Link>
                  </span>
                </label>

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
                             py-3 rounded-xl transition-colors text-sm shadow-lg shadow-orange-600/20 mt-1"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-5">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
                  Inicia sesión
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="mt-8 text-xs text-gray-700">
          <Link href="/" className="hover:text-gray-500 transition-colors">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
