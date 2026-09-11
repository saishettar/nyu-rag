import type { Conversation } from "../types";
import { Orb } from "./Orb";

function CollapseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6.5 2.5v11" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.7 6l-1.4 2 1.4 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NewChatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="6.2" cy="6.2" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.3 9.3L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onOpenSearch,
  open,
  onClose,
}: {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onNewChat: () => void;
  onOpenSearch: () => void;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {open && (
        <button
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-ink/30 backdrop-blur-[1px] lg:hidden"
        />
      )}
      {/* Fully overlays (never reserves layout space) when closed, at every breakpoint -
          collapsing the sidebar hides it completely rather than leaving a slim rail. */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col overflow-hidden border-r border-border bg-sidebar transition-transform duration-200 ease-out ${
          open ? "translate-x-0 lg:relative" : "-translate-x-full lg:hidden"
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
          <div className="flex items-center gap-2">
            <Orb size={20} />
            <span className="text-[0.95rem] font-semibold tracking-tight text-ink">
              NYU Course Assistant
            </span>
          </div>
          <button
            aria-label="Collapse sidebar"
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-faint hover:bg-surface hover:text-ink"
          >
            <CollapseIcon />
          </button>
        </div>

        <div className="flex flex-col gap-0.5 px-3 pt-1">
          <button
            type="button"
            onClick={onNewChat}
            className="glass-surface flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-ink"
          >
            <NewChatIcon />
            New chat
          </button>
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <SearchIcon />
            Search chats
          </button>
        </div>

        <nav className="mt-3 flex-1 overflow-y-auto px-3 pb-3">
          <p className="px-2.5 pb-1.5 text-xs font-semibold text-ink">Recents</p>
          {conversations.length === 0 ? (
            <p className="px-2.5 py-6 text-center text-xs leading-relaxed text-faint">
              Your conversations will show up here once you ask something.
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className={`w-full truncate rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
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
        </nav>
      </aside>
    </>
  );
}
