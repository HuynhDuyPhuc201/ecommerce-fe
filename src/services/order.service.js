import api from '~/config/api';

export const orderService = {
    getOrder: () => api.get(`/order/get`),
    getOrderAdmin: (query) => api.get(`/order/getOrderAdmin${query ? query : ''}`),
    createOrder: (orders) => api.post(`/order/create`, orders)
};
