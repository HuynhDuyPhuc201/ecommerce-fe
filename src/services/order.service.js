import api from '~/config/api';

export const orderService = {
    getOrder() {
        return api.get(`/order/get`);
    },
    getOrderAdmin(query) {
        return api.get(`/order/getOrderAdmin${query ? query : ''}`);
    },
    createOrder(orders) {
        return api.post(`/order/create`, orders);
    },
};
