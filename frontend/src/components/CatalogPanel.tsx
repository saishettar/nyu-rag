import { useEffect, useRef } from "react";
import type { Course } from "../types";

function formatDept(dept: string): string {
  return dept.replace(/_/g, "-").toUpperCase();
}

export function CatalogPanel({
  courses,
  loading,
  query,
  onQueryChange,
  department,
  departments,
  onDepartmentChange,
  highlightedCode,
  open,
  onClose,
}: {
  courses: Course[];
  loading: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  department: string | null;
  departments: string[];
  onDepartmentChange: (d: string | null) => void;
  highlightedCode: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!highlightedCode) return;
    const el = rowRefs.current[highlightedCode];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightedCode]);

  return (
    <>
      {open && (
        <button
          aria-label="Close catalog"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-ink/30 backdrop-blur-[1px] xl:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-full max-w-sm shrink-0 flex-col border-l border-border bg-surface transition-transform duration-200 ease-out xl:static xl:z-auto xl:w-80 xl:translate-x-0 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="text-sm font-semibold text-ink">Course catalog</h2>
          <button
            aria-label="Close catalog"
            onClick={onClose}
            className="rounded-md p-1 text-faint hover:text-ink xl:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-2 px-4 pb-3 pt-3">
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search code or title…"
            className="rounded-lg border border-border bg-canvas px-3 py-1.5 text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          {departments.length > 1 && (
            <select
              value={department ?? ""}
              onChange={(e) => onDepartmentChange(e.target.value || null)}
              className="rounded-lg border border-border bg-canvas px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {formatDept(d)}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {loading ? (
            <p className="px-2 py-6 text-center text-xs text-faint">Loading courses…</p>
          ) : courses.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs leading-relaxed text-faint">
              No courses match “{query}”.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {courses.map((c) => {
                const isHighlighted = c.course_code === highlightedCode;
                return (
                  <li key={c.course_code}>
                    <div
                      ref={(el) => (rowRefs.current[c.course_code] = el)}
                      className={`rounded-lg border px-3 py-2 transition-colors duration-300 ${
                        isHighlighted
                          ? "border-accent/40 bg-accent-soft"
                          : "border-transparent bg-canvas"
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-mono text-xs font-medium text-accent-ink">
                          {c.course_code}
                        </span>
                        {c.credits != null && (
                          <span className="shrink-0 text-xs text-faint">
                            {c.credits} cr
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm leading-snug text-ink">{c.title}</p>
                      {c.prerequisites && (
                        <p className="mt-1 text-xs leading-snug text-muted">
                          Prereq: {c.prerequisites}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
