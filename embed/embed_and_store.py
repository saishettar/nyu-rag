"""Embed course chunks and store them in Postgres/pgvector.

One chunk per course: the description is short and self-contained, so it
does not need splitting. Course code/title/department/prerequisites ride
along as structured metadata on the `courses` row.
"""
import glob
import json
import os
from pathlib import Path

import psycopg2
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

load_dotenv()

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
DATA_DIR = Path(__file__).parent.parent / "ingest" / "data"

_model = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    return get_model().encode(texts, normalize_embeddings=True).tolist()


def chunk_text_for(course: dict) -> str:
    """What actually gets embedded. Folding prerequisites into the text (not
    just storing them as metadata) lets "what's next after X" queries match
    courses that list X as a prerequisite."""
    text = f"{course['course_code']} {course['title']}. {course['description']}"
    if course["prerequisites"]:
        text += f" Prerequisites: {course['prerequisites']}"
    return text


def load_courses() -> list[dict]:
    courses = []
    for path in glob.glob(str(DATA_DIR / "*.json")):
        courses.extend(json.loads(Path(path).read_text(encoding="utf-8")))
    return courses


def store_courses(courses: list[dict]) -> None:
    texts = [chunk_text_for(c) for c in courses]
    embeddings = embed_texts(texts)

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    try:
        with conn.cursor() as cur:
            for course, text, embedding in zip(courses, texts, embeddings):
                cur.execute(
                    """
                    INSERT INTO courses (course_code, title, department, credits, prerequisites, source_url)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (course_code) DO UPDATE SET
                        title = EXCLUDED.title,
                        department = EXCLUDED.department,
                        credits = EXCLUDED.credits,
                        prerequisites = EXCLUDED.prerequisites,
                        source_url = EXCLUDED.source_url
                    RETURNING id
                    """,
                    (
                        course["course_code"],
                        course["title"],
                        course["department"],
                        course["credits"],
                        course["prerequisites"],
                        course["source_url"],
                    ),
                )
                course_id = cur.fetchone()[0]
                cur.execute("DELETE FROM chunks WHERE course_id = %s", (course_id,))
                cur.execute(
                    "INSERT INTO chunks (course_id, chunk_text, embedding) VALUES (%s, %s, %s)",
                    (course_id, text, embedding),
                )
        conn.commit()
    finally:
        conn.close()


def main() -> None:
    courses = load_courses()
    print(f"Embedding and storing {len(courses)} courses...")
    store_courses(courses)
    print("Done.")


if __name__ == "__main__":
    main()
