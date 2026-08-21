"""FastAPI backend for the NYU course catalog RAG assistant."""
import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

sys.path.insert(0, str(Path(__file__).parent.parent))
from app import db  # noqa: E402
from generation.answer import generate_answer  # noqa: E402
from retrieval.search import search  # noqa: E402

app = FastAPI(title="NYU Course Catalog Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class NewMessage(BaseModel):
    content: str


def _title_from(question: str, limit: int = 60) -> str:
    question = question.strip()
    return question if len(question) <= limit else question[: limit - 1].rstrip() + "…"


def _citable(course: dict) -> dict:
    return {
        "course_code": course["course_code"],
        "title": course["title"],
        "credits": course["credits"],
        "prerequisites": course["prerequisites"],
        "department": course.get("department"),
    }


@app.get("/api/courses")
def api_list_courses(q: str | None = None, department: str | None = None):
    return db.list_courses(q=q, department=department)


@app.get("/api/departments")
def api_list_departments():
    return db.list_departments()


@app.get("/api/conversations")
def api_list_conversations():
    return db.list_conversations()


@app.post("/api/conversations")
def api_create_conversation():
    return db.create_conversation()


@app.get("/api/conversations/{conversation_id}/messages")
def api_get_messages(conversation_id: int):
    if db.get_conversation(conversation_id) is None:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return db.list_messages(conversation_id)


@app.post("/api/conversations/{conversation_id}/messages")
def api_post_message(conversation_id: int, body: NewMessage):
    if db.get_conversation(conversation_id) is None:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    question = body.content.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    db.add_message(conversation_id, "user", question)
    db.set_conversation_title(conversation_id, _title_from(question))

    try:
        retrieved = search(question, top_k=5)
        answer = generate_answer(question, retrieved)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=502,
            detail=f"Couldn't reach the retrieval/generation pipeline: {exc}",
        ) from exc

    citable = [_citable(c) for c in retrieved]
    return db.add_message(conversation_id, "assistant", answer, citable)
