"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { formatTime, formatDate, getDaysRemaining, getTodayDateString } from "@/lib/utils";
import { QuizModal } from "@/components/QuizModal";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Flame,
  BrainCircuit,
  Trash2,
  CalendarClock,
  AlarmClock,
  Check,
  ChevronRight,
} from "lucide-react";

export default function PlannerPage() {
  const {
    currentUser,
    openAuthModal,
    plannerTasks,
    addPlannerTask,
    toggleTask,
    deletePlannerTask,
    revisionSchedule,
    studySessions,
    logStudySession,
    syllabus,
    settings,
  } = useAppStore();

  const todayStr = getTodayDateString();

  // Pomodoro Timer State
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60); // 25 min default
  const [timerSubjectId, setTimerSubjectId] = useState("maths");
  const [timerInitialMins, setTimerInitialMins] = useState(25);

  // Quick Quiz Modal for Due Revision
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizTarget, setQuizTarget] = useState<{
    subjectId: string;
    subjectName: string;
    chapterId: string;
    chapterName: string;
    topicId: string;
    topicName: string;
  } | null>(null);

  // Manual Task input
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskSubject, setNewTaskSubject] = useState("maths");

  // Pomodoro countdown effect
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timerRunning && secondsRemaining === 0) {
      // Completed timer!
      setTimerRunning(false);
      logStudySession({
        subjectId: timerSubjectId,
        date: todayStr,
        minutes: timerInitialMins,
        notes: `Pomodoro session (${timerInitialMins}m)`,
      });
      alert(`🎉 Focus session complete! Logged ${timerInitialMins} minutes for ${syllabus.find((s) => s.id === timerSubjectId)?.name}.`);
      setSecondsRemaining(timerInitialMins * 60);
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsRemaining, timerSubjectId, timerInitialMins, todayStr, logStudySession, syllabus]);

  const toggleTimer = () => setTimerRunning(!timerRunning);

  const resetTimer = (mins = 25) => {
    setTimerRunning(false);
    setTimerInitialMins(mins);
    setSecondsRemaining(mins * 60);
  };

  const timerDisplay = useMemo(() => {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, [secondsRemaining]);

  // Due revisions (3, 7, 21 days)
  const dueRevisions = useMemo(() => {
    return revisionSchedule.filter((r) => !r.completed && r.dueDate <= todayStr);
  }, [revisionSchedule, todayStr]);

  // Weekly study hours per subject (last 7 days)
  const weeklySubjectData = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentSessions = studySessions.filter((s) => new Date(s.date) >= sevenDaysAgo);

    return syllabus.map((sub) => {
      const minutes = recentSessions
        .filter((s) => s.subjectId === sub.id)
        .reduce((sum, s) => sum + s.minutes, 0);
      return {
        name: sub.name.split(" ")[0],
        hours: parseFloat((minutes / 60).toFixed(1)),
        fill: sub.color,
      };
    });
  }, [studySessions, syllabus]);

  // Exam Countdown Datesheet
  const examDatesheetEntries = useMemo(() => {
    return syllabus.map((sub) => {
      const examDateStr = settings.examDatesheet?.[sub.id] || settings.firstExamDate;
      const daysLeft = examDateStr ? getDaysRemaining(examDateStr) : 0;
      return {
        ...sub,
        examDate: examDateStr,
        daysLeft,
      };
    });
  }, [syllabus, settings]);

  const handleAddManualTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addPlannerTask({
      title: newTaskTitle.trim(),
      subjectId: newTaskSubject,
      source: "manual",
      date: todayStr,
      completed: false,
      priority: "medium",
    });
    setNewTaskTitle("");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-200/80 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#b8ff3c] animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
              Schedule & Focus Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            Daily & Weekly Study Planner
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Spaced repetition engine • Pomodoro focus logger • Datesheet paper countdowns
          </p>
        </div>
      </div>

      {/* Row 1: Pomodoro Study Timer & Exam Datesheet Countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pomodoro Timer */}
        <div className="double-bezel">
          <div className="double-bezel-inner flex flex-col justify-between h-full">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60">
              <div className="flex items-center gap-2">
                <AlarmClock className="w-4 h-4 text-[#b8ff3c]" />
                <h3 className="font-black text-sm uppercase text-neutral-900 dark:text-white">
                  Pomodoro Focus Timer
                </h3>
              </div>
              <select
                value={timerSubjectId}
                onChange={(e) => setTimerSubjectId(e.target.value)}
                className="px-3 py-1 text-xs font-bold rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
              >
                {syllabus.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Digital Clock Display */}
            <div className="my-8 text-center space-y-3">
              <div className="inline-block px-10 py-5 rounded-3xl bg-neutral-100 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-inner">
                <span className="text-6xl sm:text-7xl font-black font-mono tracking-tighter text-neutral-950 dark:text-white">
                  {timerDisplay}
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-mono">
                Active Subject: <strong className="text-neutral-900 dark:text-white">{syllabus.find((s) => s.id === timerSubjectId)?.name}</strong>
              </p>
            </div>

            {/* Timer Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => resetTimer(25)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold border transition-all ${
                    timerInitialMins === 25
                      ? "bg-neutral-950 text-white dark:bg-[#b8ff3c] dark:text-neutral-950 border-neutral-950 dark:border-[#b8ff3c] shadow-sm"
                      : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  25m Standard
                </button>
                <button
                  onClick={() => resetTimer(50)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold border transition-all ${
                    timerInitialMins === 50
                      ? "bg-neutral-950 text-white dark:bg-[#b8ff3c] dark:text-neutral-950 border-neutral-950 dark:border-[#b8ff3c] shadow-sm"
                      : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  50m Deep Work
                </button>
                <button
                  onClick={() => resetTimer(5)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold border transition-all ${
                    timerInitialMins === 5
                      ? "bg-neutral-950 text-white dark:bg-[#b8ff3c] dark:text-neutral-950 border-neutral-950 dark:border-[#b8ff3c] shadow-sm"
                      : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  5m Break
                </button>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={toggleTimer}
                  className="px-7 py-3 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{timerRunning ? "Pause Session" : "Start Session"}</span>
                </button>
                <button
                  onClick={() => resetTimer(timerInitialMins)}
                  className="p-3 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                  title="Reset timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Paper Countdown Datesheet */}
        <div className="double-bezel">
          <div className="double-bezel-inner flex flex-col justify-between h-full">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60">
              <h3 className="font-black text-sm uppercase text-neutral-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-500" />
                CBSE Class 12 Datesheet Countdown
              </h3>
              <span className="text-[10px] font-mono text-neutral-400">
                Days Left per Paper
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
              {examDatesheetEntries.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-1 shadow-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {item.name}
                    </p>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-2xl font-black font-mono text-neutral-950 dark:text-white">
                      {item.daysLeft > 0 ? item.daysLeft : 0}
                    </span>
                    <span className="text-[9px] font-mono uppercase text-neutral-400">
                      Days left
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 font-mono truncate">
                    Date: {item.examDate || "TBA"}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-neutral-500 font-mono text-center pt-2">
              Tip: Customize your exam datesheet in Settings.
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Today's Task List & Weekly Hours Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="double-bezel">
          <div className="double-bezel-inner space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60">
              <div>
                <h3 className="font-black text-sm uppercase text-neutral-900 dark:text-white">
                  Today's Action Checklist
                </h3>
                <p className="text-[11px] text-neutral-500 font-mono">
                  Auto-populated from revisions, failed quizzes & manual goals
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#b8ff3c]/20 text-emerald-800 dark:text-[#b8ff3c] text-xs font-mono font-bold">
                {plannerTasks.filter((t) => t.completed).length} / {plannerTasks.length} DONE
              </span>
            </div>

            {/* Add Manual Task Form */}
            <form onSubmit={handleAddManualTask} className="flex gap-2 text-xs">
              <input
                type="text"
                placeholder="Add today's study target (e.g., Solve 5 integration PYQs)..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white font-medium"
              />
              <select
                value={newTaskSubject}
                onChange={(e) => setNewTaskSubject(e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white font-mono text-[11px]"
              >
                {syllabus.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name.split(" ")[0]}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Tasks List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {plannerTasks.length === 0 ? (
                <p className="py-6 text-center text-xs text-neutral-400 font-mono">
                  No tasks for today. Add one above or schedule spaced revisions!
                </p>
              ) : (
                plannerTasks.map((task) => {
                  const sub = syllabus.find((s) => s.id === task.subjectId);
                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        task.completed
                          ? "bg-neutral-100/50 dark:bg-neutral-900/30 border-neutral-200 dark:border-neutral-800 opacity-60"
                          : "bg-neutral-50 dark:bg-neutral-900/70 border-neutral-200 dark:border-neutral-800 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 flex-1">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                            task.completed
                              ? "bg-[#10b981] border-[#10b981] text-white"
                              : "border-neutral-400 hover:border-neutral-900 dark:hover:border-white"
                          }`}
                        >
                          {task.completed && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <div>
                          <p
                            className={`text-xs font-bold ${
                              task.completed
                                ? "line-through text-neutral-400"
                                : "text-neutral-900 dark:text-white"
                            }`}
                          >
                            {task.title}
                          </p>
                          {sub && (
                            <span
                              className="text-[10px] font-mono font-bold"
                              style={{ color: sub.color }}
                            >
                              {sub.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => deletePlannerTask(task.id)}
                        className="text-neutral-400 hover:text-rose-500 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Weekly Study Hours per Subject Bar Chart */}
        <div className="double-bezel">
          <div className="double-bezel-inner space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60">
              <div>
                <h3 className="font-black text-sm uppercase text-neutral-900 dark:text-white">
                  Weekly Study Hours Distribution
                </h3>
                <p className="text-[11px] text-neutral-500 font-mono">
                  Last 7 days logged via Pomodoro timer
                </p>
              </div>
              <Clock className="w-4 h-4 text-purple-500" />
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySubjectData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.25} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0c0e17",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                    formatter={(val: any) => [`${val} hrs`, "Time"]}
                  />
                  <Bar dataKey="hours" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Spaced Repetition Due Today List */}
      <div className="double-bezel">
        <div className="double-bezel-inner space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60">
            <div>
              <h3 className="font-black text-sm uppercase text-neutral-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#b8ff3c]" />
                Spaced Revision Queue (3, 7, 21 Days Engine)
              </h3>
              <p className="text-[11px] text-neutral-500 font-mono">
                Topics scheduled for active recall after quiz completion
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#b8ff3c]/20 text-emerald-800 dark:text-[#b8ff3c] text-xs font-mono font-bold">
              {dueRevisions.length} DUE TODAY
            </span>
          </div>

          {dueRevisions.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto" />
              <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                No spaced revisions due today!
              </p>
              <p className="text-[11px] text-neutral-500 font-mono">
                Complete more topics with the 5-MCQ quiz to populate your revision calendar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dueRevisions.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: rev.subjectColor }}
                      />
                      <p className="text-xs font-bold text-neutral-900 dark:text-white">
                        {rev.topicName}
                      </p>
                    </div>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                      {rev.subjectName} • Day {rev.intervalDay} Spaced Interval
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setQuizTarget({
                        subjectId: rev.subjectId,
                        subjectName: rev.subjectName,
                        chapterId: rev.chapterId,
                        chapterName: rev.chapterName,
                        topicId: rev.topicId,
                        topicName: rev.topicName,
                      });
                      setQuizModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-black uppercase font-mono tracking-wider shadow-sm hover:scale-105 active:scale-95 transition-all"
                  >
                    Quick Quiz
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quiz Modal for quick revision */}
      {quizTarget && (
        <QuizModal
          isOpen={quizModalOpen}
          onClose={() => {
            setQuizModalOpen(false);
            setQuizTarget(null);
          }}
          subjectId={quizTarget.subjectId}
          subjectName={quizTarget.subjectName}
          chapterId={quizTarget.chapterId}
          chapterName={quizTarget.chapterName}
          topicId={quizTarget.topicId}
          topicName={quizTarget.topicName}
          onSuccess={() => {
            const found = revisionSchedule.find((r) => r.topicId === quizTarget.topicId);
            if (found) toggleTask(found.id);
          }}
        />
      )}
    </div>
  );
}
