"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function ThemeToggle() {
  const { settings, updateSettings } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Apply theme on load
    if (settings.theme === "dark" || (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.theme]);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-full bg-slate-200/50 dark:bg-white/10 animate-pulse" />;
  }

  const isDark = document.documentElement.classList.contains("dark");

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    updateSettings({ theme: nextTheme });
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className="relative p-2 rounded-full border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm backdrop-blur-md"
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
    </button>
  );
}
