import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const { titulo, contexto, modelo, capitulos, tono, incluirImagenes } = body;

  if (!contexto?.trim()) {
    return NextResponse.json({ error: "El contexto es requerido" }, { status: 400 });
  }

  const { data: proyecto, error } = await supabase
    .from("proyectos_pdf")
    .insert({
      user_id: user.id,
      titulo: titulo?.trim() || "Sin título aún",
      contexto: contexto.trim(),
      modelo_ia: modelo ?? "gemini-2.0-flash",
      incluir_imagenes: incluirImagenes ?? true,
      num_capitulos: capitulos ?? 5,
      tono: tono ?? "profesional",
      estado: "pendiente",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ proyectoId: proyecto.id });
}
