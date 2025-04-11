import { Col } from 'antd';
import React from 'react';
import { cart_empty } from '~/constants/images';

const EmptyCart = () => {
    return (
        <Col sm={24} md={24} style={{ background: '#fff', width: '100%' }}>
            <div className="flex flex-col justify-center items-center p-4 rounded-lg shadow-md">
                <div className="">
                    <img src={cart_empty} width={150} height={150} alt="" className="w-[150px]" />
                </div>
                <p>Giỏ hàng trống</p>
            </div>
        </Col>
    );
};

export default EmptyCart;
