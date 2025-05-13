import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Col } from 'antd';
import { path } from '~/config/path';
import { getUser } from '~/config/token';
import HelmetComponent from '~/components/Helmet';

const OrderSuccessPage = () => {
    const navigate = useNavigate();
    const user = getUser();

    return (
        <div className="container min-h-[500px]">
            <HelmetComponent title="Thanh toán" />
            <Col xs={24} sm={24} md={24}>
                <div className="flex  flex-col items-center justify-center p-4">
                    <div className="p-6 rounded-lg text-center ">
                        <p className="text-[30px] font-bold  text-green-600">Đặt hàng thành công!</p>
                        <p className="text-[#333] mt-2">
                            Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi. {!user && 'Theo dõi dơn hàng qua Email.'}{' '}
                            <br />
                            {user && (
                                <Link to={path.Account.MyOrder} style={{ textDecoration: 'underline' }}>
                                    Xem đơn hàng
                                </Link>
                            )}
                        </p>
                        <div className="w-[50%] mx-auto mt-4">
                            <Button
                                type="primary"
                                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-[16px]"
                                onClick={() => navigate(path.Home)}
                            >
                                Quay về trang chủ
                            </Button>
                        </div>
                    </div>
                </div>
            </Col>
        </div>
    );
};

export default OrderSuccessPage;
