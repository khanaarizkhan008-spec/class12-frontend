"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import {
  X,
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  AlertCircle,
  GraduationCap,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

export function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    authPromptReason,
    closeAuthModal,
    openAuthModal,
    loginUser,
    registerUser,
  } = useAppStore();

  const [mode, setMode] = useState<"login" | "register">(authModalMode || "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync mode from store when modal opens
  if (authModalMode && authModalMode !== mode && authModalOpen) {
    setMode(authModalMode);
  }

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "register") {
        if (!name.trim()) {
          setError("Please enter your name.");
          setLoading(false);
          return;
        }
        if (!email.trim() || !email.includes("@")) {
          setError("Please enter a valid email address.");
          setLoading(false);
          return;
        }
        if (password.length < 4) {
          setError("Password must be at least 4 characters long.");
          setLoading(false);
          return;
        }

        const res = await registerUser(name, email, password);
        if (!res.success) {
          setError(res.error || "Registration failed. Please try again.");
        } else {
          setSuccessMsg("Account created! Loading your dashboard...");
          setTimeout(() => {
            closeAuthModal();
          }, 800);
        }
      } else {
        if (!email.trim() || !password) {
          setError("Please enter both email and password.");
          setLoading(false);
          return;
        }

        const res = await loginUser(email, password);
        if (!res.success) {
          setError(res.error || "Invalid email or password.");
        } else {
          setSuccessMsg("Welcome back! Loading your study tracker...");
          setTimeout(() => {
            closeAuthModal();
          }, 800);
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setError(null);
    setEmail("aariz@example.com");
    setPassword("password123");
    setLoading(true);
    const res = await loginUser("aariz@example.com", "password123");
    setLoading(false);
    if (!res.success) {
      // If demo user doesn't exist yet, register it
      const regRes = await registerUser("Aariz Khan", "aariz@example.com", "password123");
      if (regRes.success) {
        closeAuthModal();
      } else {
        setError(regRes.error || "Demo login failed");
      }
    } else {
      closeAuthModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-white dark:bg-[#0c0e17] border border-neutral-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8"
      >
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#b8ff3c]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.06] transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Logo */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-neutral-950 dark:bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-md">
            <GraduationCap className="w-5 h-5 text-[#b8ff3c]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-lg text-neutral-950 dark:text-white tracking-tight">
                CBSE 12 Tracker
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#b8ff3c]/15 text-emerald-800 dark:text-[#b8ff3c] border border-[#b8ff3c]/30 uppercase">
                PRO
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Personalized Multi-User Progress & Sync
            </p>
          </div>
        </div>

        {/* Reason banner if triggered by trying to add a record */}
        {authPromptReason && (
          <div className="mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Sign in required to save records</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                {authPromptReason}
              </p>
            </div>
          </div>
        )}

        {/* Tabs: Sign In vs Register */}
        <div className="grid grid-cols-2 p-1 mb-5 rounded-2xl bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200/80 dark:border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === "login"
                ? "bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === "register"
                ? "bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error or Success Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" && (
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aariz Khan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-white/[0.02] text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:border-[#b8ff3c] focus:ring-1 focus:ring-[#b8ff3c]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                required
                placeholder="you@school.edu or gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-white/[0.02] text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:border-[#b8ff3c] focus:ring-1 focus:ring-[#b8ff3c]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-white/[0.02] text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:border-[#b8ff3c] focus:ring-1 focus:ring-[#b8ff3c]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>
              {loading
                ? "Processing..."
                : mode === "register"
                ? "Create Account & Start Saving"
                : "Sign In to Tracker"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Fill & Guest Mode */}
        <div className="mt-5 pt-4 border-t border-neutral-200/80 dark:border-white/10 flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={loading}
            className="font-bold text-emerald-600 dark:text-[#b8ff3c] hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Quick Demo Login
          </button>

          <button
            type="button"
            onClick={closeAuthModal}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Browse as Guest (0 records)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
