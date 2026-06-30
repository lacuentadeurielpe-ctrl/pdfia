"use client";
import { Receipt, ExternalLink } from "lucide-react";

interface Pago {
  id:          string;
  plan_id:     string;
  monto_soles: number;
  estado:      string;
  created_at:  string;
}

interface Props {
  pagos: Pago[];
}

const ESTADO_COLOR: Record<string, string> = {
  approved: "text-emerald-400", aprobado:   "text-emerald-400",
  pending:  "text-amber-400",  pendiente:   "text-amber-400",
  rejected: "text-red-400",    rechazado:   "text-red-400",
};

const PLAN_NOMBRE: Record<string, string> = {
  creador: "Plan Creador", estudio: "Plan Estudio",
  gratis:  "Plan Gratis",  desconocido: "—",
};

function fecha(s: string) {
  return new Date(s).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

export default function HistorialPagos({ pagos }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Receipt className="w-4 h-4 text-indigo-400" />
        <h3 className="text-white font-semibold">Historial de pagos</h3>
      </div>

      {pagos.length === 0 ? (
        <div className="text-center py-6">
          <Receipt className="w-8 h-8 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Sin pagos registrados</p>
          <p className="text-gray-600 text-xs mt-1">Tus facturas aparecerán aquí después de cada compra.</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-3 py-2 text-xs text-gray-500 font-medium border-b border-gray-800">
            <span>Plan</span><span>Fecha</span><span>Monto</span><span>Estado</span>
          </div>
          {pagos.map(p => (
            <div key={p.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-3 py-3 border-b border-gray-800/50 last:border-0 items-center">
              <span className="text-gray-300 text-sm">{PLAN_NOMBRE[p.plan_id] ?? p.plan_id}</span>
              <span className="text-gray-500 text-xs">{fecha(p.created_at)}</span>
              <span className="text-white text-sm font-medium">S/ {Number(p.monto_soles).toFixed(2)}</span>
              <span className={`text-xs capitalize font-medium ${ESTADO_COLOR[p.estado] ?? "text-gray-400"}`}>
                {p.estado === "approved" ? "Aprobado" : p.estado === "pending" ? "Pendiente" : p.estado === "rejected" ? "Rechazado" : p.estado}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-800">
        <p className="text-gray-600 text-xs flex items-center gap-1.5">
          <ExternalLink className="w-3 h-3" />
          Para comprobantes fiscales, accede a tu cuenta de MercadoPago.
        </p>
      </div>
    </div>
  );
}
