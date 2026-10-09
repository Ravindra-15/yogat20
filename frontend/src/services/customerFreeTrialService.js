import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

// ============================================
// 🔍 GET CURRENT TRIAL STATE
// ============================================
export const fetchTrialStatus = async () => {
  const token = getToken();
  const response = await axios.get(`${API_BASE}/customer/free-trial/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data; // { state, daysRemaining?, endDate?, rejectionReason? }
};

// ============================================
// ✍️ REQUEST A TRIAL
// ============================================
export const requestFreeTrial = async () => {
  const token = getToken();
  const response = await axios.post(
    `${API_BASE}/customer/free-trial/request`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
