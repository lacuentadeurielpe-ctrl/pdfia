import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateSuscripcion } from "@/lib/planes/creditos";
import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [configResult, creditos] = await Promise.all([
    supabase
      .from("configuraciones_negocio")
      .select("nombre_negocio, logo_url, color_primario")
      .eq("user_id", user.id)
      .single(),
    getOrCreateSuscripcion(user.id),
  ]);

  const config = configResult.data;

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar
        nombreNegocio={config?.nombre_negocio ?? "Mi Negocio"}
        logoUrl={config?.logo_url ?? null}
        userEmail={user.email ?? ""}
        planNombre={creditos.plan.nombre}
        planId={creditos.plan.id}
        creditosDisponibles={creditos.disponibles}
        creditosTotales={creditos.suscripcion.creditos_totales}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
