import api from './axiosInstance';

export const createReview      = (data)      => api.post('/reviews', data);
export const getProviderReviews = (providerId) => api.get(`/reviews/provider/${providerId}`);
export const getMyReviews       = ()          => api.get('/reviews/my');
export const updateReview       = (id, data)  => api.put(`/reviews/${id}`, data);
export const deleteReview       = (id)        => api.delete(`/reviews/${id}`);
export const getAllReviews       = ()          => api.get('/reviews');
