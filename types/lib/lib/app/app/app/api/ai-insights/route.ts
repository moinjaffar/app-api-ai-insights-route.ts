import { NextRequest, NextResponse } from "next/server";
import { Task, StudySession, AIInsights, SubjectAnalysis, InsightRequest } from "@/types";

const WEAK_COMPLETION_THRESHOLD = 40;
const WEAK_TIME_THRESHOLD = 45;
const STRONG_COMPLETION_THRESHOLD = 75;
const STRONG_TIME_THRESHOLD = 60;

function buildSubjectAnalysis(tasks: Task[], sessions: StudySession[]): SubjectAnalysis[] {
  const map: Record<string, SubjectAnalysis> = {};

  for (const s of sessions) {
    if (!map[s.subject]) map[s.subject] = { subject: s.subject, totalMinutes: 0, completionRate: 0, taskCount: 0, completedTasks: 0, missedDeadlines: 0 };
    map[s.subject].totalMinutes += s.duration;
  }

  const now = new Date();
  for (const t of tasks) {
    if (!map[t.subject]) map[t.subject] = { subject: t.subject, totalMinutes: 0, completionRate: 0, taskCount: 0, completedTasks: 0, missedDeadlines: 0 };
    map[t.subject].taskCount++;
    if (t.status === "completed") map[t.subject].completedTasks++;
    if (new Date(t.deadline) < now && t.status !== "completed") map[t.subject].missedDeadlines++;
  }

  for (const key of Object.keys(map)) {
    const e = map[key];
    e.completionRate = e.taskCount > 0 ? Math.round((e.completedTasks / e.taskCount) * 100) : 0;
  }

  return Object.values(map);
}

function detectInconsistency(sessions: StudySession[]): string[] {
  const warnings: string[] = [];
  if (sessions.length < 2) return warnings;

  const byDate: Record<string, number> = {};
  for (const s of sessions) {
    const day = s.date.slice(0, 10);
    byDate[day] = (byDate[day] || 0) + s.duration;
  }

  const durations = Object.values(byDate);
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  const stdDev = Math.sqrt(durations.reduce((sum, d) => sum + Math.pow(d - avg, 2), 0) / durations.length);

  if (stdDev > avg * 0.6) warnings.push("Your study schedule is inconsistent — try to study for similar durations each day.");

  const sorted = Object.keys(byDate).sort();
  for (let i = 1; i < sorted.length; i++) {
    const gap = (new Date(sorted[i]).getTime() - new Date(sorted[i-1]).getTime()) / 86400000;
    if (gap > 2) { warnings.push(`You had a ${Math.round(gap)}-day study gap — try not to skip more than 1 day.`); break; }
  }

  return warnings;
}

function analyzeStudyBehavior(tasks: Task[], sessions: StudySession[]): AIInsights {
  const breakdown = buildSubjectAnalysis(tasks, sessions);
  const warnings: string[] = [];
  const recommendations: string[] = [];
  const weakSubjects: string[] = [];
  const strongSubjects: string[] = [];

  for (const s of breakdown) {
    if (s.totalMinutes < WEAK_TIME_THRESHOLD && s.completionRate < WEAK_COMPLETION_THRESHOLD) {
      weakSubjects.push(s.subject);
      recommendations.push(`Increase study time for ${s.subject} — only ${s.totalMinutes} min with ${s.completionRate}% completion.`);
    } else if (s.totalMinutes >= STRONG_TIME_THRESHOLD && s.completionRate >= STRONG_COMPLETION_THRESHOLD) {
      strongSubjects.push(s.subject);
    }
    if (s.missedDeadlines > 0) {
      warnings.push(`You missed ${s.missedDeadlines} deadline(s) in ${s.subject}.`);
      recommendations.push(`Focus on completing pending ${s.subject} tasks first.`);
    }
  }

  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const now = new Date();
  const missedThisWeek = tasks.filter(t => new Date(t.deadline) >= weekAgo && new Date(t.deadline) <= now && t.status !== "completed");
  if (missedThisWeek.length >= 2) warnings.push(`You missed ${missedThisWeek.length} deadlines this week.`);

  warnings.push(...detectInconsistency(sessions));
  if (recommendations.length === 0) recommendations.push("Great job! Keep maintaining your current study pace.");

  return { weakSubjects, strongSubjects, recommendations, warnings, subjectBreakdown: breakdown, generatedAt: new Date().toISOString() };
}

export async function POST(req: NextRequest) {
  try {
    const { tasks = [], sessions = [] }: InsightRequest = await req.json();
    if (!Array.isArray(tasks) || !Array.isArray(sessions)) return NextResponse.json({ error: "Invalid data." }, { status: 400 });
    return NextResponse.json(analyzeStudyBehavior(tasks, sessions));
  } catch {
    return NextResponse.json({ error: "Failed to generate insights." }, { status: 500 });
  }
}
