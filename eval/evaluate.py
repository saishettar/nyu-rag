"""Evaluate retrieval hit-rate@k and answer groundedness against test_questions.json."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from generation.answer import generate_answer  # noqa: E402
from retrieval.search import search  # noqa: E402

TEST_QUESTIONS_PATH = Path(__file__).parent / "test_questions.json"
TOP_K = 5


def hit_rate_at_k(retrieved: list[dict], expected_codes: list[str]) -> bool:
    retrieved_codes = {c["course_code"] for c in retrieved}
    return any(code in retrieved_codes for code in expected_codes)


def judge_groundedness(question: str, answer: str, retrieved: list[dict]) -> str:
    """Ask Claude to judge whether the answer only relies on the retrieved courses."""
    import os

    import anthropic

    context = "\n".join(f"[{c['course_code']}] {c['title']}: {c['chunk_text']}" for c in retrieved)
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    message = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=200,
        messages=[
            {
                "role": "user",
                "content": (
                    "Judge whether ANSWER is fully grounded in CONTEXT (no claims "
                    "beyond what CONTEXT supports) and cites at least one course code. "
                    f"Respond with GROUNDED or NOT_GROUNDED and a one-sentence reason.\n\n"
                    f"CONTEXT:\n{context}\n\nQUESTION: {question}\n\nANSWER: {answer}"
                ),
            }
        ],
    )
    return message.content[0].text


def main() -> None:
    test_cases = json.loads(TEST_QUESTIONS_PATH.read_text(encoding="utf-8"))

    hits = 0
    results = []
    for case in test_cases:
        retrieved = search(case["question"], top_k=TOP_K)
        hit = hit_rate_at_k(retrieved, case["expected_course_codes"])
        hits += hit
        answer = generate_answer(case["question"], retrieved)
        verdict = judge_groundedness(case["question"], answer, retrieved)
        results.append(
            {
                "question": case["question"],
                "expected": case["expected_course_codes"],
                "retrieved": [c["course_code"] for c in retrieved],
                "hit": hit,
                "answer": answer,
                "groundedness": verdict,
            }
        )
        print(f"[{'HIT' if hit else 'MISS'}] {case['question']}")

    print(f"\nRetrieval hit-rate@{TOP_K}: {hits}/{len(test_cases)} = {hits / len(test_cases):.0%}")

    out_path = Path(__file__).parent / "eval_results.json"
    out_path.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"Full results written to {out_path}")


if __name__ == "__main__":
    main()
