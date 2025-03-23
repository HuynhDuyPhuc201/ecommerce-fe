const TOKEN_NAME = 'token';
const USER_NAME = 'user';
const CART_NAME = 'cart';
const ADDRESS_NAME = 'address';
const INSTANTCHECKOUT_NAME = 'instant_checkout';

export const getToken = () => {
    let token = localStorage?.getItem(TOKEN_NAME);
    if (!token || token === 'undefined') {
        return null;
    }
    return JSON.parse(token);
};

export const setToken = (data) => {
    localStorage.setItem(TOKEN_NAME, JSON.stringify(data));
};
export const removeToken = () => {
    localStorage.removeItem(TOKEN_NAME);
};

export const getUser = () => {
    let user = localStorage?.getItem(USER_NAME) || '';
    if (user) return JSON.parse(user);
};

export const setUser = (data) => {
    localStorage.setItem(USER_NAME, JSON.stringify(data));
};
export const removeUser = () => {
    localStorage.removeItem(USER_NAME);
};

// cart
export const getCart = () => {
    let cart = localStorage?.getItem(CART_NAME) || '';
    if (cart) return JSON.parse(cart);
};
export const setCart = (data) => {
    localStorage.setItem(CART_NAME, JSON.stringify(data));
};
export const removeCart = () => {
    localStorage.removeItem(CART_NAME);
};

// address
export const getAddress = () => {
    let address = localStorage?.getItem(ADDRESS_NAME) || '';
    if (address) return JSON.parse(address);
};
export const setAddress = (data) => {
    localStorage.setItem(ADDRESS_NAME, JSON.stringify(data));
};
export const removeAddress = () => {
    localStorage.removeItem(ADDRESS_NAME);
};

//instantCheckout (mua ngay, thanh toán ngay)
export const getInstantCheckout = () => {
    let address = localStorage?.getItem(INSTANTCHECKOUT_NAME) || '';
    if (address) return JSON.parse(address);
};
export const setInstantCheckout = (data) => {
    localStorage.setItem(INSTANTCHECKOUT_NAME, JSON.stringify(data));
};
export const removeInstantCheckout = () => {
    localStorage.removeItem(INSTANTCHECKOUT_NAME);
};
