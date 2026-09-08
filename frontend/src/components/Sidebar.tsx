import type { Conversation } from "../types";

function BracketMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M6.5 3H4.5C3.67 3 3 3.67 3 4.5V13.5C3 14.33 3.67 15 4.5 15H6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11.5 3H13.5C14.33 3 15 3.67 15 4.5V13.5C15 14.33 14.33 15 13.5 15H11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
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
  collapsed,
  onCollapse,
  onExpand,
}: {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onNewChat: () => void;
  onOpenSearch: () => void;
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onCollapse: () => void;
  onExpand: () => void;
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
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col overflow-hidden border-r border-border bg-sidebar transition-[transform,width,border-color] duration-200 ease-out lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-14" : "lg:w-72"}`}
      >
        {/* Expanded content: always shown on mobile (drawer), hidden on desktop when collapsed */}
        <div className={`flex h-full w-72 shrink-0 flex-col ${collapsed ? "lg:hidden" : ""}`}>
          <div className="flex items-center justify-between gap-2 px-4 pb-1 pt-4 text-accent">
            <div className="flex items-center gap-2">
              <BracketMark />
              <span className="text-[0.95rem] font-semibold tracking-tight text-ink">
                NYU Course Assistant
              </span>
            </div>
            <button
              aria-label="Collapse sidebar"
              onClick={onCollapse}
              className="hidden shrink-0 rounded-md p-1 text-faint hover:bg-surface hover:text-ink lg:flex"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="2" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M6.5 2.5v11" stroke="currentColor" strokeWidth="1.3" />
                <path d="M4.7 6l-1.4 2 1.4 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-1 px-3 pt-3">
            <button
              type="button"
              onClick={onNewChat}
              className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-ink shadow-panel transition-colors hover:border-accent/40 hover:text-accent-ink"
            >
              <NewChatIcon />
              New chat
            </button>
            <button
              type="button"
              onClick={onOpenSearch}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              <SearchIcon />
              Search chats
            </button>
          </div>

          <nav className="mt-2 flex-1 overflow-y-auto px-3 pb-3">
            {conversations.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs leading-relaxed text-faint">
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

          <div className="border-t border-border px-4 py-3 text-xs leading-snug text-faint">
            CAS: CS, Math, Data Science, Physics · grounded in NYU's Bulletin
          </div>
        </div>

        {/* Collapsed rail: desktop only, clicking the rail background expands it */}
        <div
          role="button"
          tabIndex={collapsed ? 0 : -1}
          aria-label="Expand sidebar"
          onClick={onExpand}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onExpand();
          }}
          className={`hidden h-full w-14 shrink-0 flex-col items-center gap-1 py-4 ${
            collapsed ? "lg:flex" : ""
          }`}
        >
          <span className="mb-2 text-accent">
            <BracketMark />
          </span>
          <button
            type="button"
            aria-label="New chat"
            title="New chat"
            onClick={(e) => {
              e.stopPropagation();
              onNewChat();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <NewChatIcon />
          </button>
          <button
            type="button"
            aria-label="Search chats"
            title="Search chats"
            onClick={(e) => {
              e.stopPropagation();
              onOpenSearch();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <SearchIcon />
          </button>
        </div>
      </aside>
    </>
  );
}
