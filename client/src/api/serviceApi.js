import api from './axiosInstance';

export const getAllProviders        = (params) => api.get('/providers', { params });
export const getProvidersByCategory = (catId)  => api.get(`/providers/category/${catId}`);
export const getProvider            = (id)     => api.get(`/providers/${id}`);
export const createProvider         = (data)   => api.post('/providers', data);
export const updateProvider         = (id, data) => api.put(`/providers/${id}`, data);
export const deleteProvider         = (id)     => api.delete(`/providers/${id}`);
