interface ChatMessageProps {
  role: "user" | "bot";
  text: string;
}

export function ChatMessageBubble({ role, text }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl border-2 border-border px-4 py-3 text-sm leading-relaxed ${
          isUser ? "bg-primary text-background" : "bg-surface text-text shadow-sm"
        }`}
      >
        {!isUser && (
          <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-primary">
            BoletoBot
          </p>
        )}
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}

interface TypingIndicatorProps {
  visible: boolean;
}

export function TypingIndicator({ visible }: TypingIndicatorProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="flex justify-start">
      <div className="rounded-2xl border-2 border-border bg-surface px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="h-2 w-2 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: `${dot * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface QuickRepliesProps {
  options: readonly string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export function QuickReplies({
  options,
  onSelect,
  disabled,
}: QuickRepliesProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option)}
          className="rounded-full border-2 border-border bg-surface-2 px-3 py-1.5 text-xs font-bold text-text transition hover:bg-primary hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
