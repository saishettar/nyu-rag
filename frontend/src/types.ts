export interface Course {
  course_code: string;
  title: string;
  department: string;
  credits: number | null;
  prerequisites: string;
  source_url?: string;
}

export interface Conversation {
  id: number;
  title: string | null;
  created_at: string;
}

export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  retrieved_courses: Course[] | null;
  created_at: string;
}
