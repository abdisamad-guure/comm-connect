import api from './api';

export const announcementService = {
  list: (params) => api.get('/announcements', { params }),
  get: (announcementId) => api.get(`/announcements/${announcementId}`),
  create: (payload) => api.post('/announcements', payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (announcementId, payload) => api.patch(`/announcements/${announcementId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (announcementId) => api.delete(`/announcements/${announcementId}`),
};
