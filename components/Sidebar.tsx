"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpenCheck,
  LineChart,
  CalendarClock,
  AlertTriangle,
  Sparkles,
  SlidersHorizontal,
  FolderKanban,
  X,
  ChevronRight,
  Target,
  Zap,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/syllabus", label: "Syllabus Tracker", icon: BookOpenCheck, badge: "Core" },
  { href: "/formulae", label: "Formulae Sheet", icon: Calculator, badge: "5 Practice" },
  { href: "/mocks", label: "Mock Tests", icon: LineChart },
  { href: "/planner", label: "Planner & Timer", icon: CalendarClock },
  { href: "/mistakes", label: "Mistake Log", icon: AlertTriangle },
  { href: "/extras", label: "Subject Vault", icon: FolderKanban },
  { href: "/doubt-bot", label: "AI Doubt Tutor", icon: Sparkles, highlight: true },
  { href: "/settings", label: "Settings", icon: SlidersHorizontal },
];

export function Sidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-neutral-200/80 dark:border-white/[0.06] bg-white/40 dark:bg-[#07090f]/40 backdrop-blur-xl p-4 min-h-[calc(100vh-4rem)]">
        <div className="space-y-1.5">
          <p className="px-3 py-2 text-[10px] font-black tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
            Workspace
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300",
                  isActive
                    ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md"
                    : item.highlight
                    ? "text-neutral-900 dark:text-white bg-[#b8ff3c]/15 hover:bg-[#b8ff3c]/25 border border-[#b8ff3c]/30"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/80 dark:hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-transform duration-300 group-hover:scale-110",
                      isActive
                        ? "text-[#b8ff3c] dark:text-neutral-950"
                        : item.highlight
                        ? "text-emerald-700 dark:text-[#b8ff3c]"
                        : "text-neutral-500 dark:text-neutral-400"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && !isActive && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#b8ff3c]/20 text-emerald-800 dark:text-[#b8ff3c] border border-[#b8ff3c]/30">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#b8ff3c] animate-pulse shadow-sm shadow-[#b8ff3c]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Target 95%+ Board Exam Card */}
        <div className="mt-auto pt-6">
          <div className="relative overflow-hidden p-4 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#b8ff3c]/15 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b8ff3c] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b8ff3c]"></span>
                </span>
                <p className="text-xs font-black text-white uppercase tracking-wider">
                  Target: 95%+
                </p>
              </div>
              <p className="text-[11px] text-neutral-400 leading-snug">
                CBSE 12th Board Exams 2026. Daily verified topic mastery.
              </p>
              <div className="mt-3 flex items-center justify-between text-[10px] font-mono font-bold text-neutral-300 border-t border-neutral-800 pt-2">
                <span className="text-[#b8ff3c]">GROQ AI ACTIVE</span>
                <span>NCERT 100%</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md transition-opacity"
            onClick={onCloseMobile}
          />

          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-[#07090f] p-6 shadow-2xl z-10 border-r border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800">
              <span className="font-black text-lg tracking-tight text-neutral-950 dark:text-white">
                CBSE 12 PRO
              </span>
              <button
                onClick={onCloseMobile}
                className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 py-6">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                      isActive
                        ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#b8ff3c]/20 text-emerald-800 dark:text-[#b8ff3c]">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
