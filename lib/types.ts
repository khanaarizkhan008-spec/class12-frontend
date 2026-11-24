export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  token?: string;
}

export type TopicStatus =
  | 'not_started'
  | 'learned'
  | 'revised_1x'
  | 'revised_2x'
  | 'exam_ready';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  type?: 'plain' | 'assertion_reason' | 'case_based';
}

export interface QuizAttempt {
  id: string;
  topicId: string;
  topicName: string;
  subjectId: string;
  chapterId: string;
  date: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  questions: QuizQuestion[];
  userAnswers: number[];
}

export interface Topic {
  id: string;
  name: string;
  status: TopicStatus;
  learnedAt?: string;
  isUnverified?: boolean;
  lastRevisedAt?: string;
}

export interface Chapter {
  id: string;
  name: string;
  marksWeightage?: number;
  topics: Topic[];
}

export interface Unit {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  bgLight: string;
  bgDark: string;
  units: Unit[];
  practical: string[];
}

export type MockTestType = 'sample_paper' | 'pyq' | 'school_test' | 'full_mock';

export interface MockTest {
  id: string;
  date: string;
  subjectId: string;
  testName: string;
  type: MockTestType;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  timeTakenMinutes?: number;
  notes?: string;
}

export interface RevisionScheduleItem {
  id: string;
  topicId: string;
  topicName: string;
  chapterId: string;
  chapterName: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  dueDate: string;
  intervalDay: 3 | 7 | 21;
  completed: boolean;
}

export interface PlannerTask {
  id: string;
  title: string;
  subjectId?: string;
  source: 'revision' | 'failed_quiz' | 'high_weightage' | 'retry_mistake' | 'manual';
  date: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface StudySession {
  id: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  notes?: string;
}

export type MistakeCategory = 'concept' | 'calculation' | 'silly' | 'time';

export interface MistakeLogItem {
  id: string;
  subjectId: string;
  topic: string;
  whatWentWrong: string;
  category: MistakeCategory;
  retryFlag: boolean;
  date: string;
  resolved: boolean;
}

// Subject Specific Extras
export interface FormulaItem {
  id: string;
  title: string;
  subjectId: 'maths' | 'physics' | 'chemistry';
  chapter: string;
  formula: string;
  notes?: string;
}

export interface StuckProblem {
  id: string;
  subjectId: string;
  topic: string;
  problem: string;
  notes?: string;
  resolved: boolean;
  date: string;
}

export interface DerivationOrReaction {
  id: string;
  subjectId: 'physics' | 'chemistry';
  name: string;
  chapter: string;
  completed: boolean;
  notes?: string;
}

export interface PracticalRecord {
  id: string;
  subjectId: string;
  title: string;
  completed: boolean;
  vivaPrepared: boolean;
}

export interface WritingFormatItem {
  id: string;
  title: string; // e.g., 'Notice', 'Invitation (Formal)', 'Letter to Editor'
  formatTemplate: string;
  keyPoints: string[];
  practiced: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  subjectId?: string;
  topicContext?: string;
}

export interface AppSettings {
  passMark: number; // default 4 (out of 5)
  targetPercentage: number; // default 90%
  firstExamDate: string; // YYYY-MM-DD
  examDatesheet: Record<string, string>; // subjectId -> YYYY-MM-DD
  theme: 'dark' | 'light' | 'system';
  soundEnabled: boolean;
  autoSync: boolean;
}
