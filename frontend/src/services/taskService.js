import api from './api';

const taskService = {
  list: (params) => api.get('/tasks', { params }),
  get: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  remove: (id) => api.delete(`/tasks/${id}`),
  listComments: (id) => api.get(`/tasks/${id}/comments`),
  addComment: (id, comment) => api.post(`/tasks/${id}/comments`, { comment }),
  removeComment: (taskId, commentId) => api.delete(`/tasks/${taskId}/comments/${commentId}`),
};

export default taskService;
