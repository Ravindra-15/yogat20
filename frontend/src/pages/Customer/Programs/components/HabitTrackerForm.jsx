/**
 * CUSTOMER MODULE — Habit Tracker Form (shared)
 * Renders admin-configured habit sliders for a program + Save All.
 * Used inline in ProgramDashboard (expandable) and on the AddProgress page.
 * programId comes from props — nothing hardcoded.
 */

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

import {
  getHabitsWithProgress,
  saveHabitProgress,
  buildHabitIconSrc,
} from "../../../../services/habitProgressService";

// 🧮 Returns safe min/max/avg numbers for a habit (with fallbacks)
const getRange = (habit) => {
  const min = Number.isFinite(habit.minThreshold) ? habit.minThreshold : 0;
  const max = Number.isFinite(habit.maxThreshold)
    ? habit.maxThreshold
    : Math.max(min + 10, 10);
  const avg = Number.isFinite(habit.averageGoal)
    ? habit.averageGoal
    : (min + max) / 2;
  return { min, max, avg };
};

// programId: which program's habits to load
// onSaved: optional callback fired after a successful save
const HabitTrackerForm = ({ programId, onSaved }) => {
  const [habits, setHabits] = useState([]);
  const [values, setValues] = useState({}); // habitId → current slider value
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 📥 Load active habits + today's already-logged values
  const loadHabits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHabitsWithProgress(programId);
      setHabits(data);

      // Seed slider values: today's logged value, else the average goal
      const seed = {};
      data.forEach((h) => {
        const { avg } = getRange(h);
        seed[h._id] = h.todayValue != null ? h.todayValue : avg;
      });
      setValues(seed);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load habits");
      setHabits([]);
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  // 🎚️ Update one slider's value as user drags
  const handleSlide = (habitId, value) => {
    setValues((prev) => ({ ...prev, [habitId]: Number(value) }));
  };

  // 💾 Save every habit's value for today
  const handleSaveAll = async () => {
    if (saving || habits.length === 0) return;
    setSaving(true);
    try {
      for (const habit of habits) {
        await saveHabitProgress(habit._id, values[habit._id]);
      }
      toast.success("Progress saved for today!");
      onSaved?.(); // let parent decide what happens next
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save progress");
    } finally {
      setSaving(false);
    }
  };

  // ⏳ Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-[24px] border border-[#E7EAF3] py-16 text-center">
        <p className="text-sm text-[#9CA3AF]">Loading your trackers...</p>
      </div>
    );
  }

  // 🚫 Empty state
  if (habits.length === 0) {
    return (
      <div className="bg-white rounded-[24px] border border-[#E7EAF3] py-16 text-center">
        <p className="text-sm text-[#6B7280] mb-1">No trackers available yet.</p>
        <p className="text-xs text-[#9CA3AF]">
          Check back soon — your program will add wellness trackers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => {
        const { min, max, avg } = getRange(habit);
        const current = values[habit._id] ?? avg;
        const color = habit.colorHex || "#5B4FF7";

        return (
          <div
            key={habit._id}
            className="bg-white rounded-[24px] border border-[#E7EAF3] shadow-[0_8px_24px_rgba(15,23,42,0.04)] p-5 sm:p-6"
          >
            {/* Habit name + icon + current value */}
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ backgroundColor: `${color}1A` }}
                >
                  {habit.iconUrl ? (
                    <img
                      src={buildHabitIconSrc(habit.iconUrl)}
                      alt={habit.trackerName}
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  )}
                </div>
                <p className="font-bold text-[#1F2937] text-sm sm:text-base truncate">
                  {habit.trackerName}
                </p>
              </div>

              {/* Live current value */}
              <p className="text-sm font-bold shrink-0" style={{ color }}>
                {current} {habit.unit}
              </p>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={min}
              max={max}
              step="any"
              value={current}
              onChange={(e) => handleSlide(habit._id, e.target.value)}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                accentColor: color,
                background: `linear-gradient(to right, ${color} 0%, ${color} ${
                  ((current - min) / (max - min || 1)) * 100
                }%, #E7EAF3 ${
                  ((current - min) / (max - min || 1)) * 100
                }%, #E7EAF3 100%)`,
              }}
            />

            {/* 3 zone labels */}
            <div className="flex items-start justify-between mt-3 gap-2">
              <div className="text-left">
                <p className="text-xs font-semibold text-[#374151]">Incomplete</p>
                <p className="text-[11px] text-[#9CA3AF]">
                  ({min} {habit.unit})
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-[#374151]">Moderate</p>
                <p className="text-[11px] text-[#9CA3AF]">
                  ({avg} {habit.unit})
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-[#374151]">Completed</p>
                <p className="text-[11px] text-[#9CA3AF]">
                  ({max} {habit.unit})
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* 💾 Save All button */}
      <button
        onClick={handleSaveAll}
        disabled={saving}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-3.5 rounded-full shadow-[0_8px_20px_rgba(91,79,247,0.22)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? "Saving..." : "Save All Progress"}
      </button>
    </div>
  );
};

export default HabitTrackerForm;