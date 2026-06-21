import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

// Endpoint de diagnóstico TEMPORAL para la generación de imágenes.
// Visita /api/debug/test-image en producción para ver qué modelo de Gemini
// funciona con la API key configurada. Borrar cuando el problema esté resuelto.

const MODELOS = [
  "gemini-2.5-flash-image-preview",
  "gemini-2.0-flash-preview-image-generation",
  "gemini-2.0-flash-exp-image-generation",
];

const PROMPT =
  "A clean modern editorial illustration of a small hardware store, warm professional lighting, 16:9, no text overlay.";

export async function GET() {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  const result: Record<string, unknown> = {
    apiKeyPresente: !!apiKey,
    apiKeyPrefix: apiKey ? `${apiKey.slice(0, 8)}...` : null,
    apiKeyLength: apiKey?.length ?? 0,
    modelos: {} as Record<string, unknown>,
  };

  if (!apiKey) {
    result.error = "GEMINI_API_KEY no está configurada en Vercel (o está vacía).";
    return NextResponse.json(result, { status: 200 });
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelos = result.modelos as Record<string, unknown>;

  for (const model of MODELOS) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: PROMPT }] }],
        config: { responseModalities: ["TEXT", "IMAGE"] },
      });

      const parts = res.candidates?.[0]?.content?.parts ?? [];
      let imageBytes = 0;
      let mime: string | null = null;
      let textOut: string | null = null;

      for (const part of parts) {
        if (part.inlineData?.data) {
          imageBytes = part.inlineData.data.length;
          mime = part.inlineData.mimeType ?? "image/png";
        } else if (part.text) {
          textOut = part.text.slice(0, 120);
        }
      }

      // Si encontramos imagen, intentamos subirla a Supabase para verificar todo el flujo
      let uploadOk: boolean | string = false;
      if (imageBytes > 0 && mime) {
        try {
          const supabase = createAdminClient();
          const ext = mime.includes("jpeg") ? "jpg" : "png";
          const path = `debug/test-${Date.now()}.${ext}`;
          const buffer = Buffer.from(
            parts.find((p) => p.inlineData?.data)!.inlineData!.data!,
            "base64"
          );
          const { error } = await supabase.storage
            .from("imagenes-ia")
            .upload(path, buffer, { contentType: mime, upsert: true });
          if (error) uploadOk = `error upload: ${error.message}`;
          else {
            const { data } = supabase.storage.from("imagenes-ia").getPublicUrl(path);
            uploadOk = data.publicUrl;
          }
        } catch (e) {
          uploadOk = `excepción upload: ${e instanceof Error ? e.message : String(e)}`;
        }
      }

      modelos[model] = {
        ok: imageBytes > 0,
        partes: parts.length,
        imagenBytes: imageBytes,
        mime,
        textoDevuelto: textOut,
        supabaseUpload: uploadOk,
      };
    } catch (err) {
      modelos[model] = {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  return NextResponse.json(result, { status: 200 });
}
