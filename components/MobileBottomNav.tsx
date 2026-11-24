"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpenCheck,
  Calculator,
  LineChart,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_NAV_ITEMS = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/syllabus", label: "Syllabus", icon: BookOpenCheck },
  { href: "/formulae", label: "Formulae", icon: Calculator },
  { href: "/mocks", label: "Mocks", icon: LineChart },
  { href: "/doubt-bot", label: "Doubt AI", icon: Sparkles, highlight: true },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-2xl bg-white/90 dark:bg-[#07090f]/95 border-t border-neutral-200/80 dark:border-white/[0.08] shadow-[0_-6px_24px_rgba(0,0,0,0.08)] px-2 py-1.5 transition-colors"
      style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90",
                isActive
                  ? "text-neutral-950 dark:text-white"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
              )}
            >
              {/* Highlight background pill for active tab */}
              {isActive && (
                <span className="absolute inset-0 rounded-2xl bg-neutral-200/60 dark:bg-white/[0.08] pointer-events-none" />
              )}

              <div className="relative">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isActive && "scale-110",
                    item.highlight && !isActive && "text-emerald-700 dark:text-[#b8ff3c]",
                    item.highlight && isActive && "text-[#b8ff3c] dark:text-[#b8ff3c]"
                  )}
                />
                {item.highlight && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#b8ff3c] animate-pulse" />
                )}
              </div>

              <span
                className={cn(
                  "text-[10px] mt-0.5 font-bold tracking-tight transition-all",
                  isActive
                    ? "font-black text-neutral-950 dark:text-white"
                    : "text-neutral-600 dark:text-neutral-400 font-medium"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
