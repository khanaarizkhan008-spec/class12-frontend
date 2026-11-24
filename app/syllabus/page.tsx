"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { TopicStatus, Chapter, Topic, Subject } from "@/lib/types";
import { calculatePercentage } from "@/lib/utils";
import { QuizModal } from "@/components/QuizModal";
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  ArrowUpDown,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  FlaskConical,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  FileText,
  Search,
  Check,
  Award,
} from "lucide-react";

const STATUS_CONFIG: Record<
  TopicStatus,
  { label: string; badgeClass: string; nextStatus: TopicStatus }
> = {
  not_started: {
    label: "Not started",
    badgeClass: "bg-neutral-100 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-800",
    nextStatus: "learned",
  },
  learned: {
    label: "Learned",
    badgeClass: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 font-bold",
    nextStatus: "revised_1x",
  },
  revised_1x: {
    label: "Revised 1x",
    badgeClass: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 font-bold",
    nextStatus: "revised_2x",
  },
  revised_2x: {
    label: "Revised 2x",
    badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold",
    nextStatus: "exam_ready",
  },
  exam_ready: {
    label: "Exam-Ready",
    badgeClass: "bg-[#b8ff3c] text-neutral-950 font-black border-neutral-900 shadow-sm",
    nextStatus: "not_started",
  },
};

function SyllabusContent() {
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get("subject") || "maths";

  const {
    currentUser,
    openAuthModal,
    syllabus,
    updateTopicStatus,
    addChapter,
    renameChapter,
    deleteChapter,
    addTopic,
    renameTopic,
    deleteTopic,
    resetSyllabusToDefault,
  } = useAppStore();

  const [activeSubjectId, setActiveSubjectId] = useState<string>(initialSubject);
  const [activeTab, setActiveTab] = useState<"theory" | "practical">("theory");
  const [highWeightageFirst, setHighWeightageFirst] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Quiz Modal State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [activeQuizTarget, setActiveQuizTarget] = useState<{
    chapterId: string;
    chapterName: string;
    topicId: string;
    topicName: string;
  } | null>(null);

  // Edit Inline State
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [chapterEditName, setChapterEditName] = useState("");
  const [chapterEditWeightage, setChapterEditWeightage] = useState<number>(0);

  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [topicEditName, setTopicEditName] = useState("");

  const [newTopicChapterId, setNewTopicChapterId] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState("");

  const activeSubject = useMemo(
    () => syllabus.find((s) => s.id === activeSubjectId) || syllabus[0],
    [syllabus, activeSubjectId]
  );

  // Stats
  const { totalSubjectTopics, learnedSubjectTopics, subjectPct } = useMemo(() => {
    let total = 0;
    let learned = 0;
    activeSubject.units.forEach((u) => {
      u.chapters.forEach((c) => {
        c.topics.forEach((t) => {
          total++;
          if (t.status !== "not_started") learned++;
        });
      });
    });
    return {
      totalSubjectTopics: total,
      learnedSubjectTopics: learned,
      subjectPct: calculatePercentage(learned, total),
    };
  }, [activeSubject]);

  const handleStatusClick = (
    chapterId: string,
    chapterName: string,
    topic: Topic
  ) => {
    if (!currentUser) {
      openAuthModal(
        "login",
        `Please sign in or create an account to record your mastery for "${topic.name}" and start your revision schedule!`
      );
      return;
    }

    if (topic.status === "not_started") {
      setActiveQuizTarget({
        chapterId,
        chapterName,
        topicId: topic.id,
        topicName: topic.name,
      });
      setQuizModalOpen(true);
    } else {
      const next = STATUS_CONFIG[topic.status].nextStatus;
      updateTopicStatus(activeSubject.id, chapterId, topic.id, next, topic.isUnverified);
    }
  };

  const handleQuizSuccess = (unverified = false) => {
    if (!activeQuizTarget) return;
    updateTopicStatus(
      activeSubject.id,
      activeQuizTarget.chapterId,
      activeQuizTarget.topicId,
      "learned",
      unverified
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-200/80 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#b8ff3c] animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
              Official NCERT CBSE Class 12 Syllabus
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            Syllabus Command Center
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Interactive chapter tracker • 5-MCQ verification quizzes • Spaced repetition intervals
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm("Reset syllabus back to standard official CBSE Class 12 default?")) {
              resetSyllabusToDefault();
            }
          }}
          className="px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm self-start"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Default Syllabus</span>
        </button>
      </div>

      {/* 6 Subject Selector Tabs with Custom Accent Dots */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {syllabus.map((sub) => {
          const isActive = sub.id === activeSubjectId;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubjectId(sub.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 whitespace-nowrap border flex items-center gap-2.5 ${
                isActive
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-lg"
                  : "bg-white/80 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor: sub.color,
                  boxShadow: isActive ? `0 0 10px ${sub.color}` : "none",
                }}
              />
              <span>{sub.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Subject Banner & Progress Meter */}
      <div className="double-bezel">
        <div className="double-bezel-inner">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: activeSubject.color, boxShadow: `0 0 12px ${activeSubject.color}` }}
                />
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                  {activeSubject.name}
                </h2>
                <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  CODE {activeSubject.code}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Official CBSE theory units, chapter weightages & practical portfolios
              </p>
            </div>

            <div className="flex items-center gap-6 bg-neutral-100 dark:bg-neutral-900/80 px-6 py-4 rounded-3xl border border-neutral-200/80 dark:border-neutral-800">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Coverage</p>
                <p className="text-2xl font-black font-mono text-neutral-900 dark:text-white">
                  {subjectPct}%
                </p>
              </div>
              <div className="h-8 w-[1px] bg-neutral-300 dark:bg-neutral-800" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Learned</p>
                <p className="text-2xl font-black font-mono text-emerald-600 dark:text-[#b8ff3c]">
                  {learnedSubjectTopics} / {totalSubjectTopics}
                </p>
              </div>
            </div>
          </div>

          {/* Subject Progress Bar */}
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2.5 rounded-full mt-6 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${subjectPct}%`,
                backgroundColor: activeSubject.color,
              }}
            />
          </div>
        </div>
      </div>

      {/* Controls Bar: Theory vs Practical, High-Weightage Sort, Search & Filter */}
      <div className="double-bezel">
        <div className="double-bezel-inner py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Tab Switcher */}
            <div className="flex items-center p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setActiveTab("theory")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "theory"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                Theory Chapters
              </button>
              <button
                onClick={() => setActiveTab("practical")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "practical"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                Practical / Internal
              </button>
            </div>

            {/* High Weightage Sort Button */}
            {activeTab === "theory" && (
              <button
                onClick={() => setHighWeightageFirst(!highWeightageFirst)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  highWeightageFirst
                    ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-sm"
                    : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>High Weightage First</span>
              </button>
            )}
          </div>

          {/* Search & Filter */}
          {activeTab === "theory" && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#b8ff3c]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="not_started">Not started</option>
                <option value="learned">Learned</option>
                <option value="revised_1x">Revised 1x</option>
                <option value="revised_2x">Revised 2x</option>
                <option value="exam_ready">Exam-ready</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "practical" ? (
        /* Practical Assessment Tab */
        <div className="double-bezel">
          <div className="double-bezel-inner space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-bold shadow-md">
                <FlaskConical className="w-5 h-5 text-[#b8ff3c] dark:text-neutral-950" />
              </div>
              <div>
                <h3 className="font-black text-base text-neutral-900 dark:text-white tracking-tight">
                  Practical, Project & Internal Assessment
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  Official CBSE Class 12 components (Practical records, experiments, project file, viva voce)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSubject.practical.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 flex items-start gap-3 shadow-xs"
                >
                  <span className="w-6 h-6 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center text-xs font-mono font-black shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">
                      {item}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      CBSE Mandatory Internal Portfolio Item
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Theory Units & Chapters List */
        <div className="space-y-6">
          {activeSubject.units.map((unit) => {
            let chapters = [...unit.chapters];
            if (highWeightageFirst) {
              chapters.sort(
                (a, b) => (b.marksWeightage || 0) - (a.marksWeightage || 0)
              );
            }

            return (
              <div key={unit.id} className="space-y-4">
                {/* Unit Header */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#b8ff3c] rounded-full" />
                    <h3 className="text-xs font-black tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                      UNIT: {unit.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      const name = prompt(`Enter chapter name for unit "${unit.name}":`);
                      if (name) {
                        const marks = prompt("Enter chapter marks weightage (optional):", "6");
                        addChapter(activeSubject.id, unit.id, name, marks ? parseInt(marks) : 0);
                      }
                    }}
                    className="text-xs text-neutral-500 hover:text-neutral-950 dark:hover:text-white flex items-center gap-1 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Chapter</span>
                  </button>
                </div>

                {/* Chapters */}
                <div className="space-y-4">
                  {chapters.map((chapter) => {
                    const filteredTopics = chapter.topics.filter((t) => {
                      const matchesSearch = t.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase());
                      const matchesStatus =
                        statusFilter === "all" || t.status === statusFilter;
                      return matchesSearch && matchesStatus;
                    });

                    const chapTotal = chapter.topics.length;
                    const chapLearned = chapter.topics.filter(
                      (t) => t.status !== "not_started"
                    ).length;
                    const chapPct = calculatePercentage(chapLearned, chapTotal);

                    return (
                      <div key={chapter.id} className="double-bezel">
                        <div className="double-bezel-inner">
                          {/* Chapter Title Bar */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60">
                            <div className="space-y-1">
                              {editingChapterId === chapter.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={chapterEditName}
                                    onChange={(e) => setChapterEditName(e.target.value)}
                                    className="px-3 py-1 text-sm font-bold rounded-xl border border-neutral-300 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                                  />
                                  <input
                                    type="number"
                                    placeholder="Marks"
                                    value={chapterEditWeightage}
                                    onChange={(e) => setChapterEditWeightage(parseInt(e.target.value) || 0)}
                                    className="w-16 px-3 py-1 text-sm font-bold rounded-xl border border-neutral-300 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                                  />
                                  <button
                                    onClick={() => {
                                      renameChapter(activeSubject.id, chapter.id, chapterEditName, chapterEditWeightage);
                                      setEditingChapterId(null);
                                    }}
                                    className="px-3 py-1 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold"
                                  >
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2.5">
                                  <h4 className="font-black text-base text-neutral-900 dark:text-white tracking-tight">
                                    {chapter.name}
                                  </h4>
                                  {chapter.marksWeightage !== undefined && chapter.marksWeightage > 0 && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-bold border border-amber-500/20">
                                      {chapter.marksWeightage} MARKS
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center gap-2.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                                <span>
                                  {chapLearned} of {chapTotal} topics completed
                                </span>
                                <span>•</span>
                                <span className="font-bold font-mono text-neutral-900 dark:text-white">
                                  {chapPct}%
                                </span>
                              </div>
                            </div>

                            {/* Chapter Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingChapterId(chapter.id);
                                  setChapterEditName(chapter.name);
                                  setChapterEditWeightage(chapter.marksWeightage || 0);
                                }}
                                className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
                                title="Edit Chapter"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete chapter "${chapter.name}" and all its topics?`)) {
                                    deleteChapter(activeSubject.id, chapter.id);
                                  }
                                }}
                                className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                title="Delete Chapter"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setNewTopicChapterId(chapter.id)}
                                className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1 shadow-xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Topic</span>
                              </button>
                            </div>
                          </div>

                          {/* Chapter Progress Micro Bar */}
                          <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-1.5 rounded-full my-3 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${chapPct}%`,
                                backgroundColor: activeSubject.color,
                              }}
                            />
                          </div>

                          {/* Add Topic Input Inline */}
                          {newTopicChapterId === chapter.id && (
                            <div className="my-3 p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center gap-2 border border-neutral-200 dark:border-neutral-800">
                              <input
                                type="text"
                                placeholder="Enter topic name..."
                                value={newTopicName}
                                onChange={(e) => setNewTopicName(e.target.value)}
                                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                                autoFocus
                              />
                              <button
                                onClick={() => {
                                  if (newTopicName.trim()) {
                                    addTopic(activeSubject.id, chapter.id, newTopicName.trim());
                                    setNewTopicName("");
                                    setNewTopicChapterId(null);
                                  }
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => setNewTopicChapterId(null)}
                                className="px-2.5 py-1.5 text-xs text-neutral-500"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {/* Topics List */}
                          <div className="divide-y divide-neutral-200/50 dark:divide-neutral-800/50 mt-2">
                            {filteredTopics.length === 0 ? (
                              <p className="py-4 text-center text-xs text-neutral-400 font-mono">
                                No topics found matching search criteria.
                              </p>
                            ) : (
                              filteredTopics.map((topic) => {
                                const cfg = STATUS_CONFIG[topic.status];

                                return (
                                  <div
                                    key={topic.id}
                                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group"
                                  >
                                    {editingTopicId === topic.id ? (
                                      <div className="flex items-center gap-2 flex-1">
                                        <input
                                          type="text"
                                          value={topicEditName}
                                          onChange={(e) => setTopicEditName(e.target.value)}
                                          className="flex-1 px-3 py-1 text-xs rounded-xl border border-neutral-300 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                                        />
                                        <button
                                          onClick={() => {
                                            renameTopic(activeSubject.id, chapter.id, topic.id, topicEditName);
                                            setEditingTopicId(null);
                                          }}
                                          className="px-3 py-1 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold rounded-xl"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-start gap-2.5 flex-1 pr-2">
                                        <button
                                          onClick={() => handleStatusClick(chapter.id, chapter.name, topic)}
                                          className="mt-0.5 text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors"
                                          title="Click to advance status / take quiz"
                                        >
                                          {topic.status === "exam_ready" ? (
                                            <CheckCircle2 className="w-4 h-4 text-[#b8ff3c]" />
                                          ) : topic.status.startsWith("revised") ? (
                                            <Sparkles className="w-4 h-4 text-purple-500" />
                                          ) : topic.status === "learned" ? (
                                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                          ) : (
                                            <div className="w-4 h-4 rounded-full border border-neutral-400 dark:border-neutral-700 hover:border-[#b8ff3c] transition-colors" />
                                          )}
                                        </button>

                                        <div>
                                          <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 leading-snug">
                                            {topic.name}
                                          </p>
                                          {topic.isUnverified && (
                                            <span className="text-[10px] font-mono text-amber-500 font-bold">
                                              (Unverified Quiz)
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Right Controls: Status Chip & Topic Menu */}
                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                      <button
                                        onClick={() => handleStatusClick(chapter.id, chapter.name, topic)}
                                        className={`px-3 py-1 rounded-full border text-[11px] font-bold tracking-tight transition-all duration-200 active:scale-95 flex items-center gap-1.5 shadow-xs ${cfg.badgeClass}`}
                                        title={
                                          topic.status === "not_started"
                                            ? "Click to take 5-MCQ completion quiz"
                                            : `Current: ${cfg.label}. Click to advance.`
                                        }
                                      >
                                        {topic.status === "not_started" && <HelpCircle className="w-3 h-3" />}
                                        <span>{cfg.label}</span>
                                      </button>

                                      <button
                                        onClick={() => {
                                          setEditingTopicId(topic.id);
                                          setTopicEditName(topic.name);
                                        }}
                                        className="p-1 rounded text-neutral-400 hover:text-neutral-950 dark:hover:text-white opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                        title="Rename Topic"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirm(`Delete topic "${topic.name}"?`)) {
                                            deleteTopic(activeSubject.id, chapter.id, topic.id);
                                          }
                                        }}
                                        className="p-1 rounded text-neutral-400 hover:text-rose-600 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                        title="Delete Topic"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5-MCQ Quiz Modal */}
      {activeQuizTarget && (
        <QuizModal
          isOpen={quizModalOpen}
          onClose={() => {
            setQuizModalOpen(false);
            setActiveQuizTarget(null);
          }}
          subjectId={activeSubject.id}
          subjectName={activeSubject.name}
          chapterId={activeQuizTarget.chapterId}
          chapterName={activeQuizTarget.chapterName}
          topicId={activeQuizTarget.topicId}
          topicName={activeQuizTarget.topicName}
          onSuccess={handleQuizSuccess}
        />
      )}
    </div>
  );
}

export default function SyllabusPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center font-mono text-xs text-neutral-400">
          Loading CBSE Syllabus...
        </div>
      }
    >
      <SyllabusContent />
    </Suspense>
  );
}
