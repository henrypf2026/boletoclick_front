"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  buildBotReply,
  createBotMessage,
  createGreetingMessage,
  createUserMessage,
  getInitialSuggestions,
  getLocalOnlyReply,
  type ChatMessage,
} from "@/lib/chatbot/chatEngine";
import { chatbotService } from "@/services/chatbotService";
import {
  ChatMessageBubble,
  QuickReplies,
  TypingIndicator,
} from "./ChatMessage";

const HIDDEN_ROUTE_PREFIXES = ["/admin", "/dashboard-admin"];

export function ChatWidget() {
  const pathname = usePathname();
  const [messages, setMessages] = useState<ChatMessage[]>([
    createGreetingMessage(),
  ]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState(getInitialSuggestions());
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const isHiddenRoute = HIDDEN_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  if (isHiddenRoute) {
    return null;
  }

  async function sendText(rawText: string) {
    const text = rawText.trim();
    if (!text || isTyping) {
      return;
    }

    const userMessage = createUserMessage(text);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSuggestions([]);
    setIsTyping(true);

    const localReply = getLocalOnlyReply(text);

    if (localReply) {
      setMessages((prev) => [...prev, localReply.message]);
      setSuggestions(localReply.suggestions);
      setIsTyping(false);
      return;
    }

    try {
      const answer = await chatbotService.ask(text);
      setMessages((prev) => [...prev, createBotMessage(answer)]);
      setSuggestions(getInitialSuggestions());
    } catch {
      const fallback = buildBotReply(text);
      setMessages((prev) => [...prev, fallback.message]);
      setSuggestions(fallback.suggestions);
    } finally {
      setIsTyping(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendText(input);
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-border bg-primary text-2xl text-white shadow-lg transition hover:bg-primary-deep"
        aria-label="Abrir asistente"
      >
        💬
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-3xl border-2 border-border bg-background shadow-2xl">
      <header className="flex items-center justify-between bg-primary px-4 py-3 text-white">
        <div>
          <p className="text-xs font-black uppercase tracking-wider opacity-80">
            Ayuda
          </p>
          <h2 className="text-sm font-black uppercase">Asistente BoletoClick</h2>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-full border border-white/40 px-2 py-1 text-xs font-bold hover:bg-white/10"
          aria-label="Minimizar asistente"
        >
          —
        </button>
      </header>

      <div
        ref={listRef}
        className="flex max-h-80 flex-col gap-3 overflow-y-auto px-4 py-4"
      >
        {messages.map((message) => (
          <ChatMessageBubble
            key={message.id}
            role={message.role}
            text={message.text}
          />
        ))}
        <TypingIndicator visible={isTyping} />
      </div>

      <div className="space-y-3 border-t-2 border-border bg-surface px-4 py-3">
        <QuickReplies
          options={suggestions}
          onSelect={sendText}
          disabled={isTyping}
        />

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Pregunta sobre eventos o boletos..."
            disabled={isTyping}
            className="min-w-0 flex-1 rounded-xl border-2 border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isTyping || input.trim().length === 0}
            className="rounded-xl border-2 border-border bg-accent px-4 py-2 text-sm font-black uppercase text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
