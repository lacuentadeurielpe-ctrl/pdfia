import { getQualityModels, type Calidad } from "./models";
import { runDirector } from "./director";
import { writeSection } from "./writer";
import { generateImage } from "./image-agent";
import { buildPDFHtml } from "@/lib/pdf/template";
import type { Outline, Section, BookContext } from "./parser";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Phase =
  | "planificando"
  | "escribiendo"
  | "generando_imagenes"
  | "ensamblando"
  | "completado"
  | "pausado"
  | "error";

export interface OrchestratorEvent {
  phase: Phase;
  message: string;
  progress: number;
  data?: Record<string, unknown>;
}
export type EventEmitter = (event: OrchestratorEvent) => void | Promise<void>;

interface Brand {
  nombreNegocio: string;
  logoUrl: string | null;
  colorPrimario: string;
  colorSecundario: string;
  colorAcento: string;
}

interface ResumableInput {
  proyecto: {
    id: string;
    contexto: string;
    num_capitulos: number | null;
    tono: string | null;
    calidad: string | null;
    incluir_imagenes: boolean | null;
    outline: string | null;
    paso: string | null;
    titulo: string | null;
  };
  brand: Brand;
  userId: string;
}

interface StoredChapter {
  orden: number;
  titulo: string;
  subtitulo: string;
  contenido: string;
  image_prompt: string;
  image_complexity: string;
  image_url: string | null;
  chapter_summary: string;
  target_pages: number;
}

// Guard de tiempo: dejamos de empezar trabajo pesado nuevo pasado este margen,
// dejando colchón antes del corte duro de Vercel (300s).
const DEADLINE_MS = 235_000;

export interface ResumableResult {
  completed: boolean;
  paso: string;
}

export async function runResumable(
  supabaseAdmin: SupabaseClient,
  input: ResumableInput,
  emit: EventEmitter
): Promise<ResumableResult> {
  const start = Date.now();
  const timeLeft = () => DEADLINE_MS - (Date.now() - start);
  const outOfTime = () => timeLeft() <= 0;

  const { proyecto, brand } = input;
  const calidad = (proyecto.calidad ?? "estandar") as Calidad;
  const models = getQualityModels(calidad);
  const numChapters = proyecto.num_capitulos ?? 5;
  const tono = proyecto.tono ?? "profesional";
  const generateImages = proyecto.incluir_imagenes ?? true;
  const projectId = proyecto.id;

  const setPaso = async (paso: string, estado?: string) => {
    await supabaseAdmin
      .from("proyectos_pdf")
      .update({
        paso,
        ...(estado ? { estado } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);
  };

  // ── PASO 1: OUTLINE ──
  let outline: Outline | null = null;
  if (proyecto.outline) {
    try { outline = JSON.parse(proyecto.outline) as Outline; } catch { outline = null; }
  }

  if (!outline) {
    await emit({ phase: "planificando", message: `🎬 Director [${models.director}] creando estructura...`, progress: 5 });
    const raw = await runDirector(proyecto.contexto, numChapters, tono, models.director);
    outline = raw;
    await supabaseAdmin
      .from("proyectos_pdf")
      .update({
        titulo: outline.bookTitle,
        outline: JSON.stringify(outline),
        paso: "escribiendo",
        estado: "escribiendo",
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);
    await emit({
      phase: "planificando",
      message: `📋 "${outline.bookTitle}" — ${outline.sections.length} capítulos planificados`,
      progress: 12,
    });
  }

  const totalSections = outline.sections.length;

  // ── PASO 2: ESCRITURA (reanudable, capítulo a capítulo) ──
  // Cargar capítulos ya escritos
  const loadChapters = async (): Promise<StoredChapter[]> => {
    const { data } = await supabaseAdmin
      .from("capitulos_pdf")
      .select("orden, titulo, subtitulo, contenido, image_prompt, image_complexity, image_url, chapter_summary, target_pages")
      .eq("proyecto_id", projectId)
      .order("orden", { ascending: true });
    return (data ?? []) as StoredChapter[];
  };

  let chapters = await loadChapters();
  const writtenOrders = new Set(chapters.map((c) => c.orden));

  if (writtenOrders.size < totalSections) {
    for (let i = 0; i < outline.sections.length; i++) {
      const section = outline.sections[i];
      if (writtenOrders.has(section.order)) continue;

      // ¿Queda tiempo para otro capítulo? (cada uno puede tardar 20-40s)
      if (outOfTime()) {
        await setPaso("escribiendo");
        await emit({
          phase: "pausado",
          message: `⏸️ Pausa técnica — ${writtenOrders.size}/${totalSections} capítulos guardados. Reanudando...`,
          progress: 12 + Math.floor((writtenOrders.size / totalSections) * 60),
        });
        return { completed: false, paso: "escribiendo" };
      }

      // Reconstruir BookContext desde lo ya escrito (continuidad + anti-repetición)
      const bookContext: BookContext = {
        bookTitle:    outline.bookTitle,
        bookSubtitle: outline.bookSubtitle,
        tone:         outline.tone,
        style:        outline.style,
        allChapterTitles: outline.sections.map((s) => s.title),
        completedChapters: chapters
          .sort((a, b) => a.orden - b.orden)
          .map((c) => ({ order: c.orden, title: c.titulo, summary: c.chapter_summary })),
      };

      await emit({
        phase: "escribiendo",
        message: `✍️ Escribiendo cap ${section.order + 1}/${totalSections}: "${section.title}" (${section.targetPages}p)`,
        progress: 12 + Math.floor((writtenOrders.size / totalSections) * 60),
      });

      const draft = await writeSection(
        section, outline, bookContext, "", models.writer, models.writerMaxTokens
      );

      // Guardar inmediatamente (sobrevive a un corte)
      await supabaseAdmin.from("capitulos_pdf").upsert({
        proyecto_id:      projectId,
        orden:            section.order,
        titulo:           draft.title,
        subtitulo:        draft.subtitle,
        contenido:        draft.content,
        image_prompt:     draft.imagePrompt,
        image_complexity: draft.imageComplexity,
        image_url:        null,
        chapter_summary:  draft.chapterSummary,
        target_pages:     section.targetPages,
        updated_at:       new Date().toISOString(),
      }, { onConflict: "proyecto_id,orden" });

      chapters.push({
        orden: section.order, titulo: draft.title, subtitulo: draft.subtitle,
        contenido: draft.content, image_prompt: draft.imagePrompt,
        image_complexity: draft.imageComplexity, image_url: null,
        chapter_summary: draft.chapterSummary, target_pages: section.targetPages,
      });
      writtenOrders.add(section.order);

      const wc = draft.content.split(/\s+/).length;
      await emit({
        phase: "escribiendo",
        message: `✅ Cap ${section.order + 1} guardado — "${draft.title}" (~${wc} palabras)`,
        progress: 12 + Math.floor((writtenOrders.size / totalSections) * 60),
      });
    }
  }

  await setPaso("imagenes");

  // ── PASO 3: IMÁGENES (reanudable, las que falten) ──
  chapters = await loadChapters();
  if (generateImages) {
    const pending = chapters.filter(
      (c) => c.image_complexity !== "none" && c.image_prompt?.trim() && !c.image_url
    );

    if (pending.length > 0) {
      if (outOfTime()) {
        await emit({
          phase: "pausado",
          message: `⏸️ Pausa antes de imágenes — reanudando...`,
          progress: 75,
        });
        return { completed: false, paso: "imagenes" };
      }

      await emit({
        phase: "generando_imagenes",
        message: `🎨 Generando ${pending.length} imágenes en paralelo [${models.imageModel}]...`,
        progress: 78,
      });

      let listas = 0;
      await Promise.all(
        pending.map(async (c) => {
          const url = await generateImage(
            c.image_prompt,
            c.image_complexity as Section["imageComplexity"],
            c.titulo,
            projectId,
            c.orden,
            { primario: brand.colorPrimario, secundario: brand.colorSecundario, acento: brand.colorAcento },
            outline!.style,
            models.imageModel
          );
          if (url) {
            await supabaseAdmin
              .from("capitulos_pdf")
              .update({ image_url: url, updated_at: new Date().toISOString() })
              .eq("proyecto_id", projectId)
              .eq("orden", c.orden);
          }
          listas++;
          await emit({
            phase: "generando_imagenes",
            message: url ? `✅ Imagen ${listas}/${pending.length} — "${c.titulo}"` : `⚠️ Imagen omitida — "${c.titulo}"`,
            progress: 78 + Math.floor((listas / pending.length) * 12),
          });
        })
      );
    }
  }

  await setPaso("ensamblando");

  // ── PASO 4: ENSAMBLADO ──
  await emit({ phase: "ensamblando", message: "📄 Ensamblando documento final...", progress: 93 });

  chapters = await loadChapters();
  const sections: Section[] = chapters
    .sort((a, b) => a.orden - b.orden)
    .map((c) => ({
      order:           c.orden,
      title:           c.titulo,
      subtitle:        c.subtitulo,
      content:         c.contenido,
      imagePrompt:     c.image_prompt ?? "",
      imageComplexity: (c.image_complexity ?? "none") as Section["imageComplexity"],
      imageUrl:        c.image_url ?? undefined,
    }));

  const htmlContent = buildPDFHtml(outline, sections, brand);
  const htmlBytes = Buffer.from(htmlContent, "utf-8");
  const fileName = `${projectId}/${Date.now()}.html`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("pdfs")
    .upload(fileName, htmlBytes, { contentType: "text/html", upsert: true });
  if (uploadError) throw new Error(`Storage upload: ${uploadError.message}`);

  const { data: urlData } = supabaseAdmin.storage.from("pdfs").getPublicUrl(fileName);
  const imagesCount = sections.filter((s) => s.imageUrl).length;

  await supabaseAdmin.from("pdfs_generados").insert({
    proyecto_id:        projectId,
    user_id:            input.userId,
    titulo:             outline.bookTitle,
    storage_path:       fileName,
    storage_url:        urlData.publicUrl,
    tamano_bytes:       htmlBytes.length,
    modelo_ia:          `multi-provider:${calidad}`,
    modelo_imagen:      generateImages ? models.imageModel : null,
    imagenes_generadas: imagesCount,
  });

  await setPaso("completado", "completado");

  const totalWords = sections.reduce((sum, s) => sum + s.content.split(/\s+/).length, 0);
  await emit({
    phase: "completado",
    message: `✅ "${outline.bookTitle}" listo — ${sections.length} capítulos, ~${totalWords} palabras`,
    progress: 100,
    data: { pdfUrl: `/preview/${projectId}`, titulo: outline.bookTitle, secciones: sections.length, imagenes: imagesCount },
  });

  return { completed: true, paso: "completado" };
}
