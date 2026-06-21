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

export async function generateImage(
  imagePrompt: string,
  imageComplexity: ImageComplexity,
  sectionTitle: string,
  projectId: string,
  sectionOrder: number,
  brandColors: { primario: string; secundario: string; acento: string },
  style: string,
  imageModel: string = DEFAULT_IMAGE_MODEL
): Promise<string | null> {
  if (imageComplexity === "none" || !imagePrompt.trim()) {
    console.log(`[image-agent] Sección ${sectionOrder} omitida — complexity=${imageComplexity}, prompt="${imagePrompt.slice(0, 40)}"`);
    return null;
  }

  const model = imageModel;
  const finalPrompt = enrichPrompt(imagePrompt, sectionTitle, brandColors, style);

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("[image-agent] GEMINI_API_KEY no configurada — imágenes deshabilitadas");
    return null;
  }

  console.log(`[image-agent] Generando imagen sección ${sectionOrder} con ${model} — "${sectionTitle}"`);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      config: { responseModalities: ["TEXT", "IMAGE"] },
    });

    // Extraer imagen base64
    let imageBase64: string | null = null;
    let mimeType = "image/png";

    const parts = res.candidates?.[0]?.content?.parts ?? [];
    console.log(`[image-agent] Respuesta: ${parts.length} partes`);

    for (const part of parts) {
      if (part.inlineData?.data) {
        imageBase64 = part.inlineData.data;
        mimeType = part.inlineData.mimeType ?? "image/png";
        break;
      }
    }

    if (!imageBase64) {
      console.warn(`[image-agent] Gemini no devolvió imagen base64 para sección ${sectionOrder}`);
      return null;
    }

    // Subir a Supabase Storage
    const supabase = createAdminClient();
    const ext = mimeType.includes("jpeg") ? "jpg" : "png";
    const path = `${projectId}/section-${sectionOrder}.${ext}`;
    const buffer = Buffer.from(imageBase64, "base64");

    const { error: uploadError } = await supabase.storage
      .from("imagenes-ia")
      .upload(path, buffer, { contentType: mimeType, upsert: true });

    if (uploadError) {
      console.error(`[image-agent] Error subiendo imagen a Supabase: ${uploadError.message}`);
      return null;
    }

    const { data } = supabase.storage.from("imagenes-ia").getPublicUrl(path);
    console.log(`[image-agent] ✅ Imagen lista: ${data.publicUrl.slice(0, 80)}...`);
    return data.publicUrl;
  } catch (err) {
    console.error(`[image-agent] Error sección ${sectionOrder}:`, err instanceof Error ? err.message : JSON.stringify(err));
    return null;
  }
}
