"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QuizQuestion, QuizAttempt } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import confetti from "canvas-confetti";
import {
  BrainCircuit,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  X,
  History,
  SkipForward,
} from "lucide-react";
import { LatexRenderer } from "@/components/LatexRenderer";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterName: string;
  topicId: string;
  topicName: string;
  onSuccess: (unverified?: boolean) => void;
}

export function QuizModal({
  isOpen,
  onClose,
  subjectId,
  subjectName,
  chapterId,
  chapterName,
  topicId,
  topicName,
  onSuccess,
}: QuizModalProps) {
  const { settings, addQuizAttempt, quizHistory } = useAppStore();
  const passMark = settings.passMark || 4;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  // Fetch previous questions for this topic to avoid repeats
  const topicAttempts = quizHistory.filter((q) => q.topicId === topicId);
  const previousQuestionTexts = topicAttempts.flatMap((a) => a.questions.map((q) => q.question));

  const loadQuiz = async () => {
    setLoading(true);
    setError(null);
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setShowExplanation(false);
    setQuizFinished(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subjectName,
          chapter: chapterName,
          topic: topicName,
          previousQuestions: previousQuestionTexts.slice(-10),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions returned by quiz engine.");
      }

      setQuestions(data.questions);
      setIsFallback(Boolean(data.fallback));
    } catch (err: any) {
      console.warn("Quiz API unreachable, activating local CBSE fallback quiz:", err);
      // Client-side fallback so user is never blocked
      setQuestions([
        {
          question: `[CBSE Class 12 Core] Which of the following fundamental principles directly governs "${topicName}" in ${subjectName}?`,
          options: [
            "Governing conservation law and standard boundary condition",
            "Inverse square law strictly under zero damping",
            "Empirical power law valid only at non-equilibrium",
            "Discontinuous state function under adiabatic transition",
          ],
          correctIndex: 0,
          explanation: `According to NCERT Class 12 ${subjectName}, this topic is fundamentally evaluated based on the primary governing principles and boundary definitions.`,
          type: "plain",
        },
        {
          question: `Assertion (A): For ${topicName}, the rate or field intensity depends inversely on distance/impedance.\nReason (R): The flux or charge distribution is symmetric in all isotropic media.`,
          options: [
            "Both (A) and (R) are true and (R) is the correct explanation of (A)",
            "Both (A) and (R) are true but (R) is NOT the correct explanation of (A)",
            "(A) is true but (R) is false",
            "(A) is false but (R) is true",
          ],
          correctIndex: 1,
          explanation: "Both statements reflect standard CBSE textbook facts, but the symmetry reason does not exclusively explain the mathematical relationship.",
          type: "assertion_reason",
        },
        {
          question: `In a standard 1-mark CBSE board exam question, what is the crucial condition required when applying formulas for ${topicName}?`,
          options: [
            "System must be maintained at constant reference parameters",
            "Values must be converted to non-SI traditional units",
            "Only scalar magnitudes are considered while signs are ignored",
            "Derivative of potential must be positive definite",
          ],
          correctIndex: 0,
          explanation: "CBSE marking guidelines award full marks when boundary conditions and constant reference parameters are clearly specified.",
          type: "plain",
        },
        {
          question: `If the key parameter in "${topicName}" is doubled while maintaining standard conditions, how does the resulting outcome change?`,
          options: [
            "It doubles linearly",
            "It quadruples by second order relationship",
            "It remains invariant",
            "It halves",
          ],
          correctIndex: 0,
          explanation: "The direct linear proportionality outlined in NCERT yields a proportional doubling.",
          type: "plain",
        },
        {
          question: `[Board Practical Case] An examinee records experimental deviations during practical verification of ${topicName}. The most probable source of systematic error is:`,
          options: [
            "Zero error or end-resistance in the apparatus",
            "Ambient humidity variations during the period",
            "Parallax error in digital multimeter displays",
            "Over-damped galvanometer sensitivity",
          ],
          correctIndex: 0,
          explanation: "Zero error and end-resistance are the primary standard sources of systematic errors emphasized in the CBSE practical curriculum.",
          type: "case_based",
        },
      ]);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadQuiz();
    }
  }, [isOpen, topicId]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const hasAnsweredCurrent = selectedAnswers[currentIndex] !== undefined;

  const handleSelectOption = (optionIndex: number) => {
    if (hasAnsweredCurrent) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    let score = 0;
    questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctIndex) {
        score++;
      }
    });

    const passed = score >= passMark;
    addQuizAttempt({
      topicId,
      topicName,
      subjectId,
      chapterId,
      score,
      totalQuestions: questions.length,
      passed,
      questions,
      userAnswers: selectedAnswers,
    });

    setQuizFinished(true);

    if (passed) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"],
      });
      onSuccess(false);
    }
  };

  const calculateCurrentScore = () => {
    let s = 0;
    selectedAnswers.forEach((ans, i) => {
      if (questions[i] && ans === questions[i].correctIndex) s++;
    });
    return s;
  };

  const score = calculateCurrentScore();
  const passed = score >= passMark;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0f121d] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                  Topic Mastery Verification
                </h3>
                {isFallback && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                    Offline Bank
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                {subjectName} • {topicName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>Attempts ({topicAttempts.length})</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Generating 5 CBSE Class 12 MCQs via Groq AI...
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Balancing assertion-reason, short calculations, and case studies
              </p>
            </div>
          ) : showHistory ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                  Past Attempts Timeline
                </h4>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-xs font-bold text-blue-500 hover:underline"
                >
                  Back to Quiz
                </button>
              </div>

              {topicAttempts.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No past attempts for this topic yet.</p>
              ) : (
                <div className="space-y-2">
                  {topicAttempts.map((attempt, idx) => (
                    <div
                      key={attempt.id}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold font-mono ${attempt.passed ? "text-emerald-500" : "text-rose-500"}`}>
                            {attempt.passed ? "PASSED" : "FAILED"} ({attempt.score}/{attempt.totalQuestions})
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(attempt.date).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Attempt #{topicAttempts.length - idx}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${attempt.passed ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                        {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : quizFinished ? (
            /* Results Screen */
            <div className="py-6 space-y-6 text-center">
              <div className="inline-flex p-4 rounded-3xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 shadow-lg">
                {passed ? (
                  <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                ) : (
                  <XCircle className="w-16 h-16 text-rose-500" />
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {passed ? "Topic Mastery Confirmed!" : "Needs Revision"}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  Your Score: <strong className="text-slate-900 dark:text-white text-base">{score} / {questions.length}</strong> (Pass mark: {passMark}/5)
                </p>
              </div>

              {passed ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 text-left space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    Status confirmed: Learned
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                    Spaced repetition engine activated! Reminders scheduled for 3, 7, and 21 days from now.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-300 text-left space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    Score below {passMark}/5 pass mark
                  </p>
                  <p className="text-rose-700 dark:text-rose-400 text-[11px]">
                    Topic flagged for review in your planner. Review the step explanations below and retry!
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                {!passed && (
                  <button
                    onClick={loadQuiz}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Retry Fresh Set
                  </button>
                )}

                {!passed && (
                  <button
                    onClick={() => {
                      onSuccess(true);
                      onClose();
                    }}
                    className="px-5 py-2.5 rounded-full border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    <SkipForward className="w-4 h-4" />
                    Skip & Mark Unverified
                  </button>
                )}

                {passed && (
                  <button
                    onClick={onClose}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all"
                  >
                    Continue Studying
                  </button>
                )}
              </div>
            </div>
          ) : currentQ ? (
            /* Active Question Screen */
            <div className="space-y-5">
              {/* Progress & Type Badge */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-500">
                  QUESTION {currentIndex + 1} OF {questions.length}
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {currentQ.type === "assertion_reason"
                    ? "ASSERTION - REASON"
                    : currentQ.type === "case_based"
                    ? "CASE STUDY"
                    : "CBSE MCQ"}
                </span>
              </div>

              {/* Question Text Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 shadow-xs">
                <LatexRenderer content={currentQ.question} className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed" />
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentIndex] === optIdx;
                  const isCorrect = currentQ.correctIndex === optIdx;

                  let optionStyle =
                    "border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-indigo-500 hover:bg-slate-50/70 dark:hover:bg-white/[0.05]";

                  if (hasAnsweredCurrent) {
                    if (isCorrect) {
                      optionStyle = "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-bold";
                    } else if (isSelected) {
                      optionStyle = "border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 font-bold";
                    } else {
                      optionStyle = "opacity-40 border-slate-200 dark:border-white/5";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      disabled={hasAnsweredCurrent}
                      className={`w-full p-4 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 shadow-xs ${optionStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-white/20 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <div className="flex-1 leading-relaxed">
                        <LatexRenderer content={option} />
                      </div>
                      {hasAnsweredCurrent && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      {hasAnsweredCurrent && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Dropdown on Answer */}
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-500/20 text-xs space-y-1.5"
                >
                  <p className="font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider text-[10px] font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    CBSE Marking Scheme & Step Explanation:
                  </p>
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    <LatexRenderer content={currentQ.explanation} />
                  </div>
                </motion.div>
              )}
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        {!quizFinished && !showHistory && !loading && (
          <div className="px-6 py-4 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between">
            <button
              onClick={() => {
                onSuccess(true);
                onClose();
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Skip (Mark Unverified)
            </button>

            <button
              onClick={handleNext}
              disabled={!hasAnsweredCurrent}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
            >
              <span>{currentIndex === questions.length - 1 ? "Submit Quiz" : "Next Question"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
