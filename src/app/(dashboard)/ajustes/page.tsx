import { createClient } from "@/lib/supabase/server";
import AjustesForm from "@/components/ajustes/AjustesForm";

export default async function AjustesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: config } = await supabase
    .from("configuraciones_negocio")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Ajustes del Negocio</h1>
        <p className="text-gray-400 text-sm mt-1">
          Configura el logo, colores y datos de tu empresa. Se aplicarán a todos tus PDFs.
        </p>
      </div>
      <AjustesForm config={config} userId={user!.id} />
    </div>
  );
}
