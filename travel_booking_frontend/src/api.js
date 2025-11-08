import axios from 'axios';
import { toast } from 'react-toastify';

// Use REACT_APP_API_URL when provided, otherwise use relative paths (works with CRA proxy)
const API_BASE = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

// Request interceptor: attach JWT if present
api.interceptors.request.use(
  (config) => {
    try {
      const adminToken = sessionStorage.getItem('admin-jwtToken');
      const customerToken = sessionStorage.getItem('customer-jwtToken');
      const guideToken = sessionStorage.getItem('guide-jwtToken');
      const token = adminToken || customerToken || guideToken;
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // show friendly toast for common cases
    if (error && error.response) {
      const status = error.response.status;
      const msg = (error.response.data && error.response.data.responseMessage) || error.message;
      if (status >= 500) {
        toast.error('Server error. Please try again later.');
      } else if (status === 401) {
        toast.error('Unauthorized. Please login.');
      } else if (status === 403) {
        toast.error('Forbidden. You do not have access.');
      } else if (status === 400) {
        toast.error(msg || 'Bad request');
      } else if (status === 404) {
        toast.error('Resource not found');
      } else {
        toast.error(msg || 'Request failed');
      }
    } else if (error && error.request) {
      toast.error('Network error. Check your connection or the backend.');
    } else {
      toast.error('Unexpected error occurred.');
    }
    return Promise.reject(error);
  }
);

export default api;
