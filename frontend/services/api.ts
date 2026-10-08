import axios from 'axios';
import { API_URL } from '@/lib/constants';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  // Add the SecureStore JWT authorization header here when authentication is implemented.
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // Centralize API error handling here when the service layer is implemented.
    return Promise.reject(error);
  },
);
