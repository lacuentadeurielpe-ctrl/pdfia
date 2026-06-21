import { runDirector } from "./director";
import { buildWriterPrompt } from "./prompt-engineer";
import { writeSection } from "./writer";
import { runEditor } from "./editor";
import { generateImage } from "./image-agent";
import type { Outline, Section } from "./parser";

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
  modelStr: string;
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
  const { context, numChapters, tono, modelStr, generateImages, brand, projectId } = input;

  // ── FASE 1: Director crea el outline ──
  emit({ phase: "planificando", message: "🎬 Director analizando contexto y creando estructura...", progress: 5 });

  const outline = await runDirector(context, numChapters, tono, modelStr);

  emit({
    phase: "planificando",
    message: `📋 Planificador aprobó: "${outline.bookTitle}" con ${outline.sections.length} capítulos`,
    progress: 15,
    data: { bookTitle: outline.bookTitle, numSections: outline.sections.length },
  });

  // ── FASE 2: Prompt Engineer prepara prompts (secuencial para no saturar RPM) ──
  emit({ phase: "escribiendo", message: "✏️ Ingeniero de prompts preparando instrucciones...", progress: 20 });

  const writerPrompts: string[] = [];
  for (let i = 0; i < outline.sections.length; i++) {
    const section = outline.sections[i];
    emit({
      phase: "escribiendo",
      message: `📋 Preparando prompt ${i + 1}/${outline.sections.length} → "${section.title}"`,
      progress: 20 + Math.floor((i / outline.sections.length) * 5),
    });
    const prompt = await buildWriterPrompt(outline, section, modelStr);
    writerPrompts.push(prompt);
  }

  emit({ phase: "escribiendo", message: `✅ ${writerPrompts.length} prompts listos`, progress: 25 });

  // ── FASE 3: Writers escriben secciones de a una (evita rate limit) ──
  const totalSections = outline.sections.length;
  const writtenSections: Section[] = [];

  for (let i = 0; i < outline.sections.length; i++) {
    const section = outline.sections[i];
    emit({
      phase: "escribiendo",
      message: `✍️ Escritor ${i + 1}/${totalSections} → "${section.title}"`,
      progress: 25 + Math.floor((i / totalSections) * 35),
    });

    const written = await writeSection(writerPrompts[i], section, modelStr);
    writtenSections.push(written);

    emit({
      phase: "escribiendo",
      message: `✅ Capítulo "${written.title}" completado`,
      progress: 25 + Math.floor(((i + 1) / totalSections) * 35),
    });
  }

  // ── FASE 4: Editor revisa y deduplica ──
  emit({ phase: "editando", message: "🔍 Editor revisando coherencia y eliminando repeticiones...", progress: 62 });

  const editedSections = await runEditor(writtenSections, modelStr);

  emit({ phase: "editando", message: `✅ Editor finalizó — ${editedSections.length} secciones aprobadas`, progress: 70 });

  // ── FASE 5: Agente de imágenes (paralelo, opcional) ──
  let finalSections = editedSections;

  if (generateImages) {
    emit({ phase: "generando_imagenes", message: "🖼️ Agente visual iniciando generación de imágenes...", progress: 72 });

    const sectionsNeedingImages = editedSections.filter(
      (s) => s.imageComplexity !== "none" && s.imagePrompt.trim()
    );

    const imageMap = new Map<number, string | null>();

    for (let i = 0; i < sectionsNeedingImages.length; i++) {
      const s = sectionsNeedingImages[i];
      emit({
        phase: "generando_imagenes",
        message: `🎨 Imagen ${i + 1}/${sectionsNeedingImages.length} [${s.imageComplexity}] → "${s.title}"`,
        progress: 72 + Math.floor((i / Math.max(sectionsNeedingImages.length, 1)) * 18),
      });

      const url = await generateImage(
        s.imagePrompt,
        s.imageComplexity,
        s.title,
        projectId,
        s.order,
        { primario: brand.colorPrimario, secundario: brand.colorSecundario, acento: brand.colorAcento },
        outline.style
      );

      imageMap.set(s.order, url);

      emit({
        phase: "generando_imagenes",
        message: url
          ? `✅ Imagen lista para "${s.title}"`
          : `⚠️ Imagen omitida para "${s.title}"`,
        progress: 72 + Math.floor(((i + 1) / Math.max(sectionsNeedingImages.length, 1)) * 18),
      });
    }

    // Aplicar URLs de imagen a secciones
    finalSections = editedSections.map((s) => ({
      ...s,
      imageUrl: imageMap.get(s.order) ?? undefined,
    }));
  } else {
    emit({ phase: "generando_imagenes", message: "⏭️ Generación de imágenes omitida", progress: 90 });
  }

  // ── FASE 6: Ensamblador construye HTML ──
  emit({ phase: "ensamblando", message: "📄 Ensamblador construyendo documento final...", progress: 92 });

  // El HTML se construye fuera del orquestador (en el template) para separar concerns
  const { buildPDFHtml } = await import("@/lib/pdf/template");
  const htmlContent = buildPDFHtml(outline, finalSections, brand);

  emit({
    phase: "completado",
    message: `✅ Documento "${outline.bookTitle}" ensamblado con ${finalSections.length} capítulos`,
    progress: 100,
    data: { bookTitle: outline.bookTitle, sections: finalSections.length },
  });

  return { outline, sections: finalSections, htmlContent };
}
