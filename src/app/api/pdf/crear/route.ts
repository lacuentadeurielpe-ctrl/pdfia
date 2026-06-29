import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateSuscripcion } from "@/lib/planes/creditos";
import { costoEstimado } from "@/lib/planes/config";
import type { Calidad } from "@/lib/orchestrator/models";

const CALIDADES_VALIDAS: Calidad[] = ["estandar", "avanzado", "premium"];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const { titulo, contexto, calidad, capitulos, tono, incluirImagenes, plantilla, modoImagenes } = body;

  if (!contexto?.trim()) {
    return NextResponse.json({ error: "El contexto es requerido" }, { status: 400 });
  }

  const calidadFinal = (CALIDADES_VALIDAS.includes(calidad) ? calidad : "estandar") as Calidad;
  const numCapitulos = Math.max(3, Math.min(15, Number(capitulos) || 5));
  const conImagenes = !!incluirImagenes;

  // ── Validar contra el plan del usuario ──
  const { plan, disponibles } = await getOrCreateSuscripcion(user.id);

  // 1. ¿El plan permite esta calidad?
  if (!plan.calidades.includes(calidadFinal)) {
    return NextResponse.json({
      error: `Tu plan ${plan.nombre} no incluye la calidad ${calidadFinal}. Mejora tu plan para desbloquearla.`,
      code: "calidad_no_permitida",
    }, { status: 403 });
  }

  // 2. ¿El plan permite imágenes?
  if (conImagenes && !plan.permiteImagenes) {
    return NextResponse.json({
      error: `Tu plan ${plan.nombre} no incluye imágenes IA. Mejora tu plan o genera sin imágenes.`,
      code: "imagenes_no_permitidas",
    }, { status: 403 });
  }

  // 3. ¿Excede el máximo de capítulos del plan?
  const capFinal = Math.min(numCapitulos, plan.capitulosMax);

  // 4. ¿Tiene créditos suficientes (estimado del peor caso)?
  const estimado = costoEstimado(calidadFinal, conImagenes, capFinal);
  if (disponibles < estimado) {
    return NextResponse.json({
      error: `No te alcanzan los créditos. Este ebook cuesta ~${estimado} créditos y te quedan ${disponibles}. Renueva o mejora tu plan.`,
      code: "creditos_insuficientes",
      disponibles,
      requeridos: estimado,
    }, { status: 402 });
  }

  // ── Crear el proyecto ──
  const { data: proyecto, error } = await supabase
    .from("proyectos_pdf")
    .insert({
      user_id:          user.id,
      titulo:           titulo?.trim() || "Sin título aún",
      contexto:         contexto.trim(),
      calidad:          calidadFinal,
      modelo_ia:        `multi-provider:${calidadFinal}`,
      incluir_imagenes: conImagenes,
      num_capitulos:    capFinal,
      tono:             tono ?? "profesional",
      estado:           "pendiente",
      plantilla:        plantilla ?? "clasica",
      modo_imagenes:    modoImagenes ?? (conImagenes ? "todas" : "ninguna"),
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ proyectoId: proyecto.id });
}
