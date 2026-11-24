"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { formatLatexAndMarkdown } from "@/lib/formatLatex";

interface LatexRendererProps {
  content: string;
  className?: string;
}

export function LatexRenderer({ content, className = "" }: LatexRendererProps) {
  if (!content) return null;
  const formatted = formatLatexAndMarkdown(content);

  return (
    <div className={`prose dark:prose-invert max-w-none text-xs leading-relaxed break-words ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false, errorColor: "#cc0000" }]]}
      >
        {formatted}
      </ReactMarkdown>
    </div>
  );
}
