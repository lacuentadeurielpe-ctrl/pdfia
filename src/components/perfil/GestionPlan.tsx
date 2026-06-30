"use client";
import { useState } from "react";
import Link from "next/link";
import { CreditCard, AlertTriangle, Check, Loader2, RefreshCw, RotateCcw } from "lucide-react";

interface Suscripcion {
  plan:          string;
  estado:        string;
  creditos_totales: number;
  creditos_usados:  number;
  ciclo_fin:     string;
  ilimitado:     boolean;
}

interface Props {
  suscripcion: Suscripcion | null;
  planNombre:  string;
  onRefresh:   () => void;
}

function fecha(s: string) {
  return new Date(s).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
}

export default function GestionPlan({ suscripcion: sub, planNombre, onRefresh }: Props) {
  const [loading,  setLoading]  = useState<"cancelar" | "reactivar" | null>(null);
  const [msg,      setMsg]      = useState<{ tipo: "ok" | "err"; texto: string } | null>(null);
  const [confirm,  setConfirm]  = useState(false);

  const pendiente = sub?.estado === "pendiente_cancelacion";
  const esGratis  = !sub || sub.plan === "gratis";
  const disp      = sub ? Math.max(0, sub.creditos_totales - sub.creditos_usados) : 0;
  const pct       = sub && sub.creditos_totales > 0 ? Math.round((disp / sub.creditos_totales) * 100) : 0;

  async function cancelar() {
    setLoading("cancelar"); setMsg(null);
    const res = await fetch("/api/cuenta/cancelar", { method: "POST" });
    const d   = await res.json();
    setLoading(null); setConfirm(false);
    setMsg(res.ok ? { tipo: "ok", texto: d.mensaje } : { tipo: "err", texto: d.error });
    if (res.ok) onRefresh();
  }

  async function reactivar() {
    setLoading("reactivar"); setMsg(null);
    const res = await fetch("/api/cuenta/reactivar", { method: "POST" });
    const d   = await res.json();
    setLoading(null);
    setMsg(res.ok ? { tipo: "ok", texto: "Plan reactivado correctamente." } : { tipo: "err", texto: d.error });
    if (res.ok) onRefresh();
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <CreditCard className="w-4 h-4 text-indigo-400" />
        <h3 className="text-white font-semibold">Suscripción</h3>
      </div>

      {/* Estado actual */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${sub?.ilimitado ? "text-amber-300" : "text-white"}`}>
              {sub?.ilimitado ? "Ilimitado" : planNombre}
            </span>
            {pendiente && (
              <span className="text-xs bg-amber-600/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                Cancelación pendiente
              </span>
            )}
          </div>
          {sub && (
            <p className="text-gray-500 text-xs mt-0.5">
              {pendiente
                ? `Acceso hasta el ${fecha(sub.ciclo_fin)}, luego pasa a Gratis`
                : `Ciclo termina el ${fecha(sub.ciclo_fin)}`
              }
            </p>
          )}
        </div>
        <Link href="/planes"
          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
          Ver planes →
        </Link>
      </div>

      {/* Barra de créditos */}
      {sub && (
        <div className="bg-gray-800/50 rounded-xl p-4 mb-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300 font-medium">
              {sub.ilimitado ? "∞" : disp} créditos disponibles
            </span>
            <span className="text-gray-500">{sub.ilimitado ? "Ilimitado" : `de ${sub.creditos_totales}`}</span>
          </div>
          {!sub.ilimitado && (
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${pct > 50 ? "bg-emerald-500" : pct > 20 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>
      )}

      {/* Mensaje de acción */}
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm mb-4 flex items-start gap-2 ${
          msg.tipo === "ok"
            ? "bg-emerald-950/60 border border-emerald-800 text-emerald-300"
            : "bg-red-950/60 border border-red-800 text-red-300"
        }`}>
          {msg.tipo === "ok" ? <Check className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          {msg.texto}
        </div>
      )}

      {/* Acciones */}
      {!esGratis && !sub?.ilimitado && (
        <div className="border-t border-gray-800 pt-5">
          {pendiente ? (
            <div>
              <p className="text-gray-400 text-sm mb-3">
                Cancelaste tu plan. Puedes reactivarlo antes de que venza el ciclo.
              </p>
              <button onClick={reactivar} disabled={!!loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500
                           disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                {loading === "reactivar" ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                {loading === "reactivar" ? "Reactivando..." : "Reactivar plan"}
              </button>
            </div>
          ) : confirm ? (
            <div className="bg-red-950/30 border border-red-800/60 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  ¿Confirmas la cancelación? Conservarás el acceso hasta que termine el ciclo actual.
                  Después, el plan bajará a <strong className="text-white">Gratis</strong> automáticamente.
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={cancelar} disabled={!!loading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600
                             disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                  {loading === "cancelar" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading === "cancelar" ? "Cancelando..." : "Sí, cancelar plan"}
                </button>
                <button onClick={() => setConfirm(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-xl transition-colors">
                  No, conservar plan
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirm(true)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Cancelar suscripción
            </button>
          )}
        </div>
      )}

      {esGratis && (
        <div className="border-t border-gray-800 pt-5">
          <p className="text-gray-600 text-sm">
            Estás en el plan Gratis.{" "}
            <Link href="/planes" className="text-indigo-400 hover:text-indigo-300">
              Mejora tu plan →
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
