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

  // ── FASE 2: Prompt Engineer prepara prompts ──
  emit({ phase: "escribiendo", message: "✏️ Ingeniero de prompts preparando instrucciones por capítulo...", progress: 20 });

  // Construir prompts en paralelo (no consumen tokens masivos)
  const writerPrompts = await Promise.all(
    outline.sections.map((section) => buildWriterPrompt(outline, section, modelStr))
  );

  emit({ phase: "escribiendo", message: `✅ ${writerPrompts.length} prompts optimizados generados`, progress: 25 });

  // ── FASE 3: Writers escriben secciones en paralelo ──
  const totalSections = outline.sections.length;
  const writtenSections: Section[] = new Array(totalSections);
  let completedWriters = 0;

  const writePromises = outline.sections.map(async (section, i) => {
    emit({
      phase: "escribiendo",
      message: `✍️ Escritor ${i + 1}/${totalSections} → "${section.title}"`,
      progress: 25 + Math.floor((completedWriters / totalSections) * 35),
    });

    const written = await writeSection(writerPrompts[i], section, modelStr);
    writtenSections[i] = written;
    completedWriters++;

    emit({
      phase: "escribiendo",
      message: `✅ Capítulo "${written.title}" completado`,
      progress: 25 + Math.floor((completedWriters / totalSections) * 35),
    });
  });

  await Promise.all(writePromises);

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

    let completedImages = 0;
    const imageMap = new Map<number, string | null>();

    await Promise.all(
      sectionsNeedingImages.map(async (s) => {
        emit({
          phase: "generando_imagenes",
          message: `🎨 Generando imagen [${s.imageComplexity}] → "${s.title}"`,
          progress: 72 + Math.floor((completedImages / Math.max(sectionsNeedingImages.length, 1)) * 18),
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
        completedImages++;

        emit({
          phase: "generando_imagenes",
          message: url
            ? `✅ Imagen generada para "${s.title}"`
            : `⚠️ Imagen omitida para "${s.title}" (modelo no disponible)`,
          progress: 72 + Math.floor((completedImages / Math.max(sectionsNeedingImages.length, 1)) * 18),
        });
      })
    );

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
