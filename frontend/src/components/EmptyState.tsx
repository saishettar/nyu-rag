const EXAMPLES = [
  "What's a good course to take after Data Structures?",
  "Which courses need Calculus as a prerequisite?",
  "Is there a course on quantum mechanics?",
];

export function EmptyState({ onExample }: { onExample: (q: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <h1 className="text-xl font-semibold tracking-tight text-ink">
        Ask about the course catalog
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
        Every answer cites the specific courses it's drawn from — pulled straight from
        NYU's Bulletin, not guessed from memory.
      </p>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        {EXAMPLES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onExample(q)}
            className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-left text-xs text-muted shadow-panel transition-colors hover:border-accent/40 hover:text-accent-ink sm:text-center"
          >
            {q}
          </button>
        ))}
      </div>

      <p className="mt-8 text-xs text-faint">
        Retrieval hit-rate@5: 100% · Answer groundedness: 96%, evaluated on 26
        hand-written course-planning questions
      </p>
    </div>
  );
}
