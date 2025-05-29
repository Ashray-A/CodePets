import axios from 'axios';

// Set up axios defaults
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('codepets_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('codepets_token');
      localStorage.removeItem('codepets_user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  githubLogin: (code) => api.post('/auth/github', { code }),
  verifyToken: () => api.get('/auth/verify'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getStats: () => api.get('/users/stats'),
};

// Pet API
export const petAPI = {
  getPet: () => api.get('/pets'),
  updateName: (name) => api.put('/pets/name', { name }),
  getEvolution: () => api.get('/pets/evolution'),
};

// Activity API
export const activityAPI = {
  getActivities: (params) => api.get('/activities', { params }),
  logManualSession: (data) => api.post('/activities/manual-log', data),
  syncGitHub: (repos) => api.post('/activities/sync-github', { repos }),
  getStats: (period) => api.get('/activities/stats', { params: { period } }),
};

// Generic API for custom requests
export default api;
