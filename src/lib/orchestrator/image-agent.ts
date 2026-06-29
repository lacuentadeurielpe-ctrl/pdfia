import { GoogleGenAI } from "@google/genai";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ImageComplexity } from "./parser";

// Modelo por defecto si no se pasa uno explícito (verificado disponible vía ListModels)
const DEFAULT_IMAGE_MODEL = "gemini-2.5-flash-image";

// Enriquece el prompt para hacerlo cinematográfico
function enrichPrompt(
  rawPrompt: string,
  sectionTitle: string,
  brandColors: { primario: string; secundario: string; acento: string },
  style: string,
  aspectRatio: string
): string {
  const [w, h] = aspectRatio.split(":").map(Number);
  const orientacion = h > w ? "vertical (retrato)" : w > h ? "horizontal (apaisada)" : "cuadrada";
  return `${rawPrompt}

Estilo visual: ${style}, profesional, moderno.
Paleta de colores dominante: ${brandColors.primario} como color principal, ${brandColors.acento} como acento.
Composición: ${orientacion}, proporción ${aspectRatio}, alta resolución, limpia y visualmente impactante.
Contexto: ilustración para el capítulo "${sectionTitle}" de un ebook profesional.
Sin texto superpuesto. Sin marcos ni bordes. Fondo apropiado para el tema.
Calidad fotográfica o ilustrativa premium, estilo editorial.`;
}

// Intenta generar la imagen con UN modelo. Devuelve el base64 o null.
// aspectRatio (ej. "16:9") fuerza imágenes horizontales nativas — sin recorte posterior.
async function intentarModelo(
  ai: GoogleGenAI,
  model: string,
  finalPrompt: string,
  sectionOrder: number,
  aspectRatio?: string
): Promise<{ data: string; mime: string } | null> {
  try {
    const config: Record<string, unknown> = { responseModalities: ["TEXT", "IMAGE"] };
    if (aspectRatio) config.imageConfig = { aspectRatio };
    const res = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      config,
    } as unknown as Parameters<typeof ai.models.generateContent>[0]);
    const parts = res.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return { data: part.inlineData.data, mime: part.inlineData.mimeType ?? "image/png" };
      }
    }
    console.warn(`[image-agent] ${model} no devolvió imagen (sección ${sectionOrder})`);
    return null;
  } catch (err) {
    console.warn(`[image-agent] ${model} falló (sección ${sectionOrder}): ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

export async function generateImage(
  imagePrompt: string,
  imageComplexity: ImageComplexity,
  sectionTitle: string,
  projectId: string,
  sectionOrder: number,
  brandColors: { primario: string; secundario: string; acento: string },
  style: string,
  imageModels: string | string[] = DEFAULT_IMAGE_MODEL,
  aspectRatio: string = "16:9"
): Promise<string | null> {
  if (imageComplexity === "none" || !imagePrompt.trim()) {
    console.log(`[image-agent] Sección ${sectionOrder} omitida — complexity=${imageComplexity}`);
    return null;
  }

  // Acepta un modelo o una lista (vía con fallback)
  const modelos = Array.isArray(imageModels) ? imageModels : [imageModels];
  const finalPrompt = enrichPrompt(imagePrompt, sectionTitle, brandColors, style, aspectRatio);

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("[image-agent] GEMINI_API_KEY no configurada — imágenes deshabilitadas");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  // Probar cada modelo de la vía en orden hasta que uno entregue imagen.
  // 1ª pasada: pedir la proporción nativa de la plantilla (sin recorte).
  let imagen: { data: string; mime: string } | null = null;
  for (const model of modelos) {
    console.log(`[image-agent] Sección ${sectionOrder} — intentando ${model} ${aspectRatio} ("${sectionTitle}")`);
    imagen = await intentarModelo(ai, model, finalPrompt, sectionOrder, aspectRatio);
    if (imagen) break;
  }

  // 2ª pasada (fallback): si ningún modelo aceptó el imageConfig, reintentar sin él.
  // Garantiza que la generación nunca se rompa por un parámetro no soportado.
  if (!imagen) {
    console.warn(`[image-agent] Sección ${sectionOrder} — reintentando sin aspect ratio`);
    for (const model of modelos) {
      imagen = await intentarModelo(ai, model, finalPrompt, sectionOrder);
      if (imagen) break;
    }
  }

  if (!imagen) {
    console.error(`[image-agent] Ningún modelo entregó imagen para sección ${sectionOrder}`);
    return null;
  }

  // Subir a Supabase Storage
  try {
    const supabase = createAdminClient();
    const ext = imagen.mime.includes("jpeg") ? "jpg" : "png";
    const path = `${projectId}/section-${sectionOrder}.${ext}`;
    const buffer = Buffer.from(imagen.data, "base64");

    const { error: uploadError } = await supabase.storage
      .from("imagenes-ia")
      .upload(path, buffer, { contentType: imagen.mime, upsert: true });

    if (uploadError) {
      console.error(`[image-agent] Error subiendo a Supabase: ${uploadError.message}`);
      return null;
    }

    const { data } = supabase.storage.from("imagenes-ia").getPublicUrl(path);
    console.log(`[image-agent] ✅ Imagen lista sección ${sectionOrder}`);
    return data.publicUrl;
  } catch (err) {
    console.error(`[image-agent] Error subiendo sección ${sectionOrder}:`, err instanceof Error ? err.message : err);
    return null;
  }
}
