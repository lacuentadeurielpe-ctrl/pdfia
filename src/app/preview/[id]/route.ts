import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: proyectoId } = await params;
  const supabase = await createClient();

  // Verificar sesión
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response("No autorizado", { status: 401 });
  }

  // Buscar el HTML generado más reciente para este proyecto
  const { data: pdfRecord } = await supabase
    .from("pdfs_generados")
    .select("storage_path")
    .eq("proyecto_id", proyectoId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!pdfRecord?.storage_path) {
    return new Response("Documento no encontrado", { status: 404 });
  }

  // Descargar el HTML desde Supabase Storage
  const supabaseAdmin = createAdminClient();
  const { data: blob, error } = await supabaseAdmin.storage
    .from("pdfs")
    .download(pdfRecord.storage_path);

  if (error || !blob) {
    return new Response("Error al obtener el documento", { status: 500 });
  }

  const html = await blob.text();

  // Inyectar auto-print si viene con ?print=1
  const url = new URL(req.url);
  const shouldPrint = url.searchParams.get("print") === "1";
  const finalHtml = shouldPrint
    ? html.replace(
        "if (typeof window !== 'undefined' && window.location.search.includes('print=1'))",
        "if (true)"
      )
    : html;

  return new Response(finalHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-cache",
    },
  });
}
