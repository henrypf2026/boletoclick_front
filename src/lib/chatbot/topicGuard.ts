import { ALLOWED_TOPIC_KEYWORDS, GREETING_PATTERNS } from "./faq";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

export function isGreeting(input: string): boolean {
  const normalized = normalize(input);

  return GREETING_PATTERNS.some(
    (pattern) =>
      normalized === pattern ||
      normalized.startsWith(`${pattern} `) ||
      normalized.startsWith(`${pattern},`),
  );
}

const FREE_PATTERN =
  /\b(gratis|gartis|gratuit[oa]s?|sin costo|sin pagar|de regalo|cuesta cero|free)\b/;

export function isAskingAboutFree(input: string): boolean {
  return FREE_PATTERN.test(normalize(input));
}

export function isOnTopic(input: string): boolean {
  const normalized = normalize(input);

  if (normalized.length < 2) {
    return false;
  }

  return ALLOWED_TOPIC_KEYWORDS.some((keyword) => {
    const normalizedKeyword = normalize(keyword);
    return normalized.includes(normalizedKeyword);
  });
}
