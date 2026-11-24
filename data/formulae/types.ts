export interface PracticeProblem {
  id: string;
  source: string; // e.g. "RD Sharma Ex 6.1 Q2 (Easy Level)", "HC Verma Ch 29 Q2 (Easy Level)"
  difficulty: "Easy" | "Board Standard";
  question: string;
  hint?: string;
  solution: string;
  answer: string;
}

export interface FormulaItem {
  id: string;
  subjectId: "maths" | "physics" | "chemistry" | "cs" | "english" | "pe";
  chapter: string;
  name: string;
  formulaLatex: string;
  description: string;
  standardReference: string;
  practiceProblems: PracticeProblem[];
}
