import { Breadcrumb, Button, Card, Col, message, Radio, Row } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { cart_empty } from '~/constants/images';
import { formatNumber } from '~/core';
import { getAddress, getUser, setCart } from '~/core/token';
import useGetUserDetail from '~/hooks/useGetUserDetail';
import useGetCart from '~/hooks/useGetCart';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { path } from '~/config/path';
import { orderService } from '~/services/order.service';
import { productService } from '~/services/product.service';
import { useLocalStore } from '~/store/useLocalStore';
import { paymentMethods, shippingOptions } from '~/constants/dummyData';
import InputForm from '~/components/InputForm';
import BreadcrumbComponent from '~/components/Breadcrumb';

const Payment = () => {
    const { state: checkoutInfo } = useLocation();
    const navigate = useNavigate();
    const { data: dataUserDetail } = useGetUserDetail();
    const user = getUser();
    const [loading, setLoading] = useState(false);
    const { setCartLocal, cartLocal } = useLocalStore();
    const addressLocal = getAddress();
    const { refetch: refetchCart, data: dataCart } = useGetCart();
    const [discountCode, setDiscountCode] = useState({
        code: '',
        discountAmount: 0,
    });
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [shippingMethod, setShippingMethod] = useState('standard');

    const addressForm = useForm({ mode: 'onChange' });

    const [chooseAddress, setChooseAddress] = useState(user ? checkoutInfo.shippingAddress : addressLocal);
    const addressString = useMemo(() => {
        return Object.entries(checkoutInfo?.shippingAddress || chooseAddress || {})
            .filter(([key]) => key !== '_id' && key !== 'defaultAddress')
            .map(([_, value]) => value)
            .join(', ');
    }, [checkoutInfo?.shippingAddress]);

    // phí ship
    const shippingFee = useMemo(() => {
        return shippingOptions.find((option) => option.value === shippingMethod)?.price || 0;
    }, [shippingMethod]);

    // tổng tiền
    const newSubTotal = useMemo(() => {
        return (checkoutInfo?.subTotal || 0) + shippingFee - (discountCode.discountAmount || 0);
    }, [checkoutInfo?.subTotal, shippingFee, discountCode.discountAmount]);

    if (Object.keys(checkoutInfo || []).length <= 0) return <Navigate to={path.Home} />;

    const onSubmitOrder = async (form) => {
        if (!shippingMethod) return message.error('Thêm phương thức vận chuyển');
        if (!selectedPayment) return message.error('Thêm phương thức thanh toán');

        const shippingAddress = {
            houseNumber: form?.houseNumber || chooseAddress?.houseNumber,
            district: form?.district || chooseAddress?.district,
            city: form?.city || chooseAddress?.city,
        };

        const inforUser = {
            name: form.name || dataUserDetail?.user?.name,
            email: form.email || dataUserDetail?.user?.email,
            phone: form.phone || dataUserDetail?.user?.phone,
        };

        try {
            setLoading(true);
            const listOrderItem = {
                ...checkoutInfo,
                // nếu như shipping không có (tức là khi dùng button mua ngay, nó không add shipping) thì thêm vào
                shippingAddress: shippingAddress,
                deliveryMethod: shippingMethod,
                paymentMethod: selectedPayment,
                subTotal: newSubTotal,
                ...inforUser,
            };
            const result = await orderService.createOrder(listOrderItem);
            if (result.success) {
                message.success(result.message);
                refetchCart();
                navigate(path.OrderSuccess);
                updateStockAfterOrder(listOrderItem?.orderItems);
                if (!user) {
                    const listProductOrdered = result.createdOrder.orderItems.map((item) => item.productId);
                    const listProduct = cartLocal?.listProduct.filter(
                        (item) => !listProductOrdered.includes(item.productId),
                    );
                    const newCartLocal = {
                        listProduct,
                        subTotal: listProduct.reduce((acc, item) => acc + item.price * item.quantity, 0),
                        totalProduct: listProduct?.length,
                    };
                    setCartLocal(newCartLocal);
                    setCart(newCartLocal);
                }
            } else {
                message.error(result.message);
            }

            if (!result.success) return message.error(result.message);
        } catch (error) {
            if (error) {
                message.error(error.response.data?.message || 'Lỗi đặt hàng hoặc chưa cập nhật địa chỉ');
            }
        } finally {
            setLoading(false);
        }
    };
    const updateStockAfterOrder = async (orderItems) => {
        for (const item of orderItems) {
            try {
                await productService.updateStock({
                    productId: item.productId,
                    quantityOrdered: item.quantity,
                });
            } catch (error) {
                console.error(` updating stock for product ${item.productId}`);
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
            return message.error('Mã không hợp lệ');
        }
        setDiscountCode({ code: '', discountAmount: discountAmount });
    };

    const handleCloseDiscount = () => {
        setDiscountCode({ discountAmount: 0 });
    };

    const handleShippingMethod = useCallback((e) => {
        setShippingMethod(e.target.value);
    }, []);

    const arrayBreadcrumb = useMemo(() => {
        return [
            { 
                text: checkoutInfo?.page === 'cart' ? 'Giỏ hàng' : 'Chi tiết sản phẩm', 
                href: checkoutInfo?.page === 'cart' ? 'cart' : `product-detail/${checkoutInfo?.idCate}/${checkoutInfo?.orderItems[0]?.productId}` 
            },
            { text: 'Thanh toán' },
        ];
    }, [checkoutInfo]);
    

    return (
        <div className="container pt-16">
            <BreadcrumbComponent arrayItem={arrayBreadcrumb} />
            <Row span={(16, 16)} style={{ gap: '10px' }}>
                {dataCart?.listProduct?.length > 0 ||
                cartLocal?.listProduct?.length > 0 ||
                Object.keys(checkoutInfo || []).length > 0 ||
                [] ? (
                    <>
                        <Col xs={24} sm={24} md={15}>
                            <Card title="Thông tin đơn hàng" className="mb-6">
                                <div>
                                    <p>
                                        <strong>Số lượng sản phẩm:</strong> {checkoutInfo?.totalProduct || `1`}
                                    </p>
                                    <p>
                                        <strong>Tổng tiền:</strong>{' '}
                                        {/* nếu bấm mua ngay thì totalProduct bằng giá chính nó * số lượng */}
                                        {formatNumber(
                                            checkoutInfo?.subTotal || checkoutInfo?.price * checkoutInfo?.quantity || 0,
                                        )}
                                        đ
                                    </p>
                                    <p className="mt-3">
                                        <strong>Sản phẩm:</strong>
                                    </p>
                                    {/* 1 sản phẩm cho mua ngay */}
                                    {/*  bấm mua ngay thì mới hiện */}
                                    {/* kiểm tra đại các key có hay không mới cho render ra */}
                                    {checkoutInfo.name && (
                                        <ul className="pt-5">
                                            <li style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                                <img
                                                    src={checkoutInfo?.image}
                                                    alt="Product"
                                                    style={{ width: '70px', height: '70px', marginRight: '10px' }}
                                                />
                                                <div>
                                                    <p>{checkoutInfo?.name}</p>
                                                    <p>
                                                        {formatNumber(checkoutInfo?.price || 0)} x{' '}
                                                        {checkoutInfo?.quantity || 0}
                                                    </p>
                                                </div>
                                            </li>
                                        </ul>
                                    )}
                                    <ul className="pt-5">
                                        {checkoutInfo?.orderItems?.map((item, index) => (
                                            <li
                                                key={index}
                                                style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}
                                            >
                                                <img
                                                    src={item?.image}
                                                    alt="Product"
                                                    style={{ width: '70px', height: '70px', marginRight: '10px' }}
                                                />
                                                <div>
                                                    <p>{item?.name}</p>
                                                    <p>
                                                        {formatNumber(item?.price || 0)} x {item?.quantity || 0}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                            {!user && (
                                <Card title="Thông tin khách hàng" className="mb-6">
                                    <FormProvider {...addressForm}>
                                        <form onSubmit={addressForm.handleSubmit(onSubmitOrder)}>
                                            <Row gutter={[24, 24]} align="top">
                                                <Col span={12}>
                                                    <label className="block text-gray-700">Họ tên</label>
                                                    <input
                                                        {...addressForm.register('name', {
                                                            required: true ? 'Trường này là bắt buộc' : '',
                                                        })}
                                                        type="text"
                                                        className="w-full p-2 border rounded-lg"
                                                        placeholder=""
                                                    />
                                                    {addressForm?.formState?.errors?.name && (
                                                        <p style={{ color: 'red' }}>
                                                            {addressForm?.formState?.errors?.name.message}
                                                        </p>
                                                    )}
                                                </Col>
                                                <Col span={12}>
                                                    <label className="block text-gray-700">Email</label>
                                                    <input
                                                        {...addressForm.register('email', {
                                                            required: true ? 'Trường này là bắt buộc' : '',
                                                        })}
                                                        type="text"
                                                        className="w-full p-2 border rounded-lg"
                                                        placeholder=""
                                                    />
                                                    {addressForm?.formState?.errors?.email && (
                                                        <p style={{ color: 'red' }}>
                                                            {addressForm?.formState?.errors?.email.message}
                                                        </p>
                                                    )}
                                                </Col>
                                                <Col span={!checkoutInfo?.shippingAddress ? 12 : 24}>
                                                    <label className="block text-gray-700">Số điện thoại</label>
                                                    <input
                                                        {...addressForm.register('phone', {
                                                            required: true ? 'Trường này là bắt buộc' : '',
                                                        })}
                                                        type="text"
                                                        className="w-full p-2 border rounded-lg"
                                                        placeholder=""
                                                    />
                                                    {addressForm?.formState?.errors?.phone && (
                                                        <p style={{ color: 'red' }}>
                                                            {addressForm?.formState?.errors?.phone.message}
                                                        </p>
                                                    )}
                                                </Col>
                                                {!addressLocal && (
                                                    <>
                                                        <Col span={12}>
                                                            <label className="block text-gray-700">Số nhà</label>
                                                            <input
                                                                {...addressForm.register('houseNumber', {
                                                                    required: true ? 'Trường này là bắt buộc' : '',
                                                                })}
                                                                type="text"
                                                                className="w-full p-2 border rounded-lg"
                                                                placeholder=""
                                                            />
                                                            {addressForm?.formState?.errors?.houseNumber && (
                                                                <p style={{ color: 'red' }}>
                                                                    {
                                                                        addressForm?.formState?.errors?.houseNumber
                                                                            .message
                                                                    }
                                                                </p>
                                                            )}
                                                        </Col>
                                                        <Col span={12}>
                                                            <label className="block text-gray-700">Quận / huyện</label>
                                                            <input
                                                                {...addressForm.register('district', {
                                                                    required: true ? `Trường này là bắt buộc` : '',
                                                                })}
                                                                type="text"
                                                                className="w-full p-2 border rounded-lg"
                                                                placeholder=""
                                                            />
                                                            {addressForm?.formState?.errors?.district && (
                                                                <p style={{ color: 'red' }}>
                                                                    {addressForm?.formState?.errors?.district.message}
                                                                </p>
                                                            )}
                                                        </Col>
                                                        <Col span={12}>
                                                            <label className="block text-gray-700">Thành phố</label>
                                                            <input
                                                                {...addressForm.register('city', {
                                                                    required: true ? `Trường này là bắt buộc` : '',
                                                                })}
                                                                type="text"
                                                                className="w-full p-2 border rounded-lg"
                                                                placeholder=""
                                                            />
                                                            {addressForm?.formState?.errors?.city && (
                                                                <p style={{ color: 'red' }}>
                                                                    {addressForm?.formState?.errors?.city.message}
                                                                </p>
                                                            )}
                                                        </Col>
                                                    </>
                                                )}
                                            </Row>
                                        </form>
                                    </FormProvider>
                                </Card>
                            )}
                            {user && dataUserDetail?.user?.address.length === 0 && (
                                <Card title="Thêm thông tin địa chỉ" className="mb-6">
                                    <FormProvider {...addressForm}>
                                        <form onSubmit={addressForm.handleSubmit(onSubmitOrder)}>
                                            <Row gutter={[24, 24]} align="top">
                                                {!addressLocal && (
                                                    <>
                                                        <Col span={12}>
                                                            <InputForm
                                                                error={addressForm.formState.errors['houseNumber']}
                                                                placeholder=""
                                                                name="houseNumber"
                                                                required={false}
                                                                label={'Số nhà'}
                                                            />
                                                        </Col>
                                                        <Col span={12}>
                                                            <InputForm
                                                                error={addressForm.formState.errors['district']}
                                                                placeholder=""
                                                                name="district"
                                                                required={false}
                                                                label={'Quận / huyện'}
                                                            />
                                                        </Col>
                                                        <Col span={12}>
                                                            <InputForm
                                                                error={addressForm.formState.errors['city']}
                                                                placeholder="Nhập địa chỉ"
                                                                name="city"
                                                                required={false}
                                                                label={'Thành phố'}
                                                            />
                                                        </Col>
                                                    </>
                                                )}
                                            </Row>
                                        </form>
                                    </FormProvider>
                                </Card>
                            )}
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
                                            {option.label} - {formatNumber(option.price || 0)}đ
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            </Card>
                        </Col>
                        <Col sm={24} xs={24} md={7}>
                            {addressLocal && (
                                <div className="category bg-[#fff] rounded-[8px]   p-4 w-full my-2">
                                    <div className="flex justify-between">
                                        <p className=" text-[#333]  mb-5">Giao tới</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{addressString || 'Chưa cập nhật địa chỉ'}</span>{' '}
                                        {!addressString && user && (
                                            <Link
                                                to={path.Account.Address}
                                                style={{ textDecoration: 'underline', color: '#1A94FF' }}
                                            >
                                                Cập nhật
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
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
                                        <span>
                                            {formatNumber(
                                                checkoutInfo?.subTotal ||
                                                    checkoutInfo?.price * checkoutInfo?.quantity ||
                                                    0,
                                            )}
                                            đ
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-700 mt-2">
                                        <span>Phí vận chuyển</span>
                                        <span>{formatNumber(shippingFee || 0)}đ</span>
                                    </div>

                                    {discountCode.discountAmount > 0 && (
                                        <div className="flex justify-between text-gray-700 mt-2">
                                            <span>Mã giảm giá</span>
                                            <span className="text-[red]">
                                                -{formatNumber(discountCode.discountAmount || 0)}đ
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
                                        <span>{formatNumber(newSubTotal || 0)}đ</span>
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
                                            className={`mt-4 w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 ${
                                                loading ? ' opacity-50' : 'opacity-100'
                                            }`}
                                            onClick={addressForm.handleSubmit(onSubmitOrder)}
                                            disabled={loading}
                                        >
                                            Đặt hàng (
                                            {checkoutInfo?.orderItems?.length || (checkoutInfo?.name && 1) || 0})
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
        </div>
    );
};

export default Payment;
