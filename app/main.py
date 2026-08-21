"""Streamlit chat UI for the NYU course catalog RAG assistant."""
import sys
from pathlib import Path

import streamlit as st

sys.path.insert(0, str(Path(__file__).parent.parent))
from generation.answer import generate_answer  # noqa: E402
from retrieval.search import search  # noqa: E402

st.set_page_config(page_title="NYU Course Catalog Assistant", page_icon="🎓")
st.title("NYU Course Catalog Assistant")
st.caption("Ask about CAS Computer Science courses. Answers cite specific course codes.")

if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if question := st.chat_input("e.g. What's a good course to take after Algorithms?"):
    st.session_state.messages.append({"role": "user", "content": question})
    with st.chat_message("user"):
        st.markdown(question)

    with st.chat_message("assistant"):
        with st.spinner("Searching the catalog..."):
            retrieved = search(question, top_k=5)
            answer = generate_answer(question, retrieved)
        st.markdown(answer)
        with st.expander("Retrieved courses"):
            for c in retrieved:
                st.markdown(f"**{c['course_code']}** — {c['title']} ({c['credits']} credits)")

    st.session_state.messages.append({"role": "assistant", "content": answer})
