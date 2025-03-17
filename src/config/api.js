import axios from 'axios';
import { getToken, setToken } from '../core/token';
import { userService } from '~/services/user.service';
import { API_ROOT } from '~/utils/constants';

// Khởi tạo Axios instance
const api = axios.create({
    baseURL: API_ROOT,
    withCredentials: true, // ✅ Đảm bảo luôn gửi cookie trong request
});

// Request Interceptor: Gửi token trong header nếu có (nếu lưu access token vào cookie thì không cần gửi token trong header)
api.interceptors.request.use((config) => {
    // const token = getToken();
    // if (token) {
    //     config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
});

// Response Interceptor: Xử lý lỗi và refresh token (nếu lưu access token vào cookie thì không cần refresh token - BE sẽ xử lý việc đó)
// nếu lưu vào localStorage thì cần refresh token (dễ bị tấn công SSR nếu là app lớn)
// tốt nhất là lưu ở Cookie để BE xử lí
api.interceptors.response.use(
    (res) => {
        return res.data;
    },
    // async (err) => {
    //     // console.log('Lỗi API:', err?.response?.data);

    //     // Kiểm tra lỗi do token hết hạn
    //     if (err?.response?.data?.message === 'Token is not valid') {
    //         try {
    //             console.log('🔄 Refreshing token...');

    //             // Gọi API refresh token
    //             const newAccessToken = await userService.refreshToken();

    //             // Lưu token mới vào localStorage hoặc cookie
    //             setToken(newAccessToken.access_token);

    //             // Cập nhật token mới vào headers của axios
    //             api.defaults.headers.Authorization = `Bearer ${newAccessToken.access_token}`;

    //             // Gửi lại request ban đầu với token mới
    //             err.config.headers.Authorization = `Bearer ${newAccessToken.access_token}`;
    //             return api.request(err.config);
    //         } catch (refreshError) {
    //             console.error('🚨 Refresh token failed', refreshError);
    //             throw new Error(refreshError?.response?.data);
    //         }
    //     }

    //     return Promise.reject(err);
    // },
);

export default api;
