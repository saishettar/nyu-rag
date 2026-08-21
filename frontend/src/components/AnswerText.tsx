import type { ReactNode } from "react";
import { Fragment } from "react";
import type { Course } from "../types";

const INLINE_RE = /(\*\*[^*]+\*\*|\[[^[\]]+\])/g;

function renderInline(
  text: string,
  courseCodes: Set<string>,
  onCite: (code: string) => void,
  keyPrefix: string
): ReactNode[] {
  return text
    .split(INLINE_RE)
    .filter((part) => part.length > 0)
    .map((part, i) => {
      const key = `${keyPrefix}-${i}`;
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={key} className="font-semibold text-ink">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("[") && part.endsWith("]")) {
        const code = part.slice(1, -1);
        if (courseCodes.has(code)) {
          return (
            <button
              key={key}
              type="button"
              onClick={() => onCite(code)}
              className="mx-0.5 inline-flex translate-y-[-1px] items-center rounded-full border border-accent/25 bg-accent-soft px-1.5 py-0.5 font-mono text-[0.72em] font-medium text-accent-ink transition-colors hover:border-accent/50 hover:bg-accent/15"
              title={`Jump to ${code} in the catalog`}
            >
              {code}
            </button>
          );
        }
        return <Fragment key={key}>{part}</Fragment>;
      }
      return <Fragment key={key}>{part}</Fragment>;
    });
}

function isOrderedListBlock(lines: string[]): boolean {
  return lines.every((l) => /^\d+\.\s+/.test(l.trim()));
}

function isBulletListBlock(lines: string[]): boolean {
  return lines.every((l) => /^[-*]\s+/.test(l.trim()));
}

export function AnswerText({
  content,
  courses,
  onCite,
}: {
  content: string;
  courses: Course[];
  onCite: (code: string) => void;
}) {
  const courseCodes = new Set(courses.map((c) => c.course_code));
  const blocks = content.trim().split(/\n{2,}/);

  return (
    <div className="prose-answer text-[0.95rem] text-ink">
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.trim().length > 0);
        const key = `b-${bi}`;

        if (lines.length > 1 && isOrderedListBlock(lines)) {
          return (
            <ol key={key} className="list-decimal">
              {lines.map((line, li) => (
                <li key={li}>
                  {renderInline(
                    line.replace(/^\d+\.\s+/, ""),
                    courseCodes,
                    onCite,
                    `${key}-${li}`
                  )}
                </li>
              ))}
            </ol>
          );
        }

        if (lines.length > 1 && isBulletListBlock(lines)) {
          return (
            <ul key={key} className="list-disc">
              {lines.map((line, li) => (
                <li key={li}>
                  {renderInline(
                    line.replace(/^[-*]\s+/, ""),
                    courseCodes,
                    onCite,
                    `${key}-${li}`
                  )}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={key}>
            {lines.map((line, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {renderInline(line, courseCodes, onCite, `${key}-${li}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
