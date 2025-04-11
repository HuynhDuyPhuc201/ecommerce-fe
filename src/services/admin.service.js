import api from '~/config/api';

export const adminService = {
    // user
    create: (form) => api.post(`/user/create`, form),
    getAll: () => api.get(`/user/getall`),
    update: (form) => api.put(`/user/update-user`, form),
    delete: (queryId) => api.delete(`/user/delete-user?${queryId}`),

    // category
    createCategory: (form, config = {}) => api.post(`/product/create-category`, form, config),
    deleteCategory: (ids) => api.delete(`/product/delete-cateogry?${ids}`),
    deleteAllCategory: () => api.delete(`/product/delete-all-cateogry`),

    // product
    deleteProduct: (ids) => api.delete(`/product/delete-product?${ids}`),
    createProduct: (form, config = {}) => api.post(`/product/create-product`, form, config),
    updateProduct: (form, config = {}) => api.put(`/product/update-product`, form, config),

    // chart
    getRevenueStatistics: (type) => api.get(`/chart/stats/?type=${type}`),

    // discount
    createDiscount: (data) => api.post('/discount/createDiscount', data),
    validateDiscount: (data) => api.post(`/discount/validate`, data),
    getAllDiscount: (code = '') => api.get(`/discount/getDiscount${code}`),
    deleteDiscount: (ids) => api.delete(`/discount/deleteDiscount?${ids}`),
    updateDiscount: (form) => api.put('/discount/updateDiscount', form),
};
