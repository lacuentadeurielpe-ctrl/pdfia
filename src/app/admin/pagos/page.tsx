"use client";
import { useEffect, useState } from "react";

interface Pago { id: string; email: string; plan_id: string; monto_soles: number; estado: string; created_at: string; }
interface Accion { accion: string; email: string; detalle: Record<string, unknown>; created_at: string; }

function fecha(s: string) { return new Date(s).toLocaleString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); }

const ESTADO_COLOR: Record<string, string> = {
  aprobado: "text-emerald-400", approved: "text-emerald-400",
  pendiente: "text-amber-400", pending: "text-amber-400",
  rechazado: "text-red-400", rejected: "text-red-400",
};

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/pagos").then((r) => r.json()).then((d) => {
      setPagos(d.pagos ?? []); setAcciones(d.acciones ?? []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Pagos y auditoría</h1>
      <p className="text-gray-500 text-sm mb-8">Transacciones de MercadoPago y registro de tus acciones.</p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pagos */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800"><h2 className="text-white font-semibold text-sm">Pagos MercadoPago</h2></div>
          {loading ? <div className="p-6 text-gray-600 text-sm">Cargando…</div>
            : pagos.length === 0 ? <div className="p-6 text-gray-600 text-sm">Sin pagos todavía.</div>
            : pagos.map((p) => (
              <div key={p.id} className="px-5 py-3 border-b border-gray-800/50 last:border-0 flex justify-between items-center">
                <div className="min-w-0">
                  <div className="text-white text-sm truncate">{p.email}</div>
                  <div className="text-gray-600 text-xs">{p.plan_id} · {fecha(p.created_at)}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-white text-sm font-semibold">S/ {Number(p.monto_soles).toFixed(2)}</div>
                  <div className={`text-xs capitalize ${ESTADO_COLOR[p.estado] ?? "text-gray-500"}`}>{p.estado}</div>
                </div>
              </div>
            ))}
        </div>

        {/* Auditoría */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800"><h2 className="text-white font-semibold text-sm">Registro de acciones</h2></div>
          {loading ? <div className="p-6 text-gray-600 text-sm">Cargando…</div>
            : acciones.length === 0 ? <div className="p-6 text-gray-600 text-sm">Sin acciones registradas.</div>
            : acciones.map((a, i) => (
              <div key={i} className="px-5 py-3 border-b border-gray-800/50 last:border-0">
                <div className="flex justify-between gap-2">
                  <span className="text-indigo-300 text-sm font-medium capitalize">{a.accion.replace(/_/g, " ")}</span>
                  <span className="text-gray-600 text-xs flex-shrink-0">{fecha(a.created_at)}</span>
                </div>
                <div className="text-gray-500 text-xs mt-0.5">
                  {a.email !== "—" && <span>{a.email} · </span>}
                  {Object.entries(a.detalle ?? {}).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
