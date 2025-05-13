import api from '~/config/api';

export const wishlistService = {
    getWishlist: () => api.get('/wishlist/get'),
    addWishlist: (productId) => api.post('/wishlist/add', productId),
    deleteWishlist: (productId = "") => api.delete(`/wishlist/delete?productId=${productId}`, ),
};

