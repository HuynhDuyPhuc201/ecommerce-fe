import { Col } from 'antd';
import React from 'react';
import { cart_empty } from '~/constants/images';

const EmptyCart = () => {
    return (
        <Col sm={24} md={24}>
            <div className="flex flex-col justify-center items-center p-4 bg-white rounded-lg shadow-md">
                <div className="">
                    <img src={cart_empty} alt="" className="w-[150px]" />
                </div>
                <p>Giỏ hàng trống</p>
            </div>
        </Col>
    );
};

export default EmptyCart;
