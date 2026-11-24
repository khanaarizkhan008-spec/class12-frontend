"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUBJECT_FORMULAE, FormulaItem, PracticeProblem } from "@/data/formulae";
import { LatexRenderer } from "@/components/LatexRenderer";
import {
  Calculator,
  Atom,
  TestTube2,
  Code,
  BookOpen,
  Activity,
  Sparkles,
  Search,
  BookMarked,
  Eye,
  EyeOff,
  HelpCircle,
  RotateCcw,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

const SUBJECTS = [
  { id: "maths", name: "Mathematics", icon: Calculator, color: "#38bdf8", defaultBook: "RD Sharma Class 12 / NCERT" },
  { id: "physics", name: "Physics", icon: Atom, color: "#a855f7", defaultBook: "HC Verma Concepts of Physics / SL Arora" },
  { id: "chemistry", name: "Chemistry", icon: TestTube2, color: "#10b981", defaultBook: "OP Tandon Physical Chemistry / NCERT" },
  { id: "cs", name: "Computer Science", icon: Code, color: "#f59e0b", defaultBook: "Sumita Arora Python Class 12" },
  { id: "english", name: "English Core", icon: BookOpen, color: "#f43f5e", defaultBook: "CBSE Official Marking Scheme" },
  { id: "pe", name: "Physical Education", icon: Activity, color: "#14b8a6", defaultBook: "Saraswati Physical Education" },
] as const;

export default function FormulaePage() {
  const router = useRouter();
  const [activeSubject, setActiveSubject] = useState<string>("maths");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<string>("all");

  // Track expanded solutions for each problem: problemId -> boolean
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  const [expandedHints, setExpandedHints] = useState<Record<string, boolean>>({});

  // Track Groq AI-generated problems per formula: formulaId -> PracticeProblem[]
  const [aiProblems, setAiProblems] = useState<Record<string, PracticeProblem[]>>({});
  const [loadingFormulaId, setLoadingFormulaId] = useState<string | null>(null);
  const [aiError, setAiError] = useState<Record<string, string>>({});

  const toggleSolution = (probId: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [probId]: !prev[probId] }));
  };

  const toggleHint = (probId: string) => {
    setExpandedHints((prev) => ({ ...prev, [probId]: !prev[probId] }));
  };

  // Filter formulas by subject, chapter, and search query
  const subjectFormulas = SUBJECT_FORMULAE.filter((f) => f.subjectId === activeSubject);
  const chapters = Array.from(new Set(subjectFormulas.map((f) => f.chapter)));

  const filteredFormulas = subjectFormulas.filter((f) => {
    const matchesChapter = selectedChapter === "all" || f.chapter === selectedChapter;
    const matchesSearch =
      !searchQuery ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChapter && matchesSearch;
  });

  const activeSubjectObj = SUBJECTS.find((s) => s.id === activeSubject) || SUBJECTS[0];

  // Call Express backend to generate 5 fresh easy problems via Groq API
  const handleGenerateAiProblems = async (formula: FormulaItem) => {
    setLoadingFormulaId(formula.id);
    setAiError((prev) => ({ ...prev, [formula.id]: "" }));

    try {
      const res = await fetch("http://localhost:5000/api/practice-problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: activeSubjectObj.name,
          chapter: formula.chapter,
          formulaName: formula.name,
          formulaLatex: formula.formulaLatex,
          bookSource: formula.standardReference,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to generate problems: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.problems && Array.isArray(data.problems)) {
        setAiProblems((prev) => ({
          ...prev,
          [formula.id]: data.problems,
        }));
      } else {
        throw new Error("Invalid response format received from AI server.");
      }
    } catch (err: any) {
      setAiError((prev) => ({
        ...prev,
        [formula.id]: err.message || "Failed to generate AI problems. Please check your backend connection.",
      }));
    } finally {
      setLoadingFormulaId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#b8ff3c] animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-neutral-500 uppercase font-mono">
              Class 12 Board Prep Vault
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>Subject Formulae Sheet</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#b8ff3c]/20 text-emerald-800 dark:text-[#b8ff3c] font-mono font-bold">
              5 EASY PROBLEMS PER FORMULA
            </span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
            Board-standard formulas rendered in KaTeX with 5 curated easy-level practice problems from RD Sharma, HC Verma, NCERT & OP Tandon, plus Groq AI on-demand generator.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search formulas or chapters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-950 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#b8ff3c]"
          />
        </div>
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SUBJECTS.map((tab) => {
          const isActive = activeSubject === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubject(tab.id);
                setSelectedChapter("all");
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center gap-2.5 whitespace-nowrap ${
                isActive
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-md"
                  : "bg-white/80 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
              }`}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: tab.color }} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Chapter Filter Chips */}
      {chapters.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs">
          <span className="text-[11px] font-mono text-neutral-400 mr-1 uppercase font-bold">Chapters:</span>
          <button
            onClick={() => setSelectedChapter("all")}
            className={`px-3 py-1 rounded-full font-mono text-[11px] transition-all ${
              selectedChapter === "all"
                ? "bg-[#b8ff3c] text-neutral-950 font-black shadow-xs"
                : "bg-neutral-100 dark:bg-neutral-900 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            All Chapters ({subjectFormulas.length})
          </button>
          {chapters.map((chap) => (
            <button
              key={chap}
              onClick={() => setSelectedChapter(chap)}
              className={`px-3 py-1 rounded-full font-mono text-[11px] transition-all whitespace-nowrap ${
                selectedChapter === chap
                  ? "bg-[#b8ff3c] text-neutral-950 font-black shadow-xs"
                  : "bg-neutral-100 dark:bg-neutral-900 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {chap}
            </button>
          ))}
        </div>
      )}

      {/* Formulae List */}
      <div className="space-y-8">
        {filteredFormulas.length === 0 ? (
          <div className="double-bezel text-center py-12">
            <div className="double-bezel-inner space-y-3">
              <BookMarked className="w-10 h-10 mx-auto text-neutral-400" />
              <p className="text-sm font-bold text-neutral-600 dark:text-neutral-300">
                No formulas found matching "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="px-4 py-1.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-mono font-bold"
              >
                Clear Search
              </button>
            </div>
          </div>
        ) : (
          filteredFormulas.map((formula, idx) => {
            const hasAiProblems = Boolean(aiProblems[formula.id] && aiProblems[formula.id].length > 0);
            const currentProblems = hasAiProblems ? aiProblems[formula.id] : formula.practiceProblems;
            const isGenerating = loadingFormulaId === formula.id;

            return (
              <div key={formula.id} className="double-bezel">
                <div className="double-bezel-inner space-y-5 p-5 sm:p-6">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          {formula.chapter}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          Formula #{idx + 1}
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-neutral-950 dark:text-white">
                        {formula.name}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#b8ff3c]" />
                        <span>{formula.standardReference}</span>
                      </span>
                    </div>
                  </div>

                  {/* Formula LaTeX Code Canvas */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 text-white border border-neutral-800 shadow-inner relative overflow-x-auto">
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-2 border-b border-neutral-800 pb-1.5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#b8ff3c]" />
                        FORMULA NOTATION (KATEX)
                      </span>
                      <span>CBSE 12TH SYLLABUS</span>
                    </div>

                    <div className="text-center text-sm sm:text-lg font-mono py-2 text-white overflow-x-auto px-1">
                      <LatexRenderer content={`$$\n${(formula.formulaLatex || "").trim().replace(/^\$\$|\$\$$/g, "").replace(/\$/g, "")}\n$$`} />
                    </div>

                    <p className="text-xs text-neutral-400 mt-2 font-sans border-t border-neutral-900 pt-2">
                      {formula.description}
                    </p>
                  </div>

                  {/* Practice Problems Section */}
                  <div className="pt-2 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#b8ff3c]" />
                          <span>5 Practice Problems (Easy Level)</span>
                          {hasAiProblems ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#b8ff3c]/20 text-emerald-800 dark:text-[#b8ff3c] font-mono font-bold">
                              GROQ AI GENERATED
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold">
                              CURATED FROM {formula.standardReference.split("/")[0].trim()}
                            </span>
                          )}
                        </h3>
                        <p className="text-[11px] text-neutral-500">
                          Direct concept application and single-step calculation problems suitable for daily warm-up.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasAiProblems && (
                          <button
                            onClick={() =>
                              setAiProblems((prev) => {
                                const copy = { ...prev };
                                delete copy[formula.id];
                                return copy;
                              })
                            }
                            className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                          >
                            Reset to Textbook
                          </button>
                        )}

                        <button
                          onClick={() => handleGenerateAiProblems(formula)}
                          disabled={isGenerating}
                          className="px-3.5 py-1.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold font-mono uppercase flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                        >
                          {isGenerating ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                              <span>Generating 5 Problems...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-[#b8ff3c] dark:text-neutral-950" />
                              <span>Generate 5 Fresh via Groq</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* AI Generation Error Message */}
                    {aiError[formula.id] && (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-mono">
                        {aiError[formula.id]}
                      </div>
                    )}

                    {/* Problem Accordions */}
                    <div className="space-y-3">
                      {currentProblems.map((prob, pIdx) => {
                        const probKey = `${formula.id}-${prob.id || pIdx}`;
                        const isSolOpen = Boolean(expandedSolutions[probKey]);
                        const isHintOpen = Boolean(expandedHints[probKey]);

                        return (
                          <div
                            key={probKey}
                            className="p-4 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs"
                          >
                            {/* Problem Top Meta */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-mono font-bold text-[11px]">
                                  {pIdx + 1}
                                </span>
                                <span className="text-[11px] font-mono text-neutral-500 font-bold">
                                  {prob.source || `Easy Level Practice ${pIdx + 1}`}
                                </span>
                              </div>

                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-[#b8ff3c]">
                                {prob.difficulty || "Easy"}
                              </span>
                            </div>

                            {/* Problem Statement with KaTeX */}
                            <div className="text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 leading-relaxed font-medium">
                              <LatexRenderer content={prob.question} />
                            </div>

                            {/* Hint Container (if available) */}
                            {prob.hint && isHintOpen && (
                              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
                                <p className="font-bold flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                                  <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                                  CBSE Hint & Strategy
                                </p>
                                <LatexRenderer content={prob.hint} />
                              </div>
                            )}

                            {/* Solution Container */}
                            {isSolOpen && (
                              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200 dark:border-neutral-800 space-y-2">
                                <p className="font-bold text-[11px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  Step-by-Step Solution & Working
                                </p>
                                <div className="text-xs text-neutral-800 dark:text-neutral-200">
                                  <LatexRenderer content={prob.solution} />
                                </div>
                                {prob.answer && (
                                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-baseline gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                                    <span className="text-[10px] font-mono text-[#b8ff3c] uppercase">Final Answer:</span>
                                    <LatexRenderer content={prob.answer} />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Bottom Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800/60">
                              <div className="flex items-center gap-2">
                                {prob.hint && (
                                  <button
                                    onClick={() => toggleHint(probKey)}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all flex items-center gap-1"
                                  >
                                    <HelpCircle className="w-3 h-3" />
                                    <span>{isHintOpen ? "Hide Hint" : "Show Hint"}</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => toggleSolution(probKey)}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all flex items-center gap-1"
                                >
                                  {isSolOpen ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  <span>{isSolOpen ? "Hide Solution" : "View Solution"}</span>
                                </button>
                              </div>

                              <button
                                onClick={() => {
                                  router.push(
                                    `/doubt-bot?subject=${formula.subjectId}&initialTopic=${encodeURIComponent(
                                      formula.name
                                    )}&initialPrompt=${encodeURIComponent(
                                      `I need help with this CBSE Class 12 practice problem from ${formula.chapter} on the formula "${formula.name}":\n\nProblem: ${prob.question}\n\nPlease explain the step-by-step NCERT working.`
                                    )}`
                                  );
                                }}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all flex items-center gap-1"
                              >
                                <MessageSquare className="w-3 h-3 text-[#b8ff3c]" />
                                <span>Ask Doubt Bot</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
