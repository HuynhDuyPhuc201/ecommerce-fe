import React from 'react';
import { Camera, WalletCards, Landmark, HandCoins } from 'lucide-react';

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

export const paymentMethods = [
    { id: 1, icon: <HandCoins size={18} />, label: 'Thanh toán tiền mặt', key: 'cash' },
    { id: 2, icon: <Landmark size={18} />, label: 'Thanh toán qua ngân hàng', key: 'bank' },
    { id: 3, icon: <WalletCards size={18} />, label: 'Thanh toán qua Momo', key: 'momo' },
];

export const shippingOptions = [
    { value: 'standard', label: 'Giao tiết kiệm', price: 10000, time: 'Từ 3 - 5 ngày' },
    { value: 'express', label: 'Giao nhanh', price: 20000, time: 'Từ 2 - 3 ngày' },
    { value: 'fastest', label: 'Hỏa tốc', price: 60000, time: 'Giao trong ngày' },
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

// export const modalButtonData = [
//     {
//         title: 'Quản lí sản phẩm',
//         type: 'product',
//         action: 'create',
//     },
//     {
//         title: 'Danh mục sản phẩm',
//         type: 'category',
//         action: '',
//     },
//     {
//         title: 'Khuyến mãi',
//         type: 'discount',
//         action: 'create',
//     },
// ];
