import { Button, Card, Carousel } from 'antd';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StarFilled, EyeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { generatePath, Link, useNavigate } from 'react-router-dom';
import { path } from '~/config/path';
import { formatNumber } from '~/core';
import { Eye, ShoppingCart } from 'lucide-react';
import { getUser, removeAddress } from '~/core/token';
import useGetUserDetail from '~/hooks/useGetUserDetail';
import ProductDetailModal from './ProductDetailModal';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { checkImg } from '~/utils/checkImg';

const ProductCard = ({ item }) => {
    const navigate = useNavigate();
    const { data: dataUser } = useGetUserDetail();
    const user = getUser();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const discount = useMemo(
        () => (item?.price_old ? ((item.price_old - item.price) / item.price_old) * 100 : 0),
        [item.price, item.price_old],
    );

    const handleScrollTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleViewClick = (e) => {
        e.preventDefault();
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const pathURL = useMemo(
        () => generatePath(path.ProductDetail, { idCate: item?.categories, id: item?._id }),
        [item.categories, item._id],
    );

    let address = dataUser?.user?.address.find((item) => item?.defaultAddress) || dataUser?.user.address[0];
    const handleBuyNow = useCallback(async () => {
        if (!user) removeAddress();
        const form = {
            orderItems: [
                {
                    productId: item._id,
                    name: item.name,
                    price: item.price,
                    image: item.image?.[0],
                    quantity: 1,
                },
            ],
            shippingAddress: address,
            subTotal: item.price * 1,
            totalProduct: 1,
            userId: user ? user?._id : null,
            idCate: item.categories,
        };
        navigate(path.Payment, { state: form });
    }, []);

    return (
        <div className="group relative shadow-md cursor-pointer">
            <div className="border overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="group relative h-[200px] overflow-hidden">
                    <img
                        width={200} // hoặc bất kỳ số nào gần đúng
                        height={200}
                        src={checkImg(item.image[0])}
                        loading="lazy"
                        className={`h-full w-full object-cover transition-all duration-500 group-hover:opacity-0
                            ${!item.countInstock ? 'opacity-50' : 'opacity-100'}
                        `}
                    />

                    {/* Second image on hover effect */}
                    {item.image?.length > 1 && (
                        <img
                            width={200} // hoặc bất kỳ số nào gần đúng
                            height={200}
                            src={checkImg(item.image[1])}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-500"
                        />
                    )}

                    {/* Out of stock overlay */}
                    {!item.countInstock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <div className="flex items-center justify-center w-[70px] h-[70px] rounded-full bg-[#000]">
                                <span className=" text-[12px] text-white">Đã bán hết</span>
                            </div>
                        </div>
                    )}

                    {/* Hover action buttons */}
                    <div className="absolute bottom-2 left-0 right-0 mx-2 flex items-center justify-center gap-2 transition-all duration-300 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                        <Button
                            size="lg"
                            variant="secondary"
                            className="rounded-full px-3 text-[#000] bg-[#fff] shadow-lg text-[13px]"
                            onClick={handleViewClick}
                        >
                            <Eye className="h-6 w-6" />
                            <p>Xem</p>
                        </Button>

                        <Button
                            size="sm"
                            variant="default"
                            className={`rounded-full px-4 !bg-[#fff] !text-[#000] shadow-lg text-[13px] ${
                                !item.countInstock ? 'opacity-50' : 'opacity-100'
                            }`}
                            disabled={!item.countInstock}
                            onClick={handleBuyNow}
                        >
                            <ShoppingCart className="h-6 w-6" />
                            Mua ngay
                        </Button>
                    </div>

                    {/* Discount tag */}
                    {discount > 0 && (
                        <div className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-1 text-lg font-bold text-white">
                            -{discount.toFixed(0)}%
                        </div>
                    )}
                </div>

                <div className="p-4">
                    {/* Product name */}
                    <Link to={pathURL} onClick={handleScrollTop}>
                        <h3 className="mb-1 line-clamp-2 text-[14px] h-[40px] font-medium" title={item.name}>
                            {item.name}
                        </h3>

                        {/* Rating */}
                        <div className="mb-2 flex items-center mt-5">
                            <span className="mr-1 text-[15px]">{item.rating.toFixed(1)}</span>
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className={`h-6 w-6 ${
                                            i < Math.floor(item.rating) ? 'opacity-100' : 'opacity-30'
                                        }`}
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                ))}
                            </div>
                        </div>

                        {/* Price info */}
                        <div className="flex flex-col">
                            <p className="text-[16px] font-bold text-red-600">{formatNumber(item?.price) || 0}</p>
                            {item.price_old && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[13px] text-gray-500 line-through">
                                        {formatNumber(item.price_old)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Link>
                </div>
            </div>
            <ProductDetailModal open={isModalVisible} product={item} onClose={handleCloseModal} />
        </div>
    );
};

export default ProductCard;
