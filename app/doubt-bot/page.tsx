"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { ChatMessage } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { formatLatexAndMarkdown } from "@/lib/formatLatex";
import {
  Sparkles,
  Send,
  Trash2,
  BookOpen,
  Bot,
  User,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";

const QUICK_PROMPTS: Record<string, string[]> = {
  maths: [
    "Explain the step-by-step method to solve shortest distance between two skew lines.",
    "How to find the inverse of a 3x3 matrix using minors and cofactors?",
    "Derive the formula for integration by parts and explain the ILATE rule.",
  ],
  physics: [
    "Derive the Lens Maker's formula for a thin convex lens.",
    "Explain Gauss's law and apply it to find the field due to an infinite plane sheet.",
    "State Kirchhoff's rules and explain how to apply them in a bridge circuit.",
  ],
  chemistry: [
    "Explain the difference between SN1 and SN2 mechanisms with stereochemistry.",
    "Write the complete mechanism of Aldol condensation and Cannizzaro reaction.",
    "State and explain Kohlrausch's law of independent migration of ions.",
  ],
  cs: [
    "How to implement a Stack in Python using lists with push, pop and peek functions?",
    "Explain the difference between pickle.dump() and pickle.load() with an example.",
    "Write a SQL query using GROUP BY, HAVING, and a 2-table join.",
  ],
  english: [
    "What is the official CBSE format for writing a formal Notice in 50 words?",
    "Explain the central theme and poetic devices in 'A Thing of Beauty'.",
    "How to structure a Job Application with Bio-data for 5 marks?",
  ],
  pe: [
    "Explain the procedure, benefits, and contraindications of Bhujangasana.",
    "What is the difference between Knock-out and League tournament fixtures?",
    "Explain the Female Athlete Triad and its health implications.",
  ],
};

function DoubtBotContent() {
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get("subject") || "maths";
  const initialTopic = searchParams.get("topic") || "";
  const initialQuery = searchParams.get("q") || "";

  const { chatMessages, addChatMessage, clearChatMessages, syllabus } = useAppStore();

  const [activeSubject, setActiveSubject] = useState(initialSubject);
  const [topicContext, setTopicContext] = useState(initialTopic);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedReply, setStreamedReply] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasTriggeredInitialQuery = useRef(false);

  // Filter messages for current subject (or general)
  const currentMessages = chatMessages.filter(
    (m) => !m.subjectId || m.subjectId === activeSubject
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, streamedReply]);

  useEffect(() => {
    if (initialQuery && !hasTriggeredInitialQuery.current) {
      hasTriggeredInitialQuery.current = true;
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputValue;
    if (!textToSend.trim() || isStreaming) return;

    setErrorMsg(null);
    setInputValue("");

    // Add user message to state
    addChatMessage({
      role: "user",
      content: textToSend.trim(),
      subjectId: activeSubject,
      topicContext,
    });

    setIsStreaming(true);
    setStreamedReply("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const subjectName = syllabus.find((s) => s.id === activeSubject)?.name || activeSubject;

      const res = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subjectName,
          topicContext,
          messages: [
            ...currentMessages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: textToSend.trim() },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      if (!res.body) {
        throw new Error("No readable stream received.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const dataStr = trimmed.replace("data: ", "");

          if (dataStr === "[DONE]") {
            break;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.text) {
              fullText += parsed.text;
              setStreamedReply(fullText);
            }
            if (parsed.error) {
              setErrorMsg(parsed.error);
            }
          } catch {
            // chunk boundary
          }
        }
      }

      if (fullText) {
        addChatMessage({
          role: "assistant",
          content: fullText,
          subjectId: activeSubject,
          topicContext,
        });
      }
    } catch (err: any) {
      console.error("[Chat Error]:", err);
      setErrorMsg(err.message || "Failed to reach AI tutor. Verify server is running on port 5000.");
    } finally {
      setIsStreaming(false);
      setStreamedReply("");
    }
  };

  const currentSubjectObj = syllabus.find((s) => s.id === activeSubject) || syllabus[0];

  return (
    <div className="space-y-3 sm:space-y-4 max-w-5xl mx-auto flex flex-col h-[calc(100dvh-12rem)] md:h-[calc(100vh-8rem)]">
      {/* Header Bar */}
      <div className="double-bezel shrink-0">
        <div className="double-bezel-inner py-3 px-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#b8ff3c] dark:text-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-xs sm:text-sm text-neutral-900 dark:text-white uppercase tracking-tight">
                  CBSE AI Doubt Tutor
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#b8ff3c]/20 text-emerald-800 dark:text-[#b8ff3c] text-[9px] sm:text-[10px] font-mono font-bold">
                  GROQ AI
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 font-mono">
                Step solutions • LaTeX math • NCERT hints
              </p>
            </div>
          </div>

          {/* Subject Selector & Clear Button */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            <select
              value={activeSubject}
              onChange={(e) => setActiveSubject(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-mono font-bold rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
            >
              {syllabus.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => clearChatMessages(activeSubject)}
              className="p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-rose-500 transition-colors shrink-0"
              title="Clear Chat History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Topic Context Pill (if open from a topic page) */}
      {topicContext && (
        <div className="px-4 py-2 rounded-2xl bg-neutral-100 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs shrink-0 shadow-xs">
          <div className="flex items-center gap-2 font-mono">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-neutral-500">Active Topic Context:</span>
            <strong className="text-neutral-950 dark:text-white">{topicContext}</strong>
          </div>
          <button
            onClick={() => setTopicContext("")}
            className="text-[10px] text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            Clear context ✕
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="double-bezel flex-1 overflow-hidden flex flex-col">
        <div className="double-bezel-inner flex-1 overflow-y-auto space-y-4 p-4 sm:p-6">
          {currentMessages.length === 0 && !isStreaming && (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shadow-inner">
                <Bot className="w-7 h-7 text-[#b8ff3c]" />
              </div>
              <div>
                <h3 className="font-black text-sm text-neutral-900 dark:text-white">
                  Ask Groq AI any Class 12 {currentSubjectObj.name} doubt
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mt-1">
                  Ask for derivation step-by-step proofs, integral substitutions, organic mechanisms, Python syntax, or sample board 5-mark answers.
                </p>
              </div>
            </div>
          )}

          {currentMessages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4 text-[#b8ff3c] dark:text-neutral-950" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold rounded-tr-none shadow-md"
                      : "bg-neutral-50 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-tl-none shadow-xs"
                  }`}
                >
                  <div className="prose dark:prose-invert prose-xs max-w-none break-words">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false, errorColor: "#cc0000" }]]}
                    >
                      {formatLatexAndMarkdown(msg.content)}
                    </ReactMarkdown>
                  </div>
                  <span className="block text-[9px] font-mono opacity-50 mt-2 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5 text-neutral-700 dark:text-neutral-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Live Streaming Reply Container */}
          {isStreaming && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4 text-[#b8ff3c] animate-pulse" />
              </div>
              <div className="max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl rounded-tl-none bg-neutral-50 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 text-xs leading-relaxed shadow-xs">
                {streamedReply ? (
                  <div className="prose dark:prose-invert prose-xs max-w-none break-words">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false, errorColor: "#cc0000" }]]}
                    >
                      {formatLatexAndMarkdown(streamedReply)}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-neutral-400 font-mono text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#b8ff3c] animate-ping" />
                    <span>Groq AI is formulating CBSE board step solution...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Fast Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <span className="text-[10px] font-mono text-neutral-400 uppercase shrink-0 font-bold">
          PROMPTS:
        </span>
        {(QUICK_PROMPTS[activeSubject] || []).map((promptText, i) => (
          <button
            key={i}
            onClick={() => handleSend(promptText)}
            disabled={isStreaming}
            className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-950 dark:hover:border-[#b8ff3c] text-[11px] font-mono whitespace-nowrap shadow-xs transition-colors disabled:opacity-50"
          >
            {promptText.length > 40 ? promptText.substring(0, 40) + "..." : promptText}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="double-bezel shrink-0">
        <div className="double-bezel-inner p-2 sm:p-2.5 flex items-center gap-2">
          <input
            type="text"
            placeholder={`Ask any doubt in ${currentSubjectObj.name} (Formulas, Derivations, Python code, English formats)...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isStreaming}
            className="flex-1 px-4 py-2.5 rounded-xl bg-transparent text-xs text-neutral-950 dark:text-white placeholder-neutral-400 focus:outline-none font-medium"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isStreaming}
            className="px-5 py-2.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-40 flex items-center gap-1.5"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DoubtBotPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center font-mono text-xs text-neutral-400">
          Loading AI Doubt Solver...
        </div>
      }
    >
      <DoubtBotContent />
    </Suspense>
  );
}
