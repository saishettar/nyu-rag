"""Embed a query and return the top-k most similar courses via pgvector.

Hybrid retrieval: when a query explicitly names a course (by code, e.g.
"CSCI-UA 102", or by title, e.g. "Data Structures"), that course is surfaced
first, followed by courses that list it in their own prerequisites. Pure
semantic search can't reliably answer "what's a good course after X" -
several courses often share the same prerequisite, so no single one is
uniquely favored by embedding similarity alone; and naming a course by its
exact title (e.g. "which course covers linear algebra") can otherwise bury
the course itself under its own dependents. Everything else still falls back
to plain semantic search.
"""
import os
import re
import sys
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).parent.parent))
from embed.embed_and_store import embed_texts  # noqa: E402

load_dotenv()

_COLUMNS = [
    "course_code", "title", "department", "credits",
    "prerequisites", "source_url", "chunk_text", "distance",
]

# Matches course codes like "CSCI-UA 102", "MATH-UA 121", "CS-UH 1050".
_CODE_RE = re.compile(r"\b[A-Z]{2,6}-[A-Z]{2,4}\s?\d{1,4}[A-Z]?\b")

_MIN_TITLE_MATCH_LEN = 8  # skip short/generic titles to avoid false positives

# Program/major names get their own (lower) floor: they're proper nouns with
# much lower false-positive risk than a generic course title fragment like
# "Intro", so "Physics" (7 chars) shouldn't be held to the same bar that
# excludes "Intro" -- found via eval: it silently never matched at 8.
_MIN_PROGRAM_MATCH_LEN = 5

_PROGRAM_COLUMNS = ["program_name", "department", "total_credits", "source_url", "chunk_text"]

# Strips a trailing degree qualifier ("(B.A.)", "(B.S.)") so a query naming
# the bare major ("computer science major") still matches the stored
# "Computer Science (B.A.)" program name.
_DEGREE_SUFFIX_RE = re.compile(r"\s*\([^)]*\)\s*$")


def _rows_to_dicts(rows) -> list[dict]:
    return [dict(zip(_COLUMNS, row), kind="course") for row in rows]


def _normalize_for_title_match(text: str) -> str:
    """Lowercase and fold '&' to 'and' so a title like 'Pidgin & Creole
    Languages' still matches a query that spells it out ('pidgin and creole
    languages') - found while adding Linguistics: that paraphrase fell
    through to pure semantic search, which underperforms on rare vocabulary
    crowded by 40+ other course titles in the same department."""
    return re.sub(r"\s+", " ", text.lower().replace("&", " and ")).strip()


def _match_referenced_codes(query: str, all_courses: list[tuple[str, str]]) -> set[str]:
    """Pure matching logic, separated from the DB fetch so it's unit-testable
    without a live Postgres connection: which course codes does `query`
    explicitly name, by literal code or by title?"""
    known_codes = {code for code, _ in all_courses}
    referenced = {
        code
        for code in (m.strip() for m in _CODE_RE.findall(query.upper()))
        if code in known_codes
    }

    query_normalized = _normalize_for_title_match(query)
    for code, title in all_courses:
        if len(title) >= _MIN_TITLE_MATCH_LEN and _normalize_for_title_match(title) in query_normalized:
            referenced.add(code)

    return referenced


def _referenced_course_codes(query: str, conn) -> set[str]:
    """Course codes the query explicitly names, by literal code or by title."""
    with conn.cursor() as cur:
        cur.execute("SELECT course_code, title FROM courses")
        all_courses = cur.fetchall()
    return _match_referenced_codes(query, all_courses)


def _match_referenced_programs(query: str, all_programs: list[tuple[int, str]]) -> set[int]:
    """Same exact-name matching strategy as _match_referenced_codes, applied
    to program names -- this project's own retrieval history (see the "&" vs
    "and" fix above, and the README's retrieval-bug list) shows that relying
    on embedding similarity alone to surface a specifically-named entity is
    exactly what breaks, so a "what does the CS major require" question
    should reliably pull in the Computer Science program chunk the same way
    naming a course reliably pulls in that course. v1 heuristic: this only
    matches the program's own display name (degree suffix stripped) against
    the query, so common aliases like "CS major" won't hit "Computer
    Science" yet -- expected to need the same kind of eval-driven alias
    refinement course name-matching went through."""
    query_normalized = _normalize_for_title_match(query)
    referenced = set()
    for program_id, name in all_programs:
        bare_name = _DEGREE_SUFFIX_RE.sub("", name).strip()
        normalized = _normalize_for_title_match(bare_name)
        if len(normalized) >= _MIN_PROGRAM_MATCH_LEN and normalized in query_normalized:
            referenced.add(program_id)
    return referenced


def _referenced_program_ids(query: str, conn) -> set[int]:
    """Program ids the query explicitly names by (bare) program name."""
    with conn.cursor() as cur:
        cur.execute("SELECT id, program_name FROM programs")
        all_programs = cur.fetchall()
    return _match_referenced_programs(query, all_programs)


def _programs_by_id(ids: set[int], conn) -> list[dict]:
    """The full requirement-worksheet chunk for each named program, tagged
    "kind": "program" so build_context (generation/answer.py) and the
    frontend's citation list can tell them apart from course results."""
    if not ids:
        return []
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT p.program_name, p.department, p.total_credits, p.source_url, pc.chunk_text
            FROM program_chunks pc
            JOIN programs p ON p.id = pc.program_id
            WHERE p.id = ANY(%s)
            ORDER BY p.program_name
            """,
            (list(ids),),
        )
        return [dict(zip(_PROGRAM_COLUMNS, row), kind="program") for row in cur.fetchall()]


def _courses_by_code(codes: set[str], conn) -> list[dict]:
    """The referenced courses themselves, so naming a course (e.g. "which
    course covers linear algebra") always surfaces that course - not just
    what depends on it."""
    if not codes:
        return []
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT
                c.course_code, c.title, c.department, c.credits,
                c.prerequisites, c.source_url, ch.chunk_text,
                NULL::float AS distance
            FROM chunks ch
            JOIN courses c ON c.id = ch.course_id
            WHERE c.course_code = ANY(%s)
            ORDER BY c.course_code
            """,
            (list(codes),),
        )
        return _rows_to_dicts(cur.fetchall())


def _dependents_of(codes: set[str], query_embedding, conn, top_k: int) -> list[dict]:
    """Courses whose prerequisites mention any of `codes`, ranked by
    relevance to the query rather than alphabetically by course code -- an
    alphabetical LIMIT let an unrelated course from an early-sorting
    department (e.g. ECON-UA) crowd out the actual best match (MATH-UA 122
    for "what's next after Calculus I") once enough departments existed for
    that to collide. See eval/test_questions.json."""
    if not codes:
        return []
    patterns = [f"%{code}%" for code in codes]
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT
                c.course_code, c.title, c.department, c.credits,
                c.prerequisites, c.source_url, ch.chunk_text,
                ch.embedding <=> %s::vector AS distance
            FROM chunks ch
            JOIN courses c ON c.id = ch.course_id
            WHERE c.prerequisites ILIKE ANY(%s)
              AND c.course_code != ALL(%s)
            ORDER BY distance ASC
            LIMIT %s
            """,
            (query_embedding, patterns, list(codes), top_k),
        )
        return _rows_to_dicts(cur.fetchall())


def _semantic_search(query_embedding, conn, top_k: int) -> list[dict]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT
                c.course_code, c.title, c.department, c.credits,
                c.prerequisites, c.source_url, ch.chunk_text,
                ch.embedding <=> %s::vector AS distance
            FROM chunks ch
            JOIN courses c ON c.id = ch.course_id
            ORDER BY distance ASC
            LIMIT %s
            """,
            (query_embedding, top_k),
        )
        return _rows_to_dicts(cur.fetchall())


def _combine(
    self_matches: list[dict],
    structural: list[dict],
    semantic: list[dict],
    top_k: int,
) -> list[dict]:
    """Merge the three candidate lists (self-matches first, then structural,
    then semantic), dedupe by course_code keeping the first occurrence, and
    truncate to top_k. This truncation is where both retrieval bugs in the
    README's history actually lived -- it does not re-rank, so any list fed
    in must already be ordered best-first, and a list earlier in the
    precedence order can starve a later one of its budget. Covered by
    retrieval/test_search.py; add a case there before changing this."""
    combined = list(self_matches)
    seen = {c["course_code"] for c in combined}
    for c in structural + semantic:
        if c["course_code"] not in seen:
            combined.append(c)
            seen.add(c["course_code"])
    return combined[:top_k]


def search(query: str, top_k: int = 5) -> list[dict]:
    query_embedding = embed_texts([query])[0]
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        referenced = _referenced_course_codes(query, conn)
        self_matches = _courses_by_code(referenced, conn)
        structural = _dependents_of(referenced, query_embedding, conn, top_k)
        semantic = _semantic_search(query_embedding, conn, top_k)
        program_ids = _referenced_program_ids(query, conn)
        programs = _programs_by_id(program_ids, conn)
    finally:
        conn.close()

    # Programs are additive, not counted against top_k: a named major's
    # requirement text should ride alongside the usual course results (e.g.
    # "what courses satisfy the CS major's algorithms requirement" needs
    # both), not compete with them for one of the 5 slots.
    return programs + _combine(self_matches, structural, semantic, top_k)


if __name__ == "__main__":
    import json

    query = sys.argv[1] if len(sys.argv) > 1 else "distributed systems"
    results = search(query)
    print(json.dumps(results, indent=2, default=str))
