"use client";

import { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { AuthModal } from "./AuthModal";
import Link from "next/link";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9f5] dark:bg-[#07090f] text-neutral-900 dark:text-neutral-100 selection:bg-[#b8ff3c] selection:text-neutral-950">
      <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 min-w-0 pb-24 md:pb-12">
          {children}
        </main>
      </div>

      {/* Floating Doubt AI Assistant Pill (Desktop & Tablets) */}
      <div className="hidden sm:flex fixed bottom-6 right-6 z-40 items-center gap-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 dark:bg-neutral-900/90 text-white text-[11px] font-bold backdrop-blur-md shadow-xl border border-neutral-700 pointer-events-none"
        >
          <span className="w-2 h-2 rounded-full bg-[#b8ff3c] animate-pulse shadow-sm shadow-[#b8ff3c]" />
          <span>Groq AI Tutor Active</span>
        </motion.div>

        <Link
          href="/doubt-bot"
          className="group relative flex items-center gap-3 px-5 py-3 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-black text-xs uppercase tracking-wider shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-neutral-800 dark:border-neutral-200"
        >
          <div className="w-6 h-6 rounded-full bg-[#b8ff3c] text-neutral-950 flex items-center justify-center font-bold">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>Ask Doubt AI</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white dark:group-hover:text-neutral-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>
      </div>

      {/* Mobile Glassmorphic Bottom Navigation Bar (Phones) */}
      <MobileBottomNav />

      {/* Global Authentication Modal */}
      <AuthModal />
    </div>
  );
}
