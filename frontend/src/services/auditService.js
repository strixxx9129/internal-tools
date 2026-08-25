import api from './api';

const auditService = {
  list: (params) => api.get('/audit-logs', { params }),
};

export default auditService;
