# NYU Course Catalog RAG Assistant

Ask natural-language questions about NYU's course catalog and get grounded,
cited answers instead of keyword-searching the Bulletin manually.

Scope: CAS Computer Science (`CSCI-UA`), scraped from `bulletins.nyu.edu`.

## Architecture

```
User query -> embed (sentence-transformers, local)
           -> pgvector cosine similarity search (top-k courses)
           -> prompt Claude with retrieved courses + question
           -> answer with [COURSE-CODE] citations
```

Ingestion (offline, re-run when the catalog updates):

```
bulletins.nyu.edu HTML -> scrape + parse (code, title, credits, prereqs, description)
                       -> one chunk per course (descriptions are short & self-contained)
                       -> embed -> store in Postgres/pgvector
```

## Stack

- **Backend:** Python, FastAPI (`app/server.py`)
- **Database:** Postgres + pgvector (Supabase) — courses/chunks for retrieval, plus
  `conversations`/`messages` for persisted chat history
- **Embeddings:** local `sentence-transformers/all-MiniLM-L6-v2` (no API key needed)
- **Generation:** Claude API
- **Frontend:** React + Vite + TypeScript + Tailwind (`frontend/`) — a chat interface
  with persisted conversation history and a live catalog panel; clicking a citation
  in an answer jumps to and highlights that course in the panel

## Setup

```bash
python -m venv .venv
.venv/Scripts/activate  # or source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env  # fill in DATABASE_URL and ANTHROPIC_API_KEY

cd frontend
npm install
```

## Running the pipeline

```bash
python ingest/scrape_catalog.py       # scrape + parse -> ingest/data/csci_ua.json
python db/init_db.py                  # create tables + pgvector extension (courses, chunks, conversations, messages)
python embed/embed_and_store.py       # embed courses, store in Postgres
```

Then, in two terminals:

```bash
uvicorn app.server:app --reload --port 8000   # API (retrieval, generation, conversations)
cd frontend && npm run dev                    # chat UI, proxies /api to :8000
```

## Evaluation

```bash
python eval/evaluate.py
```

Runs 20 hand-written course-planning questions (`eval/test_questions.json`)
against the live pipeline and reports:

- **Retrieval hit-rate@5** — did the correct course appear in the top-5 results?
- **Answer groundedness** — a second Claude call judges whether each answer
  is fully supported by the retrieved courses and cites a course code.

### Results (37 CSCI-UA courses, 20 hand-written questions)

- **Retrieval hit-rate@5: 19/20 (95%)**
- **Answer groundedness: 20/20 (100%)** on the run in `eval/eval_results.json`
  (LLM-judge grading has some run-to-run wording variance, so treat this as
  "no groundedness failures observed" rather than a hard guarantee)

The one retrieval miss — "What's a good course to take after Data
Structures?" — is an honest limitation, not a bug: several courses list
Data Structures (`CSCI-UA 102`) as a prerequisite, so no single course is
uniquely favored by semantic similarity alone. Answering "what's next"
questions well would need a hybrid approach: use the `prerequisites`
metadata to structurally filter candidate courses, then rank with
embeddings, rather than relying on embeddings alone.

A second finding from early eval runs (since fixed): the embedded chunk
text originally included only the title and description, not
`prerequisites`, so "what comes after X" queries had no textual signal to
match on at all. Folding prerequisites into the embedded text
(`embed/embed_and_store.py`) improved hit-rate@5 from 90% to 95%.

## Repository structure

```
ingest/       scrape_catalog.py, parse_course.py
embed/        embed_and_store.py
db/           schema.sql, init_db.py
retrieval/    search.py
generation/   answer.py
app/          server.py (FastAPI), db.py (conversations/messages + course queries)
frontend/     React + Vite + Tailwind chat UI
eval/         test_questions.json, evaluate.py
```
