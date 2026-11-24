"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { MockTest, MockTestType } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  LineChart as ChartIcon,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Award,
  Calendar,
  CheckCircle2,
} from "lucide-react";

const TEST_TYPE_LABELS: Record<MockTestType, string> = {
  sample_paper: "Sample Paper",
  pyq: "PYQ (Previous Year)",
  school_test: "School Pre-Board / Test",
  full_mock: "Full Syllabus Mock",
};

export default function MocksPage() {
  const {
    currentUser,
    openAuthModal,
    mockTests,
    addMockTest,
    updateMockTest,
    deleteMockTest,
    syllabus,
    settings,
  } = useAppStore();

  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);

  // Form State
  const [subjectId, setSubjectId] = useState("maths");
  const [testName, setTestName] = useState("");
  const [testType, setTestType] = useState<MockTestType>("sample_paper");
  const [marksObtained, setMarksObtained] = useState<number>(65);
  const [totalMarks, setTotalMarks] = useState<number>(80);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeTakenMinutes, setTimeTakenMinutes] = useState<number>(180);
  const [notes, setNotes] = useState("");

  const targetPercentage = settings.targetPercentage || 90;

  // Chart data preparation
  const chartData = useMemo(() => {
    const sorted = [...mockTests].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const dateMap = new Map<string, any>();

    sorted.forEach((test) => {
      const dLabel = test.date;
      if (!dateMap.has(dLabel)) {
        dateMap.set(dLabel, { date: formatDate(dLabel), rawDate: dLabel });
      }
      const entry = dateMap.get(dLabel);
      entry[test.subjectId] = test.percentage;

      const scores = syllabus
        .map((s) => entry[s.id])
        .filter((val) => typeof val === "number");
      if (scores.length > 0) {
        entry.average = Math.round(
          scores.reduce((a, b) => a + b, 0) / scores.length
        );
      }
    });

    return Array.from(dateMap.values());
  }, [mockTests, syllabus]);

  // Per-subject statistics (latest, best, trend)
  const subjectStats = useMemo(() => {
    return syllabus.map((sub) => {
      const tests = mockTests
        .filter((t) => t.subjectId === sub.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (tests.length === 0) {
        return {
          ...sub,
          count: 0,
          latest: 0,
          best: 0,
          trend: "none",
        };
      }

      const latest = tests[tests.length - 1].percentage;
      const best = Math.max(...tests.map((t) => t.percentage));

      let trend = "stable";
      if (tests.length >= 2) {
        const prev = tests[tests.length - 2].percentage;
        if (latest > prev + 1) trend = "improving";
        else if (latest < prev - 1) trend = "dropping";
      }

      return {
        ...sub,
        count: tests.length,
        latest,
        best,
        trend,
      };
    });
  }, [mockTests, syllabus]);

  // Filtered Tests for the Table
  const filteredTests = useMemo(() => {
    let list = [...mockTests].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (activeSubjectFilter !== "all") {
      list = list.filter((t) => t.subjectId === activeSubjectFilter);
    }
    return list;
  }, [mockTests, activeSubjectFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) return;

    if (editingTestId) {
      updateMockTest({
        id: editingTestId,
        date,
        subjectId,
        testName,
        type: testType,
        marksObtained,
        totalMarks,
        percentage: totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0,
        timeTakenMinutes,
        notes,
      });
      setEditingTestId(null);
    } else {
      addMockTest({
        date,
        subjectId,
        testName: testName || `${syllabus.find((s) => s.id === subjectId)?.name} Mock Test`,
        type: testType,
        marksObtained,
        totalMarks,
        timeTakenMinutes,
        notes,
      });
    }

    setTestName("");
    setNotes("");
    setModalOpen(false);
  };

  const handleEdit = (test: MockTest) => {
    setEditingTestId(test.id);
    setDate(test.date);
    setSubjectId(test.subjectId);
    setTestName(test.testName);
    setTestType(test.type);
    setMarksObtained(test.marksObtained);
    setTotalMarks(test.totalMarks);
    setTimeTakenMinutes(test.timeTakenMinutes || 180);
    setNotes(test.notes || "");
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-200/80 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#b8ff3c] animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
              Performance Analytics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            Mock Test Command & Trajectory
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Score % trajectories over time • Benchmark against target {targetPercentage}% • Score curves
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) {
              openAuthModal("login", "Please sign in or create an account to log mock test scores and analyze score curves!");
              return;
            }
            setEditingTestId(null);
            setTestName("");
            setNotes("");
            setModalOpen(true);
          }}
          className="btn-nested-cta self-start"
        >
          <span>Log Mock Attempt</span>
          <div className="btn-nested-icon">
            <Plus className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* Per-Subject KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {subjectStats.map((sub) => (
          <div key={sub.id} className="double-bezel">
            <div className="double-bezel-inner p-3.5 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: sub.color, boxShadow: `0 0 8px ${sub.color}` }}
                />
                <span className="text-xs font-black text-neutral-900 dark:text-white truncate">
                  {sub.name}
                </span>
              </div>

              {sub.count === 0 ? (
                <p className="text-[10px] text-neutral-400 font-mono py-1">No tests logged</p>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-neutral-500">Latest:</span>
                    <span className="text-sm font-black font-mono text-neutral-900 dark:text-white">
                      {sub.latest}%
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-neutral-500">Best:</span>
                    <span className="text-xs font-bold font-mono text-emerald-600 dark:text-[#b8ff3c]">
                      {sub.best}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    {sub.trend === "improving" ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-[#b8ff3c] flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> Up
                      </span>
                    ) : sub.trend === "dropping" ? (
                      <span className="text-[10px] font-bold text-rose-500 flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" /> Down
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-neutral-400 flex items-center gap-0.5">
                        <Minus className="w-3 h-3" /> Flat
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recharts Line Graph Container */}
      <div className="double-bezel">
        <div className="double-bezel-inner space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-sm text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
                <ChartIcon className="w-4 h-4 text-[#b8ff3c]" />
                Score Trajectory Curve (% Over Time)
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Isolate individual subjects or evaluate average scores against your {targetPercentage}% board exam target
              </p>
            </div>

            {/* Subject Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveSubjectFilter("all")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                  activeSubjectFilter === "all"
                    ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-sm"
                    : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800"
                }`}
              >
                All Subjects
              </button>
              {syllabus.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSubjectFilter(s.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    activeSubjectFilter === s.id
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-sm"
                      : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chart View */}
          {chartData.length < 2 ? (
            <div className="py-20 text-center space-y-2 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl">
              <Award className="w-8 h-8 text-neutral-400 mx-auto" />
              <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Need at least 2 logged mock attempts to draw trend curves
              </p>
              <p className="text-[11px] text-neutral-500 font-mono">
                Log your sample papers and school pre-boards to monitor progress towards {targetPercentage}%
              </p>
            </div>
          ) : (
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.25} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0c0e17",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "1rem",
                      fontSize: "12px",
                      color: "#fff",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />

                  {/* Target Line (90%) */}
                  <ReferenceLine
                    y={targetPercentage}
                    stroke="#b8ff3c"
                    strokeDasharray="4 4"
                    label={{
                      value: `Target ${targetPercentage}%`,
                      fill: "#b8ff3c",
                      fontSize: 10,
                      position: "right",
                    }}
                  />

                  {/* Overall Average Line */}
                  {(activeSubjectFilter === "all" || activeSubjectFilter === "average") && (
                    <Line
                      type="monotone"
                      dataKey="average"
                      name="Overall Avg %"
                      stroke="#ffffff"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                  )}

                  {/* Subject Lines */}
                  {syllabus.map((s) => {
                    if (activeSubjectFilter !== "all" && activeSubjectFilter !== s.id) {
                      return null;
                    }
                    return (
                      <Line
                        key={s.id}
                        type="monotone"
                        dataKey={s.id}
                        name={s.name}
                        stroke={s.color}
                        strokeWidth={2}
                        dot={{ r: 3.5 }}
                        connectNulls
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Attempts Table */}
      <div className="double-bezel">
        <div className="double-bezel-inner space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 dark:border-neutral-800/60">
            <h3 className="font-black text-sm text-neutral-900 dark:text-white uppercase tracking-tight">
              Attempt History ({filteredTests.length})
            </h3>
            <span className="text-xs text-neutral-500 font-mono">
              Editable & Deletable Records
            </span>
          </div>

          {filteredTests.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400 font-mono">
              No mock tests recorded for this view. Click "Log Mock Attempt" above to start!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-mono uppercase text-neutral-400">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Test Name & Type</th>
                    <th className="py-2.5 px-3">Marks</th>
                    <th className="py-2.5 px-3">Score %</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/50 dark:divide-neutral-800/50">
                  {filteredTests.map((test) => {
                    const sub = syllabus.find((s) => s.id === test.subjectId);
                    return (
                      <tr key={test.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                        <td className="py-3 px-3 font-mono text-neutral-500">
                          {formatDate(test.date)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                            style={{
                              backgroundColor: `${sub?.color}20`,
                              color: sub?.color,
                            }}
                          >
                            {sub?.name || test.subjectId}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-neutral-900 dark:text-white">{test.testName}</p>
                          <p className="text-[10px] text-neutral-400 font-mono">
                            {TEST_TYPE_LABELS[test.type]}
                          </p>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold">
                          {test.marksObtained} / {test.totalMarks}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-mono font-black ${
                              test.percentage >= targetPercentage
                                ? "text-emerald-600 dark:text-[#b8ff3c]"
                                : test.percentage >= 75
                                ? "text-blue-500"
                                : "text-amber-500"
                            }`}
                          >
                            {test.percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-400">
                          {test.timeTakenMinutes ? `${test.timeTakenMinutes}m` : "—"}
                        </td>
                        <td className="py-3 px-3 text-right space-x-2">
                          <button
                            onClick={() => handleEdit(test)}
                            className="p-1 rounded text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5 inline" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete mock test "${test.testName}"?`)) {
                                deleteMockTest(test.id);
                              }
                            }}
                            className="p-1 rounded text-neutral-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add / Edit Mock Test */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0c0e17] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="font-black text-sm uppercase text-neutral-950 dark:text-white">
                {editingTestId ? "Edit Mock Attempt" : "Log New Mock Attempt"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-950 dark:hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-500 font-mono mb-1">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white font-medium"
                >
                  {syllabus.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-500 font-mono mb-1">Test Name</label>
                <input
                  type="text"
                  placeholder="e.g. CBSE 2025 Official Sample Paper #1"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-500 font-mono mb-1">Type</label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value as MockTestType)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white font-medium"
                  >
                    <option value="sample_paper">Sample Paper</option>
                    <option value="pyq">PYQ</option>
                    <option value="school_test">School Test</option>
                    <option value="full_mock">Full Mock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-500 font-mono mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-500 font-mono mb-1">Marks Got</label>
                  <input
                    type="number"
                    min="0"
                    max={totalMarks}
                    value={marksObtained}
                    onChange={(e) => setMarksObtained(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-500 font-mono mb-1">Total Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-500 font-mono mb-1">Time (Mins)</label>
                  <input
                    type="number"
                    value={timeTakenMinutes}
                    onChange={(e) => setTimeTakenMinutes(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-500 font-mono mb-1">Notes / Key Weaknesses</label>
                <textarea
                  placeholder="e.g. Lost marks in Section C 3-mark calculus integration..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white h-16 resize-none font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md"
                >
                  {editingTestId ? "Save Changes" : "Record Score"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
