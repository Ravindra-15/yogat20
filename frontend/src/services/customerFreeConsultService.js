// CUSTOMER MODULE — Free Consult Cards API Service
// Fetches the user's free-consult cards (with validity + status) for a program.

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const authApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 🎁 GET my free-consult cards for a program
export const fetchMyFreeConsultCards = async (programId) => {
  const response = await authApi.get("/customer/free-consults", {
    params: { programId },
  });
  return response.data.data; // { cards, bookableCount, total }
};