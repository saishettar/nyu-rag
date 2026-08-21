"""Build a grounded prompt from retrieved courses and ask Claude to answer."""
import os

import anthropic
from dotenv import load_dotenv
from iris_otel import observe, trace_llm_call
from iris_otel.presets import anthropic_finish_reason, anthropic_output_text, anthropic_usage

load_dotenv()

MODEL = "claude-sonnet-5"

SYSTEM_PROMPT = (
    "You are a course-planning assistant for NYU students. Answer the "
    "question using ONLY the course listings provided below. Every claim "
    "must cite the specific course code(s) it is drawn from, in the form "
    "[CODE]. If the provided listings don't contain enough information to "
    "answer, say so directly instead of guessing."
)


def build_context(courses: list[dict]) -> str:
    entries = []
    for c in courses:
        entries.append(
            f"[{c['course_code']}] {c['title']} ({c['credits']} credits)\n"
            f"Prerequisites: {c['prerequisites'] or 'None'}\n"
            f"{c['chunk_text']}"
        )
    return "\n\n".join(entries)


@trace_llm_call(
    model=MODEL,
    extract_usage=anthropic_usage,
    extract_finish_reasons=anthropic_finish_reason,
    extract_messages=anthropic_output_text,
    system_instructions=SYSTEM_PROMPT,
)
def _call_claude(client: anthropic.Anthropic, **kwargs):
    return client.messages.create(**kwargs)


def generate_answer(question: str, courses: list[dict]) -> str:
    context = build_context(courses)
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    with observe("invoke_agent", **{"gen_ai.agent.name": "nyu-rag-answer"}):
        message = _call_claude(
            client,
            model=MODEL,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"Course listings:\n\n{context}\n\nQuestion: {question}",
                }
            ],
        )
    return next(block.text for block in message.content if block.type == "text")


if __name__ == "__main__":
    import sys
    from pathlib import Path

    sys.path.insert(0, str(Path(__file__).parent.parent))
    from retrieval.search import search

    question = sys.argv[1] if len(sys.argv) > 1 else "What's a good course after Algorithms?"
    retrieved = search(question)
    print(generate_answer(question, retrieved))
