import React, { useCallback, useMemo, useState } from 'react';
import { Modal, Carousel, Rate, Tag, Descriptions, Button, Divider, Typography, message } from 'antd';
import { ShoppingCartOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { formatNumber } from '~/core';
import { useQuery } from '@tanstack/react-query';
import { productService } from '~/services/product.service';
import { cartService } from '~/services/cart.service';
import useGetCart from '~/hooks/useGetCart';
import { getUser, setCart } from '~/core/token';
import { useLocalStore } from '~/store/useLocalStore';
import { checkImg } from '~/utils/checkImg';

const { Title, Text } = Typography;

const ProductDetailModal = ({ open, product, onClose }) => {
    const [quantity, setQuantity] = useState(1);
    const { cartLocal, setCartLocal } = useLocalStore();
    const user = getUser();

    const discount = product?.price_old ? ((product.price_old - product.price) / product.price_old) * 100 : 0;

    const { data: dataCategory } = useQuery({
        queryKey: ['category'],
        queryFn: async () => await productService.getCategory(),
        staleTime: 5 * 60 * 1000, // Cache trong 5 phút
        refetchOnWindowFocus: false, // Tắt refetch khi tab focus lại
        refetchOnReconnect: false, // Tắt refetch khi mạng có lại
    });

    const categories = useMemo(() => {
        dataCategory?.data?.forEach((item) => {
            if (item.id === product?.categories) {
                product.categories = item.name;
            }
        });
    });

    const { data: dataCart, refetch: refetchCart } = useGetCart();
    const handleQuantityChange = useCallback(
        (value) => {
            if (value > product?.countInstock) {
                message.error('Số lượng sản phẩm không đủ');
                return;
            }
            setQuantity(value || 1);
        },
        [product?.countInstock, quantity],
    );

    const existingItem = user
        ? dataCart?.listProduct?.find((item) => item.productId === product._id)
        : cartLocal?.listProduct?.find((item) => item.productId === product._id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newTotalQuantity = currentQuantity + quantity;

    const handleAddCart = useCallback(async () => {
        if (newTotalQuantity > product?.countInstock) {
            return message.error('Số lượng sản phẩm không đủ');
        }

        const imageUrl = product.image?.[0] ?? 'default-image-url.jpg';
        const cartItem = {
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity,
            image: imageUrl,
            countInstock: product.countInstock,
        };
        if (user) {
            try {
                const result = await cartService.addCart(cartItem);
                if (result) {
                    refetchCart();
                    message.success('Thêm vào giỏ hàng thành công');
                }
            } catch (error) {
                message.error(error.message || 'Có lỗi xảy ra');
            } finally {
                handleQuantityChange(1);
            }
        } else {
            updateLocalCart(cartItem);
        }
    }, [user, newTotalQuantity, product, refetchCart]);
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
    return (
        <Modal open={open} onCancel={onClose} footer={null} width={1000} centered className="product-detail-modal">
            {product && (
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/2">
                        <div className="slider-container bg-[#fff] rounded-[8px] p-4 relative">
                            <Carousel autoplay>
                                {product?.image?.map((url, i) => (
                                    <div key={i}>
                                        <img
                                            width={1000} // hoặc bất kỳ số nào gần đúng
                                            height={350}
                                            src={checkImg(url)}
                                            className={`h-[350px] w-full object-cover ${
                                                product.countInstock === 0 ? 'opacity-50' : ''
                                            }`}
                                            alt=""
                                        />
                                    </div>
                                ))}
                            </Carousel>
                        </div>
                    </div>

                    {/* Product Info Section */}
                    <div className="w-full md:w-1/2 mr-2">
                        <Title level={3}>{product.name}</Title>

                        <div className="flex items-center gap-3 mt-2 mb-4">
                            <div className="flex items-center">
                                <Rate
                                    allowHalf
                                    defaultValue={product.rating.toFixed(1) || 0}
                                    disabled
                                    style={{ fontSize: 14 }}
                                />
                                <Text className="ml-2">{product.rating.toFixed(1) || 0}</Text>
                            </div>
                            <Divider type="vertical" />
                            <Text type="secondary">Đã bán: {product.sold || 0}</Text>
                            <Text type="secondary">Kho: {product.countInstock || 0}</Text>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="flex items-end gap-3">
                                <Title level={2} style={{ color: '#fc3434', margin: 0 }}>
                                    {formatNumber(product.price || 0)}₫
                                </Title>
                                {discount > 0 && (
                                    <>
                                        <Text delete type="secondary" className="text-lg">
                                            {formatNumber(product.price_old || 0)}₫
                                        </Text>
                                        <Tag color="red" className="ml-2">
                                            -{discount.toFixed()}%
                                        </Tag>
                                    </>
                                )}
                            </div>
                            {product.countInstock > 0 ? (
                                <div className="mt-2 flex items-center">
                                    <CheckCircleOutlined style={{ color: 'green' }} />
                                    <Text className="ml-2" style={{ color: 'green' }}>
                                        Còn hàng
                                    </Text>
                                </div>
                            ) : (
                                <div className="mt-2">
                                    <Tag color="default">Hết hàng</Tag>
                                </div>
                            )}
                        </div>

                        <Descriptions column={1} className="mb-4">
                            <Descriptions.Item label="Danh mục">{categories || 'Điện thoại'}</Descriptions.Item>
                            <Descriptions.Item label="Xuất xứ">{product.origin || 'Chính hãng'}</Descriptions.Item>
                            <Descriptions.Item label="Bảo hành">{product.warranty || '12 tháng'}</Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <div className="quantity-selector mb-4">
                            <Text strong>Số lượng:</Text>
                            <div className="flex items-center mt-2">
                                <Button onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1}>
                                    -
                                </Button>
                                <div className="px-4 py-1 border mx-1 min-w-[50px] text-center">{quantity}</div>
                                <Button
                                    onClick={() => handleQuantityChange(quantity + 1)}
                                    disabled={quantity >= (product.countInstock || 10)}
                                >
                                    +
                                </Button>
                                <Text type="secondary" className="ml-3">
                                    {product.countInstock || 0} sản phẩm có sẵn
                                </Text>
                            </div>
                        </div>

                        <div className="action-buttons flex gap-2 mt-6">
                            <Button
                                type="primary"
                                size="large"
                                icon={<ShoppingCartOutlined />}
                                className="flex-1"
                                disabled={user?.isAdmin || product?.countInstock === 0}
                                style={{ background: '#1677ff' }}
                                onClick={handleAddCart}
                            >
                                Thêm vào giỏ hàng
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default ProductDetailModal;
