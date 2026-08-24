import api from './api';

export const userService = {
  get: (userId) => api.get(`/users/${userId}`),
  list: (params) => api.get('/users', { params }),
  remove: (userId) => api.delete(`/users/${userId}`),
};
