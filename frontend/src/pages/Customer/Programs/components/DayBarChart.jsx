/**
 * ============================================
 * CUSTOMER MODULE — Progress Report day-by-day bar chart
 * ============================================
 * Replaces the coloured day grid inside each month / week box.
 *  - 7 days per page; swipe (mobile) or use ‹ › (desktop) to see older days.
 *    A 30-day month = pages 1–7, 8–14, 15–21, 22–28, 29–30. A week = 1 page.
 *  - Opens on the page with today (or the last page of a finished period).
 *  - Tabs: "Overall" = share of the day's goals met (green / red, same as
 *    the old grid) + one tab per tracker = its real value, with a dashed
 *    goal line when the admin has set a goal.
 *  - Tap a bar → that day's details (every tracker, value vs goal) below.
 *
 * Props:
 *  days     — period days from the report API
 *             [{ dayNumber, date, isFuture, isToday, color, values, goalsMet, goalsCounted, habitsLogged }]
 *  habits   — active trackers [{ habitId, trackerName, unit, colorHex, averageGoal }]
 *  tab      — "overall" | habitId (shared by every box on the page)
 *  onTab    — (tab) => void
 *  accent   — program theme colour (hex)
 * ============================================
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";

const PAGE = 7;
const GREEN = "#22C55E";
const RED = "#EF4444";
const GRAY = "#E5E7EB";

const asDate = (key) => new Date(`${key}T00:00:00Z`);
const fmt = (key, opts) => asDate(key).toLocaleDateString("en-US", { timeZone: "UTC", ...opts });
const fmtNum = (n) =>
  n == null || Number.isNaN(Number(n))
    ? "—"
    : Number(n).toLocaleString("en-US", { maximumFractionDigits: 1 });
const hasGoal = (h) => h && h.averageGoal != null && !Number.isNaN(Number(h.averageGoal));
const idOf = (h) => String(h.habitId);

const rangeLabel = (pageDays) => {
  if (!pageDays.length) return "";
  const a = pageDays[0].date;
  const b = pageDays[pageDays.length - 1].date;
  if (a === b) return fmt(a, { day: "numeric", month: "short" });
  const sameMonth = fmt(a, { month: "short" }) === fmt(b, { month: "short" });
  // "Nov 15 – 21" / "Nov 29 – Dec 5"
  return sameMonth
    ? `${fmt(a, { month: "short", day: "numeric" })} – ${fmt(b, { day: "numeric" })}`
    : `${fmt(a, { month: "short", day: "numeric" })} – ${fmt(b, { month: "short", day: "numeric" })}`;
};

// 🏁 Which page to open on: today's page, else the last page that has
// anything in the past (a finished period opens on its final days).
const initialPage = (pages) => {
  const t = pages.findIndex((p) => p.some((d) => d.isToday));
  if (t >= 0) return t;
  for (let i = pages.length - 1; i >= 0; i--) if (pages[i].some((d) => !d.isFuture)) return i;
  return 0;
};

// 🎯 Default selected day on a page: today, else the latest logged day, else the latest past day
const defaultDay = (pageDays) =>
  pageDays.find((d) => d.isToday)?.date ||
  [...pageDays].reverse().find((d) => !d.isFuture && d.habitsLogged > 0)?.date ||
  [...pageDays].reverse().find((d) => !d.isFuture)?.date ||
  null;

export default function DayBarChart({ days = [], habits = [], tab = "overall", onTab, accent = "#F97316" }) {
  const pages = useMemo(() => {
    const out = [];
    for (let i = 0; i < days.length; i += PAGE) out.push(days.slice(i, i + PAGE));
    return out.length ? out : [[]];
  }, [days]);

  const [page, setPage] = useState(() => initialPage(pages));
  const [selected, setSelected] = useState(() => defaultDay(pages[initialPage(pages)] || []));
  const scrollerRef = useRef(null);
  const pageRef = useRef(page);
  pageRef.current = page;

  const habit = tab === "overall" ? null : habits.find((h) => idOf(h) === tab) || null;
  const activeTab = habit ? tab : "overall"; // a removed tracker falls back to Overall

  // ↔️ Jump (no animation) to the opening page once laid out
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollLeft = page * el.clientWidth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the page in view if the box is resized (rotation, desktop resize)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      el.scrollLeft = pageRef.current * el.clientWidth;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ↔️ The page always follows the real scroll position (swipe, arrows,
  // trackpad) — so the header, dots and bars can never disagree.
  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el || !el.clientWidth) return;
    const p = Math.max(0, Math.min(pages.length - 1, Math.round(el.scrollLeft / el.clientWidth)));
    if (p !== pageRef.current) setPage(p);
  };

  const goTo = (p) => {
    const el = scrollerRef.current;
    const clamped = Math.max(0, Math.min(pages.length - 1, p));
    if (el) el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    else setPage(clamped);
  };

  // New page → keep the selected day if it's on it, else pick that page's default
  useEffect(() => {
    const pd = pages[page] || [];
    setSelected((cur) => (pd.some((d) => d.date === cur) ? cur : defaultDay(pd)));
  }, [page, pages]);

  // 📏 Scale for a tracker tab: highest value in this whole period (or the
  // goal, whichever is bigger) so bars compare across pages.
  const scaleMax = useMemo(() => {
    if (!habit) return 1;
    const id = idOf(habit);
    let m = hasGoal(habit) ? Number(habit.averageGoal) : 0;
    days.forEach((d) => {
      const v = d.values?.[id];
      if (v != null && v > m) m = v;
    });
    return m > 0 ? m * 1.1 : 1;
  }, [habit, days]);

  // 🧮 One bar's height (0–100), colour and screen-reader text
  const barFor = (d) => {
    if (d.isFuture) return { h: 0, color: "transparent", future: true, label: "upcoming" };
    if (!habit) {
      if (!d.habitsLogged) return { h: 0, color: GRAY, empty: true, label: "nothing logged" };
      const pct = d.goalsCounted
        ? d.goalsMet / d.goalsCounted
        : habits.length
          ? d.habitsLogged / habits.length
          : 1;
      return {
        h: Math.max(8, Math.round(pct * 100)),
        color: d.color === "red" ? RED : GREEN,
        label: d.goalsCounted
          ? `${d.goalsMet} of ${d.goalsCounted} goals met`
          : `${d.habitsLogged} tracker${d.habitsLogged === 1 ? "" : "s"} logged`,
      };
    }
    const v = d.values?.[idOf(habit)];
    if (v == null) return { h: 0, color: GRAY, empty: true, label: "not logged" };
    const below = hasGoal(habit) && v < Number(habit.averageGoal);
    return {
      h: Math.max(4, Math.min(100, Math.round((v / scaleMax) * 100))),
      color: habit.colorHex || accent,
      dim: below,
      label: `${fmtNum(v)} ${habit.unit}${hasGoal(habit) ? (below ? ", below goal" : ", goal met") : ""}`,
    };
  };

  // 📊 Summary for the visible page (like the "daily average" on a screen-time chart)
  const pageDays = pages[page] || [];
  const summary = useMemo(() => {
    const past = pageDays.filter((d) => !d.isFuture);
    if (!habit) {
      const logged = past.filter((d) => d.habitsLogged > 0);
      const metDays = logged.filter((d) => d.color === "green").length;
      return {
        big: `${metDays} / ${past.length || 0}`,
        small: `day${past.length === 1 ? "" : "s"} on target`,
        note: logged.length ? `${logged.length} day${logged.length === 1 ? "" : "s"} logged` : "Nothing logged yet",
      };
    }
    const id = idOf(habit);
    const vals = past.map((d) => d.values?.[id]).filter((v) => v != null);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    return {
      big: avg == null ? "—" : fmtNum(avg),
      small: avg == null ? "not logged" : `${habit.unit} / day avg`,
      note: hasGoal(habit) ? `Goal ${fmtNum(habit.averageGoal)} ${habit.unit}` : `${vals.length} day${vals.length === 1 ? "" : "s"} logged`,
    };
  }, [pageDays, habit]);

  const goalPct = habit && hasGoal(habit) ? Math.min(100, (Number(habit.averageGoal) / scaleMax) * 100) : null;
  const selDay = days.find((d) => d.date === selected) || null;

  return (
    <div className="mb-5">
      {/* 🔖 Tabs: Overall + one per tracker */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 mb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Chart view">
        {[{ key: "overall", name: "Overall", color: accent }, ...habits.map((h) => ({ key: idOf(h), name: h.trackerName, color: h.colorHex || accent }))].map((t) => {
          const on = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onTab?.(t.key)}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
                on ? "text-white border-transparent" : "bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#D1D5DB]"
              }`}
              style={on ? { backgroundColor: t.color } : undefined}
            >
              {t.key !== "overall" && !on && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />}
              {t.name}
            </button>
          );
        })}
      </div>

      {/* 📈 Summary + page nav */}
      <div className="flex items-end justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[#9CA3AF]">{rangeLabel(pageDays)}</p>
          <p className="text-[#1F2937] leading-tight">
            <span className="text-xl sm:text-2xl font-bold">{summary.big}</span>{" "}
            <span className="text-xs font-semibold text-[#6B7280]">{summary.small}</span>
          </p>
          <p className="text-[11px] text-[#9CA3AF]">{summary.note}</p>
        </div>
        {pages.length > 1 && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => goTo(page - 1)}
              disabled={page === 0}
              aria-label="Earlier days"
              className="w-8 h-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F9FAFB]"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => goTo(page + 1)}
              disabled={page === pages.length - 1}
              aria-label="Later days"
              className="w-8 h-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F9FAFB]"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* 📊 Swipeable pages of 7 bars
          (pt-3 = headroom: a horizontal scroller also clips vertically, so
          without it a 100% bar's selected ring / the goal label get cut off) */}
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Daily progress — swipe for earlier days"
      >
        {pages.map((pd, pi) => (
          <div key={pi} className="w-full shrink-0 snap-start" aria-hidden={pi !== page || undefined}>
            <div className="relative h-36 sm:h-44 border-b border-[#E5E7EB]">
              {goalPct != null && (
                <div className="absolute left-0 right-0 border-t border-dashed border-[#9CA3AF] pointer-events-none z-10" style={{ bottom: `${goalPct}%` }}>
                  <span className="absolute right-0 -top-4 text-[10px] font-semibold text-[#6B7280] bg-white/90 px-1 rounded">
                    Goal {fmtNum(habit.averageGoal)}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 grid grid-cols-7 gap-1.5 sm:gap-3 items-end px-1">
                {Array.from({ length: PAGE }).map((_, i) => {
                  const d = pd[i];
                  if (!d) return <div key={i} />;
                  const b = barFor(d);
                  const on = d.date === selected;
                  return (
                    <button
                      key={d.date}
                      type="button"
                      disabled={d.isFuture}
                      tabIndex={pi === page ? 0 : -1}
                      onClick={() => setSelected(d.date)}
                      aria-pressed={on}
                      aria-label={`${fmt(d.date, { weekday: "long", day: "numeric", month: "short" })}: ${b.label}`}
                      className="h-full flex items-end justify-center rounded-t-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-default"
                      style={{ "--tw-ring-color": accent }}
                    >
                      {b.future ? (
                        <span className="w-full max-w-[34px] h-2 rounded-t-md border border-dashed border-[#D1D5DB]" />
                      ) : b.empty ? (
                        <span className="w-full max-w-[34px] h-1.5 rounded-t-md" style={{ backgroundColor: GRAY }} />
                      ) : (
                        <span
                          className="w-full max-w-[34px] rounded-t-md transition-[height] duration-300"
                          style={{
                            height: `${b.h}%`,
                            backgroundColor: b.color,
                            opacity: b.dim ? 0.45 : 1,
                            boxShadow: on ? `0 0 0 2px #fff, 0 0 0 4px ${accent}` : undefined,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* day labels */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-3 px-1 pt-1.5">
              {Array.from({ length: PAGE }).map((_, i) => {
                const d = pd[i];
                if (!d) return <div key={i} />;
                const on = d.date === selected;
                return (
                  <div key={d.date} className="text-center leading-tight">
                    <p className={`text-[10px] ${d.isToday ? "font-bold" : "text-[#9CA3AF]"}`} style={d.isToday ? { color: accent } : undefined}>
                      {d.isToday ? "Today" : fmt(d.date, { weekday: "short" })}
                    </p>
                    <p
                      className={`text-[11px] font-semibold mx-auto w-6 h-6 leading-6 rounded-full ${on ? "text-white" : d.isFuture ? "text-[#D1D5DB]" : "text-[#4B5563]"}`}
                      style={on ? { backgroundColor: accent } : undefined}
                    >
                      {fmt(d.date, { day: "numeric" })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* page dots */}
      {pages.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2" aria-hidden="true">
          {pages.map((_, i) => (
            <span key={i} className="h-1.5 rounded-full transition-all" style={{ width: i === page ? 14 : 6, backgroundColor: i === page ? accent : "#D1D5DB" }} />
          ))}
        </div>
      )}

      {/* legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3 text-[11px] text-[#6B7280]">
        {habit ? (
          <>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ backgroundColor: habit.colorHex || accent }} />{hasGoal(habit) ? "Goal met" : "Logged"}</span>
            {hasGoal(habit) && <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ backgroundColor: habit.colorHex || accent, opacity: 0.45 }} />Below goal</span>}
            {hasGoal(habit) && <span className="flex items-center gap-1.5"><span className="w-4 border-t border-dashed border-[#9CA3AF]" />Goal</span>}
          </>
        ) : (
          <>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ backgroundColor: GREEN }} />Goal met</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ backgroundColor: RED }} />Below goal</span>
          </>
        )}
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ backgroundColor: GRAY }} />Not logged</span>
      </div>

      {/* 🔎 Selected day details */}
      {selDay && (
        <div className="mt-4 rounded-xl border border-[#E7EAF3] bg-[#F9FAFB] px-4 py-3" aria-live="polite">
          <p className="text-xs font-bold text-[#374151] mb-2">
            {fmt(selDay.date, { weekday: "long", day: "numeric", month: "long" })}
            {selDay.isToday && <span className="ml-1.5 font-semibold" style={{ color: accent }}>· Today</span>}
          </p>
          {habits.length === 0 ? (
            <p className="text-xs text-[#9CA3AF]">No trackers set up for this program yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {habits.map((h) => {
                const v = selDay.values?.[idOf(h)];
                const goal = hasGoal(h);
                const met = v != null && goal && v >= Number(h.averageGoal);
                return (
                  <li key={idOf(h)} className="flex items-center justify-between gap-3 text-xs">
                    <span className="flex items-center gap-2 min-w-0 text-[#4B5563]">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: h.colorHex || accent }} />
                      <span className="truncate">{h.trackerName}</span>
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      {v == null ? (
                        <span className="text-[#9CA3AF]">Not logged</span>
                      ) : (
                        <span className="font-semibold text-[#1F2937]">{fmtNum(v)} {h.unit}</span>
                      )}
                      {goal && (
                        <span className="text-[10px] text-[#9CA3AF] hidden min-[360px]:inline">/ {fmtNum(h.averageGoal)}</span>
                      )}
                      {v != null && goal && (met ? (
                        <Check size={14} className="text-[#16A34A]" aria-label="goal met" />
                      ) : (
                        <X size={14} className="text-[#DC2626]" aria-label="below goal" />
                      ))}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
