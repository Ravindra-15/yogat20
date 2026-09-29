/**
 * ============================================
 * CUSTOMER MODULE — Progress Report Page
 * ============================================
 * Shows the user's habit history across the full plan they purchased, not
 * just one month:
 *  - top cards: average per active habit for whichever period is open
 *    (defaults to the CURRENT period, not an all-time average)
 *  - period accordion: current period pinned to the top, then previous
 *    ones going backward; only 3 shown at first, "Show more" reveals the
 *    rest back to period 1
 *  - month-priced plans (yogat20) get "Month" periods with a 30-day grid;
 *    week-priced plans (diabmukt/mommyfit/slimfitter) get "Week" periods
 *    (7-day grid) grouped 4-to-a-month under the same accordion shape
 *
 * ✅ COPY-PASTE SAFE: programId comes from the URL.
 * Route: /programs/:id/progress-report
 * ============================================
 */

import { useState, useEffect, useCallback, useMemo } from "react";
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

const INITIAL_VISIBLE_COUNT = 3;

// 📊 A row of "Avg {tracker}" cards — reused for the top summary and for
// each period's own metrics section.
const HabitStatsGrid = ({ stats, size = "md" }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    {stats.map((h) => (
      <div
        key={h.habitId}
        className={
          size === "md"
            ? "bg-white rounded-2xl border border-[#E7EAF3] shadow-[0_1px_3px_rgba(16,24,40,0.04)] px-4 py-4 text-center"
            : "bg-[#F6F8FC] border border-[#E7EAF3] rounded-xl px-3 py-3 text-center"
        }
      >
        <p
          className={
            size === "md"
              ? "text-xs text-[#9CA3AF] font-medium mb-1.5"
              : "text-[11px] text-[#9CA3AF] font-medium mb-1"
          }
        >
          Avg {h.trackerName}
        </p>
        <p
          className={size === "md" ? "text-xl sm:text-2xl font-bold" : "text-base sm:text-lg font-bold"}
          style={{ color: h.colorHex || "#1F2937" }}
        >
          {h.avgValue}{" "}
          <span className={size === "md" ? "text-sm font-semibold text-[#6B7280]" : "text-xs font-semibold text-[#6B7280]"}>
            {h.unit}
          </span>
        </p>
        <p className={size === "md" ? "text-[11px] text-[#9CA3AF] mt-1" : "text-[10px] text-[#9CA3AF] mt-0.5"}>
          {h.daysLogged} {h.daysLogged === 1 ? "day" : "days"} logged
        </p>
      </div>
    ))}
  </div>
);

// 🗓️ Day-block grid + "Period Metrics" section — shared by a month period
// and a week period, they're the same shape.
const PeriodBody = ({ days, habitStats }) => (
  <div className="px-5 pb-5">
    <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 sm:gap-2 mb-5">
      {days.map((day) => (
        <div
          key={day.dayNumber}
          title={day.date}
          className="aspect-square rounded-md sm:rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-semibold"
          style={{
            backgroundColor: BLOCK_COLORS[day.color] || BLOCK_COLORS.gray,
            color: day.color === "gray" ? "#9CA3AF" : "#FFFFFF",
          }}
        >
          {day.dayNumber}
        </div>
      ))}
    </div>

    <div className="flex items-center gap-1.5 mb-3">
      <p className="text-xs font-bold text-[#374151]">Period Metrics</p>
      <ArrowRight size={13} className="text-[#9CA3AF]" />
    </div>

    <HabitStatsGrid stats={habitStats} size="sm" />
  </div>
);

export default function ProgressReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [habits, setHabits] = useState([]);
  const [months, setMonths] = useState([]);
  const [periodType, setPeriodType] = useState("month"); // "month" | "week"
  const [loading, setLoading] = useState(true);
  const [openPeriod, setOpenPeriod] = useState(null); // open monthNumber (top-level)
  const [openWeek, setOpenWeek] = useState(null); // open weekNumber, week-type only
  const [showAll, setShowAll] = useState(false);

  // 📥 Load the progress report
  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProgressReport(id);
      setHabits(data.habits || []);
      setMonths(data.months || []);
      setPeriodType(data.periodType || "month");
      setShowAll(false);

      // Default open = current period (top of the list)
      const list = data.months || [];
      const current = list.find((m) => m.isCurrent) || list[list.length - 1];
      setOpenPeriod(current ? current.monthNumber : null);
      if ((data.periodType || "month") === "week" && current) {
        const currentWeek =
          current.weeks?.find((w) => w.isCurrent) || current.weeks?.[current.weeks.length - 1];
        setOpenWeek(currentWeek ? currentWeek.weekNumber : null);
      } else {
        setOpenWeek(null);
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

  // 🔀 Expand / collapse the top-level accordion item
  const togglePeriod = (monthNumber, group) => {
    setOpenPeriod((prev) => (prev === monthNumber ? null : monthNumber));
    if (periodType === "week" && group) {
      const currentWeek =
        group.weeks.find((w) => w.isCurrent) || group.weeks[group.weeks.length - 1];
      setOpenWeek(currentWeek ? currentWeek.weekNumber : null);
    }
  };

  const toggleWeek = (weekNumber) => {
    setOpenWeek((prev) => (prev === weekNumber ? null : weekNumber));
  };

  // 🆕 Newest (current) first — the whole point of "current on top, older
  // ones fall below as they're consumed".
  const orderedMonths = useMemo(() => [...months].reverse(), [months]);
  const visibleMonths = showAll ? orderedMonths : orderedMonths.slice(0, INITIAL_VISIBLE_COUNT);
  const hiddenCount = orderedMonths.length - visibleMonths.length;

  // 📊 Top cards mirror whichever period is currently open — defaults to
  // the current period on load, falls back to the all-time average only if
  // nothing is open at all.
  const topStats = useMemo(() => {
    if (openPeriod == null) return habits;
    const group = months.find((m) => m.monthNumber === openPeriod);
    if (!group) return habits;
    if (periodType === "month") return group.habitStats || habits;
    const week = group.weeks?.find((w) => w.weekNumber === openWeek);
    return week?.habitStats || habits;
  }, [openPeriod, openWeek, months, periodType, habits]);

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col">
      <CustomerNavbar />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

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
              {/* 📊 TOP CARDS — averages for the open period    */}
              {/* ============================================ */}
              {topStats.length > 0 && (
                <div className="mb-6">
                  <HabitStatsGrid stats={topStats} size="md" />
                </div>
              )}

              {/* ============================================ */}
              {/* 🗓️ SCHEDULE — accordion, current period on top */}
              {/* ============================================ */}
              <div className="bg-[#FFF4ED] rounded-[24px] p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-[#1F2937] mb-4">
                  Your {periodType === "week" ? "Weekly" : "Monthly"} Schedule
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
                    {visibleMonths.map((group) => {
                      const isOpen = openPeriod === group.monthNumber;
                      const label = `Month ${group.monthNumber}`;

                      return (
                        <div
                          key={group.monthNumber}
                          className="bg-white rounded-2xl overflow-hidden"
                        >
                          <button
                            onClick={() => togglePeriod(group.monthNumber, group)}
                            className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-[#1F2937]"
                          >
                            <span className="flex items-center gap-2">
                              {label}
                              {group.isCurrent && (
                                <span className="text-[10px] font-bold uppercase tracking-wide text-white bg-[#5B4FF7] px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                            </span>
                            <ChevronDown
                              size={18}
                              className={`text-[#9CA3AF] transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {isOpen && periodType === "month" && (
                            <PeriodBody days={group.days} habitStats={group.habitStats} />
                          )}

                          {isOpen && periodType === "week" && (
                            <div className="px-5 pb-5 space-y-2.5">
                              {group.weeks.map((week) => {
                                const isWeekOpen = openWeek === week.weekNumber;
                                return (
                                  <div
                                    key={week.weekNumber}
                                    className="bg-[#F6F8FC] rounded-xl overflow-hidden border border-[#E7EAF3]"
                                  >
                                    <button
                                      onClick={() => toggleWeek(week.weekNumber)}
                                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-[#1F2937]"
                                    >
                                      <span className="flex items-center gap-2">
                                        Week {week.weekNumber}
                                        {week.isCurrent && (
                                          <span className="text-[10px] font-bold uppercase tracking-wide text-white bg-[#5B4FF7] px-2 py-0.5 rounded-full">
                                            Current
                                          </span>
                                        )}
                                      </span>
                                      <ChevronDown
                                        size={16}
                                        className={`text-[#9CA3AF] transition-transform ${
                                          isWeekOpen ? "rotate-180" : ""
                                        }`}
                                      />
                                    </button>
                                    {isWeekOpen && (
                                      <div className="bg-white">
                                        <PeriodBody days={week.days} habitStats={week.habitStats} />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {hiddenCount > 0 && (
                      <button
                        onClick={() => setShowAll(true)}
                        className="w-full text-center text-sm font-semibold text-[#5B4FF7] hover:underline py-2.5 transition-colors"
                      >
                        Show {hiddenCount} more month{hiddenCount === 1 ? "" : "s"}
                      </button>
                    )}
                    {showAll && orderedMonths.length > INITIAL_VISIBLE_COUNT && (
                      <button
                        onClick={() => setShowAll(false)}
                        className="w-full text-center text-sm font-semibold text-[#9CA3AF] hover:text-[#6B7280] py-2 transition-colors"
                      >
                        Show less
                      </button>
                    )}
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
