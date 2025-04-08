import {Col, message, Row } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getAddress, getUser, setCart } from '~/core/token';
import useGetUserDetail from '~/hooks/useGetUserDetail';
import useGetCart from '~/hooks/useGetCart';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { path } from '~/config/path';
import { orderService } from '~/services/order.service';
import { productService } from '~/services/product.service';
import { useLocalStore } from '~/store/useLocalStore';
import { paymentMethods, shippingOptions } from '~/constants/dummyData';
import BreadcrumbComponent from '~/components/Breadcrumb';
import CustomerInformation from '~/components/checkout/CustomerInformation';
import OrderInformation from '~/components/checkout/OrderInformation';
import NewAddressForm from '~/components/Address/NewAddressForm';
import PaymentMethodCard from '~/components/checkout/PaymentMethodCard';
import ShippingMethodCard from '~/components/checkout/ShippingMethodCard';
import AddressDisplay from '~/components/checkout/AddressDisplay';
import OrderSummary from '~/components/checkout/OrderSummary';

const Payment = () => {
    const user = getUser();
    const navigate = useNavigate();
    const { state: checkoutInfo } = useLocation();
    const { data: dataUserDetail } = useGetUserDetail();
    const { setCartLocal, cartLocal } = useLocalStore();
    const { refetch: refetchCart, data: dataCart } = useGetCart();
    const addressLocal = getAddress();
    const [loading, setLoading] = useState(false);
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
                href:
                    checkoutInfo?.page === 'cart'
                        ? 'cart'
                        : `product-detail/${checkoutInfo?.idCate}/${checkoutInfo?.orderItems[0]?.productId}`,
            },
            { text: 'Thanh toán' },
        ];
    }, [checkoutInfo]);

    const isCartEmpty = 
    !dataCart?.listProduct?.length && 
    !cartLocal?.listProduct?.length && 
    !Object.keys(checkoutInfo || {}).length;

    return (
        <div className="container pt-16">
            <BreadcrumbComponent arrayItem={arrayBreadcrumb} />
            <Row span={(16, 16)} style={{ gap: '10px' }}>
                {!isCartEmpty ? (
                    <>
                        <Col xs={24} sm={24} md={15}>
                            <OrderInformation checkoutInfo={checkoutInfo} />
                            {!user && (
                                <CustomerInformation
                                    addressForm={addressForm}
                                    onSubmitOrder={onSubmitOrder}
                                    user={user}
                                    addressLocal={addressLocal}
                                    checkoutInfo={checkoutInfo}
                                />
                            )}
                            {user && dataUserDetail?.user?.address.length === 0 && (
                                <NewAddressForm
                                    addressForm={addressForm}
                                    onSubmitOrder={onSubmitOrder}
                                    addressLocal={addressLocal}
                                    user={user}
                                    dataUserDetail={dataUserDetail}
                                />
                            )}
                            <PaymentMethodCard
                                paymentMethods={paymentMethods}
                                selectedPayment={selectedPayment}
                                setSelectedPayment={setSelectedPayment}
                            />
                            <ShippingMethodCard
                                shippingOptions={shippingOptions}
                                shippingMethod={shippingMethod}
                                handleShippingMethod={handleShippingMethod}
                            />
                        </Col>
                        <Col sm={24} xs={24} md={7}>
                            {addressLocal && <AddressDisplay addressString={addressString} user={user} path={path} />}
                            <Col sm={24} xs={24} md={24}>
                                <OrderSummary
                                    checkoutInfo={checkoutInfo}
                                    path={path}
                                    shippingFee={shippingFee}
                                    discountCode={discountCode}
                                    newSubTotal={newSubTotal}
                                    loading={loading}
                                    setDiscountCode={setDiscountCode}
                                    handleCloseDiscount={handleCloseDiscount}
                                    handleDiscount={handleDiscount}
                                    onSubmitOrder={onSubmitOrder}
                                    addressForm={addressForm}
                                />
                            </Col>
                        </Col>
                    </>
                ) : (
                    <EmptyCart />
                )}
            </Row>
        </div>
    );
};

export default Payment;
