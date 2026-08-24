import api from './api';

export const commentService = {
  list: (postId, params) => api.get('/comments', { params: { post: postId, ...params } }),
  listAll: (params) => api.get('/comments/admin', { params }),
  create: (payload) => api.post('/comments', payload),
  update: (commentId, payload) => api.patch(`/comments/${commentId}`, payload),
  setVisibility: (commentId, hidden) => api.patch(`/comments/${commentId}/visibility`, { hidden }),
  remove: (commentId) => api.delete(`/comments/${commentId}`),
};
