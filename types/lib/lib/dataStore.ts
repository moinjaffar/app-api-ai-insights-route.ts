import { Task, StudySession } from "@/types";

const TASKS_KEY = "studyapp_tasks";
const SESSIONS_KEY = "studyapp_sessions";

export function getTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(TASKS_KEY) || "[]"); }
  catch { return []; }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function addTask(task: Task): void {
  saveTasks([...getTasks(), task]);
}

export function deleteTask(id: string): void {
  saveTasks(getTasks().filter((t) => t.id !== id));
}

export function updateTask(id: string, updates: Partial<Task>): void {
  saveTasks(getTasks().map((t) => (t.id === id ? { ...t, ...updates } : t)));
}

export function getSessions(): StudySession[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]"); }
  catch { return []; }
}

export function saveSessions(sessions: StudySession[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function addSession(session: StudySession): void {
  saveSessions([...getSessions(), session]);
}

export function seedDemoData(): void {
  const today = new Date();
  const past = (days: number) => { const d = new Date(today); d.setDate(d.getDate() - days); return d.toISOString(); };
  const future = (days: number) => { const d = new Date(today); d.setDate(d.getDate() + days); return d.toISOString(); };

  const tasks: Task[] = [
    { id: "t1", subject: "Mathematics", title: "Chapter 5 exercises", status: "pending", deadline: past(3), createdAt: past(10) },
    { id: "t2", subject: "Mathematics", title: "Algebra quiz prep", status: "pending", deadline: past(1), createdAt: past(8) },
    { id: "t3", subject: "Mathematics", title: "Geometry homework", status: "completed", deadline: future(2), createdAt: past(5) },
    { id: "t4", subject: "English", title: "Essay draft", status: "completed", deadline: past(2), createdAt: past(7) },
    { id: "t5", subject: "English", title: "Reading comprehension", status: "completed", deadline: past(1), createdAt: past(4) },
    { id: "t6", subject: "English", title: "Grammar worksheet", status: "completed", deadline: future(1), createdAt: past(3) },
    { id: "t7", subject: "Physics", title: "Motion problems", status: "pending", deadline: future(3), createdAt: past(2) },
    { id: "t8", subject: "Physics", title: "Lab report", status: "in-progress", deadline: past(2), createdAt: past(6) },
    { id: "t9", subject: "Business", title: "Case study analysis", status: "completed", deadline: future(5), createdAt: past(1) },
  ];

  const sessions: StudySession[] = [
    { id: "s1", subject: "Mathematics", duration: 30, date: past(7) },
    { id: "s2", subject: "English", duration: 90, date: past(6) },
    { id: "s3", subject: "English", duration: 60, date: past(5) },
    { id: "s4", subject: "Physics", duration: 45, date: past(4) },
    { id: "s5", subject: "Mathematics", duration: 20, date: past(3) },
    { id: "s6", subject: "Business", duration: 75, date: past(2) },
    { id: "s7", subject: "English", duration: 50, date: past(1) },
    { id: "s8", subject: "Business", duration: 60, date: past(1) },
  ];

  saveTasks(tasks);
  saveSessions(sessions);
