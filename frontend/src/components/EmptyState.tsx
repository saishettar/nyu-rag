import { Orb } from "./Orb";
import { ChatInput } from "./ChatInput";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const EXAMPLES = [
  "What's a good course to take after Data Structures?",
  "Which courses need Calculus as a prerequisite?",
  "Is there a course on quantum mechanics?",
  "What does the Computer Science major require?",
];

export function EmptyState({
  onExample,
  onSend,
  sending,
}: {
  onExample: (q: string) => void;
  onSend: (text: string) => void;
  sending: boolean;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center overflow-y-auto px-6 py-10 text-center">
      <Orb size={56} />
      <h1 className="mt-5 text-xl font-semibold tracking-tight text-ink">
        {greeting()}. Ask about the course catalog
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
        Every answer cites the specific courses it's drawn from — pulled straight from
        NYU's Bulletin, not guessed from memory.
      </p>

      <div className="mt-6 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {EXAMPLES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onExample(q)}
            className="rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-left text-xs leading-snug text-muted shadow-panel transition-colors hover:border-accent/40 hover:text-accent-ink"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="mt-6 w-full max-w-2xl">
        <ChatInput disabled={sending} onSend={onSend} />
        <p className="mt-2 text-center text-[0.7rem] text-faint">
          Answers can be wrong — always verify prerequisites and requirements with an advisor or the official Bulletin.
        </p>
      </div>
    </div>
  );
}
