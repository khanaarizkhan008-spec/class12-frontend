/**
 * Bulletproof preprocessor for Markdown text containing LaTeX math, matrices,
 * determinants, integrals, and GitHub-Flavored Markdown tables.
 *
 * Ensures that outputs from AI models (Groq, OpenAI, etc.) that may use
 * \[ ... \], \( ... \), bare [ \mathbf{A} ... ], unescaped matrix environments,
 * \left- / \right delimiter issues, unescaped inverse trig functions,
 * single-line compressed tables, single-backslash row separators, or fragmented
 * mixed math notation with nested dollar signs render as clean, publication-grade
 * KaTeX mathematical formulas.
 */
export function formatLatexAndMarkdown(content: string): string {
  if (!content) return "";
  let text = content;

  // 0. Pre-fix malformed \left- and \right delimiters from LLM outputs
  // e.g. \cos^{-1}\left-\frac{1}{2}\right -> \cos^{-1}\left(-\frac{1}{2}\right)
  text = text.replace(/\\left\s*-\s*\\frac\{([^}]+)\}\{([^}]+)\}\s*\\right(?!\s*[\)\}\]\.\|\>\/])/g, (_, a, b) => `\\left(-\\frac{${a}}{${b}}\\right)`);
  text = text.replace(/\\left\s*-\s*([0-9a-zA-Z\\]+)\s*\\right(?!\s*[\)\}\]\.\|\>\/])/g, (_, a) => `\\left(-${a}\\right)`);
  text = text.replace(/\\left\s*-\s*/g, "\\left(-");
  text = text.replace(/\\right(?=\s*[\.\,\;\?\!\:\$]|\s*$)/g, "\\right)");
  text = text.replace(/\\right(?!\s*[\)\}\]\.\|\>\/])/g, "\\right)");

  // 0b. Auto-wrap bare math formulas that lack dollar delimiters:
  // e.g. \tan^{-1}(1) + \cos^{-1}\left(-\frac{1}{2}\right)
  if (!text.includes("$") && !text.includes("\\[") && !text.includes("\\begin{")) {
    if (/^\s*\\(?:tan|sin|cos|sec|csc|cot|frac|sqrt|int|sum|lim|log|ln|vec|mathbf|det)/.test(text)) {
      text = `$${text.trim()}$`;
    } else {
      text = text.replace(/(\\(?:tan|sin|cos|sec|csc|cot|frac|sqrt|int|sum|lim|log|ln|cdot|times|pm|mp|alpha|beta|theta|pi|partial|infty|vec)[^\$,\?\!\n]*)/g, (match) => {
        const trimmed = match.trim().replace(/\.$/, "");
        const trailingDot = match.trim().endsWith(".") ? "." : "";
        if (trimmed.length > 1) {
          return `$${trimmed}$${trailingDot}`;
        }
        return match;
      });
    }
  }

  // 1. Expand single-line compressed markdown tables:
  // e.g. | col1 | col2 | |---|---| | r1 | r2 | -> proper multi-line table
  text = text.replace(/\|\s*\|\s*/g, "|\n|");

  // 2. Fix matrix row breaks with single backslash and optional space or spacing bracket:
  // e.g. "\[2pt]" inside matrices -> "\\[2pt]"
  text = text.replace(/([^\\])\\\[(\d+pt)\]/g, "$1\\\\\[$2\]");

  // Fix single backslash row breaks before digits/minus inside matrices or determinants:
  // e.g. "-1&4\2&0" -> "-1&4\\ 2&0"
  text = text.replace(/(\\begin\{(?:[bvpB]?matrix|vmatrix|aligned|cases)\}[\s\S]*?\\end\{(?:[bvpB]?matrix|vmatrix|aligned|cases)\})/g, (block) => {
    // Replace single backslash followed by a number, minus, or newline that isn't already double backslash
    let fixed = block.replace(/([0-9a-zA-Z\}\]])\\([0-9a-zA-Z\-\+])/g, "$1\\\\ $2");
    // Replace single backslash followed by newline
    fixed = fixed.replace(/([0-9a-zA-Z\}\]])\\\s*(\r?\n)/g, "$1\\\\$2");
    return fixed;
  });

  // 3. Convert double-escaped or single-escaped display math:
  // \\[ ... \\] or \[ ... \] -> $$ ... $$
  text = text.replace(/\\\\\[([\s\S]*?)\\\\\]/g, (_, formula) => `\n\n$$\n${formula.trim()}\n$$\n\n`);
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, formula) => `\n\n$$\n${formula.trim()}\n$$\n\n`);

  // 4. Convert double-escaped or single-escaped inline math:
  // \\( ... \\) or \( ... \) -> $ ... $
  text = text.replace(/\\\\\(([\s\S]*?)\\\\\)/g, (_, formula) => `$${formula.trim()}$`);
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, formula) => `$${formula.trim()}$`);

  // 5. Fix fragmented math expressions where math operators (\iff, \implies, \land, \text)
  // are mixed with raw inline $...$ delimiters:
  // e.g. R \text{ is Equivalence} \iff [R \text{ Reflexive } (aRa)] \land [R \text{ Symmetric } $aRb \implies bRa$] ...
  text = text.replace(
    /(?:^|\n)([^\$\n]*(?:\\iff|\\implies|\\land|\\lor|\\subset|\\in|\\forall|\\exists)[^\n]*\$[^\$\n]+\$[^\n]*)(?=\r?\n|$)/g,
    (_, line) => {
      const clean = line.replace(/\$/g, "").trim();
      return `\n\n$$\n${clean}\n$$\n\n`;
    }
  );

  // 6. Convert block equations enclosed in unescaped [ \something ... ]:
  // e.g. [ \mathbf{A}= \begin{bmatrix} ... \end{bmatrix} ]
  // e.g. [ \det(\mathbf{A})= ... ]
  // e.g. [ \boxed{\displaystyle ... } ]
  // e.g. [ \text{Area}= ... ]
  text = text.replace(/(^|\n)[ \t]*\[[ \t]*(\\(?:[a-zA-Z]+|\operatorname|mathbf|det|boxed|text|int|frac|sum)[\s\S]*?)\][ \t]*(?=\r?\n|$)/g, (_, prefix, formula) => {
    return `${prefix}\n\n$$\n${formula.trim()}\n$$\n\n`;
  });

  // 7. Wrap any standalone \begin{matrix/bmatrix/vmatrix/pmatrix/aligned/cases} environments
  // that are NOT already enclosed in $$ or $ into $$ ... $$
  text = text.replace(
    /(^|[^\$])(\\begin\{(?:[bvpB]?matrix|vmatrix|aligned|cases)\}[\s\S]*?\\end\{(?:[bvpB]?matrix|vmatrix|aligned|cases)\})([^\$]|$)/g,
    (_, before, block, after) => `${before}\n\n$$\n${block.trim()}\n$$\n\n${after}`
  );

  // 8. Convert unescaped parenthesized math containing LaTeX commands in prose:
  // e.g. (3\times 3), (\mathbf{A}^{-1}), (\det(\mathbf{A})\neq 0), (\pm \sqrt{2})
  // Strictly avoid matching \left( ... \right) LaTeX delimiters
  for (let i = 0; i < 3; i++) {
    text = text.replace(/(?<!\\left)\(([^()\n\$]*?\\[a-zA-Z]+[^()\n\$]*?)\)(?!\\right)/g, (_, formula) => `$${formula.trim()}$`);
  }

  // 9. Strip inner stray $ signs inside display math blocks $$ ... $$:
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, inner) => {
    return `\n\n$$\n${inner.replace(/\$/g, "").trim()}\n$$\n\n`;
  });

  // 10. Clean up extra blank lines created by wrapping
  text = text.replace(/\n{3,}/g, "\n\n");

  return text;
}
