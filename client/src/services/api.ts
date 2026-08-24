import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://alamuri-departmental-stores.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('quickstore_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized and we had a token, clear it
      const currentToken = localStorage.getItem('quickstore_token');
      if (currentToken) {
        localStorage.removeItem('quickstore_token');
        localStorage.removeItem('quickstore_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;