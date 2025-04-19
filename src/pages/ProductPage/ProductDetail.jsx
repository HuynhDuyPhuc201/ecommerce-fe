import { Button, Col, InputNumber, message, Row, Typography } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Slider from 'react-slick';
import { ShoppingCartOutlined } from '@ant-design/icons';
import ProductCard from '~/components/ProductCard';
import { productService } from '~/services/product.service';
import { useQuery } from '@tanstack/react-query';
import { getUser, removeAddress, setCart } from '~/core/token';
import { formatNumber } from '~/core';
import { cartService } from '~/services/cart.service';
import useGetUserDetail from '~/hooks/useGetUserDetail';
import useGetProductDetail from '~/hooks/useGetProductDetail';
import useGetCart from '~/hooks/useGetCart';
import { useLocalStore } from '~/store/useLocalStore';
import { path } from '~/config/path';
import BreadcrumbComponent from '~/components/Breadcrumb';
import { checkImg } from '~/utils/checkImg';
import HelmetComponent from '~/components/Helmet';
import { ReviewCard } from '~/components/ReviewCard';
import './style.css';
import { shippingOptions } from '~/constants/dummyData';

const { Title, Text } = Typography;

const ProductDetail = () => {
    const user = getUser();
    const navigate = useNavigate();

    const { idCate, id } = useParams();
    const { cartLocal, setCartLocal } = useLocalStore();
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsloading] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const { data: dataUser } = useGetUserDetail();
    const { data: _data } = useGetProductDetail(id);

    const dataDetail = _data?.product || {};
    const allImage = dataDetail?.image?.map((item) => checkImg(item)) || [];
    const discount = ((dataDetail?.price_old - dataDetail?.price) / dataDetail?.price_old) * 100 || 0;

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth((prev) => (prev !== window.innerWidth ? window.innerWidth : prev));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const settings = {
        customPaging: function (i) {
            return (
                <Link className="w-[50px] h-[50px]" to="#">
                    <img width={50} height={50} src={allImage[i]} className="w-[50px] h-[50px] object-cover" />
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

    const { data: allReviews = [], refetch: refetchReview } = useQuery({
        queryKey: ['reviews'],
        queryFn: async () => await productService.getReviews(),
    });

    const findReview = allReviews?.find((item) => item.productId === dataDetail?._id);

    const { data: dataProduct } = useQuery({
        queryKey: ['products', idCate],
        queryFn: async () => await productService.getAll(`?limit=8&page=1&categories=${idCate}`),
        // enabled: Boolean(idCate), // Chỉ gọi khi idCate tồn tại
        refetchOnWindowFocus: false, // Tắt refetch khi tab focus lại
        refetchOnReconnect: false, // Tắt refetch khi mạng có lại
    });

    const { data: dataCart, refetch: refetchCart } = useGetCart();

    const handleQuantityChange = useCallback(
        (value) => {
            if (value > dataDetail?.countInstock) {
                message.error('Số lượng sản phẩm không đủ');
                return;
            }
            setQuantity(value || 1);
        },
        [dataDetail?.countInstock, quantity],
    );

    const existingItem = user
        ? dataCart?.listProduct?.find((item) => item.productId === dataDetail._id)
        : cartLocal?.listProduct?.find((item) => item.productId === dataDetail._id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newTotalQuantity = currentQuantity + quantity;

    const handleAddCart = useCallback(async () => {
        if (newTotalQuantity > dataDetail?.countInstock) {
            return message.error('Số lượng sản phẩm không đủ');
        }

        const { _id, name, price, countInstock } = dataDetail;
        const imageUrl = dataDetail.image?.[0] ?? 'default-image-url.jpg';
        const cartItem = { productId: _id, name, price, quantity, image: imageUrl, countInstock };

        if (user) {
            try {
                setIsloading(true);
                const result = await cartService.addCart(cartItem);
                if (result) {
                    refetchCart();
                    message.success('Thêm vào giỏ hàng thành công');
                }
            } catch (error) {
                message.error(error.message || 'Có lỗi xảy ra');
            } finally {
                setIsloading(false);
                handleQuantityChange(1);
            }
        } else {
            updateLocalCart(cartItem);
        }
    }, [user, newTotalQuantity, dataDetail, refetchCart]);

    // update cart ở local dành cho user không login
    const updateLocalCart = (cartItem) => {
        const existingItem = cartLocal.listProduct.find((item) => item.productId === cartItem.productId);
        if (existingItem) {
            existingItem.quantity += cartItem.quantity;
        } else {
            cartLocal.listProduct.push(cartItem);
        }

        cartLocal.totalProduct = cartLocal.listProduct.length;
        cartLocal.subTotal += cartItem.quantity * cartItem.price;
        setCart(cartLocal);
        setCartLocal(cartLocal);
        handleQuantityChange(1);
        message.success('Thêm vào giỏ hàng thành công');
    };

    let address = dataUser?.address?.find((item) => item?.defaultAddress) || dataUser?.address[0] || {};

    // button mua ngay
    const handleBuyNow = useCallback(async () => {
        if (!user) removeAddress();
        if (quantity > dataDetail?.countInstock) {
            return message.error('Số lượng sản phẩm không đủ');
        }
        const { _id, name, price } = dataDetail;
        const imageUrl = dataDetail.image?.[0] ?? 'default-image-url.jpg';
        const cartItem = { productId: _id, name, price, quantity, image: imageUrl };
        const form = {
            orderItems: [cartItem],
            shippingAddress: address,
            subTotal: cartItem.price * cartItem.quantity,
            totalProduct: 1,
            userId: user ? user?._id : null,
            idCate,
        };
        navigate(path.Payment, { state: form });
    }, [dataDetail, newTotalQuantity]);

    const productRecommand = dataProduct?.data.filter((item) => item._id !== id);

    return (
        <div className="container pt-10  min-h-screen">
            <HelmetComponent title="Chi tiết sản phẩm" />
            <BreadcrumbComponent arrayItem={[{ text: 'Chi tiết sản phẩm' }]} />
            <Row gutter={[10, 10]} style={{ alignItems: 'flex-start' }}>
                <Col md={8} className="md:sticky top-0 pt-5 relative">
                    <div className={`slider-container bg-[#fff] rounded-[8px] p-4 relative`}>
                        <Slider {...settings}>
                            {dataDetail?.image?.map((item, i) => (
                                <div key={i}>
                                    <img
                                        width={200}
                                        height={350}
                                        src={checkImg(item)}
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
                        {discount > 0 && (
                            <div className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-1 text-lg font-bold text-white">
                                -{discount.toFixed(0) || 0}%
                            </div>
                        )}
                    </div>
                </Col>

                <Col md={10} className="pt-5">
                    <div className="des bg-[#fff] rounded-[8px] p-6 mb-4">
                        <div className="text-[20px] font-bold">
                            <span className="font-bold">{dataDetail?.name || ''}</span>
                        </div>
                        <div className="pt-10 flex items-center">
                            {dataDetail?.rating > 0 ? (
                                <>
                                    <span className="pr-2">{dataDetail?.rating || 0}</span>
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className={`h-6 w-6 text-[#ffff19] ${
                                                i < Math.floor(dataDetail.rating) ? 'opacity-100' : 'opacity-30'
                                            }`}
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ))}
                                </>
                            ) : (
                                <span className="text-[15px] text-[#000]">Chưa có đánh giá &nbsp;&nbsp;&nbsp;</span>
                            )}

                            <span className="text-[13px] text-[#888]">| đã bán {dataDetail?.sold || 0}</span>
                            <span className="text-[13px] text-[#888] pl-5">kho: {dataDetail?.countInstock}</span>
                        </div>
                        <div className="flex items-center  pt-3">
                            <p className="text-[20px] text-[#fc3434] font-bold mt-3 ">
                                {formatNumber(dataDetail?.price || 0)}₫
                            </p>
                            <div className="sale mt-3">
                                <span className="price-sale line-through pl-5 text-[gray] text-[14px]">
                                    {formatNumber(dataDetail?.price_old || 0)}₫
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
                                                controls={true}
                                            />
                                        </Row>
                                        <div className="flex mt-5 gap-5">
                                            <Button
                                                onClick={() => handleQuantityChange(quantity - 1)}
                                                disabled={quantity <= 1}
                                            >
                                                -
                                            </Button>
                                            <Button
                                                onClick={() => handleQuantityChange(quantity + 1)}
                                                disabled={quantity >= dataDetail?.countInstock}
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </Col>

                                    <Col span={24}>
                                        <Title level={5} style={{ margin: 0 }}>
                                            Tạm tính
                                        </Title>
                                        <Title level={4} style={{ color: '#fa541c', marginTop: '5px' }}>
                                            {formatNumber(quantity * dataDetail?.price || 0)}₫
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
                                            onClick={handleBuyNow}
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
                        </div>
                        <div className="border-solid border-b-2 border-[#f0f0f0] pb-4 mb-4">
                            <div className="flex-col">
                                {shippingOptions?.map((item, i) => (
                                    <>
                                        <span className="">{item.label}</span> - <span>{item.time}</span> <br />
                                    </>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="des bg-[#fff] rounded-[8px] p-6 mb-4">
                        <div className="border-solid border-b-2 border-[#f0f0f0] pb-4 mb-4">
                            <span className="font-bold">Thông tin chi tiết</span>
                        </div>
                        <div className="border-solid border-[#f0f0f0] ">
                            <p>{dataDetail?.descrireviewsption || 'Không có'}</p>
                        </div>
                    </div>
                    <div className="bg-[#fff] rounded-[8px] p-6 mb-4">
                        <div className="border-solid border-b-2 border-[#f0f0f0] pb-4 mb-4">
                            <span className="font-bold">Đánh giá sản phẩm</span>
                        </div>
                        <p>{findReview?.reviews?.length === 0 && 'Không có'}</p>
                        {findReview?.reviews.map((itemReview, index) => (
                            <div key={itemReview._id}>
                                <ReviewCard itemReview={itemReview} />
                                {/* Nếu không phải phần tử cuối cùng thì render border */}
                                {index < findReview.reviews.length - 1 && (
                                    <div className="border-solid border-b-2 border-[#f0f0f0]"></div>
                                )}
                            </div>
                        ))}
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
                                        {formatNumber(quantity * dataDetail?.price || 0)}₫
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
                                        onClick={handleBuyNow}
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
        </div>
    );
};

export default ProductDetail;
