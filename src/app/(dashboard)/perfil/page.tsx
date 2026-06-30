"use client";
import { useEffect, useState, useCallback } from "react";
import InfoPersonal  from "@/components/perfil/InfoPersonal";
import GestionPlan   from "@/components/perfil/GestionPlan";
import MetodoPago    from "@/components/perfil/MetodoPago";
import HistorialPagos from "@/components/perfil/HistorialPagos";

interface Perfil {
  usuario:     { id: string; email: string; nombre: string };
  suscripcion: {
    plan: string; estado: string; creditos_totales: number;
    creditos_usados: number; ciclo_fin: string; ilimitado: boolean;
  } | null;
  planInfo: { id: string; nombre: string; precio: number };
  pagos:   { id: string; plan_id: string; monto_soles: number; estado: string; created_at: string }[];
  metodos: { id: string; tipo: string; resumen: string | null; activo: boolean }[];
}

export default function PerfilPage() {
  const [perfil,  setPerfil]  = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(() => {
    setLoading(true);
    fetch("/api/cuenta/perfil")
      .then(r => r.json())
      .then(setPerfil)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  if (loading) return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="h-8 w-40 bg-gray-800 rounded-lg animate-pulse mb-8" />
      <div className="space-y-5">
        {[1,2,3,4].map(i => <div key={i} className="h-48 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  if (!perfil) return (
    <div className="p-8 text-gray-600">Error al cargar el perfil. Recarga la página.</div>
  );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Mi cuenta</h1>
        <p className="text-gray-500 text-sm mt-1">Gestiona tu perfil, plan y pagos.</p>
      </div>

      <div className="space-y-5">
        <InfoPersonal nombre={perfil.usuario.nombre} email={perfil.usuario.email} />
        <GestionPlan
          suscripcion={perfil.suscripcion}
          planNombre={perfil.planInfo.nombre}
          onRefresh={cargar}
        />
        <MetodoPago metodos={perfil.metodos} />
        <HistorialPagos pagos={perfil.pagos} />
      </div>
    </div>
  );
}
