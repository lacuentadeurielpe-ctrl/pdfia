"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FoxLogo } from "@/components/marketing/FoxLogo";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

export default function ActualizarPasswordPage() {
  const router = useRouter();
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [listo, setListo]             = useState(false);

  // Supabase SSR pone la sesión de recovery en la cookie automáticamente
  // vía /auth/callback. Solo necesitamos que haya sesión activa.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login?error=link_invalido");
      }
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    if (password.length < 8)  { setError("Mínimo 8 caracteres."); return; }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });

    if (err) {
      setError("No se pudo actualizar la contraseña. El enlace puede haber vencido.");
      setLoading(false);
      return;
    }

    setListo(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  const pwFuerza = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password)].filter(Boolean).length;
  const pwColor  = pwFuerza === 0 ? "bg-gray-700" : pwFuerza === 1 ? "bg-red-500" : pwFuerza === 2 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <Link href="/" className="inline-flex items-center gap-2.5 mb-10">
        <FoxLogo className="w-9 h-9" />
        <span className="text-2xl font-extrabold text-white">Fox<span className="text-orange-500">PDF</span></span>
      </Link>

      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8">
        {listo ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Contraseña actualizada</h2>
            <p className="text-gray-400 text-sm">Redirigiendo a tu panel...</p>
          </div>
        ) : (
          <>
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-white">Nueva contraseña</h1>
              <p className="text-gray-400 text-sm mt-1">Elige una contraseña segura para tu cuenta.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nueva contraseña</label>
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
                {password && (
                  <div className="mt-2 flex gap-1">
                    {[0,1,2].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < pwFuerza ? pwColor : "bg-gray-700"}`} />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirmar contraseña</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Repite tu contraseña"
                  className={`w-full bg-gray-800/60 border rounded-xl px-4 py-3 text-white
                             placeholder-gray-500 focus:outline-none focus:ring-1 transition-all text-sm ${
                    confirm && confirm !== password
                      ? "border-red-600 focus:border-red-500 focus:ring-red-500/50"
                      : "border-gray-700 focus:border-orange-500 focus:ring-orange-500/50"
                  }`}
                />
                {confirm && confirm !== password && (
                  <p className="text-xs text-red-400 mt-1">Las contraseñas no coinciden</p>
                )}
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
                {loading ? "Actualizando..." : "Guardar nueva contraseña"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
