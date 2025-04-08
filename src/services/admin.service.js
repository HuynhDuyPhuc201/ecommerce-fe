import api from '~/config/api';

export const adminService = {
    // user
    create(form) {
        return api.post(`/user/create`, form);
    },
    getAll() {
        return api.get(`/user/getall`);
    },
    update(form) {
        return api.put(`/user/update-user`, form);
    },
    delete(queryId) {
        return api.delete(`/user/delete-user?${queryId}`);
    },

    // category
    createCategory(body) {
        return api.post(`/product/create-category`, body);
    },
    deleteCategory(ids) {
        return api.delete(`/product/delete-cateogry?${ids}`);
    },
    deleteAllCategory() {
        return api.delete(`/product/delete-all-cateogry`);
    },

    // product
    deleteProduct(ids) {
        return api.delete(`/product/delete-product?${ids}`);
    },
    createProduct(form, config = {}) {
        return api.post(`/product/create-product`, form, config);
    },
    updateProduct(form, config = {}) {
        return api.put(`/product/update-product`, form, config);
    },
};
