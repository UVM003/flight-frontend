import axios from "axios";
import { store } from "../store/store";
const api = axios.create({
  baseURL: "http://localhost:8086", // your API base URL
});

api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token; // read token directly from Redux
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
