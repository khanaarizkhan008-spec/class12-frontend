"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  FolderKanban,
  Calculator,
  Atom,
  TestTube2,
  Code,
  BookOpen,
  Activity,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  Check,
} from "lucide-react";

export default function ExtrasPage() {
  const { syllabus } = useAppStore();
  const [activeSubjectTab, setActiveSubjectTab] = useState<string>("maths");

  // Stuck Problems State (Maths)
  const [stuckProblems, setStuckProblems] = useState<
    Array<{ id: string; problem: string; topic: string; resolved: boolean }>
  >([
    {
      id: "sp-1",
      topic: "Integrals",
      problem: "Evaluate ∫ (x² + 1) / (x⁴ + 1) dx using substitution x - 1/x = t",
      resolved: false,
    },
    {
      id: "sp-2",
      topic: "Differential Equations",
      problem: "dy/dx + y cot x = 2x + x² cot x (Linear diff eq with integrating factor)",
      resolved: true,
    },
  ]);
  const [newProblemText, setNewProblemText] = useState("");
  const [newProblemTopic, setNewProblemTopic] = useState("");

  // Physics Derivations Checklist
  const [derivations, setDerivations] = useState([
    { id: "d-1", title: "Gauss Law application: Electric field due to infinite straight wire", done: true },
    { id: "d-2", title: "Capacitance of parallel plate capacitor with dielectric slab", done: false },
    { id: "d-3", title: "Drift velocity relation I = n e A v_d", done: true },
    { id: "d-4", title: "Magnetic field on the axis of a circular current carrying loop", done: false },
    { id: "d-5", title: "Lens Maker's Formula for a thin convex lens", done: false },
    { id: "d-6", title: "Young's Double Slit Experiment fringe width β = λD/d", done: false },
    { id: "d-7", title: "Astronomical Telescope magnifying power in normal adjustment", done: false },
    { id: "d-8", title: "Bohr's radius and energy expression for hydrogen atom", done: true },
  ]);

  // Chemistry Named Reactions Checklist
  const [reactions, setReactions] = useState([
    { id: "r-1", name: "Aldol Condensation & Cross Aldol", chapter: "Aldehydes & Ketones", done: true },
    { id: "r-2", name: "Cannizzaro Reaction", chapter: "Aldehydes & Ketones", done: false },
    { id: "r-3", name: "Reimer-Tiemann Reaction", chapter: "Phenols", done: true },
    { id: "r-4", name: "Kolbe's Reaction", chapter: "Phenols", done: true },
    { id: "r-5", name: "Williamson's Ether Synthesis", chapter: "Ethers", done: false },
    { id: "r-6", name: "Gabriel Phthalimide Synthesis", chapter: "Amines", done: false },
    { id: "r-7", name: "Hoffmann Bromamide Degradation", chapter: "Amines", done: true },
    { id: "r-8", name: "Sandmeyer Reaction", chapter: "Haloarenes / Diazonium", done: true },
  ]);

  // CS Code Tracker
  const [csChecklist, setCsChecklist] = useState([
    { id: "cs-1", title: "Binary File operations with pickle (dump & load)", done: true },
    { id: "cs-2", title: "CSV File operations with csv (reader & writer)", done: true },
    { id: "cs-3", title: "Stack implementation using Python lists (push & pop functions)", done: true },
    { id: "cs-4", title: "Python MySQL Connectivity & cursor.fetchall()", done: false },
    { id: "cs-5", title: "SQL GROUP BY, HAVING, and 2-table Joins", done: true },
    { id: "cs-6", title: "Final Project File & Documentation", done: false },
  ]);

  // English Writing Formats Checklist
  const writingFormats = [
    {
      title: "Notice Writing (50 words, 4 marks)",
      format: "Box [Issuing Authority on top, NOTICE in bold caps, Date on left, Heading centered, Content/Agenda, Signatory Name & Designation]",
    },
    {
      title: "Formal / Informal Invitation & Reply (50 words, 4 marks)",
      format: "Formal Card: 3rd person, no signatures, centered text, RSVP details. Formal Letter: Standard official letter format.",
    },
    {
      title: "Letter to the Editor (120-150 words, 5 marks)",
      format: "Sender's Address, Date, The Editor / Newspaper / City, Subject, Salutation, 3-para structure (Problem, Evidence, Solution/Appeal), Signatory.",
    },
    {
      title: "Job Application with Bio-data / Resumé (120-150 words, 5 marks)",
      format: "Covering letter + Attached Bio-Data (Personal details, Educational qualifications table, Experience, References).",
    },
    {
      title: "Article Writing (120-150 words, 5 marks)",
      format: "Eye-catching Title, Byline (By: Name), 3-4 paragraphs: Introduction, Cause/Analysis, Preventive measures, Conclusion.",
    },
    {
      title: "Report Writing (120-150 words, 5 marks)",
      format: "Headline, Byline, Place & Date, Lead paragraph (What, When, Where, Who), Body, Concluding remark.",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-200/80 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#b8ff3c] animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
              High-Yield Subject Repositories
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            Board Preparation Vault
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Formulas • Derivations • Named reactions • Code checklists • CBSE official formats
          </p>
        </div>

        <a
          href="/formulae"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-black text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md"
        >
          <Calculator className="w-4 h-4 text-[#b8ff3c] dark:text-neutral-950" />
          <span>Open Formulae Sheet (5 Practice Qs)</span>
        </a>
      </div>

      {/* Subject Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "maths", name: "Mathematics", icon: Calculator, color: "#38bdf8" },
          { id: "physics", name: "Physics", icon: Atom, color: "#a855f7" },
          { id: "chemistry", name: "Chemistry", icon: TestTube2, color: "#10b981" },
          { id: "cs", name: "Computer Science", icon: Code, color: "#f59e0b" },
          { id: "english", name: "English Core", icon: BookOpen, color: "#f43f5e" },
          { id: "pe", name: "Physical Education", icon: Activity, color: "#14b8a6" },
        ].map((tab) => {
          const isActive = activeSubjectTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubjectTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-lg"
                  : "bg-white/80 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
              }`}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: tab.color }} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* MATHEMATICS EXTRAS */}
      {activeSubjectTab === "maths" && (
        <div className="space-y-6">
          {/* Stuck Problems Notebook */}
          <div className="double-bezel">
            <div className="double-bezel-inner space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60">
                <h3 className="font-black text-sm uppercase text-neutral-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  Stuck Problems Notebook
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold">
                  {stuckProblems.filter((p) => !p.resolved).length} UNRESOLVED
                </span>
              </div>

              {/* Add Problem Form */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Topic (e.g. Definite Integrals)"
                  value={newProblemTopic}
                  onChange={(e) => setNewProblemTopic(e.target.value)}
                  className="w-full sm:w-48 px-3.5 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white font-medium"
                />
                <input
                  type="text"
                  placeholder="Paste or type difficult problem statement..."
                  value={newProblemText}
                  onChange={(e) => setNewProblemText(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white font-medium"
                />
                <button
                  onClick={() => {
                    if (newProblemText.trim()) {
                      setStuckProblems([
                        ...stuckProblems,
                        {
                          id: `sp-${Date.now()}`,
                          topic: newProblemTopic || "Maths",
                          problem: newProblemText.trim(),
                          resolved: false,
                        },
                      ]);
                      setNewProblemText("");
                      setNewProblemTopic("");
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-black text-xs font-mono uppercase hover:scale-105 active:scale-95 transition-all shadow-sm"
                >
                  Add Problem
                </button>
              </div>

              {/* Stuck List */}
              <div className="space-y-2">
                {stuckProblems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      item.resolved
                        ? "bg-neutral-100/50 dark:bg-neutral-900/30 border-neutral-200 dark:border-neutral-800 opacity-60"
                        : "bg-neutral-50 dark:bg-neutral-900/70 border-neutral-200 dark:border-neutral-800 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setStuckProblems(
                            stuckProblems.map((p) =>
                              p.id === item.id ? { ...p, resolved: !p.resolved } : p
                            )
                          )
                        }
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                          item.resolved
                            ? "bg-[#10b981] border-[#10b981] text-white"
                            : "border-neutral-400"
                        }`}
                      >
                        {item.resolved && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <div>
                        <p
                          className={`text-xs font-bold ${
                            item.resolved ? "line-through text-neutral-400" : "text-neutral-900 dark:text-white"
                          }`}
                        >
                          {item.problem}
                        </p>
                        <span className="text-[10px] font-mono text-blue-500 font-bold">
                          {item.topic}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setStuckProblems(stuckProblems.filter((p) => p.id !== item.id))}
                      className="text-neutral-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Formula Sheet Reference */}
          <div className="double-bezel">
            <div className="double-bezel-inner space-y-4">
              <h3 className="font-black text-sm uppercase text-neutral-900 dark:text-white pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60">
                Essential Board Exam Formula Sheet
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                  <p className="font-black font-mono text-blue-500">Integration by Parts</p>
                  <p className="font-mono text-neutral-800 dark:text-neutral-200 mt-1">
                    ∫ u v dx = u ∫ v dx - ∫ [ u' (∫ v dx) ] dx
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-1">Rule: ILATE priority</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                  <p className="font-black font-mono text-blue-500">Shortest Distance (Skew Lines)</p>
                  <p className="font-mono text-neutral-800 dark:text-neutral-200 mt-1">
                    d = | (a₂ - a₁) • (b₁ × b₂) | / | b₁ × b₂ |
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-1">Guaranteed 5-mark board question</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                  <p className="font-black font-mono text-blue-500">Bayes' Theorem</p>
                  <p className="font-mono text-neutral-800 dark:text-neutral-200 mt-1">
                    P(E_i | A) = P(E_i) P(A | E_i) / Σ [ P(E_j) P(A | E_j) ]
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-1">High-probability 4/5 mark case study</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                  <p className="font-black font-mono text-blue-500">Inverse Matrix Formula</p>
                  <p className="font-mono text-neutral-800 dark:text-neutral-200 mt-1">
                    A⁻¹ = (1 / |A|) • adj(A), where |A| ≠ 0
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-1">System of equations: X = A⁻¹ B</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHYSICS EXTRAS */}
      {activeSubjectTab === "physics" && (
        <div className="double-bezel">
          <div className="double-bezel-inner space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60">
              <div>
                <h3 className="font-black text-sm uppercase text-neutral-900 dark:text-white flex items-center gap-2">
                  <Atom className="w-4 h-4 text-purple-500" />
                  Must-Know CBSE Board Derivations
                </h3>
                <p className="text-[11px] text-neutral-500 font-mono">
                  Top 8 derivations appearing repeatedly in 3-mark & 5-mark board papers
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 text-xs font-mono font-bold">
                {derivations.filter((d) => d.done).length} / {derivations.length} MASTERED
              </span>
            </div>

            <div className="space-y-2">
              {derivations.map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    setDerivations(
                      derivations.map((d) => (d.id === item.id ? { ...d, done: !d.done } : d))
                    )
                  }
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    item.done
                      ? "bg-purple-500/10 border-purple-500/30 text-purple-900 dark:text-purple-200 font-bold"
                      : "bg-neutral-50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
                  }`}
                >
                  <span className="text-xs leading-relaxed">{item.title}</span>
                  <span
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                      item.done ? "bg-purple-600 border-purple-600 text-white" : "border-neutral-400"
                    }`}
                  >
                    {item.done && <Check className="w-3.5 h-3.5" />}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHEMISTRY EXTRAS */}
      {activeSubjectTab === "chemistry" && (
        <div className="double-bezel">
          <div className="double-bezel-inner space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60">
              <div>
                <h3 className="font-black text-sm uppercase text-neutral-900 dark:text-white flex items-center gap-2">
                  <TestTube2 className="w-4 h-4 text-emerald-500" />
                  Organic Chemistry Named Reactions
                </h3>
                <p className="text-[11px] text-neutral-500 font-mono">
                  Mandatory named conversions and mechanisms tested in CBSE
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold">
                {reactions.filter((r) => r.done).length} / {reactions.length} READY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reactions.map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    setReactions(
                      reactions.map((r) => (r.id === item.id ? { ...r, done: !r.done } : r))
                    )
                  }
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    item.done
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200 font-bold"
                      : "bg-neutral-50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">{item.name}</p>
                    <p className="text-[10px] text-neutral-400 font-mono">{item.chapter}</p>
                  </div>
                  <span
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                      item.done ? "bg-[#10b981] border-[#10b981] text-white" : "border-neutral-400"
                    }`}
                  >
                    {item.done && <Check className="w-3.5 h-3.5" />}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COMPUTER SCIENCE EXTRAS */}
      {activeSubjectTab === "cs" && (
        <div className="double-bezel">
          <div className="double-bezel-inner space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60">
              <div>
                <h3 className="font-black text-sm uppercase text-neutral-900 dark:text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-amber-500" />
                  Python & SQL Practice Tracker
                </h3>
                <p className="text-[11px] text-neutral-500 font-mono">
                  Mandatory CBSE CS practical competencies and code patterns
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold">
                {csChecklist.filter((c) => c.done).length} / {csChecklist.length} VERIFIED
              </span>
            </div>

            <div className="space-y-2">
              {csChecklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    setCsChecklist(
                      csChecklist.map((c) => (c.id === item.id ? { ...c, done: !c.done } : c))
                    )
                  }
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    item.done
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200 font-bold"
                      : "bg-neutral-50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
                  }`}
                >
                  <span className="text-xs font-bold">{item.title}</span>
                  <span
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                      item.done ? "bg-amber-500 border-amber-500 text-neutral-950" : "border-neutral-400"
                    }`}
                  >
                    {item.done && <Check className="w-3.5 h-3.5" />}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ENGLISH EXTRAS */}
      {activeSubjectTab === "english" && (
        <div className="double-bezel">
          <div className="double-bezel-inner space-y-4">
            <h3 className="font-black text-sm uppercase text-neutral-900 dark:text-white pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-500" />
              Official CBSE Class 12 Writing Skills Formats
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {writingFormats.map((wf, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-2 shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <h4 className="text-xs font-black text-neutral-900 dark:text-white">
                      {wf.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed font-mono bg-white dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    {wf.format}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PHYSICAL EDUCATION EXTRAS */}
      {activeSubjectTab === "pe" && (
        <div className="double-bezel">
          <div className="double-bezel-inner space-y-4">
            <h3 className="font-black text-sm uppercase text-neutral-900 dark:text-white pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-500" />
              Physical Education Practical & File Portfolio Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                <p className="font-bold text-teal-600 dark:text-teal-400">SAI Khelo India Fitness Test</p>
                <p className="text-[11px] text-neutral-500 mt-1">BMI, Flamingo Balance Test, Plate Tapping Test, 50m Dash, 600m Run</p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                <p className="font-bold text-teal-600 dark:text-teal-400">Proficiency in Chosen Sport</p>
                <p className="text-[11px] text-neutral-500 mt-1">Rules, terminologies, skills, and ground measurement for viva</p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                <p className="font-bold text-teal-600 dark:text-teal-400">Yogic Asanas Demonstration</p>
                <p className="text-[11px] text-neutral-500 mt-1">Procedures and contraindications for Obesity, Diabetes, Asthma & Hypertension</p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                <p className="font-bold text-teal-600 dark:text-teal-400">Record File (5 Marks)</p>
                <p className="text-[11px] text-neutral-500 mt-1">Signed practical logbook with all fitness test scores recorded</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
