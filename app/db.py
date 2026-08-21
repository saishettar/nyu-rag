"""Postgres access for courses, conversations, and messages."""
import json
import os
from decimal import Decimal

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()


class _DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return float(o)
        return super().default(o)


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def list_courses(q: str | None = None, department: str | None = None) -> list[dict]:
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            clauses = []
            params: list = []
            if q:
                clauses.append("(course_code ILIKE %s OR title ILIKE %s)")
                params += [f"%{q}%", f"%{q}%"]
            if department:
                clauses.append("department = %s")
                params.append(department)
            where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
            cur.execute(
                f"""
                SELECT course_code, title, department, credits, prerequisites, source_url
                FROM courses
                {where}
                ORDER BY course_code
                """,
                params,
            )
            return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


def list_departments() -> list[str]:
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT DISTINCT department FROM courses ORDER BY department")
            return [row[0] for row in cur.fetchall()]
    finally:
        conn.close()


def list_conversations() -> list[dict]:
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT id, title, created_at FROM conversations ORDER BY created_at DESC"
            )
            return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


def create_conversation() -> dict:
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "INSERT INTO conversations DEFAULT VALUES RETURNING id, title, created_at"
            )
            row = dict(cur.fetchone())
        conn.commit()
        return row
    finally:
        conn.close()


def get_conversation(conversation_id: int) -> dict | None:
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT id, title, created_at FROM conversations WHERE id = %s",
                (conversation_id,),
            )
            row = cur.fetchone()
            return dict(row) if row else None
    finally:
        conn.close()


def set_conversation_title(conversation_id: int, title: str) -> None:
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE conversations SET title = %s WHERE id = %s AND title IS NULL",
                (title, conversation_id),
            )
        conn.commit()
    finally:
        conn.close()


def list_messages(conversation_id: int) -> list[dict]:
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, role, content, retrieved_courses, created_at
                FROM messages
                WHERE conversation_id = %s
                ORDER BY created_at ASC, id ASC
                """,
                (conversation_id,),
            )
            return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


def add_message(
    conversation_id: int,
    role: str,
    content: str,
    retrieved_courses: list[dict] | None = None,
) -> dict:
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO messages (conversation_id, role, content, retrieved_courses)
                VALUES (%s, %s, %s, %s)
                RETURNING id, role, content, retrieved_courses, created_at
                """,
                (
                    conversation_id,
                    role,
                    content,
                    json.dumps(retrieved_courses, cls=_DecimalEncoder)
                    if retrieved_courses is not None
                    else None,
                ),
            )
            row = dict(cur.fetchone())
        conn.commit()
        return row
    finally:
        conn.close()
