import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Endpoint ligero para consultar el estado de un proyecto.
// Lo usa el cliente para recuperarse si el stream SSE se interrumpe.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: proyecto } = await supabase
    .from("proyectos_pdf")
    .select("estado, titulo")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!proyecto) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json({
    estado: proyecto.estado,
    titulo: proyecto.titulo,
    previewUrl: proyecto.estado === "completado" ? `/preview/${id}` : null,
  });
}
