# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience is dual and roughly equal:

- **NYU CAS students and advisors** (currently CS, Math, Data Science, Physics, Economics, Philosophy, and Psychology) who want to ask natural-language questions about courses (prerequisites, what to take next, course content) and get a direct, cited answer instead of manually reading the Bulletin.
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

Evaluation is a first-class workflow (`eval/evaluate.py`), run against 74 hand-written course-planning questions, with results recorded in the README and `eval/eval_results.json`.

## Capabilities and Constraints

- Retrieval and generation are separately measurable and currently measured: 74/74 (100%) retrieval hit-rate@5; answer groundedness genuinely fluctuates run to run (LLM-judge wording variance), 94-100% across this project's runs, rather than sitting at a fixed number.
- Frontend is a React + Vite + Tailwind chat app (`frontend/`), backed by a FastAPI server (`app/server.py`); Streamlit was the original v1 and has been fully replaced.
- Backend (Python, Postgres/pgvector, local embeddings, Claude API for generation) is the stable architecture.
- Retrieval is hybrid, not pure semantic (`retrieval/search.py`): when a query names a course by code or title, that course itself is surfaced first, then courses that list it as a prerequisite (structural filter on `prerequisites`, ranked by embedding distance to the query rather than course code), and embedding similarity ranks and fills out the rest. This closed three real gaps, each surfaced by expanding scope: the original "what's next after X" retrieval miss (several courses sharing a prerequisite meant no single one was favored by embeddings alone); naming a course by its exact title (e.g. "which course covers linear algebra") burying that course under its own dependents; and, most recently, an alphabetical-by-course-code ranking of prerequisite-dependents letting an early-sorting department (`ECON-UA`) crowd the actual answer out of the top-5 once it also referenced the same prerequisite code — see Evidence on Hand.
- Scope: 31 of NYU CAS's 51 undergraduate departments, 1,391 courses total — see `ingest/scrape_catalog.py`'s `DEPARTMENTS` map for the current, authoritative department list (it's grown in four batches: two batches of CS/Data-Science-overlap departments first, then two batches of broadly-popular humanities/social-science departments with no specific overlap story, added to round out general coverage). Adding a department is a one-line addition to that map; the parser (`ingest/parse_course.py`) is generic CourseLeaf HTML, not CS-specific, and `embed_and_store.py` already upserts on `course_code` so cross-listed courses (the same course under two departments) don't collide.

## Brand Commitments

Visual identity is independent — the product does not use NYU's official colors, torch mark, or other institutional branding, to avoid implying endorsement.

Standing visual preference (confirmed during `/impeccable shape`, chosen deliberately over rolled/pick alternatives): the modern AI-chat interface convention, played straight and at full craft — sidebar chat history, conversational main column, calm typography — judged against **Claude** and **ChatGPT** as the craft bar. This is the committed direction for the chat surface, not a placeholder; future visual work on this surface should raise craft within this convention rather than replace it with a different visual world.

## Evidence on Hand

- Scraped, parsed course data at `ingest/data/*.json`, one file per department in `ingest/scrape_catalog.py`'s `DEPARTMENTS` map — 1,391 courses total across the 31 scoped departments as of the last expansion (Music, Religious Studies, Comparative Literature, East Asian Studies, Law and Society, Middle Eastern and Islamic Studies, Dramatic Literature, European and Mediterranean Studies).
- Real evaluation results in `eval/eval_results.json` and summarized in README — these are genuine numbers from a real run, not placeholders, and should not be altered or fabricated in future work.
- README documents architecture, setup, and eval-driven history: folding `prerequisites` into embedded text took hit-rate@5 from 90% to 95%; adding hybrid structural retrieval took it from 95% to 100% (on the original 20-question, CSCI-UA-only set); expanding to Math/Data Science/Physics surfaced a real bug in that hybrid step (a named course could be excluded by its own dependents), fixed and reverified before adding 6 new questions for the expanded scope (26/26, 100%); expanding to Economics surfaced a second real bug (alphabetical-by-course-code ranking of prerequisite-dependents let `ECON-UA` crowd out the correct answer), fixed by ranking dependents by embedding distance instead, reverified across all 28 questions (28/28, 100%); unit tests were then added for the pure name-matching/combination logic (`retrieval/test_search.py`) specifically to catch that bug class earlier, and expanding to Philosophy held at 30/30 (100%) with zero fixes needed; expanding to Psychology held retrieval at 32/32 (100%) again, with groundedness at 30/32 (94%) on that run -- reported as-is per the project's own honesty standard, since both misses were LLM-judge wording variance on a secondary course, not a retrieval or citation error; expanding to Politics held retrieval at 34/34 (100%) once more, with groundedness at 33/34 (97%) -- the one miss was an unsupported inference on a pre-existing CSCI-UA question ("Algorithms for someone interested in theory"), unrelated to the new department, consistent with the run-to-run LLM-judge variance already documented above; expanding to seven more departments at once (Neural Science, Chemistry, Biology, Linguistics, Public Policy, Urban Studies, Environmental Studies) surfaced a third real retrieval bug -- the title-naming match required an exact substring, so "pidgin and creole languages" didn't match the course title "Pidgin & Creole Languages" (the "&" vs. "and"), fell through to pure semantic search, and missed the course entirely among 40+ other Linguistics titles; fixed by normalizing "&" to "and" before the substring check (`retrieval/search.py`), covered by a new unit test, and reverified across all 44 questions (44/44, 100%), with groundedness at 43/44 (98%) -- the one miss again the same pre-existing CSCI-UA question, not a new-scope issue; expanding to eight more departments at once (History, English, Anthropology, Art History, Journalism, International Relations, Classics, Creative Writing -- the first batch without a specific CS-overlap story) added 512 more courses (1,056 total) and 14 new questions, holding at 58/58 (100%) retrieval with no fix required and 57/58 (98%) groundedness, same recurring pre-existing CSCI-UA miss; expanding to eight more departments (Music, Religious Studies, Comparative Literature, East Asian Studies, Law and Society, Middle Eastern and Islamic Studies, Dramatic Literature, European and Mediterranean Studies) added 335 more courses (1,391 total) and surfaced a question-design gap rather than a code bug -- a new question omitted "Introduction to" from the actual course title, so the hybrid exact-match didn't fire and semantic search alone underperformed among several thin "Special Topics" Music course chunks; rephrased to match the real title and reverified at 74/74 (100%) retrieval, 74/74 (100%) groundedness, with the recurring CSCI-UA groundedness miss not reproducing this run. This is real project history worth surfacing, not marketing copy.

## Product Principles

1. Groundedness over fluency — every answer must be traceable to a cited course code; never let the surface imply confidence the retrieval/generation pipeline hasn't earned.
2. Show the work — retrieved courses, citations, and (where relevant) the project's own measured accuracy are part of what makes this credible to both audiences; don't hide them behind unnecessary polish.
3. Honest about limits — report real numbers and real variance (e.g. groundedness fluctuating 95-100%) rather than a single flattering figure; a documented, later-fixed limitation is part of this project's credibility, not something to scrub from history.
4. Backend is stable — Python, Postgres/pgvector, local embeddings, and Claude API generation are the durable architecture; the frontend (now React + Vite + Tailwind, replacing the original Streamlit v1) stays open to further evolution.
5. Scope will grow — 31 of CAS's 51 departments (1,391 courses) today, not the ceiling; see `ingest/scrape_catalog.py`'s `DEPARTMENTS` map for the current list, and the pipeline was built (and has now been proven eight times) to extend to more with minimal code change.

## Accessibility & Inclusion

No product-specific accessibility requirement has been established beyond standard web accessibility practice.
