import api from '~/config/api';

// demo
export const userService = {
    update(form) {
        return api.put(`/user/update-user`, form);
    },
    getDetail(id) {
        return api.get(`/user/get-detail/${id}`);
    },

    // auth
    login(form) {
        return api.post('/user/sign-in', form);
    },
    logout(form) {
        return api.post('/user/sign-out', form);
    },
    register(form) {
        return api.post('/user/sign-up', form);
    },
    verifyEmail(form) {
        return api.post('/user/verify-email', form);
    },
    refreshToken(token) {
        return api.post('/user/refresh-token', { token }, { withCredentials: true });
    },

    getAddress(params) {
        return api.get('/user/getAddress', { params });
    },
    createAddress(form) {
        return api.post('/user/createAddress', form);
    },
    removeAddress(id) {
        return api.delete(`/user/removeAddress${id}`);
    },
    updateAddress(form) {
        return api.put(`/user/updateAddress`, form);
    },
};
