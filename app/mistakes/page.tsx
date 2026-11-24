"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { MistakeCategory, MistakeLogItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Filter,
  Brain,
  Calculator,
  Timer,
  AlertCircle,
} from "lucide-react";

const CATEGORY_CONFIG: Record<
  MistakeCategory,
  { label: string; icon: any; color: string; bg: string }
> = {
  concept: {
    label: "Concept Error",
    icon: Brain,
    color: "text-purple-500",
    bg: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
  },
  calculation: {
    label: "Calculation Slip",
    icon: Calculator,
    color: "text-blue-500",
    bg: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  },
  silly: {
    label: "Silly / Sign Mistake",
    icon: AlertCircle,
    color: "text-amber-500",
    bg: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  },
  time: {
    label: "Time Management",
    icon: Timer,
    color: "text-rose-500",
    bg: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  },
};

export default function MistakesPage() {
  const {
    currentUser,
    openAuthModal,
    mistakes,
    addMistake,
    toggleMistakeRetry,
    toggleMistakeResolved,
    deleteMistake,
    syllabus,
  } = useAppStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  // Form State
  const [formSubjectId, setFormSubjectId] = useState("maths");
  const [formTopic, setFormTopic] = useState("");
  const [formWhatWentWrong, setFormWhatWentWrong] = useState("");
  const [formCategory, setFormCategory] = useState<MistakeCategory>("concept");
  const [formRetryFlag, setFormRetryFlag] = useState(true);

  // Filtered Mistakes
  const filteredMistakes = useMemo(() => {
    return mistakes.filter((m) => {
      const matchCat = selectedCategory === "all" || m.category === selectedCategory;
      const matchSub = selectedSubject === "all" || m.subjectId === selectedSubject;
      return matchCat && matchSub;
    });
  }, [mistakes, selectedCategory, selectedSubject]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: mistakes.length,
      unresolved: mistakes.filter((m) => !m.resolved).length,
      concept: mistakes.filter((m) => m.category === "concept").length,
      calculation: mistakes.filter((m) => m.category === "calculation").length,
      silly: mistakes.filter((m) => m.category === "silly").length,
      time: mistakes.filter((m) => m.category === "time").length,
      retryQueued: mistakes.filter((m) => m.retryFlag && !m.resolved).length,
    };
  }, [mistakes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTopic.trim() || !formWhatWentWrong.trim()) return;

    addMistake({
      subjectId: formSubjectId,
      topic: formTopic.trim(),
      whatWentWrong: formWhatWentWrong.trim(),
      category: formCategory,
      retryFlag: formRetryFlag,
      resolved: false,
    });

    setFormTopic("");
    setFormWhatWentWrong("");
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-200/80 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
              Error Analysis & Recovery
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            Mistake Notebook & Practice Log
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Track concept errors, calculation slips, and silly mistakes • Automatically feeds into Daily Planner
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) {
              openAuthModal("login", "Please sign in or create an account to record errors in your Mistake Notebook!");
              return;
            }
            setModalOpen(true);
          }}
          className="btn-nested-cta self-start"
        >
          <span>Log New Error</span>
          <div className="btn-nested-icon">
            <Plus className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="double-bezel">
          <div className="double-bezel-inner p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Total Mistakes</p>
            <p className="text-3xl font-black font-mono text-neutral-950 dark:text-white mt-1">
              {stats.total}
            </p>
            <p className="text-[10px] text-amber-500 font-mono mt-0.5">
              {stats.unresolved} pending resolution
            </p>
          </div>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Concept Errors</p>
            <p className="text-3xl font-black font-mono text-purple-500 mt-1">
              {stats.concept}
            </p>
            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">NCERT revision priority</p>
          </div>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Calculation Slips</p>
            <p className="text-3xl font-black font-mono text-blue-500 mt-1">
              {stats.calculation}
            </p>
            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Practice step checking</p>
          </div>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Retry Queued</p>
            <p className="text-3xl font-black font-mono text-emerald-600 dark:text-[#b8ff3c] mt-1">
              {stats.retryQueued}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-[#b8ff3c] font-mono mt-0.5">In today's planner</p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="double-bezel">
        <div className="double-bezel-inner py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs font-bold text-neutral-500 uppercase">Filter:</span>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
            >
              <option value="all">All Subjects</option>
              {syllabus.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
            >
              <option value="all">All Error Types</option>
              <option value="concept">Concept Errors</option>
              <option value="calculation">Calculation Slips</option>
              <option value="silly">Silly / Sign Mistakes</option>
              <option value="time">Time Management</option>
            </select>
          </div>

          <span className="text-xs font-mono font-bold text-neutral-400">
            Showing {filteredMistakes.length} errors
          </span>
        </div>
      </div>

      {/* Mistakes Grid */}
      {filteredMistakes.length === 0 ? (
        <div className="double-bezel">
          <div className="double-bezel-inner py-16 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto" />
            <p className="text-sm font-black text-neutral-700 dark:text-neutral-300">
              No mistakes logged in this category!
            </p>
            <p className="text-xs text-neutral-500 font-mono max-w-sm mx-auto">
              Log questions you got wrong in mocks or practice papers to avoid repeating them in board exams.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMistakes.map((item) => {
            const sub = syllabus.find((s) => s.id === item.subjectId);
            const cat = CATEGORY_CONFIG[item.category];
            const Icon = cat.icon;

            return (
              <div key={item.id} className="double-bezel">
                <div
                  className={`double-bezel-inner space-y-3 ${
                    item.resolved ? "opacity-60 bg-neutral-100/50 dark:bg-neutral-900/30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 dark:border-neutral-800/60">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono"
                        style={{ backgroundColor: `${sub?.color}20`, color: sub?.color }}
                      >
                        {sub?.name || item.subjectId}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border flex items-center gap-1 ${cat.bg}`}>
                        <Icon className="w-3 h-3" />
                        <span>{cat.label}</span>
                      </span>
                    </div>

                    <span className="text-[10px] text-neutral-400 font-mono">
                      {formatDate(item.date)}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-sm text-neutral-950 dark:text-white">
                      {item.topic}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed bg-neutral-100 dark:bg-neutral-900/90 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                      "{item.whatWentWrong}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleMistakeRetry(item.id)}
                        className={`text-[11px] font-mono font-bold flex items-center gap-1 transition-colors ${
                          item.retryFlag ? "text-[#10b981]" : "text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                        }`}
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{item.retryFlag ? "Retry Scheduled" : "Schedule Retry"}</span>
                      </button>

                      <button
                        onClick={() => toggleMistakeResolved(item.id)}
                        className={`text-[11px] font-mono font-bold flex items-center gap-1 transition-colors ${
                          item.resolved ? "text-emerald-500" : "text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{item.resolved ? "Resolved" : "Mark Resolved"}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => deleteMistake(item.id)}
                      className="text-neutral-400 hover:text-rose-500 p-1 transition-colors"
                      title="Delete error log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Log New Mistake */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0c0e17] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="font-black text-sm uppercase text-neutral-950 dark:text-white">
                Log New Error in Notebook
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-500 font-mono mb-1">Subject</label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white font-medium"
                >
                  {syllabus.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-500 font-mono mb-1">Topic / Question Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Integration by parts with e^x, Q14 in Mock #2"
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-500 font-mono mb-1">Error Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as MistakeCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white font-medium"
                >
                  <option value="concept">Concept Error (Did not understand rule/theory)</option>
                  <option value="calculation">Calculation Slip (Algebraic/Arithmetic step error)</option>
                  <option value="silly">Silly Error (Sign error, misread question)</option>
                  <option value="time">Time Management (Ran out of time / rushed)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-500 font-mono mb-1">What went wrong?</label>
                <textarea
                  placeholder="e.g. Forgot to reverse the inequality when multiplying by a negative number..."
                  value={formWhatWentWrong}
                  onChange={(e) => setFormWhatWentWrong(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white h-20 resize-none font-medium"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="retryFlag"
                  checked={formRetryFlag}
                  onChange={(e) => setFormRetryFlag(e.target.checked)}
                  className="rounded border-neutral-400 accent-[#b8ff3c]"
                />
                <label htmlFor="retryFlag" className="text-neutral-700 dark:text-neutral-300 font-medium">
                  Queue for re-test in Today's Planner
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md"
                >
                  Save Error
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
