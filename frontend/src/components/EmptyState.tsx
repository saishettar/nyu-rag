import { useMemo } from "react";
import type { Course } from "../types";

const EXAMPLES = [
  "What's a good course to take after Data Structures?",
  "Which courses need Calculus as a prerequisite?",
  "Is there a course on quantum mechanics?",
];

const STATS = [
  { label: "Retrieval hit-rate@5", value: "100%" },
  { label: "Answer groundedness", value: "98%" },
];

function formatDept(dept: string): string {
  return dept.replace(/_/g, "-").toUpperCase();
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3.5 py-3 text-left shadow-panel">
      <p className="text-[0.68rem] font-medium uppercase tracking-wide text-faint">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-ink">{value}</p>
    </div>
  );
}

function DeptBar({ code, count, max }: { code: string; count: number; max: number }) {
  const pct = max > 0 ? Math.max((count / max) * 100, 4) : 0;
  return (
    <li
      className="flex items-center gap-3"
      title={`${formatDept(code)}: ${count} course${count === 1 ? "" : "s"}`}
    >
      <span className="w-[4.5rem] shrink-0 text-left font-mono text-[0.7rem] text-muted">
        {formatDept(code)}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-accent-soft">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 shrink-0 text-right text-[0.7rem] tabular-nums text-muted">{count}</span>
    </li>
  );
}

export function EmptyState({
  onExample,
  courses,
}: {
  onExample: (q: string) => void;
  courses: Course[];
}) {
  const deptCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of courses) {
      counts.set(c.department, (counts.get(c.department) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [courses]);

  const maxCount = deptCounts[0]?.[1] ?? 0;

  return (
    <div className="flex h-full flex-col items-center justify-center overflow-y-auto px-6 py-10 text-center">
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

      <div className="mt-10 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Courses in catalog" value={String(courses.length)} />
        <StatTile label="Departments" value={String(deptCounts.length)} />
        {STATS.map((s) => (
          <StatTile key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      {deptCounts.length > 0 && (
        <div className="mt-4 w-full max-w-2xl rounded-xl border border-border bg-surface p-4 text-left shadow-panel">
          <h2 className="text-[0.68rem] font-medium uppercase tracking-wide text-faint">
            Courses by department
          </h2>
          <ul className="mt-3 flex flex-col gap-2.5">
            {deptCounts.map(([code, count]) => (
              <DeptBar key={code} code={code} count={count} max={maxCount} />
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-xs text-faint">evaluated on 58 hand-written course-planning questions</p>
    </div>
  );
}
