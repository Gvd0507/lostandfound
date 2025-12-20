import axios from 'axios';
import { getIdToken } from './firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API Endpoints

// Lost Items
export const reportLostItem = async (formData) => {
  const response = await api.post('/lost-items', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getLostItems = async (filters = {}) => {
  const response = await api.get('/lost-items', { params: filters });
  return response.data;
};

export const getLostItemById = async (id) => {
  const response = await api.get(`/lost-items/${id}`);
  return response.data;
};

// Found Items
export const reportFoundItem = async (formData) => {
  const response = await api.post('/found-items', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getFoundItems = async (filters = {}) => {
  const response = await api.get('/found-items', { params: filters });
  return response.data;
};

export const getFoundItemById = async (id) => {
  const response = await api.get(`/found-items/${id}`);
  return response.data;
};

// Matching
export const answerSecretQuestion = async (matchId, answer) => {
  const response = await api.post(`/matches/${matchId}/verify`, { answer });
  return response.data;
};

export const getMyMatches = async () => {
  const response = await api.get('/matches/my-matches');
  return response.data;
};

// User Items
export const getMyReports = async () => {
  const response = await api.get('/users/my-reports');
  return response.data;
};

// Admin
export const getAdminCases = async () => {
  const response = await api.get('/admin/cases');
  return response.data;
};

export const resolveAdminCase = async (caseId, resolution) => {
  const response = await api.post(`/admin/cases/${caseId}/resolve`, { resolution });
  return response.data;
};

// Notifications
export const getNotifications = async (params = {}) => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.put('/notifications/mark-all-read');
  return response.data;
};

export default api;
