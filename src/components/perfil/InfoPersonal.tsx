"use client";
import { useState } from "react";
import { User, Check, Loader2 } from "lucide-react";
import Link from "next/link";

interface Props {
  nombre: string;
  email:  string;
}

export default function InfoPersonal({ nombre: nombreInicial, email }: Props) {
  const [nombre,  setNombre]  = useState(nombreInicial);
  const [loading, setLoading] = useState(false);
  const [ok,      setOk]      = useState(false);
  const [error,   setError]   = useState("");

  async function guardar() {
    setLoading(true); setOk(false); setError("");
    const res = await fetch("/api/cuenta/perfil", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ nombre }),
    });
    setLoading(false);
    if (res.ok) { setOk(true); setTimeout(() => setOk(false), 2500); }
    else { const d = await res.json(); setError(d.error ?? "Error al guardar"); }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <User className="w-4 h-4 text-indigo-400" />
        <h3 className="text-white font-semibold">Información personal</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Nombre</label>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white
                       text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Correo electrónico</label>
          <input
            value={email}
            disabled
            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2.5
                       text-gray-500 text-sm cursor-not-allowed"
          />
          <p className="text-xs text-gray-600 mt-1">El correo no se puede cambiar desde aquí.</p>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={guardar}
          disabled={loading || !nombre.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500
                     disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : ok ? <Check className="w-4 h-4" /> : null}
          {ok ? "Guardado" : "Guardar cambios"}
        </button>
        <Link href="/actualizar-password" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          Cambiar contraseña →
        </Link>
      </div>
    </div>
  );
}
