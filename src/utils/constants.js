export const API_ROOT =
    import.meta.env.VITE_BUILD_MODE === 'dev'
        ? 'http://localhost:8017/api' // chạy dev
        : 'https://ecommerce-backend-00zj.onrender.com/api'; // chạy local production
