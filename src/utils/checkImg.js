export const checkImg = (img) => {
    const { VITE_BUILD_MODE } = import.meta.env;
    return VITE_BUILD_MODE === 'dev'
        ? `http://localhost:8017/${img}`
        : `${img}`;
};