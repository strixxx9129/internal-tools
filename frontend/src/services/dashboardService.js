import api from './api';

const dashboardService = {
  get: () => api.get('/dashboard'),
};

export default dashboardService;
