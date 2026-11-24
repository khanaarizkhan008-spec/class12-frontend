"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Clock,
  BookOpen,
  RotateCcw,
  Zap,
  Target,
  CheckCircle2,
  Flame,
} from "lucide-react";

export default function CBSEBrandHero({
  daysToFirstExam,
  overallPercentage,
  learnedTopics,
  totalTopics,
}: {
  daysToFirstExam: number;
  overallPercentage: number;
  learnedTopics: number;
  totalTopics: number;
}) {
  const [animationKey, setAnimationKey] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      setTimeLeft({
        hours: 23 - now.getHours(),
        minutes: 59 - now.getMinutes(),
        seconds: 59 - now.getSeconds(),
      });
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleReplay = () => {
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div
      key={animationKey}
      className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center py-10 px-5 sm:px-10 lg:px-14 bg-[#f8f9f5] dark:bg-[#07090f] bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1b2030_1px,transparent_1px),linear-gradient(to_bottom,#1b2030_1px,transparent_1px)] bg-[size:28px_28px] rounded-[2.5rem] overflow-hidden border border-neutral-200/90 dark:border-white/[0.08] transition-colors duration-300 shadow-2xl my-2"
    >
      {/* Ambient Neon Lime & Electric Orbs */}
      <div className="absolute top-0 right-1/4 -mt-20 w-80 h-80 bg-[#b8ff3c]/20 dark:bg-[#b8ff3c]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 -mb-20 w-96 h-96 bg-blue-500/15 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Pill Badge + Replay Trigger */}
      <div className="w-full flex items-center justify-between z-10 mb-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-[11px] font-bold text-neutral-900 dark:text-neutral-100 shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-[#b8ff3c] animate-pulse" />
          <span>CBSE CLASS 12 • MISSION 2026</span>
          <span className="text-neutral-400 dark:text-neutral-500">|</span>
          <span className="text-emerald-600 dark:text-[#b8ff3c]">TARGET 95%+</span>
        </motion.div>

        <button
          onClick={handleReplay}
          className="group flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white bg-white/60 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 backdrop-blur-md transition-all active:scale-95"
          title="Replay intro animation"
        >
          <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-90 transition-transform duration-300" />
          <span className="hidden sm:inline text-[11px]">Replay</span>
        </button>
      </div>

      {/* Main Bold Figma-Style Typography Stack */}
      <div className="flex flex-col items-center font-black tracking-tighter text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-neutral-950 dark:text-white leading-[0.95] text-center select-none z-10 max-w-4xl">
        <motion.span
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          YOUR BOARD PREP
        </motion.span>

        <motion.span
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-neutral-500 dark:text-neutral-400 text-2xl sm:text-4xl md:text-5xl my-1"
        >
          DESERVES A
        </motion.span>

        {/* Highlighted Bounding Box Row with 4 Figma Corner Handles */}
        <div className="relative my-2 sm:my-3 px-4 py-1.5">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-[#c8ff29] dark:bg-[#b8ff3c] origin-left border border-neutral-900 shadow-md"
          />

          {/* 4 Figma-style Corner Handles */}
          {["-top-1.5 -left-1.5", "-top-1.5 -right-1.5", "-bottom-1.5 -left-1.5", "-bottom-1.5 -right-1.5"].map(
            (pos, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.65 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className={`absolute ${pos} w-2.5 h-2.5 bg-white dark:bg-neutral-950 border border-neutral-900 dark:border-neutral-100 z-20 shadow-xs`}
              />
            )
          )}
          <span className="relative z-10 text-neutral-950 font-black tracking-tight">
            WORLD-CLASS
          </span>
        </div>

        <motion.span
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 dark:from-white dark:via-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent"
        >
          COMMAND CENTER
        </motion.span>
      </div>

      {/* Subtitle */}
      <motion.p
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 text-center text-sm sm:text-base text-neutral-600 dark:text-neutral-300 max-w-2xl font-normal leading-relaxed z-10"
      >
        Track 100% NCERT syllabus with verified 5-MCQ completion quizzes, 3-7-21 spaced repetition, mock trajectory analytics, and 24/7 Groq AI doubt solving.
      </motion.p>

      {/* Action CTAs: Button-in-Button architecture */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center justify-center gap-4 mt-7 z-10"
      >
        <Link
          href="/syllabus"
          className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl"
        >
          <span>Explore Syllabus Tracker</span>
          <div className="w-6 h-6 rounded-full bg-white/20 dark:bg-neutral-950/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/doubt-bot"
          className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white/90 dark:bg-neutral-900/90 text-neutral-900 dark:text-neutral-100 font-bold text-xs uppercase tracking-wider border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-sm backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-[#b8ff3c] group-hover:rotate-12 transition-transform" />
          <span>Ask Doubt AI</span>
        </Link>
      </motion.div>

      {/* Live Telemetry Radar Dock */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl mt-8 pt-6 border-t border-neutral-200/80 dark:border-neutral-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 z-10"
      >
        {/* Metric 1: Exam Countdown */}
        <div className="flex flex-col items-center sm:items-start p-3 rounded-2xl bg-white/60 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>First Paper</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1 font-mono font-black text-2xl text-neutral-900 dark:text-white">
            <span>{daysToFirstExam > 0 ? daysToFirstExam : 0}</span>
            <span className="text-[10px] font-normal text-neutral-500 uppercase">days</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
            {String(timeLeft.hours).padStart(2, "0")}h {String(timeLeft.minutes).padStart(2, "0")}m {String(timeLeft.seconds).padStart(2, "0")}s
          </span>
        </div>

        {/* Metric 2: Syllabus Coverage */}
        <div className="flex flex-col items-center sm:items-start p-3 rounded-2xl bg-white/60 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
            <BookOpen className="w-3 h-3 text-blue-500" />
            <span>Coverage</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1 font-mono font-black text-2xl text-blue-600 dark:text-blue-400">
            <span>{overallPercentage}%</span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-[#b8ff3c] h-full rounded-full transition-all duration-700"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Topics Mastered */}
        <div className="flex flex-col items-center sm:items-start p-3 rounded-2xl bg-white/60 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Mastered</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1 font-mono font-black text-2xl text-neutral-900 dark:text-white">
            <span>{learnedTopics}</span>
            <span className="text-[10px] font-normal text-neutral-500">/ {totalTopics}</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            5-MCQ Verified
          </span>
        </div>

        {/* Metric 4: AI Tutor Ready */}
        <div className="flex flex-col items-center sm:items-start p-3 rounded-2xl bg-white/60 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
            <Zap className="w-3 h-3 text-purple-500" />
            <span>Groq AI LPU</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 font-mono font-bold text-sm text-neutral-900 dark:text-white">
            <span className="w-2 h-2 rounded-full bg-[#b8ff3c] animate-pulse" />
            <span>Online</span>
          </div>
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
            CBSE 6 Subjects Ready
          </span>
        </div>
      </motion.div>
    </div>
  );
}
