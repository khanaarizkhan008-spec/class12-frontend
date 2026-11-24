"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useAppStore } from "@/lib/store";
import {
  Sparkles,
  RefreshCw,
  Flame,
  CheckCircle2,
  AlertCircle,
  Menu,
  GraduationCap,
  Command,
  User,
  LogOut,
} from "lucide-react";

export function Navbar({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
  const {
    currentUser,
    openAuthModal,
    logout,
    isSyncing,
    lastSyncedAt,
    syncWithBackend,
    studySessions,
  } = useAppStore();
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle");

  const studyDates = Array.from(new Set(studySessions.map((s) => s.date))).sort().reverse();
  const streakDays = studyDates.length > 0 ? Math.min(studyDates.length, 7) : 1;

  const handleSync = async () => {
    setSyncStatus("idle");
    const res = await syncWithBackend();
    if (res.success) {
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } else {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 4000);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/70 dark:bg-[#07090f]/75 border-b border-neutral-200/80 dark:border-white/[0.06] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Mobile menu toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-2xl bg-neutral-950 dark:bg-neutral-900 border border-neutral-800 p-[1.5px] shadow-lg shadow-neutral-900/20 group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-[#b8ff3c]/20 blur-sm pointer-events-none" />
              <GraduationCap className="w-5 h-5 text-[#b8ff3c] group-hover:rotate-6 transition-transform duration-300 relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight text-neutral-950 dark:text-white">
                  CBSE 12
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#b8ff3c]/15 text-emerald-800 dark:text-[#b8ff3c] border border-[#b8ff3c]/30 tracking-wider uppercase">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium hidden sm:block tracking-tight">
                Mission 95%+ Command Center
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Nav Shortcut Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full bg-neutral-100/70 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/[0.06] text-xs font-semibold">
          <Link
            href="/syllabus"
            className="px-3.5 py-1 rounded-full text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.08] transition-all"
          >
            Syllabus
          </Link>
          <Link
            href="/mocks"
            className="px-3.5 py-1 rounded-full text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.08] transition-all"
          >
            Mocks
          </Link>
          <Link
            href="/planner"
            className="px-3.5 py-1 rounded-full text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.08] transition-all"
          >
            Planner
          </Link>
          <Link
            href="/mistakes"
            className="px-3.5 py-1 rounded-full text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.08] transition-all"
          >
            Mistakes
          </Link>
          <Link
            href="/extras"
            className="px-3.5 py-1 rounded-full text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.08] transition-all"
          >
            Vault
          </Link>
          <Link
            href="/doubt-bot"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-neutral-900 dark:text-white bg-[#b8ff3c]/20 hover:bg-[#b8ff3c]/30 text-emerald-900 dark:text-[#b8ff3c] border border-[#b8ff3c]/30 transition-all font-bold"
          >
            <Sparkles className="w-3 h-3 text-[#b8ff3c]" />
            <span>AI Tutor</span>
          </Link>
        </div>

        {/* Right side controls: Streak, Sync button, Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Study Streak Chip */}
          <div
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold"
            title={`${streakDays} Day Study Streak`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-bounce" />
            <span className="font-mono">{streakDays}d<span className="hidden sm:inline"> Streak</span></span>
          </div>

          {/* SQLite Sync Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              syncStatus === "success"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                : syncStatus === "error"
                ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                : "bg-neutral-100/80 dark:bg-white/[0.04] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20"
            }`}
            title={
              lastSyncedAt
                ? `Last synced: ${new Date(lastSyncedAt).toLocaleTimeString()}`
                : "Sync with Express backend (SQLite)"
            }
          >
            {syncStatus === "success" ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Synced</span>
              </>
            ) : syncStatus === "error" ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden sm:inline">Offline</span>
              </>
            ) : (
              <>
                <RefreshCw
                  className={`w-3.5 h-3.5 text-neutral-500 ${
                    isSyncing ? "animate-spin text-blue-500" : ""
                  }`}
                />
                <span className="hidden sm:inline font-mono">Sync</span>
              </>
            )}
          </button>

          {/* Dark/Light Theme Toggle */}
          <ThemeToggle />

          {/* User Authentication Badge / Sign In Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-1">
              <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 text-xs">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-500 to-[#b8ff3c] text-neutral-950 font-black text-[10px] flex items-center justify-center">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-neutral-800 dark:text-neutral-200 max-w-[90px] truncate hidden sm:inline">
                  {currentUser.name}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-full text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shadow-xs hover:scale-105 active:scale-95 transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
