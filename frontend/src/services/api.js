import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const originalUrl = error.config.url;
      if (!originalUrl.endsWith('/auth/login') && !originalUrl.endsWith('/auth/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

const projectApi = {
  getProjects: () => api.get('/projects'),
  getProjectDetails: (projectId) => api.get(`/projects/${projectId}`),
  createProject: (projectData) => api.post('/projects', projectData),
  deleteProject: (projectId) => api.delete(`/projects/${projectId}`),
  generateInviteCode: (projectId) => api.post(`/projects/${projectId}/invite`),
  joinProject: (code) => api.post('/projects/join', { inviteCode: code }),
  promoteMember: (projectId, userId) => api.post(`/projects/${projectId}/promote`, { userId }),
  demoteMember: (projectId, userId) => api.post(`/projects/${projectId}/demote`, { userId }),
  getActivityLog: (projectId) => api.get(`/projects/${projectId}/activity`),
};

const taskApi = {
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (taskId, updates) => api.put(`/tasks/${taskId}`, updates),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
  addCommentToTask: (taskId, commentData) => api.post(`/tasks/${taskId}/comments`, commentData),
  reorderTasks: (reorderData) => api.patch('/tasks/reorder', reorderData),
};

export default {
  ...authApi,
  ...projectApi,
  ...taskApi,
};