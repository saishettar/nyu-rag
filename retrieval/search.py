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


def _rows_to_dicts(rows) -> list[dict]:
    return [dict(zip(_COLUMNS, row)) for row in rows]


def _referenced_course_codes(query: str, conn) -> set[str]:
    """Course codes the query explicitly names, by literal code or by title."""
    with conn.cursor() as cur:
        cur.execute("SELECT course_code, title FROM courses")
        all_courses = cur.fetchall()

    known_codes = {code for code, _ in all_courses}
    referenced = {
        code
        for code in (m.strip() for m in _CODE_RE.findall(query.upper()))
        if code in known_codes
    }

    query_lower = query.lower()
    for code, title in all_courses:
        if len(title) >= _MIN_TITLE_MATCH_LEN and title.lower() in query_lower:
            referenced.add(code)

    return referenced


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


def search(query: str, top_k: int = 5) -> list[dict]:
    query_embedding = embed_texts([query])[0]
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        referenced = _referenced_course_codes(query, conn)
        self_matches = _courses_by_code(referenced, conn)
        structural = _dependents_of(referenced, query_embedding, conn, top_k)
        semantic = _semantic_search(query_embedding, conn, top_k)
    finally:
        conn.close()

    combined = list(self_matches)
    seen = {c["course_code"] for c in combined}
    for c in structural + semantic:
        if c["course_code"] not in seen:
            combined.append(c)
            seen.add(c["course_code"])
    return combined[:top_k]


if __name__ == "__main__":
    import json

    query = sys.argv[1] if len(sys.argv) > 1 else "distributed systems"
    results = search(query)
    print(json.dumps(results, indent=2, default=str))
