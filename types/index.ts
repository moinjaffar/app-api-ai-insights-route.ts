export type TaskStatus = "pending" | "in-progress" | "completed";

export interface Task {
  id: string;
  subject: string;
  title: string;
  status: TaskStatus;
  deadline: string;
  createdAt: string;
}

export interface StudySession {
  id: string;
  subject: string;
  duration: number;
  date: string;
  notes?: string;
}

export interface SubjectAnalysis {
  subject: string;
  totalMinutes: number;
  completionRate: number;
  taskCount: number;
  completedTasks: number;
  missedDeadlines: number;
}

export interface AIInsights {
  weakSubjects: string[];
  strongSubjects: string[];
  recommendations: string[];
  warnings: string[];
  subjectBreakdown: SubjectAnalysis[];
  generatedAt: string;
}

export interface InsightRequest {
  tasks: Task[];
  sessions: StudySession[];
}
