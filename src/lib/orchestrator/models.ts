import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
// SDK probado en producción (mismo que byignis-prueba)
import { GoogleGenerativeAI } from "@google/generative-ai";

export type ModelProvider = "gemini" | "deepseek" | "claude" | "openai";

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
  if (raw.includes("RESOURCE_EXHAUSTED") || raw.includes("free_tier")) {
    return `Cuota de Gemini agotada. Activa facturación en Google AI Studio o selecciona DeepSeek / Claude como modelo.`;
  }
  if (raw.includes("429") || raw.includes("rate_limit")) {
    return `Límite de velocidad alcanzado en ${provider}. Reintenta en unos segundos.`;
  }
  if (raw.includes("401") || raw.includes("API key") || raw.includes("API_KEY")) {
    return `API key de ${provider} inválida o no configurada. Revisa las variables de entorno.`;
  }
  return raw.split("\n")[0].slice(0, 200) || `Error en ${provider}`;
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
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
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
