"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FoxLogo } from "@/components/marketing/FoxLogo";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

function RecuperarForm() {
  const searchParams = useSearchParams();
  const emailPrefill = searchParams.get("email") ?? "";

  const [email, setEmail]   = useState(emailPrefill);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (err) {
      setError("No se pudo enviar el correo. Verifica la dirección e intenta de nuevo.");
      setLoading(false);
      return;
    }

    setEnviado(true);
    setLoading(false);
  }

  if (enviado) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Correo enviado</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Si existe una cuenta con{" "}
          <span className="text-white font-medium">{email}</span>,
          recibirás un enlace para restablecer tu contraseña.
        </p>
        <p className="text-xs text-gray-600">Revisa también tu carpeta de spam.</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 mt-8 text-sm text-orange-400 hover:text-orange-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Recupera tu contraseña</h1>
        <p className="text-gray-400 text-sm mt-1">
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>
      </div>

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
          {loading ? "Enviando..." : "Enviar enlace de recuperación"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a iniciar sesión
        </Link>
      </div>
    </>
  );
}

export default function RecuperarPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <Link href="/" className="inline-flex items-center gap-2.5 mb-10">
        <FoxLogo className="w-9 h-9" />
        <span className="text-2xl font-extrabold text-white">Fox<span className="text-orange-500">PDF</span></span>
      </Link>

      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <Suspense fallback={
          <div className="space-y-5 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-11 bg-gray-800 rounded-xl" />)}
          </div>
        }>
          <RecuperarForm />
        </Suspense>
      </div>

      <p className="mt-6 text-xs text-gray-700">
        <Link href="/" className="hover:text-gray-500 transition-colors">← Volver al inicio</Link>
      </p>
    </div>
  );
}
