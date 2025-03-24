import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Col } from 'antd';
import { path } from '~/config/path';
import useOrderStore from '~/store/useOrderStore';
import { getUser } from '~/core/token';

const OrderSuccessPage = () => {
    const navigate = useNavigate();
    const user = getUser();

    return (
        <Col xs={24} sm={24} md={24}>
            <div className="flex  flex-col items-center justify-center p-4">
                <div className=" p-6 rounded-lg text-center ">
                    {/* <img src={successImage} alt="Success" className="w-24 mx-auto mb-4" /> */}
                    <p className="text-[25px] font-bold  text-green-600">Đặt hàng thành công!</p>
                    <p className="text-[#333] mt-2">
                        Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi. {!user && 'Theo dõi dơn hàng qua Email.'}{' '}
                        {user ? (
                            <Link to={path.Account.MyOrder} style={{ textDecoration: 'underline' }}>
                                Xem đơn hàng
                            </Link>
                        ) : (
                            <a href="https://mail.google.com/" className="underline">
                                Xem đơn hàng
                            </a>
                        )}
                    </p>
                    <Button
                        type="primary"
                        className="mt-4 w-full bg-blue-500 hover:bg-blue-600"
                        onClick={() => navigate(path.Home)}
                    >
                        Quay về trang chủ
                    </Button>
                </div>
            </div>
        </Col>
    );
};

export default OrderSuccessPage;
