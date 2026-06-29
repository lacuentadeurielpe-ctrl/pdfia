import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { runResumable, type OrchestratorEvent } from "@/lib/orchestrator/resumable";
import { getOrCreateSuscripcion } from "@/lib/planes/creditos";

export const maxDuration = 300; // Hobby cap; Vercel rechaza valores mayores
export const dynamic = "force-dynamic";

function sseChunk(event: OrchestratorEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}
function sseError(message: string): string {
  return `data: ${JSON.stringify({ phase: "error", message, progress: 0 })}\n\n`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: proyectoId } = await params;
  const encoder = new TextEncoder();
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(sseError("No autenticado"), {
      headers: { "Content-Type": "text/event-stream" },
      status: 401,
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const emit = (event: OrchestratorEvent) => {
        if (closed) return;
        try { controller.enqueue(encoder.encode(sseChunk(event))); } catch { /* desconectado */ }
      };

      try {
        // Cargar proyecto
        const { data: proyecto, error: pErr } = await supabase
          .from("proyectos_pdf")
          .select("*")
          .eq("id", proyectoId)
          .eq("user_id", user.id)
          .single();

        if (pErr || !proyecto) {
          emit({ phase: "error", message: "Proyecto no encontrado", progress: 0 });
          controller.close();
          return;
        }

        // Si ya está completado, avisamos y salimos
        if (proyecto.estado === "completado" && proyecto.paso === "completado") {
          emit({
            phase: "completado",
            message: "✅ Documento ya generado",
            progress: 100,
            data: { pdfUrl: `/preview/${proyectoId}` },
          });
          controller.close();
          return;
        }

        // Marca de marca/branding
        const { data: config } = await supabase
          .from("configuraciones_negocio")
          .select("nombre_negocio, logo_url, color_primario, color_secundario, color_acento, url_negocio, footer_texto")
          .eq("user_id", user.id)
          .single();

        const brand = {
          nombreNegocio:   config?.nombre_negocio ?? "Mi Empresa",
          logoUrl:         config?.logo_url ?? null,
          colorPrimario:   config?.color_primario ?? "#6366f1",
          colorSecundario: config?.color_secundario ?? "#8b5cf6",
          colorAcento:     config?.color_acento ?? "#06b6d4",
          urlNegocio:      config?.url_negocio ?? "",
          footerTexto:     config?.footer_texto ?? "",
        };

        // Plan del usuario → decide la marca de agua y si puede usar su propia marca
        const { plan } = await getOrCreateSuscripcion(user.id);

        // Plan gratis: nombre, logo Y colores son de FoxPDF (no del usuario)
        const DEFAULTS = { colorPrimario: "#6366f1", colorSecundario: "#8b5cf6", colorAcento: "#06b6d4" };
        const brandFinal = plan.marcaPersonalizada
          ? brand
          : { nombreNegocio: "FoxPDF", logoUrl: null, urlNegocio: "", footerTexto: "", ...DEFAULTS };

        const result = await runResumable(
          supabaseAdmin,
          { proyecto, brand: brandFinal, userId: user.id, marcaDeAgua: plan.marcaDeAgua },
          emit
        );

        // Si quedó incompleto por límite de tiempo, el cliente reabrirá el stream
        if (!result.completed) {
          emit({
            phase: "pausado",
            message: "🔄 Reanudando automáticamente...",
            progress: 0,
            data: { resume: true, paso: result.paso },
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        console.error("[generar-pdf] Error:", err);
        try {
          await supabaseAdmin
            .from("proyectos_pdf")
            .update({ estado: "error", error_msg: msg, updated_at: new Date().toISOString() })
            .eq("id", proyectoId);
        } catch { /* ignore */ }
        emit({ phase: "error", message: `❌ Error: ${msg}`, progress: 0 });
      } finally {
        closed = true;
        try { controller.close(); } catch { /* ya cerrado */ }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":      "text/event-stream",
      "Cache-Control":     "no-cache, no-transform",
      Connection:          "keep-alive",
      "X-Accel-Buffering":  "no",
    },
  });
}
