import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { runOrchestrator, type OrchestratorEvent } from "@/lib/orchestrator";
import { generatePDFFromHtml } from "@/lib/pdf/generator";

export const maxDuration = 300;
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

  // Verificar sesión
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(sseError("No autenticado"), {
      headers: { "Content-Type": "text/event-stream" },
      status: 401,
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: OrchestratorEvent) => {
        try {
          controller.enqueue(encoder.encode(sseChunk(event)));
        } catch {
          // cliente desconectado
        }
      };

      try {
        // ── Cargar proyecto ──
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

        // ── Cargar configuración de marca ──
        const { data: config } = await supabase
          .from("configuraciones_negocio")
          .select("nombre_negocio, logo_url, color_primario, color_secundario, color_acento")
          .eq("user_id", user.id)
          .single();

        const brand = {
          nombreNegocio: config?.nombre_negocio ?? "Mi Empresa",
          logoUrl:       config?.logo_url       ?? null,
          colorPrimario:   config?.color_primario   ?? "#6366f1",
          colorSecundario: config?.color_secundario ?? "#8b5cf6",
          colorAcento:     config?.color_acento     ?? "#06b6d4",
        };

        // ── Actualizar estado a planificando ──
        await supabaseAdmin
          .from("proyectos_pdf")
          .update({ estado: "planificando", updated_at: new Date().toISOString() })
          .eq("id", proyectoId);

        // ── Correr orquestador ──
        const result = await runOrchestrator(
          {
            context:         proyecto.contexto,
            numChapters:     proyecto.num_capitulos ?? 5,
            tono:            proyecto.tono ?? "profesional",
            modelStr:        proyecto.modelo_ia ?? "gemini:gemini-2.0-flash",
            generateImages:  proyecto.incluir_imagenes ?? true,
            brand,
            projectId:       proyectoId,
          },
          async (event) => {
            emit(event);
            // Sincronizar estado en DB en cada fase importante
            if (
              event.phase === "planificando" ||
              event.phase === "escribiendo" ||
              event.phase === "generando_imagenes" ||
              event.phase === "ensamblando"
            ) {
              await supabaseAdmin
                .from("proyectos_pdf")
                .update({ estado: event.phase, updated_at: new Date().toISOString() })
                .eq("id", proyectoId);
            }
          }
        );

        // ── Guardar outline en DB ──
        await supabaseAdmin
          .from("proyectos_pdf")
          .update({
            titulo:       result.outline.bookTitle,
            outline:      JSON.stringify(result.outline),
            estado:       "ensamblando",
            updated_at:   new Date().toISOString(),
          })
          .eq("id", proyectoId);

        // ── Generar PDF con puppeteer ──
        emit({ phase: "ensamblando", message: "🖨️ Renderizando PDF con Puppeteer...", progress: 94 });

        const pdfBuffer = await generatePDFFromHtml(result.htmlContent);
        const fileName = `${proyectoId}/${Date.now()}.pdf`;

        emit({ phase: "ensamblando", message: "☁️ Subiendo PDF a almacenamiento...", progress: 97 });

        // ── Subir PDF a Supabase Storage ──
        const { error: uploadError } = await supabaseAdmin.storage
          .from("pdfs")
          .upload(fileName, pdfBuffer, {
            contentType: "application/pdf",
            upsert: true,
          });

        if (uploadError) throw new Error(`Storage upload: ${uploadError.message}`);

        const { data: urlData } = supabaseAdmin.storage
          .from("pdfs")
          .getPublicUrl(fileName);

        const pdfUrl = urlData.publicUrl;

        // ── Registrar en pdfs_generados ──
        const imagesCount = result.sections.filter((s) => s.imageUrl).length;

        await supabaseAdmin.from("pdfs_generados").insert({
          proyecto_id:         proyectoId,
          user_id:             user.id,
          titulo:              result.outline.bookTitle,
          storage_path:        fileName,
          storage_url:         pdfUrl,
          tamano_bytes:        pdfBuffer.length,
          modelo_ia:           proyecto.modelo_ia,
          modelo_imagen:       proyecto.incluir_imagenes ? "gemini-auto" : null,
          imagenes_generadas:  imagesCount,
        });

        // ── Marcar proyecto completado ──
        await supabaseAdmin
          .from("proyectos_pdf")
          .update({
            estado:      "completado",
            updated_at:  new Date().toISOString(),
          })
          .eq("id", proyectoId);

        emit({
          phase: "completado",
          message: `🎉 ¡PDF "${result.outline.bookTitle}" listo!`,
          progress: 100,
          data: {
            pdfUrl,
            titulo:     result.outline.bookTitle,
            secciones:  result.sections.length,
            imagenes:   imagesCount,
            bytes:      pdfBuffer.length,
          },
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        console.error("[generar-pdf] Error:", err);

        try {
          await supabaseAdmin
            .from("proyectos_pdf")
            .update({
              estado:      "error",
              error_msg:   msg,
              updated_at:  new Date().toISOString(),
            })
            .eq("id", proyectoId);
        } catch { /* ignorar error secundario */ }

        emit({ phase: "error", message: `❌ Error: ${msg}`, progress: 0 });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection:      "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
