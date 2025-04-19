import api from '~/config/api';

export const productService = {
    getDetail(id) {
        return api.get(`/product/get-detail/${id}`);
    },
    getAll(query) {
        return api.get(`/product/getAllProduct${query ? query : ''}`);
    },
    updateStock(form) {
        return api.put(`/product/update-stock`, form);
    },
    // cate
    getCategory() {
        return api.get(`/product/getCategory`);
    },

    // review
    addReview(form, config = {}) {
        return api.post('/reviews/add', form, config);
    },
    updateReview(reviewId) {
        return api.put(`/reviews/update?${reviewId}`);
    },
    getReviews() {
        return api.get(`/reviews/get`);
    },
    deleteAllReviews() {
        return api.delete(`/reviews/delete-all`);
    },
};
