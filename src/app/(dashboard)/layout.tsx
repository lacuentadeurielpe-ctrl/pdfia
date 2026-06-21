import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: config } = await supabase
    .from("configuraciones_negocio")
    .select("nombre_negocio, logo_url, color_primario")
    .single();

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar
        nombreNegocio={config?.nombre_negocio ?? "Mi Negocio"}
        logoUrl={config?.logo_url ?? null}
        userEmail={user.email ?? ""}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
