import api from './api';

const externalService = {
  users: () => api.get('/external/users'),
};

export default externalService;
