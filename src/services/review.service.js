import api from '~/config/api';

export const reviewService = {
    addReview: (form, config = {}) => api.post('/reviews/add', form, config),
    getReviews: () => api.get(`/reviews/get`),
};
