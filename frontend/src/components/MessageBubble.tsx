import type { Message } from "../types";
import { AnswerText } from "./AnswerText";
import { Orb } from "./Orb";

export function MessageBubble({
  message,
  onCite,
}: {
  message: Message;
  onCite: (code: string) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end animate-rise-in">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-surface px-4 py-2.5 text-[0.95rem] leading-relaxed text-ink shadow-panel sm:max-w-[70%]">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 animate-rise-in">
      <div className="mt-0.5">
        <Orb size={24} />
      </div>
      <div className="max-w-measure min-w-0 flex-1">
        <AnswerText
          content={message.content}
          courses={message.retrieved_courses ?? []}
          onCite={onCite}
        />
      </div>
    </div>
  );
}
