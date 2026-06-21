import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

export type ModelProvider = "gemini" | "deepseek" | "claude" | "openai";

export function parseModelConfig(modelStr: string): { provider: ModelProvider; modelId: string } {
  if (modelStr.startsWith("gemini"))    return { provider: "gemini",   modelId: modelStr };
  if (modelStr.startsWith("deepseek"))  return { provider: "deepseek", modelId: modelStr };
  if (modelStr.startsWith("claude"))    return { provider: "claude",   modelId: modelStr };
  if (modelStr.startsWith("gpt") || modelStr.startsWith("o1") || modelStr.startsWith("o3"))
    return { provider: "openai", modelId: modelStr };
  return { provider: "gemini", modelId: "gemini-2.0-flash" };
}

export async function callTextModel(
  modelStr: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 6000
): Promise<string> {
  const { provider, modelId } = parseModelConfig(modelStr);

  switch (provider) {
    case "gemini": {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const res = await ai.models.generateContent({
        model: modelId,
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n---\n\n${userPrompt}` }] }],
        config: { maxOutputTokens: maxTokens, temperature: 0.7 },
      });
      return res.text ?? "";
    }
    case "deepseek": {
      const client = new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY!, baseURL: "https://api.deepseek.com" });
      const res = await client.chat.completions.create({
        model: modelId,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        max_tokens: maxTokens,
      });
      return res.choices[0]?.message?.content ?? "";
    }
    case "claude": {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
      const res = await client.messages.create({
        model: modelId,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });
      return res.content[0]?.type === "text" ? res.content[0].text : "";
    }
    case "openai": {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
      const res = await client.chat.completions.create({
        model: modelId,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        max_tokens: maxTokens,
      });
      return res.choices[0]?.message?.content ?? "";
    }
  }
}
