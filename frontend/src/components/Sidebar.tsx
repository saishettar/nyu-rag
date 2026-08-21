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

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  open,
  onClose,
}: {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onNewChat: () => void;
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
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-border bg-sidebar transition-transform duration-200 ease-out lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-4 pb-1 pt-4 text-accent">
          <BracketMark />
          <span className="text-[0.95rem] font-semibold tracking-tight text-ink">
            NYU Course Assistant
          </span>
        </div>

        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={onNewChat}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-ink shadow-panel transition-colors hover:border-accent/40 hover:text-accent-ink"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M7 2v10M2 7h10"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            New chat
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
      </aside>
    </>
  );
}
