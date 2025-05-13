import api from '~/config/api';

export const productService = {
    getDetail: (id) => api.get(`/product/get-detail/${id}`),
    getAll: (query) => api.get(`/product/getAllProduct${query ? query : ''}`),
    updateStock: (form) => api.put(`/product/update-stock`, form),
};
