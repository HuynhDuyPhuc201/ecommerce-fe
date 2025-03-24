import { Col, Menu, Row } from 'antd';
import React, { useState } from 'react';
import { AppstoreOutlined, UserOutlined } from '@ant-design/icons';
import Header from '~/components/Layout/Header';
import AdminUser from './AdminUser';
import AdminProduct from './AdminProduct';
import { Navigate } from 'react-router-dom';
import { path } from '~/config/path';
import { getUser } from '~/core/token';
import './admin.css';

const Admin = () => {
    const [renderComponent, setRenderComponent] = useState('user');
    const user = getUser();
    const items = [
        {
            id: 1,
            key: 'user',
            label: 'Người dùng',
            icon: <UserOutlined />,
        },
        {
            id: 2,
            key: 'product',
            label: 'Sản Phẩm',
            icon: <AppstoreOutlined />,
        },
    ];
    const onClick = ({ key }) => {
        setRenderComponent(key);
    };
    if (!user?.isAdmin) return <Navigate to={path.Home} />;
    return (
        <>
            <Header />
            <div className="pt-[50px] md:pt-[70px]">
                <Row>
                    <Col sm={24} xs={24} md={4}>
                        <Menu
                            onClick={onClick}
                            className="custom-menu"
                            defaultSelectedKeys={['user']}
                            mode="inline"
                            items={items}
                        />
                    </Col>
                    <Col sm={24} md={20}>
                        <div className="">{renderComponent === 'user' ? <AdminUser /> : <AdminProduct />}</div>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default Admin;
