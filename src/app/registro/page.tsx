"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FoxLogo } from "@/components/marketing/FoxLogo";
import { CheckCircle } from "lucide-react";

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [okConfirm, setOkConfirm] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    if (!acepta) { setError("Debes aceptar los Términos y la Política de Privacidad."); return; }

    setLoading(true);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    });

    if (err) {
      setError(err.message.includes("already") ? "Este correo ya está registrado. Inicia sesión." : "No se pudo crear la cuenta. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    // Si la sesión viene inmediata (confirmación desactivada), entramos al panel
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setOkConfirm(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <FoxLogo className="w-12 h-12" />
            <span className="text-2xl font-extrabold text-white">Fox<span className="text-orange-500">PDF</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-2">Crea tu cuenta gratis</h1>
          <p className="text-gray-400 mt-1 text-sm">Empieza a crear ebooks profesionales en minutos.</p>
        </div>

        {okConfirm ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-white font-bold text-lg">Revisa tu correo</h2>
            <p className="text-gray-400 text-sm mt-2">
              Te enviamos un enlace de confirmación a <span className="text-white">{email}</span>. Confírmalo para
              activar tu cuenta.
            </p>
            <Link href="/login" className="inline-block mt-6 text-orange-400 hover:text-orange-300 text-sm font-medium">
              Ir a iniciar sesión →
            </Link>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Nombre</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm
                             placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Tu nombre" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Correo electrónico</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm
                             placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="tu@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm
                             placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Mínimo 6 caracteres" />
              </div>

              <label className="flex items-start gap-2.5 text-xs text-gray-400 cursor-pointer">
                <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)}
                  className="mt-0.5 accent-orange-500 w-4 h-4" />
                <span>
                  Acepto los <Link href="/terminos" className="text-orange-400 hover:underline">Términos y Condiciones</Link> y la{" "}
                  <Link href="/privacidad" className="text-orange-400 hover:underline">Política de Privacidad</Link>.
                </span>
              </label>

              {error && (
                <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-900 disabled:cursor-not-allowed
                           text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          ¿Ya tienes cuenta? <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
