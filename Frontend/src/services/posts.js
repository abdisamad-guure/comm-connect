import api from './api';

export const postService = {
  list: (params) => api.get('/posts', { params }),
  get: (postId) => api.get(`/posts/${postId}`),
  create: (payload) => api.post('/posts', payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (postId, payload) => api.patch(`/posts/${postId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (postId) => api.delete(`/posts/${postId}`),
  toggleLike: (postId) => api.post(`/posts/${postId}/like`),
};
