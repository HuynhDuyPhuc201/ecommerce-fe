import { Button, Col, InputNumber, message, Modal, Row, Typography } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Slider from 'react-slick';
import { ShoppingCartOutlined, StarFilled } from '@ant-design/icons';
import ProductCard from '~/components/ProductCard';
import { productService } from '~/services/product.service';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '~/store/useAppStore';
import { getUser } from '~/core/token';
import { formatNumber } from '~/core';
import { cartService } from '~/services/cart.service';
import AddressModal from '~/components/Address/AddressModal';
import useGetUserDetail from '~/hooks/useGetUserDetail';
import useGetProductDetail from '~/hooks/useGetProductDetail';
import useGetCart from '~/hooks/useGetCart';
import './style.css';

const { Title, Text } = Typography;

const ProductDetail = () => {
    const { idCate, id } = useParams();
    const { toggleModal } = useAppStore();
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsloading] = useState(false);
    const [modalConfig, setModalConfig] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const user = getUser();
    const { data: dataUser } = useGetUserDetail();
    const { data: _data } = useGetProductDetail(id);

    const dataDetail = _data?.product || {};
    const allImage = dataDetail?.image?.map((item) => item.thumbUrl) || [];
    const discount = ((dataDetail?.price_old - dataDetail?.price) / dataDetail?.price_old) * 100 || 0;

    useEffect(() => {
        let timeout;
        const handleResize = () => {
            if (timeout) cancelAnimationFrame(timeout);
            timeout = requestAnimationFrame(() => setWindowWidth(window.innerWidth));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const settings = {
        customPaging: function (i) {
            return (
                <Link className="w-[50px] h-[50px]" to="#">
                    <img src={allImage[i]} className="w-[50px] h-[50px] object-cover" />
                </Link>
            );
        },
        dots: true,
        dotsClass: 'slick-thumb',
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false, // Ẩn nút prev/next
    };

    const { data: dataProduct } = useQuery({
        queryKey: ['products', idCate],
        queryFn: async () => productService.getAll(`?limit=8&page=1&categories=${idCate}`),
        enabled: Boolean(idCate), // Chỉ gọi khi idCate tồn tại
    });

    const { data: dataCart, refetch } = useGetCart();

    const handleQuantityChange = useCallback(
        (value) => {
            if (value > dataDetail?.countInstock) {
                message.error('Số lượng sản phẩm không đủ');
                return;
            }
            setQuantity(value || 1);
        },
        [dataDetail?.countInstock],
    );

    const existingItem = dataCart?.listProduct?.find((item) => item.productId === dataDetail._id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newTotalQuantity = currentQuantity + quantity;
    const handleAddCart = useCallback(async () => {
        if (!user) return toggleModal(true);
        if (newTotalQuantity > dataDetail?.countInstock) {
            return message.error('Số lượng sản phẩm không đủ');
        }
        setIsloading(true);
        try {
            const { _id, name, price, countInstock } = dataDetail;
            const imageUrl = dataDetail.image?.[0]?.thumbUrl ?? 'default-image-url.jpg'; // +1 ở đây là do lấy itemCart cần phải useEfft để nó set lại, kh gọi nó sẽ bị chậm 1 bước nên +1 cho lẹ
            const result = await cartService.addCart({
                productId: _id,
                name,
                price,
                quantity: quantity,
                image: imageUrl,
                countInstock,
            });

            if (result) {
                message.success('Thêm vào giỏ hàng thành công');
                refetch();
                setIsloading(false);
            }
        } catch (error) {
            setIsloading(true);
            message.error(error);
        }
    }, [user, newTotalQuantity, dataDetail, refetch]);

    let address = dataUser?.user?.address.find((item) => item.defaultAddress === true);

    const [chooseAddress, setChooseAddress] = useState(address);

    let addressString = Object?.entries(chooseAddress || '')
        ?.filter(([key]) => key !== '_id' && key !== 'defaultAddress')
        ?.map(([_, value]) => value)
        ?.join(', ');

    const updateAddress = () => {
        if (!user) {
            return toggleModal(true);
        }
        setModalConfig(true);
    };

    const productRecommand = dataProduct?.data.filter((item) => item._id !== id);

    const handleCancel = () => {
        setModalConfig(false);
    };

    const handleChooseAddress = (item) => {
        setModalConfig(false);
        setChooseAddress(item);
    };

    return (
        <div className="container pt-10">
            <Row gutter={[10, 10]} style={{ alignItems: 'flex-start' }}>
                <Col md={8} className="md:sticky top-0 pt-5">
                    <div className={`slider-container bg-[#fff] rounded-[8px] p-4 relative`}>
                        <Slider {...settings}>
                            {dataDetail?.image?.map((item, i) => (
                                <div key={i}>
                                    <img
                                        src={item.thumbUrl}
                                        className={`h-[350px] w-full object-cover ${
                                            dataDetail.countInstock === 0 && 'opacity-50'
                                        }`}
                                    />
                                </div>
                            ))}
                        </Slider>
                        {dataDetail?.countInstock === 0 && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70px] h-[70px] rounded-full bg-[#000000] ">
                                <span className="text-white h-full text-[12px] text-center flex items-center justify-center">
                                    Đã bán hết
                                </span>
                            </div>
                        )}
                    </div>
                </Col>

                <Col md={10} className="pt-5">
                    <div className="des bg-[#fff] rounded-[8px] p-6 mb-4">
                        <div className="">
                            <span className="font-bold">{dataDetail?.name || ''}</span>
                        </div>
                        <div className="pt-4">
                            <span className="pr-2">{dataDetail?.rating || 0}</span>
                            <StarFilled style={{ color: '#ffff19' }} /> |{' '}
                            <span className="text-[13px] text-[#888]">đã bán 125</span>
                            <span className="text-[13px] text-[#888] pl-5">kho: {dataDetail?.countInstock}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="text-[20px] text-[#fc3434] font-bold mt-3 ">
                                {formatNumber(dataDetail?.price || 0)}
                            </p>
                            <div className="sale mt-2">
                                <span className="p-1 bg-slate-200 rounded-[10px] text-[10px]">
                                    -{discount.toFixed() || 0}%
                                </span>
                                <span className="price-sale line-through pl-5 text-[gray] text-[10px]">
                                    {formatNumber(dataDetail?.price_old) || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                    {windowWidth < 1000 && (
                        <Col sm={24} className="lg:sticky top-0 pt-5">
                            <div className="payment bg-[#fff] rounded-[8px] p-6 mb-4">
                                <Row>
                                    <Col span={24}>
                                        <Text strong>Số Lượng</Text>
                                        <Row style={{ marginTop: '8px' }} align="middle">
                                            <InputNumber
                                                min={1}
                                                max={dataDetail?.countInstock || 100}
                                                value={quantity}
                                                onChange={handleQuantityChange}
                                                style={{ width: '100px' }}
                                            />
                                        </Row>
                                    </Col>

                                    <Col span={24}>
                                        <Title level={5} style={{ margin: 0 }}>
                                            Tạm tính
                                        </Title>
                                        <Title level={4} style={{ color: '#fa541c', marginTop: '5px' }}>
                                            {formatNumber(quantity * dataDetail?.price) || 0}
                                        </Title>
                                    </Col>

                                    <Col span={24}>
                                        <Button
                                            type="primary"
                                            block
                                            style={{
                                                backgroundColor: '#ff4d4f',
                                                borderColor: '#ff4d4f',
                                                marginBottom: '8px',
                                            }}
                                            disabled={user?.isAdmin || dataDetail?.countInstock === 0}
                                            onClick={handleAddCart}
                                        >
                                            Mua ngay
                                        </Button>
                                    </Col>

                                    <Col span={24}>
                                        <Button
                                            onClick={handleAddCart}
                                            type="default"
                                            icon={<ShoppingCartOutlined />}
                                            block
                                            disabled={user?.isAdmin || dataDetail?.countInstock === 0}
                                        >
                                            Thêm vào giỏ
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    )}
                    <div className="des bg-[#fff] rounded-[8px] p-6 mb-4">
                        <div className="border-solid border-b-2 border-[#f0f0f0] pb-4 mb-4">
                            <span className="font-bold">Thông tin vận chuyển</span>
                            <div className="flex justify-between items-center pt-5">
                                <span>{addressString || 'Chưa cập nhật địa chỉ'}</span>
                                <Button className="text-[#6274ff]" onClick={updateAddress}>
                                    Đổi
                                </Button>
                            </div>
                        </div>
                        <div className="border-solid border-b-2 border-[#f0f0f0] pb-4 mb-4">
                            <span className="">Giao siêu tốc 2h</span>
                            <div className="flex justify-between items-center "></div>
                            <span>Trước 18h hôm nay: 25.000₫</span>
                        </div>
                    </div>
                    <div className="des bg-[#fff] rounded-[8px] p-6 mb-4">
                        <div className="border-solid border-b-2 border-[#f0f0f0] pb-4 mb-4">
                            <span className="font-bold">Sản phẩm tương tự</span>
                        </div>
                        {!productRecommand?.length && <span>Không có</span>}
                        <Row gutter={[10, 10]}>
                            {productRecommand?.map((item, i) => (
                                <Col md={12} sm={12} key={i}>
                                    <ProductCard item={item} />
                                </Col>
                            ))}
                        </Row>
                    </div>
                    <div className="bg-[#fff] rounded-[8px] p-6 mb-4">
                        <span className="font-bold">Thông tin chi tiết</span>
                        <p>{dataDetail?.description}</p>
                    </div>
                </Col>
                {windowWidth > 1000 && (
                    <Col md={6} className="md:sticky top-0 pt-5">
                        <div className="payment bg-[#fff] rounded-[8px] p-6 mb-4">
                            <Row>
                                <Col span={24}>
                                    <Text strong>Số Lượng</Text>
                                    <Row style={{ marginTop: '8px' }} align="middle">
                                        <InputNumber
                                            min={1}
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                            style={{ width: '100px' }}
                                        />
                                    </Row>
                                </Col>

                                <Col span={24}>
                                    <Title level={5} style={{ margin: 0 }}>
                                        Tạm tính
                                    </Title>
                                    <Title level={4} style={{ color: '#fa541c', marginTop: '5px' }}>
                                        {formatNumber(quantity * dataDetail?.price) || 0}
                                    </Title>
                                </Col>

                                <Col span={24}>
                                    <Button
                                        type="primary"
                                        block
                                        style={{
                                            backgroundColor: '#ff4d4f',
                                            borderColor: '#ff4d4f',
                                            marginBottom: '8px',
                                        }}
                                        disabled={user?.isAdmin || dataDetail?.countInstock === 0}
                                        onClick={handleAddCart}
                                    >
                                        Mua ngay
                                    </Button>
                                </Col>

                                <Col span={24}>
                                    <Button
                                        onClick={handleAddCart}
                                        type="default"
                                        icon={<ShoppingCartOutlined />}
                                        block
                                        disabled={user?.isAdmin || isLoading || dataDetail?.countInstock === 0}
                                    >
                                        Thêm vào giỏ
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                )}
            </Row>

            {/* modal chọn địa chỉ */}
            <AddressModal
                open={modalConfig}
                onClose={handleCancel}
                addresses={dataUser?.user?.address}
                onSelect={handleChooseAddress}
            />
        </div>
    );
};

export default ProductDetail;
