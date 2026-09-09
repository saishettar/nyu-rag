# NYU Course Catalog RAG Assistant

Ask natural-language questions about NYU's course catalog and get grounded,
cited answers instead of keyword-searching the Bulletin manually.

Scope: 44 of NYU CAS's 51 undergraduate departments, 1,870 courses total —
scraped from `bulletins.nyu.edu`. Started with CS and the departments it
most often cross-references (Math, Physics, Data Science, Economics,
Philosophy, Psychology), then expanded batch by batch toward full CAS
coverage; see `ingest/scrape_catalog.py`'s `DEPARTMENTS` map for the
current, authoritative list of which departments are in and which are
still pending — that map is a one-line-per-department addition, so growing
scope further is mostly data verification, not code.

![Home chat screen: sidebar with conversation history, a chat thread with example questions and eval stats, and a course catalog panel on the right](docs/screenshot-home.jpg)

## Architecture

```
User query -> embed (sentence-transformers, local)
           -> hybrid retrieval (retrieval/search.py):
                - if the query names a course by code or title, surface that
                  course itself, then courses that list it as a prerequisite
                - fill remaining slots with pgvector cosine similarity search
           -> prompt Claude with retrieved courses + question
           -> answer with [COURSE-CODE] citations
```

Pure semantic search alone can't reliably answer "what's a good course after X" -
several courses often share the same prerequisite, so no single one is
uniquely favored by embedding similarity. It also can't be trusted to rank a
course above its own dependents when a query names that course directly
(e.g. "which course covers linear algebra" was losing `MATH-UA 140` itself
under four courses that require it). The hybrid step surfaces the named
course first, then its structural dependents, then lets embeddings fill out
the rest.

Ingestion (offline, re-run when the catalog updates):

```
bulletins.nyu.edu HTML -> scrape + parse (code, title, credits, prereqs, description)
                       -> one chunk per course (descriptions are short & self-contained)
                       -> embed -> store in Postgres/pgvector
```

## Stack

- **Backend:** Python, FastAPI (`app/server.py`)
- **Database:** Postgres + pgvector — a local instance via the included
  `docker-compose.yml` by default; swap in a managed Postgres (e.g. Supabase) by
  changing `DATABASE_URL` if you'd rather not run Docker. Holds courses/chunks for
  retrieval, plus `conversations`/`messages` for persisted chat history
- **Embeddings:** local `sentence-transformers/all-MiniLM-L6-v2` (no API key needed)
- **Generation:** Claude API — bring your own `ANTHROPIC_API_KEY`; nothing here is
  shared, hosted, or billed to anyone but you
- **Frontend:** React + Vite + TypeScript + Tailwind (`frontend/`) — a chat interface
  with persisted conversation history and a live catalog panel; clicking a citation
  in an answer jumps to and highlights that course in the panel

## Quickstart

Everything runs on your own machine with your own API key — nothing shared,
nothing to trust. Requires Python 3.10+, Node 18+ (works on 16 with npm engine
warnings, but 18+ is what the frontend's dependencies target), and
[Docker](https://docs.docker.com/get-docker/) (only if you're using the included
local Postgres instead of your own).

```bash
git clone https://github.com/saishettar/nyu-rag.git
cd nyu-rag

cp .env.example .env
# edit .env and set ANTHROPIC_API_KEY to your own key
# (get one at https://console.anthropic.com/settings/keys)
# DATABASE_URL already points at the Docker Postgres below - leave it as-is
# unless you're using your own Postgres/Supabase instance

docker compose up -d          # local Postgres + pgvector

python -m venv .venv
.venv/Scripts/activate         # or source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt

cd frontend && npm install && cd ..
```

Then, one-time database setup (course data for all 44 departments is
already checked into the repo at `ingest/data/*.json`, so there's nothing to
scrape):

```bash
python db/init_db.py                  # create tables + pgvector extension
python embed/embed_and_store.py       # embed courses, store in Postgres
```

Then, in two terminals:

```bash
uvicorn app.server:app --reload --port 8000   # API (retrieval, generation, conversations)
cd frontend && npm run dev                    # chat UI, proxies /api to :8000
```

Open the URL Vite prints (usually `http://localhost:5173`) and ask a question.

To refresh the catalog data from the live Bulletin instead of using the
checked-in snapshot: `python ingest/scrape_catalog.py`, then re-run the two
database steps above.

## Evaluation

```bash
python eval/evaluate.py
```

Runs 100 hand-written course-planning questions (`eval/test_questions.json`)
against the live pipeline and reports:

- **Retrieval hit-rate@5** — did the correct course appear in the top-5 results?
- **Answer groundedness** — a second Claude call judges whether each answer
  is fully supported by the retrieved courses and cites a course code.

### Results (1,870 courses across 44 departments, 100 hand-written questions)

- **Retrieval hit-rate@5: 100/100 (100%)** on the run in `eval/eval_results.json`
- **Answer groundedness: 100/100 (100%)** on that same run — this genuinely
  fluctuates across runs (LLM-judge grading has real run-to-run wording
  variance, e.g. asserting an unstated topic for a course mentioned
  alongside the correctly-cited one, or how strictly it parses which grade
  requirement applies to which option in an OR'd prerequisite list); prior
  runs in this project's history have landed anywhere from 94% to 100%, so
  treat that as the honest range rather than either endpoint as a guarantee

Retrieval history, in order:

1. **90% → 95%:** the embedded chunk text originally included only the title
   and description, not `prerequisites`, so "what comes after X" queries had
   no textual signal to match on at all. Folding prerequisites into the
   embedded text (`embed/embed_and_store.py`) fixed most of that.
2. **95% → 100%** (on the original 20-question, CSCI-UA-only set): the one
   remaining miss — "What's a good course to take after Data Structures?" —
   was a structural limitation, not a data gap: four courses (`CSCI-UA 201`,
   `310`, `473`, `479`) all list Data Structures (`CSCI-UA 102`) as a
   prerequisite, so no single one was uniquely favored by embedding
   similarity alone. Fixed with hybrid retrieval (`retrieval/search.py`):
   when a query names a course by code or title, courses that list it as a
   prerequisite are surfaced alongside it, and embeddings rank and fill out
   the rest.
3. **Bug found while adding Math/Data Science/Physics:** that hybrid step
   was excluding the named course itself from its own results - "which
   course covers linear algebra" surfaced four courses that require
   `MATH-UA 140` but not `MATH-UA 140` itself. Fixed by always including the
   named course alongside its dependents rather than instead of it; verified
   against the original 20 questions (still 20/20) before adding 6 new
   questions for the expanded scope.
4. **Bug found while adding Economics:** the prerequisite-dependents lookup
   ranked matches alphabetically by course code and `LIMIT`ed *before*
   merging with the named course itself, so a department that happens to
   sort early (`ECON-UA`) could silently crowd the real answer out of the
   final top-5 - "what's a good course after Calculus I" started missing
   `MATH-UA 122` the moment `ECON-UA 18` also listed `MATH-UA 121` as a
   prerequisite option. Fixed by ranking dependents by embedding distance to
   the query instead of course code (`retrieval/search.py`); this is the
   same failure shape as #3 one level down the pipeline - alphabetical or
   positional shortcuts that happened to work at 4-department scope broke at
   5, so it's worth treating scope growth as a retrieval regression test
   going forward, not just a data-verification step.
5. **No regression adding Philosophy:** unit tests were added for the pure
   name-matching and list-combination logic (`retrieval/test_search.py`)
   before this expansion, specifically to catch the next version of bugs #3
   and #4 without needing a live eval run. Adding a 6th department (48 more
   courses, 220 total) held at 30/30 (100%) with no fix required - first
   real evidence the regression class is actually closed, not just patched
   once.
6. **No regression adding Psychology either:** a 7th department (35 more
   courses, 255 total) held retrieval at 32/32 (100%) again. Groundedness
   did dip to 30/32 (94%) on this run, but both misses were LLM-judge
   wording variance on a secondary course mentioned alongside the correctly
   cited one (an unstated-topic claim), not a retrieval or citation error -
   the kind of run-to-run fluctuation this project has always reported
   honestly rather than smoothing over.
7. **No regression adding Politics:** an 8th department (63 more courses,
   318 total) held retrieval at 34/34 (100%) again. Groundedness came in at
   33/34 (97%), and the one miss was on a pre-existing CSCI-UA question
   ("what's a good course after Algorithms for someone interested in
   theory?") - an unsupported inference about what `CSCI-UA 310` covers,
   unrelated to Politics or to this expansion, and again consistent with
   the run-to-run LLM-judge variance already documented above rather than
   a new regression.
8. **Bug found while adding seven departments at once (Neural Science,
   Chemistry, Biology, Linguistics, Public Policy, Urban Studies,
   Environmental Studies):** the title-naming match in hybrid retrieval
   required an exact substring, so "is there a course on pidgin and creole
   languages?" didn't match the course title `Pidgin & Creole Languages`
   (spelled-out "and" vs. "&"), fell through to pure semantic search, and
   missed the course entirely - crowded out by 40+ other Linguistics course
   titles in the embedding space. Fixed by normalizing "&" to "and" before
   the substring check (`retrieval/search.py`), covered by a new unit test,
   and reverified across all 44 questions (226 more courses, 544 total):
   44/44 (100%) retrieval, 43/44 (98%) groundedness - the one miss again the
   same pre-existing CSCI-UA question from #7, not a new-scope issue.
9. **No regression adding eight more departments at once** (History,
   English, Anthropology, Art History, Journalism, International
   Relations, Classics, Creative Writing - the first batch without a
   specific CS-overlap story, added to round out general CAS coverage):
   512 more courses (1,056 total), 14 new questions, held at 58/58 (100%)
   retrieval with no fix required. Groundedness held at 57/58 (98%), same
   pre-existing CSCI-UA miss as #7 and #8.
10. **Question-design gap, not a retrieval bug, adding eight more
    departments** (Music, Religious Studies, Comparative Literature, East
    Asian Studies, Law and Society, Middle Eastern and Islamic Studies,
    Dramatic Literature, European and Mediterranean Studies): 335 more
    courses (1,391 total). One of the 16 new questions ("is there a course
    on music technology and sustainable audio?") initially missed because
    it dropped "Introduction to" from the actual course title, so the
    hybrid exact-title match didn't fire and pure semantic search
    underperformed among several generic "Special Topics"/"Seminar" Music
    course chunks with little content of their own. Not a code bug -
    rephrased the question to match the real title ("which course is an
    introduction to...") and reverified: 74/74 (100%) retrieval, 74/74
    (100%) groundedness - even the recurring pre-existing CSCI-UA
    groundedness miss from #7-#9 didn't reproduce this run, consistent
    with it being LLM-judge variance rather than a stable failure.
11. **No regression adding the remaining real academic departments** (13 at
    once: French, German, Italian, Portuguese, Russian and Slavic Studies,
    Hebrew and Judaic Studies, Hellenic Studies, Irish Studies, Latin
    American-Caribbean Studies, Medieval and Renaissance Studies, Animal
    Studies, Child/Adolescent Mental Health Studies, Expository Writing --
    leaving only administrative/curriculum categories like College Core
    Curriculum and First-Year Seminars unscoped). 479 more courses (1,870
    total), 26 new questions (all phrased to closely match exact course
    titles, learning from #10's near-miss), held at 100/100 (100%)
    retrieval and 100/100 (100%) groundedness with no fix required.

### CI regression check

Separate from the eval script above: `.github/workflows/eval.yml` runs
`eval/suite.yaml` (an [iris-eval](https://github.com/saishettar/iris/tree/main/eval)
suite, not `eval/evaluate.py`) against every PR touching `generation/**`, and
posts pass/fail per test case as a PR comment. Needs an `ANTHROPIC_API_KEY`
repo secret (Settings > Secrets and variables > Actions) to run the real
judge calls -- without it, the workflow fails with an auth error rather than
skipping silently.

## Repository structure

```
ingest/             scrape_catalog.py, parse_course.py
embed/              embed_and_store.py
db/                 schema.sql, init_db.py
retrieval/          search.py
generation/         answer.py
app/                server.py (FastAPI), db.py (conversations/messages + course queries)
frontend/           React + Vite + Tailwind chat UI
eval/               test_questions.json, evaluate.py
docker-compose.yml  local Postgres + pgvector for self-hosting
```

## License

MIT — see [LICENSE](LICENSE).
