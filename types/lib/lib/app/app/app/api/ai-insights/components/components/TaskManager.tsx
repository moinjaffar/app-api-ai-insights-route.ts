"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Task, TaskStatus } from "@/types";
import { addTask, deleteTask, updateTask } from "@/lib/dataStore";
import { v4 as uuidv4 } from "uuid";

const SUBJECTS = ["Mathematics","English","Physics","Business","Chemistry","History","Other"];
const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: "text-stone-400 bg-stone-800 border-stone-700",
  "in-progress": "text-yellow-400 bg-yellow-950 border-yellow-700",
  completed: "text-green-400 bg-green-950 border-green-800",
};
const STATUS_LABELS: Record<TaskStatus, string> = { pending: "Pending", "in-progress": "In Progress", completed: "Done" };

interface Props { tasks: Task[]; onTaskChange: () => void; }

export default function TaskManager({ tasks, onTaskChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: SUBJECTS[0], title: "", deadline: "", status: "pending" as TaskStatus });

  const handleAdd = () => {
    if (!form.title.trim() || !form.deadline) return;
    addTask({ id: uuidv4(), subject: form.subject, title: form.title.trim(), status: form.status, deadline: new Date(form.deadline).toISOString(), createdAt: new Date().toISOString() });
    setForm({ subject: SUBJECTS[0], title: "", deadline: "", status: "pending" });
    setShowForm(false); onTaskChange();
  };

  const cycleStatus = (task: Task) => {
    const order: TaskStatus[] = ["pending","in-progress","completed"];
    updateTask(task.id, { status: order[(order.indexOf(task.status) + 1) % order.length] });
    onTaskChange();
  };

  const isPastDeadline = (t: Task) => new Date(t.deadline) < new Date() && t.status !== "completed";

  return (
    <section className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">📋 Tasks</h2>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-yellow-500 text-black text-sm font-bold hover:bg-yellow-400 transition-colors">
          {showForm ? "✕ Cancel" : "+ Add Task"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-5">
            <div className="rounded-2xl border border-yellow-700/40 bg-yellow-950/20 p-5 space-y-3">
              <input className="w-full rounded-xl bg-stone-900 border border-stone-700 text-stone-200 text-sm px-3 py-2 focus:outline-none focus:border-yellow-600 placeholder:text-stone-600"
                placeholder="Task title..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <div className="flex gap-3 flex-wrap">
                <select className="flex-1 min-w-[140px] rounded-xl bg-stone-900 border border-stone-700 text-stone-300 text-sm px-3 py-2 focus:outline-none focus:border-yellow-600"
                  value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                  {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
                <input type="date" className="flex-1 min-w-[140px] rounded-xl bg-stone-900 border border-stone-700 text-stone-300 text-sm px-3 py-2 focus:outline-none focus:border-yellow-600"
                  value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd}
                className="w-full py-2 rounded-xl bg-yellow-500 text-black text-sm font-bold hover:bg-yellow-400 transition-colors">
                Add Task
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {tasks.length === 0 ? (
        <p className="text-center text-stone-600 text-sm py-10">No tasks yet. Add one above!</p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.li key={task.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, height: 0 }} transition={{ duration: 0.3 }}
                className={`rounded-2xl border p-4 flex items-center gap-3 group transition-colors
                  ${task.status === "completed" ? "border-stone-800/50 bg-stone-900/30 opacity-60" : isPastDeadline(task) ? "border-red-800/50 bg-red-950/20" : "border-stone-700/40 bg-stone-900/40 hover:border-yellow-700/40"}`}>
                <button onClick={() => cycleStatus(task)}
                  className={`shrink-0 w-5 h-5 rounded-full border-2 transition-colors cursor-pointer
                    ${task.status === "completed" ? "border-green-500 bg-green-500" : task.status === "in-progress" ? "border-yellow-500 bg-yellow-500/30" : "border-stone-600 hover:border-yellow-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${task.status === "completed" ? "line-through text-stone-600" : "text-stone-200"}`}>{task.title}</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {task.subject} · Due {new Date(task.deadline).toLocaleDateString()}
                    {isPastDeadline(task) && <span className="text-red-500 ml-1">· Overdue!</span>}
                  </p>
                </div>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[task.status]}`}>{STATUS_LABELS[task.status]}</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => { deleteTask(task.id); onTaskChange(); }}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center bg-red-950 border border-red-800 text-red-400 hover:bg-red-900 text-xs">
                  ✕
                </motion.button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
