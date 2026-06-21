import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
// SDK probado en producción (mismo que byignis-prueba)
import { GoogleGenerativeAI } from "@google/generative-ai";

export type ModelProvider = "gemini" | "deepseek" | "claude" | "openai";
export type Calidad = "estandar" | "avanzado" | "premium";

export interface QualityModels {
  director: string;          // Claude — razonamiento y planificación
  writer: string;            // DeepSeek — redacción económica de alta calidad
  integrator: string;        // Claude — revisión y expansión de capítulos
  editor: string;            // Claude — revisión global final
  writerMaxTokens: number;
  integratorMaxTokens: number;
  researcherMaxTokens: number;
}

export function getQualityModels(calidad: Calidad): QualityModels {
  switch (calidad) {
    case "premium":
      return {
        director:              "claude-opus-4-8",
        writer:                "deepseek-chat",
        integrator:            "claude-opus-4-8",
        editor:                "claude-sonnet-4-6",
        writerMaxTokens:       8000,
        integratorMaxTokens:   6000,
        researcherMaxTokens:   2500,
      };
    case "avanzado":
      return {
        director:              "claude-sonnet-4-6",
        writer:                "deepseek-chat",
        integrator:            "claude-sonnet-4-6",
        editor:                "claude-haiku-4-5-20251001",
        writerMaxTokens:       6000,
        integratorMaxTokens:   4000,
        researcherMaxTokens:   2000,
      };
    default: // estandar
      return {
        director:              "claude-haiku-4-5-20251001",
        writer:                "deepseek-chat",
        integrator:            "claude-haiku-4-5-20251001",
        editor:                "claude-haiku-4-5-20251001",
        writerMaxTokens:       4000,
        integratorMaxTokens:   3000,
        researcherMaxTokens:   1500,
      };
  }
}

export function parseModelConfig(modelStr: string): { provider: ModelProvider; modelId: string } {
  if (modelStr.startsWith("gemini"))    return { provider: "gemini",   modelId: modelStr };
  if (modelStr.startsWith("deepseek"))  return { provider: "deepseek", modelId: modelStr };
  if (modelStr.startsWith("claude"))    return { provider: "claude",   modelId: modelStr };
  if (modelStr.startsWith("gpt") || modelStr.startsWith("o1") || modelStr.startsWith("o3"))
    return { provider: "openai", modelId: modelStr };
  return { provider: "gemini", modelId: "gemini-2.5-flash" };
}

function isRateLimit(err: unknown): boolean {
  const msg = String(err instanceof Error ? err.message : JSON.stringify(err));
  return msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("rate_limit");
}

function parseRetryDelay(err: unknown): number {
  try {
    const msg = String(err instanceof Error ? err.message : JSON.stringify(err));
    const match = msg.match(/retry[^0-9]*(\d+(?:\.\d+)?)\s*s/i);
    if (match) return Math.ceil(parseFloat(match[1]) * 1000);
  } catch {}
  return 60_000;
}

function friendlyError(err: unknown, provider: ModelProvider): string {
  const raw = err instanceof Error ? err.message : JSON.stringify(err);
  console.error(`[models] Error en ${provider}:`, raw.slice(0, 500));
  if (raw.includes("API key de Gemini no configurada")) return raw;
  if (raw.includes("RESOURCE_EXHAUSTED") || raw.includes("free_tier")) {
    return `Gemini RESOURCE_EXHAUSTED — revisa en Vercel que la variable GEMINI_API_KEY esté bien escrita y que el proyecto de Google Cloud tenga billing activo.`;
  }
  if (raw.includes("429") || raw.includes("rate_limit")) {
    return `Límite de velocidad en ${provider}. Reintenta en unos segundos.`;
  }
  if (raw.includes("401") || raw.includes("API key") || raw.includes("API_KEY")) {
    return `API key de ${provider} inválida. Revisa las variables de entorno en Vercel.`;
  }
  return `[${provider}] ${raw.split("\n")[0].slice(0, 300)}`;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callWithRetry(
  fn: () => Promise<string>,
  provider: ModelProvider,
  maxRetries = 1
): Promise<string> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (isRateLimit(err) && attempt < maxRetries) {
        const delay = Math.min(parseRetryDelay(err), 90_000);
        console.warn(`[models] Rate limit ${provider} — esperando ${delay}ms`);
        await sleep(delay);
        continue;
      }
      break;
    }
  }
  throw new Error(friendlyError(lastErr, provider));
}

export async function callTextModel(
  modelStr: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 6000
): Promise<string> {
  const { provider, modelId } = parseModelConfig(modelStr);

  switch (provider) {
    case "gemini":
      return callWithRetry(async () => {
        const apiKey =
          process.env.GEMINI_API_KEY ||
          process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
          process.env.GOOGLE_API_KEY;
        if (!apiKey) throw new Error("API key de Gemini no configurada. Agrega GEMINI_API_KEY en las variables de entorno de Vercel.");
        console.log(`[models] Gemini key found (${apiKey.slice(0, 8)}...), model: ${modelId}`);
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: modelId,
          generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
        });
        const result = await model.generateContent(
          `${systemPrompt}\n\n---\n\n${userPrompt}`
        );
        return result.response.text();
      }, "gemini");

    case "deepseek":
      return callWithRetry(async () => {
        const client = new OpenAI({
          apiKey: process.env.DEEPSEEK_API_KEY!,
          baseURL: "https://api.deepseek.com",
        });
        const res = await client.chat.completions.create({
          model: modelId,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user",   content: userPrompt },
          ],
          max_tokens: maxTokens,
        });
        return res.choices[0]?.message?.content ?? "";
      }, "deepseek");

    case "claude":
      return callWithRetry(async () => {
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
        const res = await client.messages.create({
          model:     modelId,
          max_tokens: maxTokens,
          system:    systemPrompt,
          messages:  [{ role: "user", content: userPrompt }],
        });
        return res.content[0]?.type === "text" ? res.content[0].text : "";
      }, "claude");

    case "openai":
      return callWithRetry(async () => {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
        const res = await client.chat.completions.create({
          model: modelId,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user",   content: userPrompt },
          ],
          max_tokens: maxTokens,
        });
        return res.choices[0]?.message?.content ?? "";
      }, "openai");
  }
}
