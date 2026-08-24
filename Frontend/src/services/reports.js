import api from './api';

export const reportService = {
  list: (params) => api.get('/reports', { params }),
  get: (reportId) => api.get(`/reports/${reportId}`),
  create: (payload) => api.post('/reports', payload),
  updateStatus: (reportId, status) => api.patch(`/reports/${reportId}/status`, { status }),
};
