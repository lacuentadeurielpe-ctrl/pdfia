"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Infinity as InfinityIcon, ChevronRight } from "lucide-react";

interface Cliente {
  id: string; email: string; nombre: string; creadoEl: string;
  plan: string; planNombre: string; ilimitado: boolean;
  creditosDisponibles: number; creditosTotales: number; ebooks: number;
}

const FILTROS = [
  { id: "", label: "Todos" },
  { id: "gratis", label: "Gratis" },
  { id: "creador", label: "Creador" },
  { id: "estudio", label: "Estudio" },
  { id: "ilimitado", label: "Ilimitados" },
];

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState("");
  const [filtro, setFiltro] = useState("");

  const cargar = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (buscar) params.set("buscar", buscar);
    if (filtro) params.set("plan", filtro);
    fetch(`/api/admin/usuarios?${params}`)
      .then((r) => r.json())
      .then((d) => setClientes(d.usuarios ?? []))
      .finally(() => setLoading(false));
  }, [buscar, filtro]);

  useEffect(() => {
    const t = setTimeout(cargar, 250);
    return () => clearTimeout(t);
  }, [cargar]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Clientes</h1>
      <p className="text-gray-500 text-sm mb-6">Gestiona perfiles, planes y créditos.</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar por correo o nombre…"
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTROS.map((f) => (
            <button key={f.id} onClick={() => setFiltro(f.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filtro === f.id ? "bg-indigo-600 text-white" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-gray-800 text-xs text-gray-500 font-medium">
          <span>Cliente</span><span className="text-right">Plan</span><span className="text-right">Créditos</span><span className="text-right w-16">Ebooks</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-600 text-sm">Cargando…</div>
        ) : clientes.length === 0 ? (
          <div className="p-8 text-center text-gray-600 text-sm">Sin resultados.</div>
        ) : (
          clientes.map((c) => (
            <Link key={c.id} href={`/admin/clientes/${c.id}`}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3.5 border-b border-gray-800/60 last:border-0 hover:bg-gray-800/40 transition-colors items-center group">
              <div className="min-w-0">
                <div className="text-white text-sm font-medium truncate">{c.nombre || c.email}</div>
                <div className="text-gray-500 text-xs truncate">{c.email}</div>
              </div>
              <div className="text-right">
                {c.ilimitado ? (
                  <span className="inline-flex items-center gap-1 text-amber-300 text-xs font-semibold"><InfinityIcon className="w-3 h-3" />Ilimitado</span>
                ) : (
                  <span className="text-gray-300 text-xs">{c.planNombre}</span>
                )}
              </div>
              <div className="text-right text-sm">
                <span className={c.ilimitado ? "text-amber-300" : "text-white"}>{c.ilimitado ? "∞" : c.creditosDisponibles}</span>
              </div>
              <div className="text-right w-16 flex items-center justify-end gap-1">
                <span className="text-gray-400 text-sm">{c.ebooks}</span>
                <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400" />
              </div>
            </Link>
          ))
        )}
      </div>
      <p className="text-gray-600 text-xs mt-3">{clientes.length} cliente{clientes.length !== 1 ? "s" : ""}</p>
    </div>
  );
}
