import api from '~/config/api';

export const cartService = {
    getCart: () => api.get(`/cart/get`),
    addCart: (product) => api.post('/cart/add', product),
    updateCart: (payload) => api.put(`/cart/update`, payload),
    removeCart: (ids) => api.delete(`/cart/delete?${ids}`)
};
