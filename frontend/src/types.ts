export type Role = 'student' | 'instructor' | 'admin';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Paged<T> { count: number; next?: string | null; previous?: string | null; results: T[] }
export type Listish<T> = Paged<T> | T[];

export interface User {
  id: number; email: string; first_name: string; last_name: string; full_name: string; role: Role;
  avatar: string | null; bio?: string; email_verified: boolean; xp: number; streak: number;
  date_joined?: string; is_active?: boolean;
}

export interface Category { id: number; name: string; slug: string }
export interface InstructorBrief { id?: number; full_name: string; avatar?: string | null; bio?: string }

export interface Lesson {
  id: number; title: string; kind: 'video' | 'text' | 'file'; duration_minutes: number;
  is_free_preview?: boolean; video_url?: string; content?: string; resource?: string | null; order?: number;
}
export interface Section { id: number; title: string; order?: number; lessons: Lesson[] }

export interface Course {
  id: number; slug: string; title: string; subtitle?: string; description?: string; thumbnail?: string | null;
  level: Level; status: CourseStatus; price_kobo: number; is_free?: boolean; category?: Category | null;
  instructor?: InstructorBrief; instructor_name?: string; avg_rating?: number | string | null;
  lesson_count?: number; student_count?: number; sections?: Section[];
  can_manage?: boolean; is_enrolled?: boolean; progress_pct?: number;
}
export interface CourseDetail extends Course { sections: Section[] }

export interface Enrollment { id: number; course: Course; progress_pct: number; completed_at?: string | null }
export interface Progress { completed_lesson_ids: number[]; progress_pct: number }
export interface CompleteResult { xp_awarded?: number; course_completed?: boolean }
export interface Review { id: number; user_name: string; rating: number; comment?: string; created_at: string }
export interface Certificate { id: number; token: string; course_title: string; issued_at: string }
export interface CertificateCheck { valid: boolean; holder: string; course: string; issued_at: string }

export type LiveStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';
export interface LiveClass {
  id: number; title: string; description?: string; course_title: string; starts_at: string; duration_minutes: number;
  host_name: string; status: LiveStatus; can_join: boolean; is_host: boolean; recording_url?: string | null;
}
export interface LiveConnection { domain: string; room: string; jwt?: string | null; display_name: string; email: string; is_moderator?: boolean }
export interface Attendance { student: string; email: string; first_joined_at: string; join_count: number }

export interface Quiz {
  id: number; title: string; description?: string; question_count: number; pass_mark_pct: number;
  time_limit_minutes?: number | null; max_attempts?: number | null; attempts_used: number;
  best_score_pct?: number | null; is_required?: boolean; is_published?: boolean;
}
export interface Choice { id: number; text: string; is_correct?: boolean }
export interface Question {
  id: number; prompt: string; kind: 'single' | 'multiple'; points?: number; explanation?: string; order?: number; choices: Choice[];
}
export interface QuizSession { attempt: { id: number; started_at: string }; time_limit_minutes?: number | null; questions: Question[] }
export interface QuizResult {
  passed: boolean; score_pct: number; expired?: boolean; pass_mark_pct: number; xp_awarded?: number;
  attempts_remaining?: number | null;
  results: { question: number; correct: boolean; correct_choice_ids?: number[]; explanation?: string }[];
}

export interface Submission {
  id: number; student_name?: string; text?: string; file?: string | null; score?: number | null; feedback?: string;
  graded_at?: string | null; submitted_at?: string; is_late?: boolean;
}
export interface Assignment {
  id: number; title: string; instructions: string; due_at?: string | null; max_score: number; allow_late: boolean;
  is_published: boolean; my_submission?: Submission | null;
}
export interface Announcement { id: number; title: string; body: string; author_name?: string; created_at: string }
export interface Thread { id: number; title: string; body: string; author_name: string; created_at: string; reply_count: number; is_resolved: boolean }
export interface Reply { id: number; body: string; author_name: string; author_role: Role }

export interface NotificationItem { id: number; title: string; body?: string; link?: string; is_read: boolean; created_at: string }
export interface SearchResults {
  courses: { id: number; slug: string; title: string; instructor: string; category?: string; price_kobo: number }[];
  instructors: { id: number; full_name: string; course_count: number }[];
  lessons: { id: number; title: string; course_title: string; course_slug: string }[];
}

export type PaymentStatus = 'success' | 'pending' | 'failed' | 'refund_pending' | 'refunded' | 'refund_failed';
export interface Payment {
  id: number; reference: string; course_title: string; user_email?: string; amount_kobo: number; status: PaymentStatus;
  paid_at?: string | null; refunded_at?: string | null; created_at: string; can_request_refund?: boolean;
  refund_status?: string;
  refund_request_status?: 'pending' | 'processing' | 'approved' | 'rejected' | 'failed' | null;
}
export interface RefundRequest {
  id: number; student: string; email: string; course_title: string; amount_kobo: number; reason: string;
  progress_pct?: number | null; status: 'pending' | 'processing' | 'approved' | 'rejected' | 'failed'; created_at: string;
}
export interface ContactMessage { id: number; name: string; email: string; subject: string; message: string; is_handled: boolean; created_at: string }

export interface InstructorStats {
  courses: number; published: number; students: number; completions: number; revenue_kobo: number;
  per_course: { slug: string; title: string; students: number }[];
}
export interface AdminStats {
  users: Record<string, number | undefined>; courses: Record<string, number | undefined>;
  enrollments: number; completions: number; revenue_kobo: number;
}
export interface Gradebook {
  quizzes: { id: number; title: string }[]; assignments: { id: number; title: string; max_score: number }[];
  rows: { student_id: number; student: string; email: string; progress_pct: number; completed: boolean;
    quizzes: Record<string, number | null | undefined>; assignments: Record<string, number | null | undefined> }[];
}
