import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ??
  (import.meta.env.DEV ? '' : 'http://localhost:5000');

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const adminInfo = localStorage.getItem('adminInfo');
    if (adminInfo) {
      try {
        const { token } = JSON.parse(adminInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        /* ignore invalid stored auth */
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('adminInfo');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (!error.response) {
      error.message =
        error.code === 'ECONNABORTED'
          ? 'Request timed out. Is the backend running on port 5000?'
          : `Cannot reach API at ${API_BASE || 'proxy'}. Run: npm run backend`;
    }
    return Promise.reject(error);
  }
);

export { API_BASE };
export default api;
