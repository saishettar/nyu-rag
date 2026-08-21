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

- **Backend:** Python
- **Database:** Postgres + pgvector (Supabase)
- **Embeddings:** local `sentence-transformers/all-MiniLM-L6-v2` (no API key needed)
- **Generation:** Claude API
- **Frontend:** Streamlit

## Setup

```bash
python -m venv .venv
.venv/Scripts/activate  # or source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env  # fill in DATABASE_URL and ANTHROPIC_API_KEY
```

## Running the pipeline

```bash
python ingest/scrape_catalog.py       # scrape + parse -> ingest/data/csci_ua.json
python db/init_db.py                  # create tables + pgvector extension
python embed/embed_and_store.py       # embed courses, store in Postgres
streamlit run app/main.py             # chat UI
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

Results, once run: _TBD — fill in after first eval run._

## Repository structure

```
ingest/       scrape_catalog.py, parse_course.py
embed/        embed_and_store.py
db/           schema.sql, init_db.py
retrieval/    search.py
generation/   answer.py
app/          main.py (Streamlit)
eval/         test_questions.json, evaluate.py
```
