"use client";
import { useState } from "react";
import { Gift, Check, AlertTriangle } from "lucide-react";

const GRUPOS = [
  { id: "todos",            label: "Todos los usuarios" },
  { id: "plan:gratis",   label: "Plan Gratis" },
  { id: "plan:creador",  label: "Plan Creador" },
  { id: "plan:estudio",  label: "Plan Estudio" },
  { id: "ilimitado",        label: "Cuentas ilimitadas" },
  { id: "lista",            label: "Lista de correos" },
];

export default function CreditosMasivos() {
  const [grupo, setGrupo] = useState("plan:gratis");
  const [cantidad, setCantidad] = useState("");
  const [emails, setEmails] = useState("");
  const [busy, setBusy] = useState(false);
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null);

  async function enviar() {
    setBusy(true); setResultado(null);
    const body: Record<string, unknown> = { grupo, cantidad: Number(cantidad) };
    if (grupo === "lista") body.emails = emails.split(/[\n,;]+/).map((e) => e.trim()).filter(Boolean);
    const res = await fetch("/api/admin/creditos-masivo", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    setBusy(false);
    const d = await res.json();
    if (res.ok) setResultado({ ok: true, texto: `✓ ${cantidad} créditos regalados a ${d.afectados} usuario(s).` });
    else setResultado({ ok: false, texto: d.error ?? "Error" });
  }

  const puede = Number(cantidad) > 0 && (grupo !== "lista" || emails.trim().length > 0);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Créditos masivos</h1>
      <p className="text-gray-500 text-sm mb-8">Regala créditos de cortesía a un grupo de un solo clic.</p>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-white font-semibold text-sm mb-3">¿A quién?</label>
          <div className="grid grid-cols-2 gap-2">
            {GRUPOS.map((g) => (
              <button key={g.id} onClick={() => setGrupo(g.id)}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors ${
                  grupo === g.id ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}>{g.label}</button>
            ))}
          </div>
        </div>

        {grupo === "lista" && (
          <div>
            <label className="block text-white font-semibold text-sm mb-2">Correos</label>
            <textarea value={emails} onChange={(e) => setEmails(e.target.value)} rows={5}
              placeholder="Pega los correos separados por coma, punto y coma o salto de línea"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none" />
          </div>
        )}

        <div>
          <label className="block text-white font-semibold text-sm mb-2">¿Cuántos créditos?</label>
          <input type="number" min={1} value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="Ej: 20"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
        </div>

        <button disabled={busy || !puede} onClick={enviar}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold py-3.5 rounded-2xl transition-colors">
          <Gift className="w-5 h-5" />
          {busy ? "Enviando…" : "Regalar créditos"}
        </button>

        {resultado && (
          <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${resultado.ok ? "bg-emerald-950/60 border border-emerald-800 text-emerald-300" : "bg-red-950/60 border border-red-800 text-red-300"}`}>
            {resultado.ok ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {resultado.texto}
          </div>
        )}
      </div>
    </div>
  );
}
