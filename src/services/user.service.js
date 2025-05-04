import api from '~/config/api';

// demo
export const userService = {
    update: (form) => api.put(`/user/update-user`, form),
    getDetail: (id) => api.get(`/user/get-detail/${id}`),

    // auth
    login: (form) => api.post('/user/sign-in', form),
    loginGoogle: (token) => api.post('/user/sign-in-google', token),
    logout: (form) => api.post('/user/sign-out', form),
    register: (form) => api.post('/user/sign-up', form),
    verifyEmail: (form) => api.post('/user/verify-email', form),
    refreshToken: (token) => api.post('/user/refresh-token', { token }, { withCredentials: true }),

    getAddress: (params) => api.get('/user/getAddress', { params }),
    createAddress: (form) => api.post('/user/createAddress', form),
    removeAddress: (id) => api.delete(`/user/removeAddress${id}`),
    updateAddress: (form) => api.put(`/user/updateAddress`, form),
};
