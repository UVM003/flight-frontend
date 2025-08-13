// src/services/api.ts
import axios from "axios";
const API_BASE_URL = "http://localhost:8086/api/auth/customers"; // change this to your backend base URL

const apiclient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Authorization token if exists
apiclient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});
// api.interceptors.request.use(
//   (config) => {
//     const token = store.getState().auth.token; // read token directly from Redux
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// Common API calls
export const AuthService = {
  login: async (email: string, password: string) => {
    const response = await apiclient.post("/login", { email, password });
    return response.data; // { token, role, ... }
  },

 
};



