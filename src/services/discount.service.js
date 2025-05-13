import api from '~/config/api';

export const discountService = {
    createDiscount: (data) => api.post('/discount/createDiscount', data),
    validateDiscount: (data) => api.post(`/discount/validate`, data),
    getAllDiscount: (code = '') => api.get(`/discount/getDiscount${code}`),
    deleteDiscount: (ids) => api.delete(`/discount/deleteDiscount?${ids}`),
    updateDiscount: (form) => api.put('/discount/updateDiscount', form),
};
