import api from '~/config/api';

export const categoryService = {
    getCategory: () => api.get(`/category/getCategory`),
};
