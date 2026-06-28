import { createClient } from "@/lib/supabase/server";
import { getOrCreateSuscripcion } from "@/lib/planes/creditos";
import AjustesForm from "@/components/ajustes/AjustesForm";

export default async function AjustesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: config }, { plan }] = await Promise.all([
    supabase
      .from("configuraciones_negocio")
      .select("id, nombre_negocio, logo_url, color_primario, color_secundario, color_acento")
      .eq("user_id", user!.id)
      .single(),
    getOrCreateSuscripcion(user!.id),
  ]);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Ajustes del Negocio</h1>
        <p className="text-gray-400 text-sm mt-1">
          Configura el logo, colores y nombre de tu empresa para que aparezcan en tus PDFs.
        </p>
      </div>
      <AjustesForm
        config={config}
        userId={user!.id}
        marcaPersonalizada={plan.marcaPersonalizada}
        planNombre={plan.nombre}
      />
    </div>
  );
}
