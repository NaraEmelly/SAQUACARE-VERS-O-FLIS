import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SYSTEM_PROMPT } from '../shared/assistantPrompt';

dotenv.config();

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface RateWindow {
  count: number;
  resetAt: number;
}

const app = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const CHAT_LIMIT = 12;
const CHAT_WINDOW_MS = 60_000;
const MAX_RATE_ENTRIES = 2_000;
const rateWindows = new Map<string, RateWindow>();

const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
  }),
);
app.use(express.json({ limit: '16kb' }));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeForPrivacyCheck(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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

function limitChatRequests(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction,
) {
  const now = Date.now();
  const key = request.ip || request.socket.remoteAddress || 'unknown';

  for (const [client, window] of rateWindows) {
    if (window.resetAt <= now) rateWindows.delete(client);
  }

  let window = rateWindows.get(key);
  if (!window) {
    if (rateWindows.size >= MAX_RATE_ENTRIES) {
      response.status(503).json({
        error: 'O assistente está ocupado. Tente novamente em instantes.',
      });
      return;
    }

    window = { count: 0, resetAt: now + CHAT_WINDOW_MS };
    rateWindows.set(key, window);
  }

  if (window.count >= CHAT_LIMIT) {
    response.set('Retry-After', String(Math.ceil((window.resetAt - now) / 1000)));
    response.status(429).json({
      error: 'Muitas perguntas em pouco tempo. Aguarde um minuto e tente novamente.',
    });
    return;
  }

  window.count += 1;
  next();
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
      || (item.role !== 'user' && item.role !== 'assistant')
      || typeof item.content !== 'string'
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

  while (messages[0]?.role === 'assistant') messages.shift();
  if (messages[messages.length - 1]?.role !== 'user') return null;
  return messages.slice(-10);
}

function extractAnswer(value: unknown) {
  if (!isRecord(value) || !Array.isArray(value.content)) return '';

  return value.content
    .filter(
      (block): block is Record<string, unknown> =>
        isRecord(block) && block.type === 'text' && typeof block.text === 'string',
    )
    .map((block) => block.text as string)
    .join('\n')
    .trim();
}

app.get('/api/health', (_request, response) => {
  response.json({
    mode: 'demo',
    database: 'disabled',
    aiConfigured: Boolean(ANTHROPIC_API_KEY),
  });
});

app.post('/api/chat', limitChatRequests, async (request, response) => {
  const body: unknown = request.body;
  const messages = isRecord(body) ? readChatMessages(body.messages) : null;

  if (!messages) {
    response.status(400).json({
      error: 'A conversa enviada é inválida. Revise a mensagem e tente novamente.',
    });
    return;
  }

  const latestMessage = messages[messages.length - 1];
  if (containsSensitiveContent(latestMessage.content)) {
    response.status(400).json({
      error: 'Não envie dados pessoais ou informações clínicas. Reformule sua pergunta sem esses detalhes; nada foi encaminhado à Anthropic.',
    });
    return;
  }

  const safeMessages = messages.filter((message) => !containsSensitiveContent(message.content));
  while (safeMessages[0]?.role === 'assistant') safeMessages.shift();

  if (!ANTHROPIC_API_KEY) {
    response.status(503).json({
      error: 'A IA ainda não está configurada no servidor. Configure ANTHROPIC_API_KEY para habilitar as respostas conversacionais.',
    });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  let anthropicResponse: Response;

  try {
    anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 700,
        system: SYSTEM_PROMPT,
        messages: safeMessages,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeout);
    response.status(error instanceof Error && error.name === 'AbortError' ? 504 : 502).json({
      error: error instanceof Error && error.name === 'AbortError'
        ? 'A resposta demorou demais. Tente novamente.'
        : 'Não foi possível conectar à IA agora. Tente novamente em instantes.',
    });
    return;
  }
  clearTimeout(timeout);

  let providerBody: unknown;
  try {
    providerBody = await anthropicResponse.json();
  } catch {
    response.status(502).json({
      error: 'A IA retornou uma resposta inválida. Tente novamente.',
    });
    return;
  }

  if (!anthropicResponse.ok) {
    const status = anthropicResponse.status === 429 || anthropicResponse.status === 529
      ? 503
      : 502;
    response.status(status).json({
      error: status === 503
        ? 'A IA está ocupada no momento. Aguarde um pouco e tente novamente.'
        : 'A IA não conseguiu responder. Verifique a configuração do servidor e tente novamente.',
    });
    return;
  }

  const answer = extractAnswer(providerBody);
  if (!answer) {
    response.status(502).json({
      error: 'A IA não retornou uma resposta em texto. Tente novamente.',
    });
    return;
  }

  response.json({ answer });
});

app.use('/api', (_request, response) => {
  response.status(503).json({
    message: 'A API está desativada no modo de demonstração. Nenhum dado foi salvo.',
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de demonstração disponível na porta ${PORT}`);
});
