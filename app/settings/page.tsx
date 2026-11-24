"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  SlidersHorizontal,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Target,
  Calendar,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings, exportData, importData, resetAllData, syllabus } =
    useAppStore();

  const [passMark, setPassMark] = useState(settings.passMark || 4);
  const [targetPercentage, setTargetPercentage] = useState(settings.targetPercentage || 90);
  const [firstExamDate, setFirstExamDate] = useState(settings.firstExamDate || "2026-02-15");
  const [datesheet, setDatesheet] = useState<Record<string, string>>(
    settings.examDatesheet || {
      maths: "2026-03-09",
      physics: "2026-02-24",
      chemistry: "2026-03-02",
      cs: "2026-03-23",
      english: "2026-02-18",
      pe: "2026-03-16",
    }
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      passMark,
      targetPercentage,
      firstExamDate,
      examDatesheet: datesheet,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExport = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cbse12_study_tracker_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = importData(text);
      if (success) {
        alert("Data imported successfully! Your syllabus and mock tests have been restored.");
      } else {
        setImportError("Invalid JSON backup file format. Please check and retry.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-200/80 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#b8ff3c] animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
              Preferences & Data Controls
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            Settings & System Controls
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Exam target percentages • Quiz mastery thresholds • Full JSON backup and restore
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1.5 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>Preferences Saved!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Parameters */}
        <div className="double-bezel">
          <div className="double-bezel-inner space-y-5">
            <h3 className="font-black text-sm uppercase text-neutral-900 dark:text-white pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Exam Benchmarks & Quiz Logic
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-neutral-500 font-mono mb-1">
                  Board Exam Target Percentage (%):
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={targetPercentage}
                  onChange={(e) => setTargetPercentage(parseInt(e.target.value) || 90)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono font-bold"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  Draws the target benchmark on your mock test trajectory graphs.
                </p>
              </div>

              <div>
                <label className="block text-neutral-500 font-mono mb-1">
                  Quiz Pass Mark (Out of 5 MCQs):
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={passMark}
                  onChange={(e) => setPassMark(parseInt(e.target.value) || 4)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono font-bold"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  Default: 4/5 (80%). Topic is confirmed "Learned" when this score is achieved.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Datesheet */}
        <div className="double-bezel">
          <div className="double-bezel-inner space-y-5">
            <h3 className="font-black text-sm uppercase text-neutral-900 dark:text-white pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-500" />
              Class 12 Board Datesheet Schedule
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-500 font-mono mb-1">
                  First Board Exam Date:
                </label>
                <input
                  type="date"
                  value={firstExamDate}
                  onChange={(e) => setFirstExamDate(e.target.value)}
                  className="w-full sm:w-64 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {syllabus.map((s) => (
                  <div key={s.id}>
                    <label className="block text-neutral-500 font-mono mb-1">
                      {s.name} Date:
                    </label>
                    <input
                      type="date"
                      value={datesheet[s.id] || firstExamDate}
                      onChange={(e) =>
                        setDatesheet({ ...datesheet, [s.id]: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono text-[11px] font-bold"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-nested-cta"
              >
                <span>Save Configuration</span>
                <div className="btn-nested-icon">
                  <Save className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Data Backup & Migration Section */}
      <div className="double-bezel">
        <div className="double-bezel-inner space-y-5">
          <h3 className="font-black text-sm uppercase text-neutral-900 dark:text-white pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60">
            Data Management & JSON Portability
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Export */}
            <div className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <p className="font-bold text-neutral-900 dark:text-white">Export Local Backup</p>
              <p className="text-[11px] text-neutral-500 leading-relaxed font-mono">
                Save all your syllabus progress, quiz history, mock test curves, and mistake notebook to a downloadable JSON file.
              </p>
              <button
                onClick={handleExport}
                className="px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-mono font-bold text-neutral-900 dark:text-white text-xs flex items-center gap-2 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON Backup</span>
              </button>
            </div>

            {/* Import */}
            <div className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <p className="font-bold text-neutral-900 dark:text-white">Import JSON Backup</p>
              <p className="text-[11px] text-neutral-500 leading-relaxed font-mono">
                Restore your tracker data from an existing backup file.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-mono font-bold text-neutral-900 dark:text-white text-xs cursor-pointer transition-colors shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Select File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              {importError && (
                <p className="text-rose-500 text-[10px] font-mono">{importError}</p>
              )}
            </div>
          </div>

          {/* Factory Reset */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-xs text-rose-700 dark:text-rose-400">
                Clear All Data & Reset Tracker
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                Permanently purges all mock test scores, quiz history, and resets syllabus back to default.
              </p>
            </div>

            <button
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to completely reset all study data? This cannot be undone."
                  )
                ) {
                  resetAllData();
                  alert("Tracker has been reset to default state.");
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs shrink-0 transition-colors shadow-sm"
            >
              Reset Everything
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
