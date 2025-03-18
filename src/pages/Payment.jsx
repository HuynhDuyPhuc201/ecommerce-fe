import { Button, Card, Col, message, Modal, Radio, Row, Table } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import InputForm from '~/components/InputForm';
import { cart_empty } from '~/constants/images';
import { formatNumber } from '~/core';
import { getUser, setUser } from '~/core/token';
import { userService } from '~/services/user.service';
import useGetUserDetail from '~/hooks/useGetUserDetail';
import useGetCart from '~/hooks/useGetCart';
import useOrderStore from '~/store/useOrderStore';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { path } from '~/config/path';
import { orderService } from '~/services/order.service';
import { useQuery } from '@tanstack/react-query';
import { productService } from '~/services/product.service';

const paymentMethods = [{ id: 1, label: 'Thanh toán tiền mặt' }];
const shippingOptions = [
    { value: 'standard', label: 'Giao tiết kiệm', price: 10000 },
    { value: 'express', label: 'Giao nhanh', price: 20000 },
    { value: 'fastest', label: 'Hỏa tốc', price: 60000 },
];
const Payment = () => {
    const navigate = useNavigate();
    const { checkoutInfo } = useOrderStore();
    const { refetch: refetchUser } = useGetUserDetail();
    const { refetch: refetchCart, data: dataCart } = useGetCart();
    const [discountCode, setDiscountCode] = useState({
        code: '',
        discountAmount: 0,
    });
    const [modalConfig, setModalConfig] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [shippingMethod, setShippingMethod] = useState('standard');

    const orderForm = useForm({ mode: 'onChange' });

    // phí ship
    const shippingFee = useMemo(() => {
        return shippingOptions.find((option) => option.value === shippingMethod)?.price || 0;
    }, [shippingMethod]);

    // tổng tiền
    const newSubTotal = useMemo(() => {
        return (checkoutInfo?.subTotal || 0) + shippingFee - (discountCode.discountAmount || 0);
    }, [checkoutInfo?.subTotal, shippingFee, discountCode.discountAmount]);

    if (Object.keys(checkoutInfo)?.length === 0) return <Navigate to={path.Home} />;

    const onSubmit = async (form) => {
        try {
            const data = await userService.update(form);
            if (data.success) {
                const { password, ...user } = data.user;
                setUser(user);
                message.success(data.message);
                refetchUser();
                orderForm.reset({});
                setModalConfig(false);
            }
        } catch (error) {
            message.error(error.response.data?.message);
        }
    };
    const { refetch: refetchProduct } = useQuery({
        queryKey: ['products'],
        queryFn: async () => productService.getAll(`?limit=8&page=1`),
    });

    const hanldeOrder = async () => {
        if (!shippingMethod) return message.error('Thêm phương thức vận chuyển');
        if (!selectedPayment) return message.error('Thêm phương thức thanh toán');
        try {
            const listOrderItem = {
                ...checkoutInfo,
                deliveryMethod: shippingMethod,
                paymentMethod: selectedPayment,
                subTotal: newSubTotal,
            };
            const result = await orderService.createOrder(listOrderItem);
            if (result.success) {
                message.success(result.message);
                refetchCart();
                navigate(path.OrderSuccess);
                updateStockAfterOrder(listOrderItem.orderItems);
            }
        } catch (error) {
            message.error(error);
        }
    };
    const updateStockAfterOrder = async (orderItems) => {
        for (const item of orderItems) {
            try {
                const result = await productService.updateStock({
                    productId: item.productId,
                    quantityOrdered: item.quantity,
                });
                if (result) {
                    refetchProduct();
                }
            } catch (error) {
                console.error(`Error updating stock for product ${item.productId}`, error);
            }
        }
    };

    const handleDiscount = () => {
        let discountAmount = discountCode.discountAmount;
        if (discountCode.code) {
            if (discountCode.code === 'GIAM30') {
                discountAmount = (checkoutInfo?.subTotal * 30) / 100; // Giảm giá 30%
            } else if (discountCode.code === 'GIAM10') {
                discountAmount = (checkoutInfo?.subTotal * 10) / 100; // Giảm giá 10%
            }
        }
        if (discountCode && !['GIAM30', 'GIAM10'].includes(discountCode.code)) {
            message.error('Mã không hợp lệ');
        }
        setDiscountCode({ code: '', discountAmount: discountAmount });
    };

    const handleCloseDiscount = () => {
        setDiscountCode({ discountAmount: 0 });
    };

    const handleShippingMethod = useCallback((e) => {
        setShippingMethod(e.target.value);
    }, []);

    const handleCancel = () => {
        setModalConfig(false);
    };

    const addressString = useMemo(() => {
        return Object.entries(checkoutInfo?.shippingAddress || {})
            .filter(([key]) => key !== '_id' && key !== 'defaultAddress')
            .map(([_, value]) => value)
            .join(', ');
    }, [checkoutInfo?.shippingAddress]);

    return (
        <div className="container pt-16">
            <Row span={(16, 16)} style={{ gap: '10px' }}>
                {dataCart?.listProduct?.length > 0 ? (
                    <>
                        <Col xs={24} sm={24} md={15}>
                            <Card title="Phương thức thanh toán" className="mb-6">
                                <Radio.Group
                                    onChange={(e) => setSelectedPayment(e.target.value)}
                                    value={selectedPayment}
                                >
                                    {paymentMethods?.map((method) => (
                                        <div key={method.id} style={{ marginBottom: 10 }}>
                                            <Radio value={method.label}>
                                                {method.icon} {method.label}
                                            </Radio>
                                        </div>
                                    ))}
                                </Radio.Group>
                            </Card>

                            <Card title="Phương thức giao hàng" className="mb-6">
                                <Radio.Group
                                    onChange={handleShippingMethod}
                                    value={shippingMethod}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                                >
                                    {shippingOptions?.map((option) => (
                                        <Radio key={option.value} value={option.value}>
                                            {option.label} - {formatNumber(option.price) || 0}đ
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            </Card>
                        </Col>
                        <Col sm={24} xs={24} md={7}>
                            <div className="category bg-[#fff] rounded-[8px]   p-4 w-full my-2">
                                <div className="flex justify-between">
                                    <p className=" text-[#333]  mb-5">Giao tới</p>
                                </div>
                                <span>{addressString || 'Chưa cập nhật địa chỉ'}</span>
                            </div>
                            <Col sm={24} xs={24} md={24}>
                                <div className="p-4 bg-white rounded-lg shadow-md ">
                                    <div className="flex justify-between">
                                        <p className=" text-[#333] mb-5">Đơn hàng</p>
                                        <Link className=" text-[#5351c7]  mb-5" to={path.Cart}>
                                            Đổi
                                        </Link>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Tạm tính</span>
                                        <span>{formatNumber(checkoutInfo?.subTotal) || 0}đ</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700 mt-2">
                                        <span>Phí vận chuyển</span>
                                        <span>{formatNumber(shippingFee) || 0}đ</span>
                                    </div>

                                    {discountCode.discountAmount > 0 && (
                                        <div className="flex justify-between text-gray-700 mt-2">
                                            <span>Mã giảm giá</span>
                                            <span className="text-[red]">
                                                -{formatNumber(discountCode.discountAmount) || 0}đ
                                                <Button
                                                    style={{ width: '10px', fontSize: '10px', marginLeft: '10px' }}
                                                    onClick={handleCloseDiscount}
                                                >
                                                    X
                                                </Button>
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-700 mt-2">
                                        <span>Giảm giá</span>
                                        <input
                                            type="text"
                                            onChange={(e) =>
                                                setDiscountCode({
                                                    code: e.target.value,
                                                    discountAmount: discountCode.discountAmount,
                                                })
                                            }
                                            value={discountCode.code}
                                            placeholder="GIAM30, GIAM10"
                                            className="text-[13px] w-[60%] outline-none border-r-none border-l-none border-t-none border-b-[2px]"
                                        />
                                    </div>
                                    <div className="flex justify-between font-bold mt-4">
                                        <span>Tổng tiền thanh toán</span>
                                        <span>{formatNumber(newSubTotal) || 0}đ</span>
                                    </div>
                                    <p className="text-sm text-gray-500">(Đã bao gồm VAT nếu có)</p>
                                    {discountCode.code ? (
                                        <button
                                            className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600"
                                            onClick={handleDiscount}
                                        >
                                            Áp dụng
                                        </button>
                                    ) : (
                                        <button
                                            className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600"
                                            onClick={hanldeOrder}
                                        >
                                            Đặt hàng ({checkoutInfo?.orderItems?.length || 0})
                                        </button>
                                    )}
                                </div>
                            </Col>
                        </Col>
                    </>
                ) : (
                    <Col sm={24} md={24}>
                        <div className="flex flex-col justify-center items-center p-4 bg-white rounded-lg shadow-md">
                            <div className="">
                                <img src={cart_empty} alt="" className="w-[150px]" />
                            </div>
                            <p>Giỏ hàng trống</p>
                        </div>
                    </Col>
                )}
            </Row>
            <FormProvider {...orderForm}>
                <Modal title="Cập nhật địa chỉ" open={modalConfig} onCancel={handleCancel} footer={null}>
                    <form onSubmit={orderForm.handleSubmit(onSubmit)}>
                        <Row gutter={[18, 18]}>
                            <Col md={24}>
                                <InputForm
                                    error={orderForm.formState.errors['address']}
                                    placeholder="Nhập địa chỉ"
                                    name="address"
                                    required={false}
                                />
                            </Col>
                            <div className="flex items-center justify-center w-full">
                                <button className="w-1/2 mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Cập nhật địa chỉ
                                </button>
                            </div>
                        </Row>
                    </form>
                </Modal>
            </FormProvider>
        </div>
    );
};

export default Payment;
