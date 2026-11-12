/// <reference types="node" />

import type { IncomingMessage, ServerResponse } from "node:http";
import { SYSTEM_PROMPT } from "../shared/assistantPrompt.js";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ChatRequest extends IncomingMessage {
  body?: unknown;
}

interface ChatResponse extends ServerResponse {
  status(code: number): ChatResponse;
  json(body: unknown): void;
}

interface RateWindow {
  count: number;
  resetAt: number;
}

const CHAT_LIMIT = 12;
const CHAT_WINDOW_MS = 60_000;
const MAX_RATE_ENTRIES = 2_000;
const rateWindows = new Map<string, RateWindow>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeForPrivacyCheck(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function containsSensitiveContent(value: string) {
  const normalized = normalizeForPrivacyCheck(value);
  const containsIdentifier =
    /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(value)
    || /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/.test(value)
    || /\b\d{15}\b/.test(value)
    || /\b(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9\d{4}|\d{4})[-.\s]?\d{4}\b/.test(value);
  const describesPersonalHealth =
    /\b(?:eu|meu|minha|meus|minhas|tenho|estou com|sinto|fui diagnosticado|fui diagnosticada)\b[\s\S]{0,80}\b(?:dor|sintoma|febre|doenca|diagnostico|exame|alergia|medicamento|remedio|dose|gravidez|vacina|pressao|glicemia)\b/.test(normalized);

  return containsIdentifier || describesPersonalHealth;
}

function readChatMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 12) {
    return null;
  }

  const messages: ChatMessage[] = [];
  let totalCharacters = 0;

  for (const item of value) {
    if (
      !isRecord(item)
      || (item.role !== "user" && item.role !== "assistant")
      || typeof item.content !== "string"
    ) {
      return null;
    }

    const content = item.content.trim();
    if (!content || content.length > 1_200) return null;
    totalCharacters += content.length;
    if (totalCharacters > 8_000) return null;

    const role = item.role as ChatRole;
    const previous = messages[messages.length - 1];
    if (previous?.role === role) {
      previous.content = `${previous.content}\n\n${content}`;
    } else {
      messages.push({ role, content });
    }
  }

  while (messages[0]?.role === "assistant") messages.shift();
  if (messages[messages.length - 1]?.role !== "user") return null;
  return messages.slice(-10);
}

function extractAnswer(value: unknown) {
  if (!isRecord(value) || !Array.isArray(value.content)) return "";

  return value.content
    .filter(
      (block): block is Record<string, unknown> =>
        isRecord(block) && block.type === "text" && typeof block.text === "string",
    )
    .map((block) => block.text as string)
    .join("\n")
    .trim();
}

function allowRequest(request: ChatRequest, response: ChatResponse) {
  const forwardedFor = request.headers["x-forwarded-for"];
  const clientIp =
    (typeof forwardedFor === "string" ? forwardedFor.split(",")[0]?.trim() : undefined)
    || request.socket.remoteAddress
    || "unknown";
  const now = Date.now();

  for (const [client, window] of rateWindows) {
    if (window.resetAt <= now) rateWindows.delete(client);
  }

  let window = rateWindows.get(clientIp);
  if (!window) {
    if (rateWindows.size >= MAX_RATE_ENTRIES) {
      response.status(503).json({
        error: "O assistente está ocupado. Tente novamente em instantes.",
      });
      return false;
    }

    window = { count: 0, resetAt: now + CHAT_WINDOW_MS };
    rateWindows.set(clientIp, window);
  }

  if (window.count >= CHAT_LIMIT) {
    response.setHeader("Retry-After", String(Math.ceil((window.resetAt - now) / 1000)));
    response.status(429).json({
      error: "Muitas perguntas em pouco tempo. Aguarde um minuto e tente novamente.",
    });
    return false;
  }

  window.count += 1;
  return true;
}

export default async function handler(request: ChatRequest, response: ChatResponse) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Método não permitido." });
    return;
  }

  if (!allowRequest(request, response)) return;

  const body: unknown = request.body;
  const messages = isRecord(body) ? readChatMessages(body.messages) : null;
  if (!messages) {
    response.status(400).json({
      error: "A conversa enviada é inválida. Revise a mensagem e tente novamente.",
    });
    return;
  }

  if (containsSensitiveContent(messages[messages.length - 1].content)) {
    response.status(400).json({
      error: "Não envie dados pessoais ou informações clínicas. Reformule sua pergunta sem esses detalhes; nada foi encaminhado à Anthropic.",
    });
    return;
  }

  const safeMessages = messages.filter((message) => !containsSensitiveContent(message.content));
  while (safeMessages[0]?.role === "assistant") safeMessages.shift();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    response.status(503).json({
      error: "A conversa com IA ainda não está configurada neste ambiente. A equipe responsável precisa configurar ANTHROPIC_API_KEY no servidor.",
    });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const providerResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
        max_tokens: 700,
        system: SYSTEM_PROMPT,
        messages: safeMessages,
      }),
      signal: controller.signal,
    });

    let providerBody: unknown;
    try {
      providerBody = await providerResponse.json();
    } catch {
      response.status(502).json({
        error: "A IA retornou uma resposta inválida. Tente novamente.",
      });
      return;
    }

    if (!providerResponse.ok) {
      const status = providerResponse.status === 429 || providerResponse.status === 529
        ? 503
        : 502;
      response.status(status).json({
        error: status === 503
          ? "A IA está ocupada no momento. Aguarde um pouco e tente novamente."
          : "A IA não conseguiu responder. Verifique a chave e o modelo configurados no servidor.",
      });
      return;
    }

    const answer = extractAnswer(providerBody);
    if (!answer) {
      response.status(502).json({
        error: "A IA não retornou uma resposta em texto. Tente novamente.",
      });
      return;
    }

    response.status(200).json({ answer });
  } catch (error) {
    response.status(error instanceof Error && error.name === "AbortError" ? 504 : 502).json({
      error: error instanceof Error && error.name === "AbortError"
        ? "A resposta demorou demais. Tente novamente."
        : "Não foi possível conectar à IA agora. Tente novamente em instantes.",
    });
  } finally {
    clearTimeout(timeout);
  }
}
