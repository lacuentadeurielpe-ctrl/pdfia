import { getQualityModels, type Calidad } from "./models";
import { runDirector } from "./director";
import { writeSection } from "./writer";
import { runEditor } from "./editor";
import { generateImage } from "./image-agent";
import type { Outline, Section, BookContext } from "./parser";

export type Phase =
  | "planificando"
  | "escribiendo"
  | "editando"
  | "generando_imagenes"
  | "ensamblando"
  | "completado"
  | "error";

export interface OrchestratorEvent {
  phase: Phase;
  message: string;
  progress: number; // 0-100
  data?: Record<string, unknown>;
}

export type EventEmitter = (event: OrchestratorEvent) => void;

export interface OrchestratorInput {
  context: string;
  numChapters: number;
  tono: string;
  calidad: Calidad;
  generateImages: boolean;
  brand: {
    nombreNegocio: string;
    logoUrl: string | null;
    colorPrimario: string;
    colorSecundario: string;
    colorAcento: string;
  };
  projectId: string;
}

export interface OrchestratorResult {
  outline: Outline;
  sections: Section[];
  htmlContent: string;
}

export async function runOrchestrator(
  input: OrchestratorInput,
  emit: EventEmitter
): Promise<OrchestratorResult> {
  const { context, numChapters, tono, calidad, generateImages, brand, projectId } = input;
  const models = getQualityModels(calidad);

  // ── FASE 1: Director crea el outline (Claude) ──
  emit({ phase: "planificando", message: `🎬 Director [${models.director}] analizando contexto...`, progress: 5 });

  const outline = await runDirector(context, numChapters, tono, models.director);

  emit({
    phase: "planificando",
    message: `📋 "${outline.bookTitle}" — ${outline.sections.length} capítulos planificados`,
    progress: 12,
    data: { bookTitle: outline.bookTitle, numSections: outline.sections.length },
  });

  // ── FASE 2-4: Por capítulo: Investigador → Escritor → Integrador ──
  const totalSections = outline.sections.length;
  const completedSections: Section[] = [];

  const bookContext: BookContext = {
    bookTitle:        outline.bookTitle,
    bookSubtitle:     outline.bookSubtitle,
    tone:             outline.tone,
    style:            outline.style,
    allChapterTitles: outline.sections.map((s) => s.title),
    completedChapters: [],
  };

  // Cada capítulo ocupa aprox (75 / totalSections) % del progreso total
  const progressPerChapter = Math.floor(68 / totalSections);

  // Todos los niveles usan el ciclo de continuidad:
  // Writer recibe el BookContext completo de capítulos anteriores.
  // La calidad se diferencia por el modelo y el presupuesto de tokens, no por cantidad de agentes.
  for (let i = 0; i < outline.sections.length; i++) {
    const section = outline.sections[i];
    const baseProgress = 12 + i * progressPerChapter;

    emit({
      phase: "escribiendo",
      message: `✍️ Escribiendo cap ${i + 1}/${totalSections}: "${section.title}" (${section.targetPages}p)`,
      progress: baseProgress,
    });

    const draft = await writeSection(
      section,
      outline,
      bookContext,
      "",          // sin researcher separado — contexto viene del BookContext
      models.writer,
      models.writerMaxTokens
    );

    completedSections.push(draft);

    // Actualizar BookContext con el capítulo completado
    bookContext.completedChapters.push({
      order:   section.order,
      title:   draft.title,
      summary: draft.chapterSummary,
    });

    const wordCount = draft.content.split(/\s+/).length;
    emit({
      phase: "escribiendo",
      message: `✅ Cap ${i + 1} listo — "${draft.title}" (~${wordCount} palabras)`,
      progress: baseProgress + progressPerChapter,
    });
  }

  // ── FASE 5: Editor global (Claude) ──
  emit({ phase: "editando", message: "🔍 Editor revisando coherencia global y títulos duplicados...", progress: 82 });

  const editedSections = await runEditor(completedSections, models.editor);

  emit({ phase: "editando", message: `✅ Editor finalizó — ${editedSections.length} capítulos aprobados`, progress: 86 });

  // ── FASE 6: Agente de imágenes (Gemini, siempre) ──
  let finalSections = editedSections;

  if (generateImages) {
    emit({ phase: "generando_imagenes", message: "🖼️ Agente visual [Gemini] iniciando imágenes...", progress: 87 });

    // Debug: mostrar qué secciones tienen prompt de imagen
    for (const s of editedSections) {
      console.log(`[orchestrator] Sección ${s.order} "${s.title}" — complexity=${s.imageComplexity}, prompt="${s.imagePrompt.slice(0, 60)}"`);
    }

    const sectionsNeedingImages = editedSections.filter(
      (s) => s.imageComplexity !== "none" && s.imagePrompt.trim()
    );

    console.log(`[orchestrator] ${sectionsNeedingImages.length}/${editedSections.length} secciones necesitan imagen`);

    const imageMap = new Map<number, string | null>();

    emit({
      phase: "generando_imagenes",
      message: `🎨 Generando ${sectionsNeedingImages.length} imágenes en paralelo...`,
      progress: 89,
    });

    // Gemini ahora SOLO hace imágenes (el texto es Claude/DeepSeek), así que
    // podemos generarlas todas en paralelo sin saturar el RPM. Ahorra ~30-40s.
    let listas = 0;
    await Promise.all(
      sectionsNeedingImages.map(async (s) => {
        const url = await generateImage(
          s.imagePrompt,
          s.imageComplexity,
          s.title,
          projectId,
          s.order,
          { primario: brand.colorPrimario, secundario: brand.colorSecundario, acento: brand.colorAcento },
          outline.style,
          models.imageModel
        );
        imageMap.set(s.order, url);
        listas++;
        emit({
          phase: "generando_imagenes",
          message: url
            ? `✅ Imagen ${listas}/${sectionsNeedingImages.length} lista — "${s.title}"`
            : `⚠️ Imagen omitida — "${s.title}"`,
          progress: 89 + Math.floor((listas / Math.max(sectionsNeedingImages.length, 1)) * 7),
        });
      })
    );

    finalSections = editedSections.map((s) => ({
      ...s,
      imageUrl: imageMap.get(s.order) ?? undefined,
    }));
  } else {
    emit({ phase: "generando_imagenes", message: "⏭️ Imágenes omitidas", progress: 96 });
  }

  // ── FASE 7: Ensamblador construye HTML ──
  emit({ phase: "ensamblando", message: "📄 Ensamblando documento final...", progress: 97 });

  const { buildPDFHtml } = await import("@/lib/pdf/template");
  const htmlContent = buildPDFHtml(outline, finalSections, brand);

  const totalWords = finalSections.reduce((sum, s) => sum + s.content.split(/\s+/).length, 0);
  emit({
    phase: "completado",
    message: `✅ "${outline.bookTitle}" listo — ${finalSections.length} capítulos, ~${totalWords} palabras`,
    progress: 100,
    data: { bookTitle: outline.bookTitle, sections: finalSections.length, words: totalWords },
  });

  return { outline, sections: finalSections, htmlContent };
}
