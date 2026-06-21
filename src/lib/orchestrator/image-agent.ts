import { GoogleGenAI } from "@google/genai";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ImageComplexity } from "./parser";

// Director decide el modelo según complejidad
// Gemini Developer API sólo soporta gemini-2.0-flash-preview-image-generation para imágenes
function selectImageModel(complexity: ImageComplexity): string {
  // El prompt enriquecido compensa la complejidad — mismo modelo, mejor prompt
  void complexity;
  return "gemini-2.0-flash-preview-image-generation";
}

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
  style: string
): Promise<string | null> {
  if (imageComplexity === "none" || !imagePrompt.trim()) return null;

  try {
    const model = selectImageModel(imageComplexity);
    const finalPrompt = enrichPrompt(imagePrompt, sectionTitle, brandColors, style);

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GOOGLE_API_KEY;
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    // Extraer imagen base64
    let imageBase64: string | null = null;
    let mimeType = "image/png";

    for (const part of res.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        imageBase64 = part.inlineData.data;
        mimeType = part.inlineData.mimeType ?? "image/png";
        break;
      }
    }

    if (!imageBase64) return null;

    // Subir a Supabase Storage
    const supabase = createAdminClient();
    const ext = mimeType.includes("jpeg") ? "jpg" : "png";
    const path = `${projectId}/section-${sectionOrder}.${ext}`;
    const buffer = Buffer.from(imageBase64, "base64");

    const { error } = await supabase.storage
      .from("imagenes-ia")
      .upload(path, buffer, { contentType: mimeType, upsert: true });

    if (error) return null;

    const { data } = supabase.storage.from("imagenes-ia").getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.error(`[image-agent] Error generando imagen sección ${sectionOrder}:`, err);
    return null;
  }
}
