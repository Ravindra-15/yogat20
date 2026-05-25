/**
 * ============================================
 * CUSTOMER MODULE — Habit Progress API Service
 * ============================================
 * Used by the "Add Progress" page.
 *
 * Endpoints:
 *  - getHabitsWithProgress(programId) → active habits + today's logged values
 *  - saveHabitProgress(habitId, value) → save/update one habit's value for today
 *
 * ✅ COPY-PASTE SAFE: identical for yogat20 / mommyfit / slimfitter.
 *    Nothing here is program-specific.
 * ============================================
 */

import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// 🔒 Auth'd instance — attaches customer JWT
const customerApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// 🔑 Attach token to every request
customerApi.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 🌐 Build absolute URL for a backend-served habit icon
// iconUrl is stored as "/uploads/habit-icons/xxx.png"
export const buildHabitIconSrc = (relativePath) => {
  if (!relativePath) return "";
  if (relativePath.startsWith("http")) return relativePath;
  const serverRoot = BASE_URL.replace(/\/api\/?$/, "");
  return `${serverRoot}${relativePath}`;
};

// ============================================
// 📋 GET ACTIVE HABITS + TODAY'S PROGRESS
// ============================================
/**
 * Fetches active habits for a program, each with the user's
 * value logged today (todayValue is null if not logged yet).
 * @param {string} programId - yogat20 | diabmukt | mommyfit | slimfitter
 * @returns Promise<Array> - list of habits with todayValue attached
 */
export const getHabitsWithProgress = async (programId) => {
  const response = await customerApi.get("/customer/habit-progress", {
    params: { programId },
  });
  return response.data.data.habits;
};

// ============================================
// 💾 SAVE / UPDATE TODAY'S PROGRESS
// ============================================
/**
 * Saves or updates the value for one habit for today.
 * @param {string} habitId - HabitConfig _id
 * @param {number} value - the numeric value the user picked
 */
export const saveHabitProgress = async (habitId, value) => {
  const response = await customerApi.post("/customer/habit-progress", {
    habitId,
    value,
  });
  return response.data;
};

// ============================================
// 📊 GET PROGRESS REPORT (historical)
// ============================================
/**
 * Fetches the user's progress report for a program —
 * overall habit averages + monthly day-grid with color verdicts.
 * @param {string} programId - yogat20 | diabmukt | mommyfit | slimfitter
 * @returns Promise<{ habits, months }>
 */
export const getProgressReport = async (programId) => {
  const response = await customerApi.get("/customer/habit-progress/report", {
    params: { programId },
  });
  return response.data.data;
};