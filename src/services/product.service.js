import api from '~/config/api';

export const productService = {
    getDetail: (id) => api.get(`/product/get-detail/${id}`),
    getAll: (query) => api.get(`/product/getAllProduct${query ? query : ''}`),
    updateStock: (form) => api.put(`/product/update-stock`, form),

    //cate
    getCategory: () => api.get(`/product/getCategory`),

    //review
    addReview: (form, config = {}) => api.post('/reviews/add', form, config),
    updateReview: (reviewId) => api.put(`/reviews/update?${reviewId}`),
    getReviews: () => api.get(`/reviews/get`),
    deleteAllReviews: () => api.delete(`/reviews/delete-all`),

    // wishlist
    getWishlist: () => api.get('/wishlist/get'),
    addWishlist: (productId) => api.post('/wishlist/add', productId),
    deleteWishlist: (productId = "") => api.delete(`/wishlist/delete?productId=${productId}`, ),
};
