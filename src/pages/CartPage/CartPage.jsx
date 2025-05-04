import { Button, Col, InputNumber, message, Modal, Row, Table } from 'antd';
import React, { useState, useMemo, useCallback } from 'react';
import { cart_empty } from '~/constants/images';
import { formatNumber } from '~/utils/formatNumber';
import { getAddress, getUser, setAddress, setCart } from '~/config/token';
import { cartService } from '~/services/cart.service';
import AddressModal from '~/components/Address/AddressModal';
import useGetUserDetail from '~/hooks/useGetUserDetail';
import useGetCart from '~/hooks/useGetCart';
import { useNavigate } from 'react-router-dom';
import { path } from '~/config/path';
import useOrderStore from '~/store/useOrderStore';
import { useForm } from 'react-hook-form';
import { useLocalStore } from '~/store/useLocalStore';
import UpdateAddressForm from '~/components/Form/UpdateAddressForm';
import './CartPage.css';
import BreadcrumbComponent from '~/components/Breadcrumb';
import EmptyCart from '~/components/cart/EmptyCart';
import HelmetComponent from '~/components/Helmet';

const CartPage = () => {
    const user = getUser();
    const { setCartLocal, cartLocal } = useLocalStore();
    const addressLocal = getAddress();
    const [idCheckbox, setIdCheckbox] = useState([]);
    const [modalConfig, setModalConfig] = useState(false);
    const { data: dataUserDetail } = useGetUserDetail();
    const { refetch: refetchCart, data: dataCart } = useGetCart();
    const { setCheckoutInfo } = useOrderStore();
    const navigate = useNavigate();
    const addressForm = useForm({ mode: 'onChange' });

    const address = useMemo(() => {
        return dataUserDetail?.address?.find((item) => item?.defaultAddress) || dataUserDetail?.address[0] || {};
    }, [dataUserDetail]);

    const [chooseAddress, setChooseAddress] = useState(user ? address : addressLocal);

    const addressString = useMemo(() => {
        return Object?.entries(chooseAddress || '')
            .filter(([key]) => key !== '_id' && key !== 'defaultAddress')
            .map(([_, value]) => value)
            .join(', ');
    }, [chooseAddress]);

    const selectedTotal = useMemo(() => {
        return idCheckbox.reduce((acc, id) => {
            const checkItemProduct = user
                ? dataCart?.listProduct.find((item) => item?._id === id)
                : cartLocal?.listProduct.find((item) => item.productId === id);
            return checkItemProduct ? acc + checkItemProduct.price * checkItemProduct.quantity : acc;
        }, 0);
    }, [idCheckbox, dataCart, cartLocal, user]);

    const subTotal = useMemo(() => {
        if (user) {
            return idCheckbox?.length === dataCart?.listProduct?.length ? dataCart?.subTotal : selectedTotal;
        } else {
            return idCheckbox?.length === cartLocal?.listProduct?.length ? cartLocal?.subTotal : selectedTotal;
        }
    }, [idCheckbox, dataCart, selectedTotal, user, cartLocal]);
    const handleCancel = useCallback(() => {
        setModalConfig(false);
    }, []);

    const handleOnClick = useCallback(() => {
        setModalConfig(true);
    }, []);

    const onSubmitAddress = useCallback((form) => {
        if (form.houseNumber.trim() === '' || form.district.trim() === '' || form.city.trim() === '') {
            return message.warning('Nhập thiếu thông tin');
        }
        setModalConfig(false);
        setChooseAddress(form);
        if (!user) {
            setAddress(form);
            addressForm.reset({
                houseNumber: '',
                district: '',
                city: '',
            });
        }
    }, []);

    const handleChooseAddress = useCallback((item) => {
        setModalConfig(false);
        setChooseAddress(item);
    }, []);

    const query = useMemo(() => {
        return idCheckbox?.map((item) => `id=${item}`).join('&');
    }, [idCheckbox]);

    const handleDelete = useCallback(async () => {
        try {
            if (user) {
                const response = await cartService.removeCart(query);
                if (response) {
                    message.success('Xóa sản phẩm thành công');
                    setIdCheckbox([]);
                    refetchCart();
                }
            } else {
                const listProduct = cartLocal?.listProduct.filter((item) => !idCheckbox.includes(item.productId));
                const subTotal = listProduct?.reduce((acc, item) => acc + item.quantity * item.price, 0) || 0;
                const totalProduct = listProduct?.length || 0;
                if (listProduct) {
                    message.success('Xóa sản phẩm thành công');
                    setCartLocal({ listProduct, totalProduct, subTotal });
                    setCart({ listProduct, totalProduct, subTotal });
                }
            }
        } catch (error) {
            message.error('Xóa sản phẩm thất bại');
        }
    }, [query, refetchCart]);

    const handleQuantityChange = useCallback(
        async (value, record) => {
            try {
                if (value < 1) return;
                if (value > record.countInstock) return message.error('Số lượng sản phẩm không đủ', 2);

                const payload = {
                    productId: record.productId,
                    quantity: value,
                };
                if (user) {
                    await cartService.updateCart(payload);
                    refetchCart();
                } else {
                    const item = cartLocal.listProduct.find((item) => item.productId === record.productId);
                    if (item) {
                        item.quantity = value;
                    }
                    const subTotal = cartLocal?.listProduct?.reduce((acc, item) => acc + item.price * item.quantity, 0);
                    const updatedCart = {
                        ...cartLocal,
                        subTotal,
                    };
                    setCartLocal(updatedCart);
                    setCart(updatedCart);
                }
            } catch (error) {
                message.error(error.response?.data?.message || 'Cập nhật giỏ hàng thất bại!');
            }
        },
        [refetchCart, setCartLocal],
    );

    const hanldeOrder = useCallback(async () => {
        if (addressString === '' || !idCheckbox.length) {
            return message.error('Vui lòng cập nhật địa chỉ hoặc chọn sản phẩm');
        }
        const listProduct = idCheckbox.map((productId) => {
            return user
                ? dataCart?.listProduct.find((item) => item._id === productId)
                : cartLocal?.listProduct.find((item) => item.productId === productId);
        });
        const form = {
            userId: user ? dataCart.userId : '',
            orderItems: listProduct,
            totalProduct: user ? dataCart.totalProduct : cartLocal.totalProduct,
            subTotal: selectedTotal,
            shippingAddress: chooseAddress,
            page: 'cart', // dùng để kiểm tra cho breadcrumb
        };
        navigate(path.Payment, { state: form });
    }, [addressString, idCheckbox, dataCart, user, address, setCheckoutInfo]);

    const renderImage = useCallback((img) => {
        return img ? (
            <img width={100} height={100} className="h-[100px] w-full object-cover" src={img} alt="" />
        ) : (
            ''
        );
    }, []);

    const columns = useMemo(
        () => [
            { title: 'Hình', dataIndex: 'image', align: 'top', width: 100, render: renderImage },
            { title: 'Tên sản phẩm', dataIndex: 'name', align: 'top', width: 150 },
            {
                title: 'Đơn giá',
                dataIndex: 'price',
                ellipsis: true,
                width: 70,
                align: 'top',
                render: (price) => formatNumber(Number(price || 0)),
            },
            {
                title: 'Số lượng',
                dataIndex: 'quantity',
                align: 'top',
                render: (quantity, record) => (
                    <InputNumber
                        min={1}
                        value={
                            user
                                ? quantity
                                : cartLocal?.listProduct.find((item) => item.productId === record.productId)?.quantity
                        }
                        onChange={(value) => handleQuantityChange(value, record)}
                    />
                ),
                width: 70,
            },
            {
                title: 'Thành tiền',
                width: 70,
                render: (_, record) => formatNumber(Number(record.price * record.quantity || 0)),
            },
        ],
        [renderImage, handleQuantityChange],
    );

    const checkProduct = dataCart?.listProduct?.length > 0 || cartLocal?.listProduct?.length > 0;

    return (
        <div className="container pt-16">
            <HelmetComponent title="Giỏ hàng" />
            <BreadcrumbComponent arrayItem={[{ text: 'Giỏ hàng' }]} />
            <Row span={(16, 16)} style={{ gap: '10px' }}>
                <Col xs={24} sm={24} md={24}>
                    <h1 className="text-[22px] uppercase pb-6 mt-5">Giỏ hàng</h1>
                    {checkProduct && (
                        <Button
                            disabled={!idCheckbox?.length > 0}
                            style={{ marginBottom: '10px' }}
                            onClick={handleDelete}
                        >
                            Xóa
                        </Button>
                    )}
                </Col>
                {checkProduct ? (
                    <>
                        <Col sm={24} md={18}>
                            <Table
                                rowClassName={() => 'align-top'}
                                style={{ display: '' }}
                                rowKey={(record) => record._id || record.productId}
                                rowSelection={{
                                    selectedRowKeys: idCheckbox,
                                    onChange: (keys) => {
                                        setIdCheckbox(keys);
                                    },
                                }}
                                columns={columns}
                                dataSource={dataCart?.listProduct || cartLocal?.listProduct}
                                scroll={{ x: 800 }}
                            />
                        </Col>
                        <Col sm={24} xs={24} md={5}>
                            <div className="category bg-[#fff] rounded-[8px] p-4 w-full my-2">
                                <div className="flex justify-between">
                                    <p className=" text-[#333] mb-5">Giao tới</p>
                                    <Button className=" text-[#5351c7]  mb-5" onClick={handleOnClick}>
                                        Thay đổi
                                    </Button>
                                </div>
                                <span>{addressString || 'Chưa cập nhật địa chỉ'}</span>
                            </div>
                            <Col sm={24} xs={24} md={24}>
                                <div className="p-4 bg-white rounded-lg shadow-md ">
                                    <div className="flex justify-between text-gray-700">
                                        <span>Tạm tính</span>
                                        <span>{formatNumber(subTotal || 0)}₫</span>
                                    </div>

                                    <div className="flex justify-between font-bold mt-4">
                                        <span>
                                            Tổng tiền <br />
                                            thanh toán
                                        </span>
                                        <span>{formatNumber(subTotal || 0)}₫</span>
                                    </div>
                                    <p className="text-sm text-gray-500">(Đã bao gồm VAT nếu có)</p>
                                    <button
                                        className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600"
                                        onClick={hanldeOrder}
                                    >
                                        Mua Hàng ({idCheckbox?.length || 0})
                                    </button>
                                </div>
                            </Col>
                        </Col>
                    </>
                ) : (
                    <EmptyCart />
                )}
            </Row>

            {user ? (
                <AddressModal
                    open={modalConfig}
                    onClose={handleCancel}
                    addresses={dataUserDetail?.address}
                    onSelect={handleChooseAddress}
                />
            ) : (
                <Modal title="Cập nhật địa chỉ" open={modalConfig} onCancel={handleCancel} footer={null}>
                    <UpdateAddressForm onSubmit={onSubmitAddress} useForm={addressForm} />
                </Modal>
            )}
        </div>
    );
};

export default CartPage;
