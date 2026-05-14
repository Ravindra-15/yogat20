/**
 * ============================================
 * CUSTOMER MODULE — Clinical Video API Service
 * ============================================
 * Used by the YogaT20 dashboard video section.
 *
 * Endpoints:
 *  - getCurrentVideo(programId, yogaType) → current video to display
 *  - markVideoComplete(videoId) → user clicked "Mark as Complete"
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

customerApi.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 🌐 Build absolute URL for backend-served thumbnail files
// thumbnailUrl stored as "/uploads/clinical-videos/xxx.jpg"
export const buildThumbnailSrc = (relativePath) => {
  if (!relativePath) return "";
  if (relativePath.startsWith("http")) return relativePath;
  const serverRoot = BASE_URL.replace(/\/api\/?$/, "");
  return `${serverRoot}${relativePath}`;
};

// ============================================
// 🎬 GET CURRENT VIDEO FOR QUEUE
// ============================================
/**
 * @param {string} programId - yogat20 | diabmukt | mommyfit | slimfitter
 * @param {string} yogaType  - normal_yoga | chair_yoga | high_intensity
 * @returns Promise<{ video, completedToday, isScheduled, message? }>
 */
export const getCurrentVideo = async (programId, yogaType) => {
  const response = await customerApi.get("/customer/clinical-videos/current", {
    params: { programId, yogaType },
  });
  return response.data.data;
};

// ============================================
// ✅ MARK VIDEO COMPLETE
// ============================================
/**
 * @param {string} videoId - Video _id
 */
export const markVideoComplete = async (videoId) => {
  const response = await customerApi.post(
    `/customer/clinical-videos/${videoId}/complete`
  );
  return response.data;
};