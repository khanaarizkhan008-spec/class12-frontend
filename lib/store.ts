import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  Subject,
  TopicStatus,
  QuizAttempt,
  MockTest,
  RevisionScheduleItem,
  PlannerTask,
  StudySession,
  MistakeLogItem,
  ChatMessage,
  AppSettings,
  Topic,
  User,
} from "./types";
import { DEFAULT_SYLLABUS } from "@/data/syllabus";
import { getTodayDateString } from "./utils";

/**
 * Returns a pristine syllabus where every topic is in "not_started" status,
 * ensuring unauthenticated guests start with 0 records and 0% coverage.
 */
export function getZeroRecordsSyllabus(): Subject[] {
  return DEFAULT_SYLLABUS.map((sub) => ({
    ...sub,
    units: sub.units.map((u) => ({
      ...u,
      chapters: u.chapters.map((c) => ({
        ...c,
        topics: c.topics.map((t) => ({
          ...t,
          status: "not_started" as TopicStatus,
          isUnverified: false,
          learnedAt: undefined,
          lastRevisedAt: undefined,
        })),
      })),
    })),
  }));
}

interface AppState {
  // Authentication & Guest State
  currentUser: User | null;
  authModalOpen: boolean;
  authModalMode: "login" | "register";
  authPromptReason?: string;

  // Study Tracker Records (0 records for guests)
  syllabus: Subject[];
  mockTests: MockTest[];
  quizHistory: QuizAttempt[];
  revisionSchedule: RevisionScheduleItem[];
  plannerTasks: PlannerTask[];
  studySessions: StudySession[];
  mistakes: MistakeLogItem[];
  chatMessages: ChatMessage[];
  settings: AppSettings;
  lastSyncedAt: string | null;
  isSyncing: boolean;

  // Auth Actions
  openAuthModal: (mode?: "login" | "register", reason?: string) => void;
  closeAuthModal: () => void;
  loginUser: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (user: User) => Promise<void>;
  logout: () => void;

  // Syllabus Tracker Actions
  updateTopicStatus: (
    subjectId: string,
    chapterId: string,
    topicId: string,
    status: TopicStatus,
    isUnverified?: boolean
  ) => void;

  addChapter: (subjectId: string, unitId: string, chapterName: string, marksWeightage?: number) => void;
  renameChapter: (subjectId: string, chapterId: string, newName: string, marksWeightage?: number) => void;
  deleteChapter: (subjectId: string, chapterId: string) => void;

  addTopic: (subjectId: string, chapterId: string, topicName: string) => void;
  renameTopic: (subjectId: string, chapterId: string, topicId: string, newName: string) => void;
  deleteTopic: (subjectId: string, chapterId: string, topicId: string) => void;
  reorderTopics: (subjectId: string, chapterId: string, topics: Topic[]) => void;
  resetSyllabusToDefault: () => void;

  // Quiz
  addQuizAttempt: (attempt: Omit<QuizAttempt, "id" | "date">) => QuizAttempt;

  // Mock Tests
  addMockTest: (test: Omit<MockTest, "id" | "percentage">) => void;
  updateMockTest: (test: MockTest) => void;
  deleteMockTest: (id: string) => void;

  // Planner
  addPlannerTask: (task: Omit<PlannerTask, "id">) => void;
  toggleTask: (id: string) => void;
  deletePlannerTask: (id: string) => void;

  // Study Sessions (Pomodoro)
  logStudySession: (session: Omit<StudySession, "id">) => void;

  // Mistakes
  addMistake: (mistake: Omit<MistakeLogItem, "id" | "date">) => void;
  toggleMistakeRetry: (id: string) => void;
  toggleMistakeResolved: (id: string) => void;
  deleteMistake: (id: string) => void;

  // Chat
  addChatMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearChatMessages: (subjectId?: string) => void;

  // Settings
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  // Sync & Export/Import
  syncWithBackend: () => Promise<{ success: boolean; error?: string }>;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  resetAllData: () => void;
}

const defaultSettings: AppSettings = {
  passMark: 4,
  targetPercentage: 90,
  firstExamDate: "2026-02-15",
  examDatesheet: {
    maths: "2026-03-09",
    physics: "2026-02-24",
    chemistry: "2026-03-02",
    cs: "2026-03-23",
    english: "2026-02-18",
    pe: "2026-03-16",
  },
  theme: "dark",
  soundEnabled: true,
  autoSync: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      authModalOpen: false,
      authModalMode: "login",
      authPromptReason: undefined,

      // Initial state is 0 records (clean guest state)
      syllabus: getZeroRecordsSyllabus(),
      mockTests: [],
      quizHistory: [],
      revisionSchedule: [],
      plannerTasks: [],
      studySessions: [],
      mistakes: [],
      chatMessages: [
        {
          id: "welcome-bot-msg",
          role: "assistant",
          content:
            "Hello! I'm your dedicated CBSE Class 12 AI Doubt Solver. Ask me any concept, derivation, numerical, Python code, or board question from Maths, Physics, Chemistry, CS, English or PE!",
          timestamp: new Date().toISOString(),
        },
      ],
      settings: defaultSettings,
      lastSyncedAt: null,
      isSyncing: false,

      // -------------------------------------------------------------
      // AUTH ACTIONS
      // -------------------------------------------------------------
      openAuthModal: (mode = "login", reason?: string) => {
        set({ authModalOpen: true, authModalMode: mode, authPromptReason: reason });
      },

      closeAuthModal: () => {
        set({ authModalOpen: false, authPromptReason: undefined });
      },

      loginUser: async (email: string, password: string) => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const res = await fetch(`${apiUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) {
            return { success: false, error: data.error || "Login failed" };
          }

          const user: User = data.user;
          await get().login(user);
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.message || "Failed to reach authentication server" };
        }
      },

      registerUser: async (name: string, email: string, password: string) => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const res = await fetch(`${apiUrl}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          });
          const data = await res.json();
          if (!res.ok) {
            return { success: false, error: data.error || "Registration failed" };
          }

          const user: User = data.user;
          await get().login(user);
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.message || "Failed to reach authentication server" };
        }
      },

      login: async (user: User) => {
        const localKey = `cbse12_user_${user.id}_data`;
        let loadedData: any = null;

        if (typeof window !== "undefined") {
          const raw = localStorage.getItem(localKey);
          if (raw) {
            try {
              loadedData = JSON.parse(raw);
            } catch (e) {
              console.warn("Error parsing user local data:", e);
            }
          }
        }

        // Try syncing from backend SQLite
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const syncRes = await fetch(`${apiUrl}/api/sync?userId=${user.id}`);
          if (syncRes.ok) {
            const syncJson = await syncRes.json();
            if (syncJson.data) {
              if (!loadedData || (syncJson.updatedAt && new Date(syncJson.updatedAt) >= new Date(loadedData.updatedAt || 0))) {
                loadedData = syncJson.data;
              }
            }
          }
        } catch (e) {
          console.warn("Backend sync check failed during login:", e);
        }

        if (loadedData) {
          set({
            currentUser: user,
            syllabus: loadedData.syllabus || getZeroRecordsSyllabus(),
            mockTests: loadedData.mockTests || [],
            quizHistory: loadedData.quizHistory || [],
            revisionSchedule: loadedData.revisionSchedule || [],
            plannerTasks: loadedData.plannerTasks || [],
            studySessions: loadedData.studySessions || [],
            mistakes: loadedData.mistakes || [],
            settings: loadedData.settings ? { ...defaultSettings, ...loadedData.settings } : defaultSettings,
            authModalOpen: false,
            authPromptReason: undefined,
          });
        } else {
          // Brand new user starts with 0 records
          set({
            currentUser: user,
            syllabus: getZeroRecordsSyllabus(),
            mockTests: [],
            quizHistory: [],
            revisionSchedule: [],
            plannerTasks: [],
            studySessions: [],
            mistakes: [],
            settings: defaultSettings,
            authModalOpen: false,
            authPromptReason: undefined,
          });
        }
      },

      logout: () => {
        const state = get();
        if (state.currentUser && typeof window !== "undefined") {
          const localKey = `cbse12_user_${state.currentUser.id}_data`;
          const exportData = {
            syllabus: state.syllabus,
            mockTests: state.mockTests,
            quizHistory: state.quizHistory,
            revisionSchedule: state.revisionSchedule,
            plannerTasks: state.plannerTasks,
            studySessions: state.studySessions,
            mistakes: state.mistakes,
            settings: state.settings,
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem(localKey, JSON.stringify(exportData));
        }

        // Reset to pristine 0 records guest state
        set({
          currentUser: null,
          syllabus: getZeroRecordsSyllabus(),
          mockTests: [],
          quizHistory: [],
          revisionSchedule: [],
          plannerTasks: [],
          studySessions: [],
          mistakes: [],
          settings: defaultSettings,
          lastSyncedAt: null,
        });
      },

      // -------------------------------------------------------------
      // SYLLABUS TRACKER (Guarded: Login required to add records)
      // -------------------------------------------------------------
      updateTopicStatus: (subjectId, chapterId, topicId, status, isUnverified = false) => {
        if (!get().currentUser) {
          get().openAuthModal(
            "login",
            "Please sign in or create an account to record topic completion and unlock spaced repetition schedules!"
          );
          return;
        }

        set((state) => {
          const nowStr = new Date().toISOString();
          let topicName = "";
          let chapterName = "";
          let subjectName = "";
          let subjectColor = "#3b82f6";

          const newSyllabus = state.syllabus.map((sub) => {
            if (sub.id !== subjectId) return sub;
            subjectName = sub.name;
            subjectColor = sub.color;

            const newUnits = sub.units.map((unit) => {
              const newChapters = unit.chapters.map((chap) => {
                if (chap.id !== chapterId) return chap;
                chapterName = chap.name;

                const newTopics = chap.topics.map((top) => {
                  if (top.id !== topicId) return top;
                  topicName = top.name;
                  return {
                    ...top,
                    status,
                    isUnverified,
                    learnedAt: status === "learned" ? nowStr : top.learnedAt,
                    lastRevisedAt: status.startsWith("revised") ? nowStr : top.lastRevisedAt,
                  };
                });
                return { ...chap, topics: newTopics };
              });
              return { ...unit, chapters: newChapters };
            });
            return { ...sub, units: newUnits };
          });

          // Generate Spaced Repetition items if confirmed learned
          let newRevisionSchedule = [...state.revisionSchedule];
          if (status === "learned") {
            const today = new Date();
            const intervals: Array<3 | 7 | 21> = [3, 7, 21];
            intervals.forEach((days) => {
              const dueDate = new Date(today);
              dueDate.setDate(dueDate.getDate() + days);
              const dueStr = dueDate.toISOString().split("T")[0];

              newRevisionSchedule.push({
                id: `rev-${topicId}-${days}-${Date.now()}`,
                topicId,
                topicName: topicName || topicId,
                chapterId,
                chapterName: chapterName || chapterId,
                subjectId,
                subjectName,
                subjectColor,
                dueDate: dueStr,
                intervalDay: days,
                completed: false,
              });
            });
          }

          return {
            syllabus: newSyllabus,
            revisionSchedule: newRevisionSchedule,
          };
        });

        // Auto sync if enabled
        if (get().settings.autoSync) {
          get().syncWithBackend();
        }
      },

      addChapter: (subjectId, unitId, chapterName, marksWeightage) => {
        if (!get().currentUser) {
          get().openAuthModal("login", "Please sign in or create an account to customize chapters and weightage.");
          return;
        }

        set((state) => {
          const newId = `${subjectId}-c-${Date.now()}`;
          const newSyllabus = state.syllabus.map((sub) => {
            if (sub.id !== subjectId) return sub;
            const newUnits = sub.units.map((u) => {
              if (u.id !== unitId) return u;
              return {
                ...u,
                chapters: [
                  ...u.chapters,
                  {
                    id: newId,
                    name: chapterName,
                    marksWeightage: marksWeightage || 0,
                    topics: [],
                  },
                ],
              };
            });
            return { ...sub, units: newUnits };
          });
          return { syllabus: newSyllabus };
        });

        if (get().settings.autoSync) get().syncWithBackend();
      },

      renameChapter: (subjectId, chapterId, newName, marksWeightage) => {
        if (!get().currentUser) {
          get().openAuthModal("login", "Please sign in or create an account to rename syllabus chapters.");
          return;
        }

        set((state) => {
          const newSyllabus = state.syllabus.map((sub) => {
            if (sub.id !== subjectId) return sub;
            const newUnits = sub.units.map((u) => {
              const newChapters = u.chapters.map((chap) => {
                if (chap.id !== chapterId) return chap;
                return {
                  ...chap,
                  name: newName,
                  marksWeightage: marksWeightage !== undefined ? marksWeightage : chap.marksWeightage,
                };
              });
              return { ...u, chapters: newChapters };
            });
            return { ...sub, units: newUnits };
          });
          return { syllabus: newSyllabus };
        });

        if (get().settings.autoSync) get().syncWithBackend();
      },

      deleteChapter: (subjectId, chapterId) => {
        if (!get().currentUser) {
          get().openAuthModal("login", "Please sign in or create an account to modify syllabus structure.");
          return;
        }

        set((state) => {
          const newSyllabus = state.syllabus.map((sub) => {
            if (sub.id !== subjectId) return sub;
            const newUnits = sub.units.map((u) => ({
              ...u,
              chapters: u.chapters.filter((c) => c.id !== chapterId),
            }));
            return { ...sub, units: newUnits };
          });
          return { syllabus: newSyllabus };
        });

        if (get().settings.autoSync) get().syncWithBackend();
      },

      addTopic: (subjectId, chapterId, topicName) => {
        if (!get().currentUser) {
          get().openAuthModal("login", "Please sign in or create an account to add custom topics.");
          return;
        }

        set((state) => {
          const newId = `t-${Date.now()}`;
          const newSyllabus = state.syllabus.map((sub) => {
            if (sub.id !== subjectId) return sub;
            const newUnits = sub.units.map((u) => {
              const newChapters = u.chapters.map((chap) => {
                if (chap.id !== chapterId) return chap;
                return {
                  ...chap,
                  topics: [
                    ...chap.topics,
                    { id: newId, name: topicName, status: "not_started" as TopicStatus },
                  ],
                };
              });
              return { ...u, chapters: newChapters };
            });
            return { ...sub, units: newUnits };
          });
          return { syllabus: newSyllabus };
        });

        if (get().settings.autoSync) get().syncWithBackend();
      },

      renameTopic: (subjectId, chapterId, topicId, newName) => {
        if (!get().currentUser) {
          get().openAuthModal("login", "Please sign in or create an account to rename topics.");
          return;
        }

        set((state) => {
          const newSyllabus = state.syllabus.map((sub) => {
            if (sub.id !== subjectId) return sub;
            const newUnits = sub.units.map((u) => {
              const newChapters = u.chapters.map((chap) => {
                if (chap.id !== chapterId) return chap;
                const newTopics = chap.topics.map((t) => {
                  if (t.id !== topicId) return t;
                  return { ...t, name: newName };
                });
                return { ...chap, topics: newTopics };
              });
              return { ...u, chapters: newChapters };
            });
            return { ...sub, units: newUnits };
          });
          return { syllabus: newSyllabus };
        });

        if (get().settings.autoSync) get().syncWithBackend();
      },

      deleteTopic: (subjectId, chapterId, topicId) => {
        if (!get().currentUser) {
          get().openAuthModal("login", "Please sign in or create an account to modify topics.");
          return;
        }

        set((state) => {
          const newSyllabus = state.syllabus.map((sub) => {
            if (sub.id !== subjectId) return sub;
            const newUnits = sub.units.map((u) => {
              const newChapters = u.chapters.map((chap) => {
                if (chap.id !== chapterId) return chap;
                return {
                  ...chap,
                  topics: chap.topics.filter((t) => t.id !== topicId),
                };
              });
              return { ...u, chapters: newChapters };
            });
            return { ...sub, units: newUnits };
          });
          return { syllabus: newSyllabus };
        });

        if (get().settings.autoSync) get().syncWithBackend();
      },

      reorderTopics: (subjectId, chapterId, topics) => {
        if (!get().currentUser) {
          get().openAuthModal("login", "Please sign in or create an account to reorder topics.");
          return;
        }

        set((state) => {
          const newSyllabus = state.syllabus.map((sub) => {
            if (sub.id !== subjectId) return sub;
            const newUnits = sub.units.map((u) => {
              const newChapters = u.chapters.map((chap) => {
                if (chap.id !== chapterId) return chap;
                return { ...chap, topics };
              });
              return { ...u, chapters: newChapters };
            });
            return { ...sub, units: newUnits };
          });
          return { syllabus: newSyllabus };
        });

        if (get().settings.autoSync) get().syncWithBackend();
      },

      resetSyllabusToDefault: () => {
        set({ syllabus: getZeroRecordsSyllabus() });
      },

      // -------------------------------------------------------------
      // QUIZ ATTEMPTS (Guarded)
      // -------------------------------------------------------------
      addQuizAttempt: (attemptData) => {
        const attempt: QuizAttempt = {
          ...attemptData,
          id: `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          date: new Date().toISOString(),
        };

        if (!get().currentUser) {
          get().openAuthModal("login", "Please sign in or create an account to save quiz scores and history.");
          return attempt;
        }

        set((state) => ({
          quizHistory: [attempt, ...state.quizHistory],
        }));

        if (get().settings.autoSync) get().syncWithBackend();
        return attempt;
      },

      // -------------------------------------------------------------
      // MOCK TESTS (Guarded)
      // -------------------------------------------------------------
      addMockTest: (testData) => {
        if (!get().currentUser) {
          get().openAuthModal("login", "Please sign in or create an account to log mock tests and analyze score trends.");
          return;
        }

        const percentage =
          testData.totalMarks > 0
            ? Math.round((testData.marksObtained / testData.totalMarks) * 100)
            : 0;

        const newTest: MockTest = {
          ...testData,
          id: `mock-${Date.now()}`,
          percentage,
        };

        set((state) => ({
          mockTests: [newTest, ...state.mockTests],
        }));

        if (get().settings.autoSync) get().syncWithBackend();
      },

      updateMockTest: (updatedTest) => {
        if (!get().currentUser) {
          get().openAuthModal("login", "Please sign in to edit mock tests.");
          return;
        }

        set((state) => ({
          mockTests: state.mockTests.map((t) => (t.id === updatedTest.id ? updatedTest : t)),
        }));

        if (get().settings.autoSync) get().syncWithBackend();
      },

      deleteMockTest: (id) => {
        if (!get().currentUser) {
          get().openAuthModal("login", "Please sign in to delete mock tests.");
          return;
        }

        set((state) => ({
          mockTests: state.mockTests.filter((t) => t.id !== id),
        }));

        if (get().settings.autoSync) get().syncWithBackend();
      },

      // -------------------------------------------------------------
      // PLANNER TASKS (Guarded)
      // -------------------------------------------------------------
      addPlannerTask: (taskData) => {
        if (!get().currentUser) {
          get().openAuthModal("login", "Please sign in or create an account to add tasks to your study planner.");
          return;
        }

        const newTask: PlannerTask = {
          ...taskData,
          id: `task-${Date.now()}`,
        };

        set((state) => ({
          plannerTasks: [newTask, ...state.plannerTasks],
        }));

        if (get().settings.autoSync) get().syncWithBackend();
      },

      toggleTask: (id) => {
        if (!get().currentUser) {
          get().openAuthModal("login", "Please sign in or create an account to mark tasks completed.");
          return;
        }

        set((state) => ({
          plannerTasks: state.plannerTasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
          revisionSchedule: state.revisionSchedule.map((r) =>
            r.id === id ? { ...r, completed: !r.completed } : r
          ),
        }));

        if (get().settings.autoSync) get().syncWithBackend();
      },

      deletePlannerTask: (id) => {
        if (!get().currentUser) {
          get().openAuthModal("login", "Please sign in to delete planner tasks.");
          return;
        }

        set((state) => ({
          plannerTasks: state.plannerTasks.filter((t) => t.id !== id),
        }));

        if (get().settings.autoSync) get().syncWithBackend();
      },

      // -------------------------------------------------------------
      // STUDY SESSIONS / POMODORO (Guarded)
      // -------------------------------------------------------------
      logStudySession: (sessionData) => {
        if (!get().currentUser) {
          get().openAuthModal("login", "Please sign in or create an account to record your study hours and maintain streaks.");
          return;
        }

        const session: StudySession = {
          ...sessionData,
          id: `session-${Date.now()}`,
        };
        set((state) => ({
          studySessions: [session, ...state.studySessions],
        }));

        if (get().settings.autoSync) get().syncWithBackend();
      },

      // -------------------------------------------------------------
      // MISTAKES BANK (Guarded)
      // -------------------------------------------------------------
      addMistake: (mistakeData) => {
        if (!get().currentUser) {
          get().openAuthModal("login", "Please sign in or create an account to record questions in your Mistake Notebook.");
          return;
        }

        const mistake: MistakeLogItem = {
          ...mistakeData,
          id: `mistake-${Date.now()}`,
          date: getTodayDateString(),
        };

        set((state) => {
          let updatedPlanner = state.plannerTasks;
          if (mistake.retryFlag) {
            updatedPlanner = [
              {
                id: `retry-${mistake.id}`,
                title: `Retry problem: ${mistake.topic} (${mistake.category} mistake)`,
                subjectId: mistake.subjectId,
                source: "retry_mistake",
                date: getTodayDateString(),
                completed: false,
                priority: "high",
              },
              ...state.plannerTasks,
            ];
          }
          return {
            mistakes: [mistake, ...state.mistakes],
            plannerTasks: updatedPlanner,
          };
        });

        if (get().settings.autoSync) get().syncWithBackend();
      },

      toggleMistakeRetry: (id) => {
        if (!get().currentUser) {
          get().openAuthModal("login", "Please sign in to manage mistakes.");
          return;
        }

        set((state) => ({
          mistakes: state.mistakes.map((m) =>
            m.id === id ? { ...m, retryFlag: !m.retryFlag } : m
          ),
        }));

        if (get().settings.autoSync) get().syncWithBackend();
      },

      toggleMistakeResolved: (id) => {
        if (!get().currentUser) {
          get().openAuthModal("login", "Please sign in to resolve mistakes.");
          return;
        }

        set((state) => ({
          mistakes: state.mistakes.map((m) =>
            m.id === id ? { ...m, resolved: !m.resolved } : m
          ),
        }));

        if (get().settings.autoSync) get().syncWithBackend();
      },

      deleteMistake: (id) => {
        if (!get().currentUser) {
          get().openAuthModal("login", "Please sign in to delete mistake records.");
          return;
        }

        set((state) => ({
          mistakes: state.mistakes.filter((m) => m.id !== id),
        }));

        if (get().settings.autoSync) get().syncWithBackend();
      },

      // -------------------------------------------------------------
      // DOUBT BOT CHAT MESSAGES
      // -------------------------------------------------------------
      addChatMessage: (msgData) => {
        const newMsg: ChatMessage = {
          ...msgData,
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          chatMessages: [...state.chatMessages, newMsg],
        }));
      },

      clearChatMessages: (subjectId) => {
        set((state) => ({
          chatMessages: subjectId
            ? state.chatMessages.filter((m) => m.subjectId !== subjectId)
            : [],
        }));
      },

      // -------------------------------------------------------------
      // APP SETTINGS
      // -------------------------------------------------------------
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
        if (get().currentUser && get().settings.autoSync) {
          get().syncWithBackend();
        }
      },

      // -------------------------------------------------------------
      // MULTI-USER SYNC & BACKEND PERSISTENCE
      // -------------------------------------------------------------
      syncWithBackend: async () => {
        const state = get();
        if (!state.currentUser) {
          return { success: false, error: "Please sign in to sync your study records." };
        }

        set({ isSyncing: true });
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const res = await fetch(`${apiUrl}/api/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: state.currentUser.id,
              payload: {
                syllabus: state.syllabus,
                mockTests: state.mockTests,
                quizHistory: state.quizHistory,
                revisionSchedule: state.revisionSchedule,
                plannerTasks: state.plannerTasks,
                studySessions: state.studySessions,
                mistakes: state.mistakes,
                settings: state.settings,
                updatedAt: new Date().toISOString(),
              },
            }),
          });

          if (!res.ok) {
            throw new Error(`Sync failed with HTTP ${res.status}`);
          }

          // Save copy in localStorage under user key
          if (typeof window !== "undefined") {
            const localKey = `cbse12_user_${state.currentUser.id}_data`;
            localStorage.setItem(
              localKey,
              JSON.stringify({
                syllabus: state.syllabus,
                mockTests: state.mockTests,
                quizHistory: state.quizHistory,
                revisionSchedule: state.revisionSchedule,
                plannerTasks: state.plannerTasks,
                studySessions: state.studySessions,
                mistakes: state.mistakes,
                settings: state.settings,
                updatedAt: new Date().toISOString(),
              })
            );
          }

          set({ lastSyncedAt: new Date().toISOString(), isSyncing: false });
          return { success: true };
        } catch (err: any) {
          set({ isSyncing: false });
          return { success: false, error: err.message || "Failed to reach server" };
        }
      },

      exportData: () => {
        const state = get();
        const exportObj = {
          version: "2.0",
          user: state.currentUser,
          exportedAt: new Date().toISOString(),
          syllabus: state.syllabus,
          mockTests: state.mockTests,
          quizHistory: state.quizHistory,
          revisionSchedule: state.revisionSchedule,
          plannerTasks: state.plannerTasks,
          studySessions: state.studySessions,
          mistakes: state.mistakes,
          settings: state.settings,
        };
        return JSON.stringify(exportObj, null, 2);
      },

      importData: (jsonStr: string) => {
        try {
          const parsed = JSON.parse(jsonStr);
          if (!parsed.syllabus) return false;
          set({
            syllabus: parsed.syllabus || getZeroRecordsSyllabus(),
            mockTests: parsed.mockTests || [],
            quizHistory: parsed.quizHistory || [],
            revisionSchedule: parsed.revisionSchedule || [],
            plannerTasks: parsed.plannerTasks || [],
            studySessions: parsed.studySessions || [],
            mistakes: parsed.mistakes || [],
            settings: parsed.settings ? { ...defaultSettings, ...parsed.settings } : defaultSettings,
          });
          if (get().currentUser) get().syncWithBackend();
          return true;
        } catch (e) {
          console.error("Import error:", e);
          return false;
        }
      },

      resetAllData: () => {
        set({
          syllabus: getZeroRecordsSyllabus(),
          mockTests: [],
          quizHistory: [],
          revisionSchedule: [],
          plannerTasks: [],
          studySessions: [],
          mistakes: [],
          chatMessages: [],
          settings: defaultSettings,
          lastSyncedAt: null,
        });
      },
    }),
    {
      name: "cbse12-exam-tracker-session",
      storage: createJSONStorage(() => localStorage),
      // Persist only session meta: if currentUser is null, guests always boot with 0 records
      partialize: (state) => ({
        currentUser: state.currentUser,
        settings: state.settings,
        ...(state.currentUser
          ? {
              syllabus: state.syllabus,
              mockTests: state.mockTests,
              quizHistory: state.quizHistory,
              revisionSchedule: state.revisionSchedule,
              plannerTasks: state.plannerTasks,
              studySessions: state.studySessions,
              mistakes: state.mistakes,
              lastSyncedAt: state.lastSyncedAt,
            }
          : {}),
      }),
    }
  )
);
