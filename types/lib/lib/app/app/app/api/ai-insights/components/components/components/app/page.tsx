"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AIInsightsPanel from "@/components/AIInsights";
import TaskManager from "@/components/TaskManager";
import SessionLogger from "@/components/SessionLogger";
import { getTasks, getSessions, seedDemoData } from "@/lib/dataStore";
import { Task, StudySession } from "@/types";

type Tab = "insights" | "tasks" | "sessions";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("insights");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [seeded, setSeeded] = useState(false);

  const refreshData = useCallback(() => { setTasks(getTasks()); setSessions(getSessions()); }, []);

  useEffect(() => {
    if (getTasks().length === 0 && !seeded) { seedDemoData(); setSeeded(true); }
    refreshData();
  }, [refreshData, seeded]);

  const tabs = [
    { id: "insights" as Tab, label: "AI Insights", icon: "🧠" },
    { id: "tasks" as Tab, label: "Tasks", icon: "📋" },
    { id: "sessions" as Tab, label: "Sessions", icon: "⏱" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0c0a06]/80 border-b border-[#2a2410]">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-extrabold tracking-tight glow" style={{ color: "#f59e0b" }}>
                StudyOS
              </motion.h1>
              <p className="text-xs text-stone-500 mt-0.5 font-mono">AI-Powered Study Tracker</p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-stone-900 border border-stone-700 text-stone-400">{tasks.length} tasks</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-stone-900 border border-stone-700 text-stone-400">{sessions.length} sessions</span>
            </div>
          </div>
          <nav className="flex gap-0 mt-4 -mb-[1px]">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 text-sm font-semibold transition-colors mr-1 rounded-t-lg
                  ${activeTab === tab.id ? "text-yellow-400 bg-yellow-950/30 border border-b-0 border-yellow-700/40" : "text-stone-500 hover:text-stone-300"}`}>
                <span className="mr-1.5">{tab.icon}</span>{tab.label}
                {activeTab === tab.id && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500 rounded-full" />}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "insights" && <motion.div key="insights" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}><AIInsightsPanel /></motion.div>}
          {activeTab === "tasks" && <motion.div key="tasks" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}><TaskManager tasks={tasks} onTaskChange={refreshData} /></motion.div>}
          {activeTab === "sessions" && <motion.div key="sessions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}><SessionLogger sessions={sessions} onSessionAdd={refreshData} /></motion.div>}
        </AnimatePresence>
      </main>

      <footer className="border-t border-[#2a2410] py-8 mt-auto">
        <div className="max-w-3xl mx-auto px-4 flex flex-col items-center gap-3">
          <p className="text-xs text-stone-600">Built for the ambitious student 📚</p>
          <a href="https://www.instagram.com/moin.jaffar?igsh=bGluMDEwOXRjY25m" target="_blank" rel="noopener noreferrer"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-stone-700 hover:border-yellow-600 bg-stone-900/60 hover:bg-yellow-950/40 transition-all duration-300">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400 group-hover:text-yellow-400 transition-colors">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
            <span className="text-sm text-stone-400 group-hover:text-yellow-300 font-semibold transition-colors">mian moin</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
