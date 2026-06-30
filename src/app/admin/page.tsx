"use client";
import { useEffect, useState } from "react";
import { Users, UserPlus, Infinity as InfinityIcon, FileText, TrendingUp, DollarSign } from "lucide-react";

interface Metricas {
  totalUsuarios: number;
  nuevos30: number;
  ilimitados: number;
  porPlan: Record<string, number>;
  totalEbooks: number;
  ebooks30: number;
  ingresos: number;
  pagosAprobados: number;
}

const PLAN_LABEL: Record<string, string> = {
  gratis: "Gratis", creador: "Creador", estudio: "Estudio",
};

export default function AdminHome() {
  const [m, setM] = useState<Metricas | null>(null);

  useEffect(() => {
    fetch("/api/admin/metricas").then((r) => r.json()).then(setM).catch(() => {});
  }, []);

  const cards = m ? [
    { label: "Usuarios totales", value: m.totalUsuarios, icon: Users, color: "text-indigo-400" },
    { label: "Nuevos (30 días)", value: m.nuevos30, icon: UserPlus, color: "text-emerald-400" },
    { label: "Cuentas ilimitadas", value: m.ilimitados, icon: InfinityIcon, color: "text-amber-400" },
    { label: "Ebooks totales", value: m.totalEbooks, icon: FileText, color: "text-violet-400" },
    { label: "Ebooks (30 días)", value: m.ebooks30, icon: TrendingUp, color: "text-sky-400" },
    { label: "Ingresos (S/)", value: `S/ ${m.ingresos.toFixed(2)}`, icon: DollarSign, color: "text-green-400" },
  ] : [];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Resumen</h1>
      <p className="text-gray-500 text-sm mb-8">Vista general de FoxPDF.</p>

      {!m ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <Icon className={`w-5 h-5 ${c.color} mb-3`} />
                  <div className="text-2xl font-bold text-white">{c.value}</div>
                  <div className="text-gray-500 text-xs mt-1">{c.label}</div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Distribución por plan</h2>
            <div className="space-y-3">
              {Object.entries(m.porPlan).sort((a, b) => b[1] - a[1]).map(([plan, n]) => {
                const pct = m.totalUsuarios ? Math.round((n / m.totalUsuarios) * 100) : 0;
                return (
                  <div key={plan}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{PLAN_LABEL[plan] ?? plan}</span>
                      <span className="text-gray-500">{n} · {pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
