"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { calculatePercentage, getDaysRemaining } from "@/lib/utils";
import CBSEBrandHero from "@/components/ui/cbse-brand-hero";
import { QuizModal } from "@/components/QuizModal";
import {
  BookOpenCheck,
  LineChart,
  CalendarClock,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Target,
  Flame,
  CheckCircle2,
  BrainCircuit,
  ChevronRight,
  Zap,
  Send,
  HelpCircle,
  Award,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const {
    currentUser,
    openAuthModal,
    syllabus,
    mockTests,
    quizHistory,
    plannerTasks,
    revisionSchedule,
    settings,
    studySessions,
    updateTopicStatus,
    toggleTask,
  } = useAppStore();

  const [aiDoubtInput, setAiDoubtInput] = useState("");
  const [activeQuiz, setActiveQuiz] = useState<{
    subjectId: string;
    subjectName: string;
    chapterId: string;
    chapterName: string;
    topicId: string;
    topicName: string;
    revisionId?: string;
  } | null>(null);

  // Compute metrics
  let totalTopics = 0;
  let learnedTopics = 0;
  let revisedTopics = 0;

  const subjectStats = syllabus.map((sub) => {
    let subTotal = 0;
    let subLearned = 0;
    sub.units.forEach((u) => {
      u.chapters.forEach((c) => {
        c.topics.forEach((t) => {
          subTotal++;
          if (t.status !== "not_started") {
            subLearned++;
          }
          if (t.status.startsWith("revised") || t.status === "exam_ready") {
            revisedTopics++;
          }
        });
      });
    });
    totalTopics += subTotal;
    learnedTopics += subLearned;
    const pct = calculatePercentage(subLearned, subTotal);
    return { ...sub, subTotal, subLearned, pct };
  });

  const overallPercentage = calculatePercentage(learnedTopics, totalTopics);

  // Weakest subject calculation
  const sortedByProgress = [...subjectStats].sort((a, b) => a.pct - b.pct);
  const weakestSubject = sortedByProgress[0];

  // Exam Countdown
  const daysToFirstExam = settings.firstExamDate
    ? getDaysRemaining(settings.firstExamDate)
    : 45;

  // Study hours this week (last 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const totalMinutesThisWeek = studySessions
    .filter((s) => new Date(s.date) >= sevenDaysAgo)
    .reduce((acc, curr) => acc + curr.minutes, 0);
  const hoursThisWeek = (totalMinutesThisWeek / 60).toFixed(1);

  // Today's revisions due
  const todayStr = new Date().toISOString().split("T")[0];
  const dueRevisions = revisionSchedule.filter(
    (r) => !r.completed && r.dueDate <= todayStr
  );

  // Mock test trajectory
  const latestMock = mockTests.length > 0 ? mockTests[mockTests.length - 1] : null;

  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiDoubtInput.trim()) return;
    router.push(`/doubt-bot?q=${encodeURIComponent(aiDoubtInput.trim())}`);
  };

  const handlePromptClick = (prompt: string) => {
    router.push(`/doubt-bot?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Eye-Catching Figma Brand Hero */}
      <CBSEBrandHero
        daysToFirstExam={daysToFirstExam > 0 ? daysToFirstExam : 0}
        overallPercentage={overallPercentage}
        learnedTopics={learnedTopics}
        totalTopics={totalTopics}
      />

      {/* Groq AI Rapid Doubt Solver Command Bar */}
      <div className="double-bezel">
        <div className="double-bezel-inner">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#b8ff3c] text-neutral-950 flex items-center justify-center font-bold shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-neutral-900 dark:text-white flex items-center gap-2">
                  <span>Groq AI CBSE Doubt Solver</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#b8ff3c]/20 text-emerald-800 dark:text-[#b8ff3c] font-mono">
                    STREAMING SSE
                  </span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Instant step-by-step NCERT solutions with LaTeX formulas and marking tips
                </p>
              </div>
            </div>

            <form onSubmit={handleAskAi} className="flex-1 max-w-xl flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={aiDoubtInput}
                  onChange={(e) => setAiDoubtInput(e.target.value)}
                  placeholder="Ask any doubt... e.g., 'Derive Gauss Law & electric field of line charge'"
                  className="w-full px-4 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-900/90 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#b8ff3c] focus:ring-1 focus:ring-[#b8ff3c] transition-all pr-10 font-medium"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 p-1.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:scale-105 active:scale-95 transition-all"
                  title="Ask Doubt"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* Quick High-Yield Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-neutral-200/60 dark:border-neutral-800/60">
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
              Quick High-Yield Doubts:
            </span>
            {[
              "Gauss Law Application",
              "Integrate sin³(x) dx",
              "Aldol Condensation Mechanism",
              "SQL GROUP BY vs HAVING",
              "Notice Writing Marking Scheme",
              "Newton's Laws in Sports",
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(p)}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-neutral-100 dark:bg-white/[0.04] text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-[#b8ff3c] hover:bg-neutral-200 dark:hover:bg-white/[0.08] border border-neutral-200 dark:border-neutral-800 transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary KPI Bento Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Overall Progress */}
        <div className="double-bezel">
          <div className="double-bezel-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Syllabus
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <BookOpenCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-neutral-900 dark:text-white">
                {learnedTopics}
              </span>
              <span className="text-xs text-neutral-400 font-mono">/ {totalTopics}</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-[#b8ff3c] h-full rounded-full transition-all duration-700"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px] font-mono font-bold text-neutral-500">
              <span>{overallPercentage}% Ready</span>
              <span>100% NCERT</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Focus Subject */}
        <div className="double-bezel">
          <div className="double-bezel-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Focus Subject
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-base font-black text-neutral-900 dark:text-white truncate">
              {weakestSubject?.name || "All Balanced"}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-mono font-bold">
              {weakestSubject ? `${weakestSubject.pct}% coverage` : "Optimal prep"}
            </p>
            <div className="mt-3">
              <Link
                href={`/syllabus?subject=${weakestSubject?.id || "maths"}`}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Study High-Weightage Chapters</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* KPI 3: Study Velocity */}
        <div className="double-bezel">
          <div className="double-bezel-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                This Week
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-neutral-900 dark:text-white">
                {hoursThisWeek}
              </span>
              <span className="text-xs text-neutral-400 font-mono">hrs logged</span>
            </div>
            <p className="text-xs text-neutral-500 mt-2 font-medium">
              Pomodoro focus sessions
            </p>
            <div className="mt-3">
              <Link
                href="/planner"
                className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>Start 25m Pomodoro</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* KPI 4: 5-MCQ Groq AI Verification */}
        <div className="double-bezel">
          <div className="double-bezel-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Quizzes Verified
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#b8ff3c]/20 text-emerald-800 dark:text-[#b8ff3c] flex items-center justify-center font-bold">
                <BrainCircuit className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-neutral-900 dark:text-white">
                {quizHistory.length}
              </span>
              <span className="text-xs text-emerald-600 dark:text-[#b8ff3c] font-mono font-bold">
                {quizHistory.filter((q) => q.passed).length} passed (4/5)
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-2 font-medium">
              CBSE board-level checks
            </p>
            <div className="mt-3">
              <Link
                href="/syllabus"
                className="text-[11px] font-bold text-emerald-600 dark:text-[#b8ff3c] hover:underline flex items-center gap-1"
              >
                <span>Take Topic Quizzes</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Subject Holographic Mastery Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#b8ff3c]" />
            <h2 className="text-base font-black text-neutral-900 dark:text-white tracking-tight">
              6-Subject Command Matrix
            </h2>
          </div>
          <Link
            href="/syllabus"
            className="text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white flex items-center gap-1"
          >
            <span>View Full Syllabus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectStats.map((sub) => (
            <Link
              key={sub.id}
              href={`/syllabus?subject=${sub.id}`}
              className="double-bezel group block hover:-translate-y-1 transition-all duration-300"
            >
              <div className="double-bezel-inner">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{
                        backgroundColor: sub.color,
                        boxShadow: `0 0 12px ${sub.color}`,
                      }}
                    />
                    <span className="font-black text-sm text-neutral-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-[#b8ff3c] transition-colors">
                      {sub.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-black text-neutral-900 dark:text-white">
                    {sub.pct}%
                  </span>
                </div>

                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${sub.pct}%`,
                      backgroundColor: sub.color,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  <span>{sub.subLearned} of {sub.subTotal} topics learned</span>
                  <span className="text-neutral-400 font-mono font-bold">Code {sub.code}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bento Row 2: Revise Today & Quick Launchpad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revise Today List with Direct 5-MCQ Quiz trigger */}
        <div className="double-bezel flex flex-col">
          <div className="double-bezel-inner flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60 mb-4">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-[#b8ff3c]" />
                  <h3 className="font-black text-sm text-neutral-900 dark:text-white">
                    Revise Today (3-7-21 Spaced Repetition)
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#b8ff3c]/20 text-emerald-800 dark:text-[#b8ff3c] text-xs font-mono font-bold">
                  {dueRevisions.length} Due
                </span>
              </div>

              {dueRevisions.length === 0 ? (
                <div className="py-8 text-center text-neutral-400 text-xs flex flex-col items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mb-2" />
                  <p className="font-bold text-neutral-800 dark:text-neutral-200 text-sm">
                    All caught up! No spaced revisions due right now.
                  </p>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                    Complete syllabus topics via 5-MCQ quizzes to automatically schedule 3, 7, and 21 day retention checks.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {dueRevisions.slice(0, 4).map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between shadow-xs"
                    >
                      <div>
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">
                          {rev.topicName}
                        </p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          {rev.subjectName} • Day {rev.intervalDay} interval
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            openAuthModal("login", "Please sign in or create an account to start revision quizzes and track progress!");
                            return;
                          }
                          const sub = syllabus.find((s) => s.id === rev.subjectId);
                          let chName = "";
                          let chId = "";
                          sub?.units.forEach((u) => {
                            u.chapters.forEach((c) => {
                              if (c.topics.some((t) => t.id === rev.topicId)) {
                                chName = c.name;
                                chId = c.id;
                              }
                            });
                          });
                          setActiveQuiz({
                            subjectId: rev.subjectId,
                            subjectName: rev.subjectName,
                            chapterId: chId || "ch-1",
                            chapterName: chName || "Chapter",
                            topicId: rev.topicId,
                            topicName: rev.topicName,
                            revisionId: rev.id,
                          });
                        }}
                        className="px-3.5 py-1 text-xs font-bold rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:scale-105 active:scale-95 transition-all shadow-sm"
                      >
                        Take 5-MCQ
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/planner"
              className="mt-4 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60 text-xs font-bold text-neutral-500 hover:text-neutral-950 dark:hover:text-white flex items-center justify-between"
            >
              <span>Open Planner & Revision Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Launchpad Vault */}
        <div className="double-bezel flex flex-col">
          <div className="double-bezel-inner flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-black text-sm text-neutral-900 dark:text-white pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60 mb-4">
                Core Module Launchpad
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/mocks"
                  className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 hover:scale-[1.02] transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <LineChart className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-black text-neutral-900 dark:text-white">
                    Mock Tests
                  </p>
                  <p className="text-[10px] text-neutral-500">Score trajectories & 90% target</p>
                </Link>

                <Link
                  href="/planner"
                  className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 hover:scale-[1.02] transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Clock className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-black text-neutral-900 dark:text-white">
                    Pomodoro Timer
                  </p>
                  <p className="text-[10px] text-neutral-500">Study hours & task queue</p>
                </Link>

                <Link
                  href="/mistakes"
                  className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 hover:scale-[1.02] transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-black text-neutral-900 dark:text-white">
                    Mistake Notebook
                  </p>
                  <p className="text-[10px] text-neutral-500">Concept error correction</p>
                </Link>

                <Link
                  href="/extras"
                  className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 hover:scale-[1.02] transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#b8ff3c]/20 text-emerald-800 dark:text-[#b8ff3c] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-black text-neutral-900 dark:text-white">
                    Subject Vault
                  </p>
                  <p className="text-[10px] text-neutral-500">Formulas, reactions, writing</p>
                </Link>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 text-center pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60 mt-4 font-mono">
              Offline-first • Synchronizing to SQLite backend
            </p>
          </div>
        </div>
      </div>

      {/* Quiz Modal for Due Revisions */}
      {activeQuiz && (
        <QuizModal
          isOpen={true}
          onClose={() => setActiveQuiz(null)}
          subjectId={activeQuiz.subjectId}
          subjectName={activeQuiz.subjectName}
          chapterId={activeQuiz.chapterId}
          chapterName={activeQuiz.chapterName}
          topicId={activeQuiz.topicId}
          topicName={activeQuiz.topicName}
          onSuccess={(unverified) => {
            if (activeQuiz.revisionId) {
              toggleTask(activeQuiz.revisionId);
            } else {
              updateTopicStatus(
                activeQuiz.subjectId,
                activeQuiz.chapterId,
                activeQuiz.topicId,
                "learned",
                unverified
              );
            }
            setActiveQuiz(null);
          }}
        />
      )}
    </div>
  );
}
