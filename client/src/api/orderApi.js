import api from './axiosInstance';

export const createOrder      = (data)          => api.post('/orders', data);
export const getAllOrders      = (params)        => api.get('/orders', { params });
export const getMyOrders       = ()              => api.get('/orders/my');
export const getOrder          = (id)            => api.get(`/orders/${id}`);
export const cancelOrder       = (id, reason)    => api.put(`/orders/${id}/cancel`, { reason });
export const updateOrderStatus = (id, orderStatus) => api.put(`/orders/${id}/status`, { orderStatus });
