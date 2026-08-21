# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience is dual and roughly equal:

- **NYU CS students and advisors** who want to ask natural-language questions about courses (prerequisites, what to take next, course content) and get a direct, cited answer instead of manually reading the Bulletin.
- **Portfolio/demo evaluators** (recruiters, interviewers, technical reviewers) assessing this as a demonstration of RAG engineering: retrieval quality, grounding, and evaluation rigor.

Both audiences must be served by the same surface — it needs to read as a genuinely useful tool, not a toy, while also making its engineering (retrieval, grounding, measured accuracy) legible to a technical evaluator.

## Product Purpose

Answers natural-language questions about NYU's course catalog with grounded, cited answers, replacing manual keyword-searching of the Bulletin. Success means: retrieved courses are actually relevant (evaluated via retrieval hit-rate@5), and generated answers are fully supported by retrieved content and cite specific course codes (evaluated via an LLM-judge groundedness check).

## Positioning

Every claim in an answer is grounded to a specific `[COURSE-CODE]` citation pulled from real Bulletin data via semantic search — not a general-purpose chatbot guessing at NYU's catalog from training data. The project also self-reports its own accuracy (hit-rate@5, groundedness) rather than asserting correctness, and documents a known limitation (weak retrieval on "what's next after X" questions) with a stated fix (hybrid structural + semantic retrieval).

## Operating Context

Pipeline has two phases:

- **Offline ingestion** (re-run when the catalog updates): scrape `bulletins.nyu.edu` HTML → parse course fields (code, title, credits, prerequisites, description) → one chunk per course → embed → store in Postgres/pgvector.
- **Online query**: user question → embed (local `sentence-transformers/all-MiniLM-L6-v2`) → pgvector cosine similarity top-k → Claude generates a cited answer from the retrieved courses.

Evaluation is a first-class workflow (`eval/evaluate.py`), run against 20 hand-written course-planning questions, with results recorded in the README and `eval/eval_results.json`.

## Capabilities and Constraints

- Retrieval and generation are separately measurable and currently measured: 19/20 (95%) retrieval hit-rate@5, 20/20 (100%) answer groundedness on the recorded eval run.
- Frontend is currently Streamlit (`app/main.py`) but this is an implementation detail, not a durable constraint — future visual work may move off Streamlit if that better serves the product.
- Backend (Python, Postgres/pgvector, local embeddings, Claude API for generation) is the stable architecture; frontend is the open surface.
- Known limitation: "what's next after X" style questions retrieve weakly because many courses share a prerequisite, so no single course is uniquely favored by embedding similarity alone. Documented fix direction: hybrid retrieval using `prerequisites` metadata to structurally filter before ranking by embeddings.

## Brand Commitments

Visual identity is independent — the product does not use NYU's official colors, torch mark, or other institutional branding, to avoid implying endorsement.

Standing visual preference (confirmed during `/impeccable shape`, chosen deliberately over rolled/pick alternatives): the modern AI-chat interface convention, played straight and at full craft — sidebar chat history, conversational main column, calm typography — judged against **Claude** and **ChatGPT** as the craft bar. This is the committed direction for the chat surface, not a placeholder; future visual work on this surface should raise craft within this convention rather than replace it with a different visual world.

## Evidence on Hand

- Scraped, parsed CSCI-UA course data at `ingest/data/csci_ua.json` (37 courses).
- Real evaluation results in `eval/eval_results.json` and summarized in README — these are genuine numbers from a real run, not placeholders, and should not be altered or fabricated in future work.
- README documents architecture, setup, and a specific eval-driven finding (folding `prerequisites` into embedded text improved hit-rate@5 from 90% to 95%). This is real project history worth surfacing, not marketing copy.

## Product Principles

1. Groundedness over fluency — every answer must be traceable to a cited course code; never let the surface imply confidence the retrieval/generation pipeline hasn't earned.
2. Show the work — retrieved courses, citations, and (where relevant) the project's own measured accuracy are part of what makes this credible to both audiences; don't hide them behind unnecessary polish.
3. Honest about limits — the documented retrieval weakness ("what's next after X") is a feature of this project's credibility, not something to sand away.
4. Backend is stable, frontend is open — Streamlit was the fastest path to a working v1; treat it as replaceable if a redesign better serves students or better demonstrates the engineering.
5. Scope will grow — CSCI-UA (37 courses) is the current department, not the ceiling; avoid hardcoding assumptions that only hold for a single department.

## Accessibility & Inclusion

No product-specific accessibility requirement has been established beyond standard web accessibility practice.
