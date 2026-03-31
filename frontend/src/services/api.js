import axios from 'axios';

const VITE_API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  register: async (username, password, confirmPassword) => {
    const response = await api.post('/api/register', {
      username,
      password,
      confirm_password: confirmPassword
    });
    return response.data;
  },

  login: async (username, password) => {
    const response = await api.post('/api/login', { username, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/api/logout');
    return response.data;
  },
  
  checkAuth: async () => {
    const response = await api.get('/api/check-auth');
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async () => {
    const response = await api.get('/api/tasks');
    return response.data;
  },
  
  getById: async (taskId) => {
    const response = await api.get(`/api/tasks/${taskId}`);
    return response.data;
  },
  
  create: async (taskData) => {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
  },
  
  update: async (taskId, taskData) => {
    const response = await api.put(`/api/tasks/${taskId}`, taskData);
    return response.data;
  },
  
  delete: async (taskId) => {
    const response = await api.delete(`/api/tasks/${taskId}`);
    return response.data;
  },
  
  getHistory: async (taskId) => {
    const response = await api.get(`/api/tasks/${taskId}/history`);
    return response.data;
  },
};

export default api;


