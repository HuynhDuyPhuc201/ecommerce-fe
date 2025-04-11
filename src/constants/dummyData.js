export const startArr = [
    {
        id: 1,
        value: 3,
        checked: false,
    },
    {
        id: 2,
        value: 2,
        checked: false,
    },
    {
        id: 3,
        value: 1,
        checked: false,
    },
];

export const priceArr = [
    {
        id: 1,
        price: '-40000',
        name: 'Dưới 40.000',
        checked: false,
    },
    {
        id: 2,
        price: '+400000',
        name: 'Trên 400.000',
        checked: false,
    },
];

export const paymentMethods = [{ id: 1, label: 'Thanh toán tiền mặt' }];

export const shippingOptions = [
    { value: 'standard', label: 'Giao tiết kiệm', price: 10000 },
    { value: 'express', label: 'Giao nhanh', price: 20000 },
    { value: 'fastest', label: 'Hỏa tốc', price: 60000 },
];

// admin Product
export const tabTableAdminProduct = [
    {
        title: 'Xem danh sách sản phẩm',
        value: 'product',
    },
    {
        title: 'Xem danh mục sản phẩm',
        value: 'category',
    },
    {
        title: 'Xem mã giảm giá',
        value: 'discount',
    },
];

export const modalButtonData = [
    {
        title: 'Quản lí sản phẩm',
        type: 'product',
        action: 'create',
    },
    {
        title: 'Danh mục sản phẩm',
        type: 'category',
        action: '',
    },
    {
        title: 'Khuyến mãi',
        type: 'discount',
        action: 'create',
    },
];
