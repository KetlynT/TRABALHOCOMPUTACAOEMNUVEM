import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);

export const changePassword = (passwordData) => {
    return api.post('/auth/change-password', passwordData);
};

export const deleteAccount = () => {
    return api.delete('/auth/delete-account');
};

export const getProjects = () => api.get('/projects');
export const createProject = (projectData) => api.post('/projects', projectData);
export const getProjectDetails = (projectId) => api.get(`/projects/${projectId}`);
export const joinProject = (inviteCode) => api.post('/projects/join', { inviteCode });
export const getProjectActivity = (projectId) => api.get(`/projects/${projectId}/activity`);

export const createTask = (taskData) => api.post('/tasks', taskData);
export const updateTask = (taskId, taskData) => api.put(`/tasks/${taskId}`, taskData);
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`);
export const reorderTasks = (reorderData) => api.patch('/tasks/reorder', reorderData);
export const addCommentToTask = (taskId, commentData) => api.post(`/tasks/${taskId}/comments`, commentData);


const apis = {
    register,
    login,
    changePassword,
    deleteAccount,
    getProjects,
    createProject,
    getProjectDetails,
    joinProject,
    getProjectActivity,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
    addCommentToTask,
};

export default apis;