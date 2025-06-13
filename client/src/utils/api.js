import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("codepets_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("codepets_token");
      localStorage.removeItem("codepets_user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  getGitHubUrl: () => api.get("/auth/github/url"),
  authenticateWithGitHub: (code) => api.post("/auth/github", { code }),
};

// Pet API calls
export const petAPI = {
  getPet: () => api.get("/pets"),
  logTime: (hours, description) =>
    api.post("/pets/log-time", { hours, description }),
  getHistory: () => api.get("/pets/history"),
};

// GitHub API calls
export const githubAPI = {
  getRepos: () => api.get("/github/repos"),
  syncCommits: () => api.post("/github/sync-commits"),
  getStats: () => api.get("/github/stats"),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get("/users/profile"),
};

export default api;
