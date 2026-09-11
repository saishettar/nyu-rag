/*
THESIS: citations are not text, they're a pointer — clicking one moves you to
the real course record, refusing the category default of "chat with sources
listed below and never touched again."
OWN-WORLD: a gradient violet orb (#ede9fe -> #a78bfa -> #6d28d9, re-tuned per
theme) as the assistant's one signature mark — greeting icon and per-message
avatar — against a warm-neutral canvas floating as a rounded card (28px) on a
soft ambient page tint; violet is the one accent, spent only on interactive
elements (citations, active nav, send button), never as a field. IBM Plex
Sans for UI, IBM Plex Mono for course codes and data.
STORY: a student or evaluator asks a course-planning question, sees a cited
answer, and can click straight from a citation into the live catalog record
that backs it — grounding made tangible, not asserted.
FIRST VIEWPORT: three-column shell — conversation sidebar (new chat + history)
left, message thread center with bottom-pinned composer, course catalog panel
right, persistent on desktop and collapsible on narrower widths.
FORM: pinned-reference redesign, done explicitly at the user's direction
(four reference screenshots of an external "ThinkAI" chat UI), replacing the
prior monochrome/cobalt world with the reference's structure (floating
rounded shell, gradient orb avatar, pill suggestion chips) recolored to
violet. Violet was flagged as a departure from this project's prior
"independent from NYU branding" brand commitment (NYU's institutional color)
and confirmed anyway by the user; recorded in PRODUCT.md.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance.
*/
import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "./api";
import type { Conversation, Course, Message } from "./types";
import { Sidebar } from "./components/Sidebar";
import { ChatSearchView } from "./components/ChatSearchView";
import { CatalogPanel } from "./components/CatalogPanel";
import { EmptyState } from "./components/EmptyState";
import { MessageBubble } from "./components/MessageBubble";
import { ChatInput } from "./components/ChatInput";
import { ThinkingIndicator } from "./components/ThinkingIndicator";
import { ErrorBanner } from "./components/ErrorBanner";

let localId = -1;

const FAVORITE_DEPARTMENTS_KEY = "nyu-rag:favoriteDepartments";

function loadFavoriteDepartments(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITE_DEPARTMENTS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>([]);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogDepartment, setCatalogDepartment] = useState<string | null>(null);
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const [favoriteDepartments, setFavoriteDepartments] = useState<Set<string>>(loadFavoriteDepartments);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [catalogCollapsed, setCatalogCollapsed] = useState(true);
  const [searchView, setSearchView] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.listConversations().then(setConversations).catch(() => {});
    api.listDepartments().then(setDepartments).catch(() => {});
    api.listCourses("", null).then(setAllCourses).catch(() => {});
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
    setSearchView(false);
    setError(null);
  }

  function newChat() {
    setActiveId(null);
    setMessages([]);
    setSidebarOpen(false);
    setSearchView(false);
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

  function toggleFavoriteDepartment(department: string) {
    setFavoriteDepartments((prev) => {
      const next = new Set(prev);
      if (next.has(department)) {
        next.delete(department);
      } else {
        next.add(department);
      }
      try {
        localStorage.setItem(FAVORITE_DEPARTMENTS_KEY, JSON.stringify([...next]));
      } catch {
        // ignore storage failures (private browsing, quota, etc.)
      }
      return next;
    });
  }

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  return (
    <div className="flex h-screen items-center justify-center xl:p-8">
    <div className="flex h-full w-full overflow-hidden bg-canvas text-ink xl:rounded-[28px] xl:border xl:border-border xl:shadow-composer">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={selectConversation}
        onNewChat={newChat}
        onOpenSearch={() => {
          setSearchView(true);
          setSidebarOpen(false);
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(true)}
        onExpand={() => setSidebarCollapsed(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {searchView ? (
          <ChatSearchView
            conversations={conversations}
            activeId={activeId}
            onSelect={selectConversation}
            onNewChat={newChat}
            onBack={() => setSearchView(false)}
          />
        ) : (
          <>
            <header className="flex items-center justify-between border-b border-border px-4 py-3 lg:px-6">
              <div className="flex items-center gap-3">
                <button
                  aria-label="Open sidebar"
                  onClick={() => {
                    setSidebarOpen(true);
                    setSidebarCollapsed(false);
                  }}
                  className={`rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink ${
                    sidebarCollapsed ? "" : "lg:hidden"
                  }`}
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
                onClick={() => {
                  setCatalogOpen(true);
                  setCatalogCollapsed(false);
                }}
                className={`rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink ${
                  catalogCollapsed ? "" : "xl:hidden"
                }`}
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
                <EmptyState onExample={send} courses={allCourses} favorites={favoriteDepartments} />
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

            <div className="mx-auto w-full max-w-3xl px-4 pb-2 lg:px-8">
              <ChatInput disabled={sending} onSend={send} />
              <p className="mt-2 text-center text-[0.7rem] text-faint">
                Answers can be wrong — always verify prerequisites and requirements with an advisor or the official Bulletin.
              </p>
            </div>
          </>
        )}
      </div>

      {!searchView && (
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
          collapsed={catalogCollapsed}
          onCollapse={() => setCatalogCollapsed(true)}
          favorites={favoriteDepartments}
          onToggleFavorite={toggleFavoriteDepartment}
        />
      )}
    </div>
    </div>
  );
}
