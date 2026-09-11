import { Orb } from "./Orb";

export function ThinkingIndicator() {
  return (
    <div
      className="flex items-center gap-3"
      role="status"
      aria-label="Searching the catalog and drafting an answer"
    >
      <Orb size={24} />
      <div className="flex items-center gap-1.5 py-1">
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-faint [animation-delay:-0.32s]" />
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-faint [animation-delay:-0.16s]" />
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-faint" />
      </div>
    </div>
  );
}
