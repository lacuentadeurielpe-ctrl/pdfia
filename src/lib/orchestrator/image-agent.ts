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
  style: string
): string {
  return `${rawPrompt}

Estilo visual: ${style}, profesional, moderno.
Paleta de colores dominante: ${brandColors.primario} como color principal, ${brandColors.acento} como acento.
Composición: horizontal (16:9), alta resolución, limpia y visualmente impactante.
Contexto: ilustración para el capítulo "${sectionTitle}" de un ebook profesional.
Sin texto superpuesto. Sin marcos ni bordes. Fondo apropiado para el tema.
Calidad fotográfica o ilustrativa premium, estilo editorial.`;
}

// Intenta generar la imagen con UN modelo. Devuelve el base64 o null.
async function intentarModelo(
  ai: GoogleGenAI,
  model: string,
  finalPrompt: string,
  sectionOrder: number
): Promise<{ data: string; mime: string } | null> {
  try {
    const res = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      config: { responseModalities: ["TEXT", "IMAGE"] },
    });
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
  imageModels: string | string[] = DEFAULT_IMAGE_MODEL
): Promise<string | null> {
  if (imageComplexity === "none" || !imagePrompt.trim()) {
    console.log(`[image-agent] Sección ${sectionOrder} omitida — complexity=${imageComplexity}`);
    return null;
  }

  // Acepta un modelo o una lista (vía con fallback)
  const modelos = Array.isArray(imageModels) ? imageModels : [imageModels];
  const finalPrompt = enrichPrompt(imagePrompt, sectionTitle, brandColors, style);

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("[image-agent] GEMINI_API_KEY no configurada — imágenes deshabilitadas");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  // Probar cada modelo de la vía en orden hasta que uno entregue imagen
  let imagen: { data: string; mime: string } | null = null;
  for (const model of modelos) {
    console.log(`[image-agent] Sección ${sectionOrder} — intentando ${model} ("${sectionTitle}")`);
    imagen = await intentarModelo(ai, model, finalPrompt, sectionOrder);
    if (imagen) break;
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
