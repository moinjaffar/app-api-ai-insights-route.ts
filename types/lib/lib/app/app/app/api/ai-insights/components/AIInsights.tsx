"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AIInsights as AIInsightsType, SubjectAnalysis } from "@/types";
import { getTasks, getSessions } from "@/lib/dataStore";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

function ProgressRing({ value, color }: { value: number; color: string }) {
  const r = 28, circ = 2 * Math.PI * r, offset = circ - (value / 100) * circ;
  return (
    <svg width="68" height="68" viewBox="0 0 68 68">
      <circle cx="34" cy="34" r={r} fill="none" stroke="#2a2410" strokeWidth="6" />
      <motion.circle cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={circ} strokeLinecap="round"
        transform="rotate(-90 34 34)" animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }} />
      <text x="34" y="39" textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>{value}%</text>
    </svg>
  );
}

function SubjectCard({ s, isWeak, isStrong }: { s: SubjectAnalysis; isWeak: boolean; isStrong: boolean }) {
  const color = isWeak ? "#ef4444" : isStrong ? "#f59e0b" : "#a8a29e";
  const label = isWeak ? "Needs Work" : isStrong ? "Strong" : "Average";
  const labelBg = isWeak ? "bg-red-950/60 text-red-400 border-red-800" : isStrong ? "bg-yellow-950/60 text-yellow-400 border-yellow-700" : "bg-stone-800 text-stone-400 border-stone-700";
  return (
    <div className={`relative rounded-2xl border p-4 flex flex-col gap-3 hover:scale-[1.02] transition-all ${isWeak ? "border-red-800/60 bg-red-950/20" : isStrong ? "border-yellow-700/50 bg-yellow-950/20" : "border-stone-700/40 bg-stone-900/40"}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-stone-200">{s.subject}</p>
          <p className="text-xs text-stone-500 mt-0.5">{s.totalMinutes} min studied</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${labelBg}`}>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <ProgressRing value={s.completionRate} color={color} />
        <div className="text-xs text-stone-400 space-y-1">
          <p>✅ {s.completedTasks}/{s.taskCount} tasks done</p>
          {s.missedDeadlines > 0 && <p className="text-red-400">⚠ {s.missedDeadlines} missed</p>}
        </div>
      </div>
    </div>
  );
}

export default function AIInsightsPanel() {
  const [insights, setInsights] = useState<AIInsightsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ai-insights", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tasks: getTasks(), sessions: getSessions() }) });
      if (!res.ok) throw new Error();
      setInsights(await res.json());
      setLastUpdated(new Date().toLocaleTimeString());
    } catch { setError("Could not generate insights. Please try again."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchInsights(); }, [fetchInsights]);

  return (
    <section className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">🧠 AI Insight Engine</h2>
          {lastUpdated && <p className="text-xs text-stone-500 mt-0.5">Last analyzed: {lastUpdated}</p>}
        </div>
        <motion.button onClick={fetchInsights} disabled={loading} whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-xl bg-yellow-500 text-black text-sm font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50">
          {loading ? "Analyzing..." : "↻ Refresh"}
        </motion.button>
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-16 gap-4">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-10 h-10 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full" />
            <p className="text-stone-400 text-sm">Crunching your study data...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && !loading && <div className="rounded-2xl border border-red-800 bg-red-950/30 p-4 text-red-400 text-sm">{error}</div>}

      {insights && !loading && (
        <div className="space-y-5">
          <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-2">
            {insights.weakSubjects.length > 0 && <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-950 text-red-400 border border-red-800">⚠ {insights.weakSubjects.length} Weak Subject(s)</span>}
            {insights.strongSubjects.length > 0 && <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-950 text-yellow-400 border border-yellow-700">★ {insights.strongSubjects.length} Strong Subject(s)</span>}
            {insights.warnings.length > 0 && <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-950 text-orange-400 border border-orange-800">🔔 {insights.warnings.length} Warning(s)</span>}
          </motion.div>

          {insights.warnings.length > 0 && (
            <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" className="rounded-2xl border border-orange-800/50 bg-orange-950/20 p-5">
              <h3 className="text-sm font-bold text-orange-400 mb-3">🔔 Warnings</h3>
              <ul className="space-y-2">{insights.warnings.map((w, i) => <li key={i} className="text-sm text-orange-200/80 flex items-start gap-2"><span className="text-orange-500 shrink-0">›</span>{w}</li>)}</ul>
            </motion.div>
          )}

          {insights.recommendations.length > 0 && (
            <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" className="rounded-2xl border border-yellow-700/40 bg-yellow-950/20 p-5">
              <h3 className="text-sm font-bold text-yellow-400 mb-3">💡 Recommendations</h3>
              <ul className="space-y-2">{insights.recommendations.map((r, i) => <li key={i} className="text-sm text-yellow-100/80 flex items-start gap-2"><span className="text-yellow-500 shrink-0">›</span>{r}</li>)}</ul>
            </motion.div>
          )}

          {insights.subjectBreakdown.length > 0 && (
            <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
              <h3 className="text-sm font-bold text-stone-400 mb-3">📊 Subject Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {insights.subjectBreakdown.map((s, i) => (
                  <motion.div key={s.subject} custom={i + 4} variants={cardVariants} initial="hidden" animate="visible">
                    <SubjectCard s={s} isWeak={insights.weakSubjects.includes(s.subject)} isStrong={insights.strongSubjects.includes(s.subject)} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </section>
  );
}
