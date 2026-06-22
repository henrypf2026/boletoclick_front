import {
  FAQ_ENTRIES,
  GREETING,
  GREETING_REPLY,
  OFF_TOPIC,
  QUICK_REPLIES,
  type FaqEntry,
} from "./faq";
import { isAskingAboutFree, isGreeting, isOnTopic } from "./topicGuard";

export type MessageRole = "user" | "bot";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  matchedFaqId?: string;
}

export interface ChatReply {
  message: ChatMessage;
  suggestions: readonly string[];
}

let messageCounter = 0;

function createId(prefix: string): string {
  messageCounter += 1;
  return `${prefix}-${messageCounter}-${Date.now()}`;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function scoreEntry(input: string, entry: FaqEntry): number {
  const normalized = normalize(input);
  let score = 0;

  for (const keyword of entry.keywords) {
    const normalizedKeyword = normalize(keyword);
    if (normalized.includes(normalizedKeyword)) {
      score += normalizedKeyword.length >= 5 ? 2 : 1;
    }
  }

  const normalizedQuestion = normalize(entry.question);
  if (normalized === normalizedQuestion) {
    score += 5;
  }

  return score;
}

export function findBestFaq(input: string): FaqEntry | null {
  const ranked = FAQ_ENTRIES.map((entry) => ({
    entry,
    score: scoreEntry(input, entry),
  }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.entry ?? null;
}

export function resolveQuickReply(label: string): FaqEntry | null {
  const map: Record<string, string> = {
    "¿Cómo compro entradas?": "comprar",
    "Medios de pago": "pago",
    "Mi QR de acceso": "qr",
    "Soy productor": "productor",
    "Hablar con soporte": "contacto",
  };

  const faqId = map[label];
  if (!faqId) {
    return findBestFaq(label);
  }

  return FAQ_ENTRIES.find((entry) => entry.id === faqId) ?? null;
}

export function createGreetingMessage(): ChatMessage {
  return {
    id: createId("bot"),
    role: "bot",
    text: GREETING,
  };
}

export function createUserMessage(text: string): ChatMessage {
  return {
    id: createId("user"),
    role: "user",
    text: text.trim(),
  };
}

export function createBotMessage(text: string): ChatMessage {
  return {
    id: createId("bot"),
    role: "bot",
    text,
  };
}

/** Respuestas locales fijas: saludo, gratis y fuera de tema. */
export function getLocalOnlyReply(input: string): ChatReply | null {
  const trimmed = input.trim();

  if (isGreeting(trimmed)) {
    return {
      message: {
        id: createId("bot"),
        role: "bot",
        text: GREETING_REPLY,
      },
      suggestions: QUICK_REPLIES,
    };
  }

  if (isAskingAboutFree(trimmed)) {
    const gratisFaq = FAQ_ENTRIES.find((entry) => entry.id === "gratis");
    return {
      message: {
        id: createId("bot"),
        role: "bot",
        text: gratisFaq?.answer ?? "No hay eventos gratis en BoletoClick.",
        matchedFaqId: "gratis",
      },
      suggestions: QUICK_REPLIES,
    };
  }

  const faqMatch = findBestFaq(trimmed) ?? resolveQuickReply(trimmed);
  if (faqMatch?.id === "pago") {
    return {
      message: {
        id: createId("bot"),
        role: "bot",
        text: faqMatch.answer,
        matchedFaqId: "pago",
      },
      suggestions: QUICK_REPLIES,
    };
  }

  if (!isOnTopic(trimmed)) {
    return {
      message: {
        id: createId("bot"),
        role: "bot",
        text: OFF_TOPIC,
      },
      suggestions: QUICK_REPLIES,
    };
  }

  return null;
}

export function buildBotReply(input: string): ChatReply {
  const trimmed = input.trim();

  if (isGreeting(trimmed)) {
    return {
      message: {
        id: createId("bot"),
        role: "bot",
        text: GREETING_REPLY,
      },
      suggestions: QUICK_REPLIES,
    };
  }

  if (isAskingAboutFree(trimmed)) {
    const gratisFaq = FAQ_ENTRIES.find((entry) => entry.id === "gratis");
    return {
      message: {
        id: createId("bot"),
        role: "bot",
        text: gratisFaq?.answer ?? "No hay eventos gratis en BoletoClick.",
        matchedFaqId: "gratis",
      },
      suggestions: QUICK_REPLIES,
    };
  }

  const faq = findBestFaq(trimmed) ?? resolveQuickReply(trimmed);

  if (faq) {
    return {
      message: {
        id: createId("bot"),
        role: "bot",
        text: faq.answer,
        matchedFaqId: faq.id,
      },
      suggestions: QUICK_REPLIES,
    };
  }

  if (!isOnTopic(trimmed)) {
    return {
      message: {
        id: createId("bot"),
        role: "bot",
        text: OFF_TOPIC,
      },
      suggestions: QUICK_REPLIES,
    };
  }

  return {
    message: {
      id: createId("bot"),
      role: "bot",
      text: OFF_TOPIC,
    },
    suggestions: QUICK_REPLIES,
  };
}

export const TYPING_DELAY_MS = 650;

export function getInitialSuggestions(): readonly string[] {
  return QUICK_REPLIES;
}
