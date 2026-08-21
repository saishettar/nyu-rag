import type { Conversation, Course, Message } from "./types";

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.detail ?? `Request failed (${res.status})`, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listCourses: (q: string, department: string | null) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (department) params.set("department", department);
    const qs = params.toString();
    return request<Course[]>(`/courses${qs ? `?${qs}` : ""}`);
  },
  listDepartments: () => request<string[]>("/departments"),
  listConversations: () => request<Conversation[]>("/conversations"),
  createConversation: () =>
    request<Conversation>("/conversations", { method: "POST" }),
  listMessages: (conversationId: number) =>
    request<Message[]>(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: number, content: string) =>
    request<Message>(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
};

export { ApiError };
