import api from '~/config/api';

export const cartService = {
    getCart() {
        return api.get(`/cart/get`);
    },
    addCart(product) {
        return api.post('/cart/add', product);
    },

    updateCart(payload) {
        return api.put(`/cart/update`, payload);
    },
    removeCart(ids) {
        return api.delete(`/cart/delete?${ids}`);
    },
};
