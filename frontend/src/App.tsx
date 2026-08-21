/*
THESIS: citations are not text, they're a pointer — clicking one moves you to
the real course record, refusing the category default of "chat with sources
listed below and never touched again."
OWN-WORLD: warm-neutral canvas (#fafaf8 / #18181a dark), one committed cobalt
accent (#2e4dd4 / #7c93ff dark) reserved for interactive elements only —
citations, active nav, send button — never as a field; IBM Plex Sans for UI,
IBM Plex Mono for course codes and data; a bracket glyph "[ ]" as the mark,
echoing the [COURSE-CODE] citation itself.
STORY: a student or evaluator asks a course-planning question, sees a cited
answer, and can click straight from a citation into the live catalog record
that backs it — grounding made tangible, not asserted.
FIRST VIEWPORT: three-column shell — conversation sidebar (new chat + history)
left, message thread center with bottom-pinned composer, course catalog panel
right, persistent on desktop and collapsible on narrower widths.
FORM: standing exit (canon), taken explicitly by the user over the rolled
direction and IMPECCABLE'S PICK at direction-seed key a0fb49a2 (assigned index
7, "Academic Typesetting"; a0fb49a2 assigned index 7). Executed as the modern
AI-chat convention, played straight, craft bar = Claude / ChatGPT, per
new-work.md's standing-exit protocol; PRODUCT.md records this as a durable
brand commitment.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance.
*/
import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "./api";
import type { Conversation, Course, Message } from "./types";
import { Sidebar } from "./components/Sidebar";
import { CatalogPanel } from "./components/CatalogPanel";
import { EmptyState } from "./components/EmptyState";
import { MessageBubble } from "./components/MessageBubble";
import { ChatInput } from "./components/ChatInput";
import { ThinkingIndicator } from "./components/ThinkingIndicator";
import { ErrorBanner } from "./components/ErrorBanner";

let localId = -1;

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>([]);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogDepartment, setCatalogDepartment] = useState<string | null>(null);
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.listConversations().then(setConversations).catch(() => {});
    api.listDepartments().then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    setCatalogLoading(true);
    const handle = setTimeout(() => {
      api
        .listCourses(catalogQuery, catalogDepartment)
        .then(setCourses)
        .catch(() => {})
        .finally(() => setCatalogLoading(false));
    }, 150);
    return () => clearTimeout(handle);
  }, [catalogQuery, catalogDepartment]);

  useEffect(() => {
    if (activeId === null) {
      setMessages([]);
      return;
    }
    setMessagesLoading(true);
    api
      .listMessages(activeId)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setMessagesLoading(false));
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  function selectConversation(id: number) {
    setActiveId(id);
    setSidebarOpen(false);
    setError(null);
  }

  function newChat() {
    setActiveId(null);
    setMessages([]);
    setSidebarOpen(false);
    setError(null);
  }

  async function send(text: string) {
    setError(null);
    setLastFailedText(null);
    const optimisticUser: Message = {
      id: localId--,
      role: "user",
      content: text,
      retrieved_courses: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);
    setSending(true);

    try {
      let conversationId = activeId;
      if (conversationId === null) {
        const created = await api.createConversation();
        conversationId = created.id;
        setActiveId(created.id);
      }
      const assistantMessage = await api.sendMessage(conversationId, text);
      setMessages((prev) => [...prev, assistantMessage]);
      const updated = await api.listConversations();
      setConversations(updated);
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Something went wrong. Check your connection and try again.";
      setError(message);
      setLastFailedText(text);
    } finally {
      setSending(false);
    }
  }

  function retry() {
    if (lastFailedText) {
      const text = lastFailedText;
      setMessages((prev) => prev.slice(0, -1));
      send(text);
    }
  }

  function handleCite(code: string) {
    setHighlightedCode(code);
    setCatalogOpen(true);
  }

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-ink">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={selectConversation}
        onNewChat={newChat}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open sidebar"
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink lg:hidden"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M2.5 5h13M2.5 9h13M2.5 13h13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <h1 className="truncate text-sm font-medium text-muted">
              {activeConversation?.title ?? "New chat"}
            </h1>
          </div>
          <button
            aria-label="Open course catalog"
            onClick={() => setCatalogOpen(true)}
            className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink xl:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="2.5" y="3" width="13" height="3" rx="1" stroke="currentColor" strokeWidth="1.4" />
              <rect x="2.5" y="8" width="13" height="3" rx="1" stroke="currentColor" strokeWidth="1.4" />
              <rect x="2.5" y="13" width="13" height="2" rx="1" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 && !messagesLoading ? (
            <EmptyState onExample={send} />
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6 lg:px-8">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} onCite={handleCite} />
              ))}
              {sending && <ThinkingIndicator />}
              {error && <ErrorBanner message={error} onRetry={retry} />}
            </div>
          )}
        </div>

        <div className="mx-auto w-full max-w-3xl px-4 pb-4 lg:px-8">
          <ChatInput disabled={sending} onSend={send} />
        </div>
      </div>

      <CatalogPanel
        courses={courses}
        loading={catalogLoading}
        query={catalogQuery}
        onQueryChange={setCatalogQuery}
        department={catalogDepartment}
        departments={departments}
        onDepartmentChange={setCatalogDepartment}
        highlightedCode={highlightedCode}
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
      />
    </div>
  );
}
