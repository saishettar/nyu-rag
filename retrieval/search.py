"""Embed a query and return the top-k most similar courses via pgvector."""
import os
import sys
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).parent.parent))
from embed.embed_and_store import embed_texts  # noqa: E402

load_dotenv()


def search(query: str, top_k: int = 5) -> list[dict]:
    query_embedding = embed_texts([query])[0]

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
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
            rows = cur.fetchall()
    finally:
        conn.close()

    columns = [
        "course_code", "title", "department", "credits",
        "prerequisites", "source_url", "chunk_text", "distance",
    ]
    return [dict(zip(columns, row)) for row in rows]


if __name__ == "__main__":
    import json

    query = sys.argv[1] if len(sys.argv) > 1 else "distributed systems"
    results = search(query)
    print(json.dumps(results, indent=2, default=str))
