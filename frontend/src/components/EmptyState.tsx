import { useState } from "react";
import { Orb } from "./Orb";
import { ChatInput } from "./ChatInput";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const EXAMPLE_POOL = [
  "What's a good course to take after Data Structures?",
  "Which courses need Calculus as a prerequisite?",
  "Is there a course on quantum mechanics?",
  "What does the Computer Science major require?",
  "Compare CSCI-UA 102 and CSCI-UA 310.",
  "How many credits is the Economics major?",
  "Which introductory course has no prerequisites and is meant for beginners?",
  "Is there a course on the history of Ukraine?",
  "What's the difference between Calculus II and Calculus III?",
  "Which math courses satisfy the Computer Science major?",
  "Is there a course on pidgin and creole languages?",
  "What courses cover linear algebra?",
];

const VISIBLE_COUNT = 4;

function sampleExamples(exclude: string[] = []): string[] {
  const candidates = EXAMPLE_POOL.filter((q) => !exclude.includes(q));
  const pool = candidates.length >= VISIBLE_COUNT ? candidates : EXAMPLE_POOL;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, VISIBLE_COUNT);
}

function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M12 7a5 5 0 1 1-1.5-3.57M12 2v3h-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EmptyState({
  onExample,
  onSend,
  sending,
}: {
  onExample: (q: string) => void;
  onSend: (text: string) => void;
  sending: boolean;
}) {
  const [examples, setExamples] = useState(() => sampleExamples());

  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center overflow-y-auto px-6 py-10 pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-center text-center">
        <Orb size={56} />
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-ink">
          {greeting()}. Ask about the course catalog
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
          Answers cite the exact courses they're based on, pulled straight from NYU's
          Bulletin.
        </p>

        <div className="mt-6 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {examples.map((q) => (
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

        <button
          type="button"
          onClick={() => setExamples((prev) => sampleExamples(prev))}
          className="mt-2 flex w-full max-w-2xl items-center gap-1.5 text-left text-xs text-faint transition-colors hover:text-muted"
        >
          <RefreshIcon />
          Refresh prompts
        </button>

        <div className="mt-6 w-full max-w-2xl">
          <ChatInput disabled={sending} onSend={onSend} />
          <p className="mt-2 text-center text-[0.7rem] text-faint">
            Answers can be wrong — always verify prerequisites and requirements with an advisor or the official Bulletin.
          </p>
        </div>
      </div>
    </div>
  );
}
