"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { StudySession } from "@/types";
import { addSession } from "@/lib/dataStore";
import { v4 as uuidv4 } from "uuid";

const SUBJECTS = ["Mathematics","English","Physics","Business","Chemistry","History","Other"];
interface Props { sessions: StudySession[]; onSessionAdd: () => void; }

export default function SessionLogger({ sessions, onSessionAdd }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: SUBJECTS[0], duration: "", date: new Date().toISOString().slice(0,10) });

  const handleAdd = () => {
    const mins = parseInt(form.duration);
    if (!mins || mins <= 0 || !form.date) return;
    addSession({ id: uuidv4(), subject: form.subject, duration: mins, date: new Date(form.date).toISOString() });
    setForm({ subject: SUBJECTS[0], duration: "", date: new Date().toISOString().slice(0,10) });
    setShowForm(false); onSessionAdd();
  };

  const todayMins = sessions.filter(s => s.date.slice(0,10) === new Date().toISOString().slice(0,10)).reduce((sum, s) => sum + s.duration, 0);

  return (
    <section className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">⏱ Study Sessions</h2>
          <p className="text-xs text-stone-500 mt-0.5">Today: {todayMins} min studied</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-yellow-500 text-black text-sm font-bold hover:bg-yellow-400 transition-colors">
          {showForm ? "✕ Cancel" : "+ Log Session"}
        </motion.button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden mb-5">
          <div className="rounded-2xl border border-yellow-700/40 bg-yellow-950/20 p-5 space-y-3">
            <div className="flex gap-3 flex-wrap">
              <select className="flex-1 min-w-[140px] rounded-xl bg-stone-900 border border-stone-700 text-stone-300 text-sm px-3 py-2 focus:outline-none focus:border-yellow-600"
                value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
              <input type="number" placeholder="Duration (min)"
                className="flex-1 min-w-[140px] rounded-xl bg-stone-900 border border-stone-700 text-stone-300 text-sm px-3 py-2 focus:outline-none focus:border-yellow-600 placeholder:text-stone-600"
                value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              <input type="date"
                className="flex-1 min-w-[140px] rounded-xl bg-stone-900 border border-stone-700 text-stone-300 text-sm px-3 py-2 focus:outline-none focus:border-yellow-600"
                value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd}
              className="w-full py-2 rounded-xl bg-yellow-500 text-black text-sm font-bold hover:bg-yellow-400 transition-colors">
              Log Session
            </motion.button>
          </div>
        </motion.div>
      )}

      {sessions.length === 0 ? (
        <p className="text-center text-stone-600 text-sm py-8">No sessions logged yet.</p>
      ) : (
        <div className="space-y-2">
          {[...sessions].reverse().slice(0, 8).map(s => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-700/40 bg-stone-900/40">
              <div className="w-8 h-8 rounded-lg bg-yellow-950 border border-yellow-800 flex items-center justify-center text-sm">📚</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-200">{s.subject}</p>
                <p className="text-xs text-stone-500">{new Date(s.date).toLocaleDateString()}</p>
              </div>
              <span className="text-sm font-bold text-yellow-500">{s.duration} min</span>
            </div>
          ))}
        </div>
      )}
    </section>
