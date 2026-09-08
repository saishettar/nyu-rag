import { useMemo, useState } from "react";
import type { Conversation } from "../types";

export function ChatSearchView({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onBack,
}: {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onNewChat: () => void;
  onBack: () => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => (c.title ?? "New chat").toLowerCase().includes(q));
  }, [conversations, query]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 lg:px-6">
        <button
          aria-label="Back to chat"
          onClick={onBack}
          className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M11 4l-5 5 5 5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-sm font-medium text-ink">Search chats</h1>
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 overflow-hidden px-4 py-6 lg:px-8">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 shadow-panel">
          <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0 text-faint">
            <circle cx="6.2" cy="6.2" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9.3 9.3L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats…"
            className="w-full bg-transparent text-sm text-ink placeholder:text-faint focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm font-medium text-ink shadow-panel transition-colors hover:border-accent/40 hover:text-accent-ink"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          New chat
        </button>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs leading-relaxed text-faint">
              {conversations.length === 0
                ? "Your conversations will show up here once you ask something."
                : `No chats match "${query}".`}
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {filtered.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className={`w-full truncate rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      c.id === activeId
                        ? "bg-accent-soft text-accent-ink"
                        : "text-muted hover:bg-surface hover:text-ink"
                    }`}
                    title={c.title ?? "New chat"}
                  >
                    {c.title ?? "New chat"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
