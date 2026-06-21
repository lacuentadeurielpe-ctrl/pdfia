import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GeneradorClient from "@/components/generar/GeneradorClient";

export default async function GenerarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: proyecto } = await supabase
    .from("proyectos_pdf")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!proyecto) redirect("/crear");

  // Si ya está completado, cargamos la URL del preview directamente
  const previewUrl = proyecto.estado === "completado"
    ? `/preview/${id}`
    : null;

  return <GeneradorClient proyecto={proyecto} previewUrl={previewUrl} />;
}
