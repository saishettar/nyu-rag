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

Every claim in an answer is grounded to a specific `[COURSE-CODE]` citation pulled from real Bulletin data via semantic search — not a general-purpose chatbot guessing at NYU's catalog from training data. The project also self-reports its own accuracy (hit-rate@5, groundedness) rather than asserting correctness, and its own eval history (90% → 95% → 100% retrieval hit-rate@5, each jump tied to a named fix) is part of that credibility story.

## Operating Context

Pipeline has two phases:

- **Offline ingestion** (re-run when the catalog updates): scrape `bulletins.nyu.edu` HTML → parse course fields (code, title, credits, prerequisites, description) → one chunk per course → embed → store in Postgres/pgvector.
- **Online query**: user question → embed (local `sentence-transformers/all-MiniLM-L6-v2`) → pgvector cosine similarity top-k → Claude generates a cited answer from the retrieved courses.

Evaluation is a first-class workflow (`eval/evaluate.py`), run against 20 hand-written course-planning questions, with results recorded in the README and `eval/eval_results.json`.

## Capabilities and Constraints

- Retrieval and generation are separately measurable and currently measured: 20/20 (100%) retrieval hit-rate@5 (up from 95%, see below); answer groundedness genuinely fluctuates 95-100% run to run (LLM-judge wording variance) rather than sitting at a fixed number.
- Frontend is a React + Vite + Tailwind chat app (`frontend/`), backed by a FastAPI server (`app/server.py`); Streamlit was the original v1 and has been fully replaced.
- Backend (Python, Postgres/pgvector, local embeddings, Claude API for generation) is the stable architecture.
- Retrieval is hybrid, not pure semantic (`retrieval/search.py`): when a query names a course by code or title, courses that list it as a prerequisite are surfaced first (structural filter on `prerequisites`), and embedding similarity ranks and fills out the rest. This closed the one previously-documented "what's next after X" retrieval gap, where several courses sharing a prerequisite meant no single one was uniquely favored by embeddings alone.

## Brand Commitments

Visual identity is independent — the product does not use NYU's official colors, torch mark, or other institutional branding, to avoid implying endorsement.

Standing visual preference (confirmed during `/impeccable shape`, chosen deliberately over rolled/pick alternatives): the modern AI-chat interface convention, played straight and at full craft — sidebar chat history, conversational main column, calm typography — judged against **Claude** and **ChatGPT** as the craft bar. This is the committed direction for the chat surface, not a placeholder; future visual work on this surface should raise craft within this convention rather than replace it with a different visual world.

## Evidence on Hand

- Scraped, parsed CSCI-UA course data at `ingest/data/csci_ua.json` (37 courses).
- Real evaluation results in `eval/eval_results.json` and summarized in README — these are genuine numbers from a real run, not placeholders, and should not be altered or fabricated in future work.
- README documents architecture, setup, and eval-driven history: folding `prerequisites` into embedded text took hit-rate@5 from 90% to 95%, and adding hybrid structural retrieval took it from 95% to 100%. This is real project history worth surfacing, not marketing copy.

## Product Principles

1. Groundedness over fluency — every answer must be traceable to a cited course code; never let the surface imply confidence the retrieval/generation pipeline hasn't earned.
2. Show the work — retrieved courses, citations, and (where relevant) the project's own measured accuracy are part of what makes this credible to both audiences; don't hide them behind unnecessary polish.
3. Honest about limits — report real numbers and real variance (e.g. groundedness fluctuating 95-100%) rather than a single flattering figure; a documented, later-fixed limitation is part of this project's credibility, not something to scrub from history.
4. Backend is stable — Python, Postgres/pgvector, local embeddings, and Claude API generation are the durable architecture; the frontend (now React + Vite + Tailwind, replacing the original Streamlit v1) stays open to further evolution.
5. Scope will grow — CSCI-UA (37 courses) is the current department, not the ceiling; avoid hardcoding assumptions that only hold for a single department.

## Accessibility & Inclusion

No product-specific accessibility requirement has been established beyond standard web accessibility practice.
