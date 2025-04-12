import { Col, message, Row } from 'antd';
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
import { useQuery } from '@tanstack/react-query';
import { adminService } from '~/services/admin.service';
import { useDebounce } from '~/hooks/useDebounce';
import { userService } from '~/services/user.service';

const Payment = () => {
    const user = getUser();
    const navigate = useNavigate();
    const { state: checkoutInfo } = useLocation();
    const { data: dataUserDetail } = useGetUserDetail();
    const { setCartLocal, cartLocal } = useLocalStore();
    const { refetch: refetchCart, data: dataCart } = useGetCart();
    const addressLocal = getAddress();
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [discountPriced, setDiscountPriced] = useState(0);

    const [selectedPayment, setSelectedPayment] = useState(null);
    const [shippingMethod, setShippingMethod] = useState('standard');

    const addressForm = useForm({ mode: 'onChange' });

    const chooseAddress = user ? checkoutInfo?.shippingAddress : addressLocal;
    const addressString = useMemo(() => {
        return Object.entries(checkoutInfo?.shippingAddress || chooseAddress || {})
            .filter(([key]) => key !== '_id' && key !== 'defaultAddress')
            .map(([_, value]) => value)
            .join(', ');
    }, [checkoutInfo?.shippingAddress]);

    const [searchDiscount, setSearchDiscount] = useState('');
    const handleSearchDiscount = (e) => {
        const value = e.target.value;
        setSearchDiscount(value);
    };

    const debouncedSearch = useDebounce(searchDiscount, 500);

    const { data: dataDiscount } = useQuery({
        queryKey: ['discount', debouncedSearch],
        queryFn: async () => await adminService.getAllDiscount(`?code=${debouncedSearch}`),
        staleTime: 5 * 60 * 1000,
    });

    // phí ship
    const shippingFee = useMemo(() => {
        return shippingOptions.find((option) => option.value === shippingMethod)?.price || 0;
    }, [shippingMethod]);

    // tổng tiền
    let totalPrice = useMemo(() => {
        return discountPriced
            ? checkoutInfo?.subTotal + shippingFee - discountPriced
            : checkoutInfo?.subTotal + shippingFee + discountPriced;
    }, [checkoutInfo?.subTotal, shippingFee, discountPriced]);

    const handleDiscount = async (id) => {
        const itemDiscount = dataDiscount?.data.find((item) => item._id === id);
        // nếu mà trùng id => tức là nút hủy chọn => move nó
        if (selectedDiscount?._id || 0 === itemDiscount?._id) {
            setIsModalOpen(false);
            setSelectedDiscount(null);
            setDiscountPriced(0);
            return;
        }
        const discountPrice =
            itemDiscount.type === 'percent' ? checkoutInfo?.subTotal * (itemDiscount.value / 100) : itemDiscount.value;
        try {
            const result = await adminService.validateDiscount({
                id: user?._id,
                code: itemDiscount?.code,
                subTotal: checkoutInfo?.subTotal,
            });
            if (result.success) {
                setIsModalOpen(false);
                setSelectedDiscount(itemDiscount);
                setDiscountPriced(discountPrice);
                message.success(result.message);
            }
        } catch (error) {
            message.error(error.response.data?.message || 'Lỗi khi áp mã');
        }
    };

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

        if (selectedPayment !== 'Thanh toán tiền mặt') return message.error('Phương thức thanh toán chưa khả dụng');
        try {
            setLoading(true);
            const listOrderItem = {
                ...checkoutInfo,
                // nếu như shipping không có (tức là khi dùng button mua ngay, nó không add shipping) thì thêm vào
                shippingAddress: shippingAddress,
                deliveryMethod: shippingMethod,
                paymentMethod: selectedPayment,
                subTotal: checkoutInfo?.subTotal,
                shippingFee,
                totalPrice,
                discount: selectedDiscount?.code,
                discountPrice: discountPriced,
                isPaid: true,
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

    const handleShippingMethod = useCallback((e) => {
        setShippingMethod(e.target.value);
    }, []);

    const handleOpen = () => {
        setIsModalOpen(true);
    };

    const handleCancle = () => {
        setIsModalOpen(false);
    };

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
        !dataCart?.listProduct?.length && !cartLocal?.listProduct?.length && !Object.keys(checkoutInfo || {}).length;

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
                            {addressString && <AddressDisplay addressString={addressString} user={user} path={path} />}
                            <Col sm={24} xs={24} md={24}>
                                <OrderSummary
                                    checkoutInfo={checkoutInfo}
                                    path={path}
                                    shippingFee={shippingFee}
                                    totalPrice={totalPrice}
                                    loading={loading}
                                    handleDiscount={handleDiscount}
                                    onSubmitOrder={onSubmitOrder}
                                    addressForm={addressForm}
                                    handleOpen={handleOpen}
                                    handleCancle={handleCancle}
                                    isModalOpen={isModalOpen}
                                    selectedDiscount={selectedDiscount}
                                    discountPriced={discountPriced}
                                    handleSearchDiscount={handleSearchDiscount}
                                    dataDiscount={dataDiscount}
                                    searchDiscount={searchDiscount}
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
