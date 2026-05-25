/**
 * ============================================
 * CUSTOMER MODULE — Progress Report Page
 * ============================================
 * Shows the user's habit history:
 *  - top cards: overall average per active habit (plan start → today)
 *  - monthly accordion: each month expands to a day-block grid
 *    (green = goal met, red = below goal, gray = not logged / future)
 *
 * ✅ COPY-PASTE SAFE: programId comes from the URL.
 * Route: /programs/:id/progress-report
 * ============================================
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

import CustomerNavbar from "../../../components/customer/layout/CustomerNavbar";
import CustomerFooter from "../../../components/customer/layout/CustomerFooter";
import { getProgressReport } from "../../../services/habitProgressService";

// 🎨 Day-block colors by verdict
const BLOCK_COLORS = {
  green: "#22C55E",
  red: "#EF4444",
  gray: "#E5E7EB",
};

export default function ProgressReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [habits, setHabits] = useState([]);
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMonth, setOpenMonth] = useState(null); // which month is expanded

  // 📥 Load the progress report
  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProgressReport(id);
      setHabits(data.habits || []);
      setMonths(data.months || []);
      // Open the latest month by default
      if (data.months?.length) {
        setOpenMonth(data.months[data.months.length - 1].monthNumber);
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to load progress report"
      );
      setHabits([]);
      setMonths([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // 🔀 Expand / collapse a month
  const toggleMonth = (monthNumber) => {
    setOpenMonth((prev) => (prev === monthNumber ? null : monthNumber));
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col">
      <CustomerNavbar />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

          {/* 🔙 Header */}
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => navigate(`/programs/${id}/add-progress`)}
              className="text-[#6B7280] hover:text-[#5B4FF7] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">
              Your Progress Report
            </h1>
          </div>
          <p className="text-[#9CA3AF] text-sm mb-6 sm:ml-9">
            Track your consistency over time.
          </p>

          {loading ? (
            <div className="bg-white rounded-[24px] border border-[#E7EAF3] py-16 text-center">
              <p className="text-sm text-[#9CA3AF]">Loading your report...</p>
            </div>
          ) : (
            <>
              {/* ============================================ */}
              {/* 📊 TOP CARDS — overall averages per habit    */}
              {/* ============================================ */}
              {habits.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  {habits.map((h) => (
                    <div
                      key={h.habitId}
                      className="bg-white rounded-2xl border border-[#E7EAF3] shadow-[0_1px_3px_rgba(16,24,40,0.04)] px-4 py-4 text-center"
                    >
                      <p className="text-xs text-[#9CA3AF] font-medium mb-1.5">
                        Avg {h.trackerName}
                      </p>
                      <p
                        className="text-xl sm:text-2xl font-bold"
                        style={{ color: h.colorHex || "#1F2937" }}
                      >
                        {h.avgValue}{" "}
                        <span className="text-sm font-semibold text-[#6B7280]">
                          {h.unit}
                        </span>
                      </p>
                      <p className="text-[11px] text-[#9CA3AF] mt-1">
                        {h.daysLogged}{" "}
                        {h.daysLogged === 1 ? "day" : "days"} logged
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* ============================================ */}
              {/* 🗓️ MONTHLY SCHEDULE — accordion              */}
              {/* ============================================ */}
              <div className="bg-[#EEF0FF] rounded-[24px] p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-[#1F2937] mb-4">
                  Your Monthly Schedule
                </h2>

                {months.length === 0 ? (
                  <div className="bg-white rounded-2xl py-12 text-center">
                    <p className="text-sm text-[#6B7280]">
                      No progress data yet.
                    </p>
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      Start logging from the Add Progress page.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {months.map((month) => {
                      const isOpen = openMonth === month.monthNumber;
                      return (
                        <div
                          key={month.monthNumber}
                          className="bg-white rounded-2xl overflow-hidden"
                        >
                          {/* Month header — clickable */}
                          <button
                            onClick={() => toggleMonth(month.monthNumber)}
                            className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-[#1F2937]"
                          >
                            <span>Month {month.monthNumber}</span>
                            <ChevronDown
                              size={18}
                              className={`text-[#9CA3AF] transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {/* Expanded content */}
                          {isOpen && (
                            <div className="px-5 pb-5">
                              {/* Day-block grid */}
                              <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 sm:gap-2 mb-5">
                                {month.days.map((day) => (
                                  <div
                                    key={day.dayNumber}
                                    title={day.date}
                                    className="aspect-square rounded-md sm:rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-semibold"
                                    style={{
                                      backgroundColor:
                                        BLOCK_COLORS[day.color] ||
                                        BLOCK_COLORS.gray,
                                      color:
                                        day.color === "gray"
                                          ? "#9CA3AF"
                                          : "#FFFFFF",
                                    }}
                                  >
                                    {day.dayNumber}
                                  </div>
                                ))}
                              </div>

                              {/* Month metrics label */}
                              <div className="flex items-center gap-1.5 mb-3">
                                <p className="text-xs font-bold text-[#374151]">
                                  Month Metrics
                                </p>
                                <ArrowRight
                                  size={13}
                                  className="text-[#9CA3AF]"
                                />
                              </div>

                              {/* Per-habit stats for this month */}
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {month.habitStats.map((h) => (
                                  <div
                                    key={h.habitId}
                                    className="bg-[#F6F8FC] border border-[#E7EAF3] rounded-xl px-3 py-3 text-center"
                                  >
                                    <p className="text-[11px] text-[#9CA3AF] font-medium mb-1">
                                      Avg {h.trackerName}
                                    </p>
                                    <p
                                      className="text-base sm:text-lg font-bold"
                                      style={{
                                        color: h.colorHex || "#1F2937",
                                      }}
                                    >
                                      {h.avgValue}{" "}
                                      <span className="text-xs font-semibold text-[#6B7280]">
                                        {h.unit}
                                      </span>
                                    </p>
                                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                                      {h.daysLogged}{" "}
                                      {h.daysLogged === 1 ? "day" : "days"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: BLOCK_COLORS.green }}
                    />
                    <span className="text-[11px] text-[#6B7280]">
                      Goal met
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: BLOCK_COLORS.red }}
                    />
                    <span className="text-[11px] text-[#6B7280]">
                      Below goal
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: BLOCK_COLORS.gray }}
                    />
                    <span className="text-[11px] text-[#6B7280]">
                      Not logged
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}