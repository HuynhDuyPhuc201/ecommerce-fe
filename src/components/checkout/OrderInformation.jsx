import React from 'react';
import { Card } from 'antd';
import CheckoutProductItem from './CheckoutProductItem';
import { formatNumber } from '~/utils/formatNumber';

const OrderInformation = ({ checkoutInfo }) => {
    const totalProduct = checkoutInfo?.totalProduct || 1;
    const subTotal = checkoutInfo?.subTotal || checkoutInfo?.price * checkoutInfo?.quantity || 0;

    return (
        <Card title="Thông tin đơn hàng" className="mb-6">
            <div>
                <p>
                    <strong>Số lượng sản phẩm:</strong> {totalProduct}
                </p>
                <p>
                    <strong>Tổng tiền:</strong> {formatNumber(subTotal)}₫
                </p>
                <p className="mt-3">
                    <strong>Sản phẩm:</strong>
                </p>

                {/* Sản phẩm cho mua ngay */}
                {checkoutInfo.name && (
                    <ul className="pt-5">
                        <CheckoutProductItem
                            image={checkoutInfo?.image[0]}
                            name={checkoutInfo?.name}
                            price={checkoutInfo?.price}
                            quantity={checkoutInfo?.quantity}
                        />
                    </ul>
                )}

                {/* Danh sách sản phẩm */}
                <ul className="pt-5">
                    {checkoutInfo?.orderItems?.map((item, index) => (
                        <CheckoutProductItem
                            key={index}
                            image={item?.image}
                            name={item?.name}
                            price={item?.price}
                            quantity={item?.quantity}
                        />
                    ))}
                </ul>
            </div>
        </Card>
    );
};

export default OrderInformation;
