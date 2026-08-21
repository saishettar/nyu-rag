export function ThinkingIndicator() {
  return (
    <div
      className="flex items-center gap-1.5 py-1"
      role="status"
      aria-label="Searching the catalog and drafting an answer"
    >
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-faint [animation-delay:-0.32s]" />
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-faint [animation-delay:-0.16s]" />
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-faint" />
    </div>
  );
}
