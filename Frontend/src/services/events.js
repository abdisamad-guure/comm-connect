import api from './api';

export const eventService = {
  list: (params) => api.get('/events', { params }),
  get: (eventId) => api.get(`/events/${eventId}`),
  create: (payload) => api.post('/events', payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (eventId, payload) => api.patch(`/events/${eventId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (eventId) => api.delete(`/events/${eventId}`),
  join: (eventId) => api.post(`/events/${eventId}/join`),
};
