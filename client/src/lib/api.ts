import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getCookie, removeCookie } from "./cookies";
import { API_URL } from "@/config/appConfig";

const BASE_API_URL = API_URL + "/api/";

export const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = getCookie("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        removeCookie("token");
        removeCookie("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
