import axios from 'axios';
import { supabase } from './supabase.js';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach JWT to every request ─────────────────────────────
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// ── Global error handler ────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ── Scores ───────────────────────────────────────────────────
export const scoresAPI = {
  getAll: () => api.get('/scores'),
  add: (data) => api.post('/scores', data),
  update: (id, data) => api.put(`/scores/${id}`, data),
  delete: (id) => api.delete(`/scores/${id}`),
};

// ── Draws ─────────────────────────────────────────────────────
export const drawsAPI = {
  getAll: () => api.get('/draws'),
  getById: (id) => api.get(`/draws/${id}`),
  getMyEntries: () => api.get('/draws/my-entries'),
};

// ── Charities ─────────────────────────────────────────────────
export const charitiesAPI = {
  getAll: (params) => api.get('/charities', { params }),
  getById: (id) => api.get(`/charities/${id}`),
  donate: (id, data) => api.post(`/charities/${id}/donate`, data),
  updateUserCharity: (data) => api.put('/charities/user-selection', data),
};

// ── Subscriptions ─────────────────────────────────────────────
export const subscriptionsAPI = {
  createCheckout: (plan) => api.post('/subscriptions/create-checkout', { plan }),
  getStatus: () => api.get('/subscriptions/status'),
  cancel: () => api.post('/subscriptions/cancel'),
};

// ── Winners ───────────────────────────────────────────────────
export const winnersAPI = {
  getMyWins: () => api.get('/winners/my-wins'),
  uploadProof: (entryId, formData) =>
    api.post(`/winners/${entryId}/upload-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ── Admin ─────────────────────────────────────────────────────
export const adminAPI = {
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  updateUserScores: (userId, scores) => api.put(`/admin/users/${userId}/scores`, { scores }),

  // Draws
  getDraws: () => api.get('/admin/draws'),
  createDraw: (data) => api.post('/admin/draws', data),
  simulateDraw: (id, data) => api.post(`/admin/draws/${id}/simulate`, data),
  publishDraw: (id) => api.post(`/admin/draws/${id}/publish`),
  getDrawResults: (id) => api.get(`/admin/draws/${id}/results`),

  // Charities
  getCharities: () => api.get('/admin/charities'),
  createCharity: (data) => api.post('/admin/charities', data),
  updateCharity: (id, data) => api.put(`/admin/charities/${id}`, data),
  deleteCharity: (id) => api.delete(`/admin/charities/${id}`),

  // Winners
  getWinners: () => api.get('/admin/winners'),
  updateVerification: (id, data) => api.put(`/admin/winners/${id}`, data),

  // Reports
  getReports: () => api.get('/admin/reports'),
};

export default api;
