"""Embed program requirement summaries and store them in Postgres/pgvector.

Mirrors embed_and_store.py's shape (one chunk per program, upsert on the
natural key) but writes to the parallel programs/program_chunks tables
instead of courses/chunks -- see db/schema.sql.
"""
import glob
import json
import os
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

from embed_and_store import embed_texts

load_dotenv()

DATA_DIR = Path(__file__).parent.parent / "ingest" / "data_programs"


def load_programs() -> list[dict]:
    programs = []
    for path in glob.glob(str(DATA_DIR / "*.json")):
        programs.append(json.loads(Path(path).read_text(encoding="utf-8")))
    return programs


def store_programs(programs: list[dict]) -> None:
    texts = [p["text"] for p in programs]
    embeddings = embed_texts(texts)

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        with conn.cursor() as cur:
            for program, text, embedding in zip(programs, texts, embeddings):
                cur.execute(
                    """
                    INSERT INTO programs (program_name, department, total_credits, source_url)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (program_name) DO UPDATE SET
                        department = EXCLUDED.department,
                        total_credits = EXCLUDED.total_credits,
                        source_url = EXCLUDED.source_url
                    RETURNING id
                    """,
                    (
                        program["program_name"],
                        program["department"],
                        program["total_credits"],
                        program["source_url"],
                    ),
                )
                program_id = cur.fetchone()[0]
                cur.execute("DELETE FROM program_chunks WHERE program_id = %s", (program_id,))
                cur.execute(
                    "INSERT INTO program_chunks (program_id, chunk_text, embedding) VALUES (%s, %s, %s)",
                    (program_id, text, embedding),
                )
        conn.commit()
    finally:
        conn.close()


def main() -> None:
    programs = load_programs()
    print(f"Embedding and storing {len(programs)} programs...")
    store_programs(programs)
    print("Done.")


if __name__ == "__main__":
    main()
