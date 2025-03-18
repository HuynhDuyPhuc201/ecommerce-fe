import { Button, Col, InputNumber, message, Modal, Row, Table } from 'antd';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { cart_empty } from '~/constants/images';
import { formatNumber } from '~/core';
import { getUser } from '~/core/token';
import { cartService } from '~/services/cart.service';
import './CartPage.css';
import AddressModal from '~/components/Address/AddressModal';
import useGetUserDetail from '~/hooks/useGetUserDetail';
import useGetCart from '~/hooks/useGetCart';
import { useNavigate } from 'react-router-dom';
import { path } from '~/config/path';
import useOrderStore from '~/store/useOrderStore';

const CartPage = () => {
    const [idCheckbox, setIdCheckbox] = useState([]);
    const [modalConfig, setModalConfig] = useState(false);
    const user = getUser();
    const { data: dataUser, refetch: refetchUser } = useGetUserDetail();
    const { refetch: refetchCart, data: dataCart } = useGetCart();
    const { setCheckoutInfo } = useOrderStore();
    const navigate = useNavigate();

    const address = useMemo(() => {
        return dataUser?.user?.address.find((item) => item?.defaultAddress) || dataUser?.user.address[0];
    }, [dataUser]);

    const [chooseAddress, setChooseAddress] = useState(address);

    const addressString = useMemo(() => {
        return Object?.entries(chooseAddress || '')
            .filter(([key]) => key !== '_id' && key !== 'defaultAddress')
            .map(([_, value]) => value)
            .join(', ');
    }, [chooseAddress]);

    useEffect(() => {
        setChooseAddress(address);
    }, [address]);

    const selectedTotal = useMemo(() => {
        return idCheckbox.reduce((acc, id) => {
            const checkItemProduct = dataCart?.listProduct.find((item) => item?._id === id);
            return checkItemProduct ? acc + checkItemProduct.price * checkItemProduct.quantity : acc;
        }, 0);
    }, [idCheckbox, dataCart]);

    const subTotal = useMemo(() => {
        return idCheckbox?.length === dataCart?.listProduct?.length ? dataCart?.subTotal : selectedTotal;
    }, [idCheckbox, dataCart, selectedTotal]);

    const handleCancel = useCallback(() => {
        setModalConfig(false);
    }, []);

    const handleOnClick = useCallback(() => {
        setModalConfig(true);
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
            const response = await cartService.removeCart(query);
            if (response) {
                message.success('Xóa sản phẩm thành công');
                setIdCheckbox([]);
                refetchCart();
            }
        } catch (error) {
            message.error('Xóa sản phẩm thất bại');
        }
    }, [query, refetchCart]);

    const handleQuantityChange = useCallback(
        async (value, record) => {
            try {
                if (value < 1) return;
                if (value > record.countInstock) {
                    return message.error('Số lượng sản phẩm không đủ', 2);
                }

                const payload = {
                    productId: record.productId,
                    quantity: value,
                };
                const response = await cartService.updateCart(payload);
                if (response) {
                    message.success('Cập nhật giỏ hàng thành công!');
                    refetchCart();
                }
            } catch (error) {
                message.error(error.response?.data?.message || 'Cập nhật giỏ hàng thất bại!');
            }
        },
        [refetchCart],
    );

    const hanldeOrder = useCallback(async () => {
        if (addressString === '' || !idCheckbox.length) {
            return message.error('Vui lòng cập nhật địa chỉ hoặc chọn sản phẩm');
        }
        const listProduct = idCheckbox.map((productId) => {
            return dataCart?.listProduct.find((item) => item._id === productId);
        });
        const form = {
            userId: dataCart.userId,
            orderItems: listProduct,
            totalProduct: dataCart.totalProduct,
            subTotal: selectedTotal,
            shippingAddress: chooseAddress,
        };
        setCheckoutInfo(form);
        navigate(path.Payment);
    }, [addressString, idCheckbox, dataCart, user, address, setCheckoutInfo]);

    const renderImage = useCallback((img) => {
        return img ? <img className="h-[100px] w-full object-cover" src={img} alt="" /> : '';
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
                render: (price) => formatNumber(Number(price)),
            },
            {
                title: 'Số lượng',
                dataIndex: 'quantity',
                align: 'top',
                render: (quantity, record) => (
                    <InputNumber min={1} value={quantity} onChange={(value) => handleQuantityChange(value, record)} />
                ),
                width: 70,
            },
            {
                title: 'Thành tiền',
                width: 70,
                render: (_, record) => formatNumber(Number(record.price * record.quantity)),
            },
        ],
        [renderImage, handleQuantityChange],
    );

    return (
        <div className="container pt-16">
            <Row span={(16, 16)} style={{ gap: '10px' }}>
                <Col xs={24} sm={24} md={24}>
                    <h1 className="text-[22px] uppercase pb-6">Giỏ hàng</h1>
                    {dataCart?.listProduct?.length > 0 && (
                        <Button style={{ marginBottom: '10px' }} onClick={handleDelete}>
                            Xóa
                        </Button>
                    )}
                </Col>
                {dataCart?.listProduct?.length > 0 ? (
                    <>
                        <Col sm={24} md={18}>
                            <Table
                                rowClassName={() => 'align-top'}
                                style={{ display: '' }}
                                rowKey="_id"
                                rowSelection={{
                                    selectedRowKeys: idCheckbox,
                                    onChange: (keys) => setIdCheckbox(keys),
                                }}
                                columns={columns}
                                dataSource={dataCart?.listProduct}
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
                                        <span>{formatNumber(subTotal) || 0}đ</span>
                                    </div>

                                    <div className="flex justify-between font-bold mt-4">
                                        <span>Tổng tiền thanh toán</span>
                                        <span>{formatNumber(subTotal) || 0}đ</span>
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
                    <Col xs={24} sm={24} md={24}>
                        <div className="flex flex-col justify-center items-center p-4 bg-white rounded-lg shadow-md">
                            <div className="">
                                <img src={cart_empty} alt="" className="lg:w-[150px] w-[100px]" />
                            </div>
                            <p>Giỏ hàng trống</p>
                        </div>
                    </Col>
                )}
            </Row>

            <AddressModal
                open={modalConfig}
                onClose={handleCancel}
                addresses={dataUser?.user?.address}
                onSelect={handleChooseAddress}
            />
        </div>
    );
};

export default CartPage;
