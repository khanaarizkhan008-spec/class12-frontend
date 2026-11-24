import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <h2 className="text-5xl font-black font-mono text-neutral-950 dark:text-white">404</h2>
      <p className="text-sm text-neutral-500 font-medium">Page not found in CBSE Class 12 Study Tracker.</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>
    </div>
  );
}
