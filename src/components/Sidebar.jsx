import React from 'react';
import { Drawer, Avatar, Badge, Menu } from 'antd';
import { CloseOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { useAppStore } from '~/store/useAppStore';
import { getUser, removeToken, removeUser } from '~/core/token';
import { useNavigate } from 'react-router-dom';
import { path } from '~/config/path';
import useGetCart from '~/hooks/useGetCart';
import SearchBar from './SearchBar';
import { Typography } from 'antd';
import useGetUserDetail from '~/hooks/useGetUserDetail';
import { useLocalStore } from '~/store/useLocalStore';

const Sidebar = () => {
    const { cartLocal } = useLocalStore();
    const user = getUser();
    const { toggleSidebar, openSidebar, toggleModal } = useAppStore();
    const { data: userDetail } = useGetUserDetail();
    const navigate = useNavigate();
    const { data: dataCart } = useGetCart();

    const handleLogout = () => {
        removeUser();
        removeToken();
        navigate('/', { replace: true });
        toggleSidebar();
        window.location.replace('/');
    };

    const handleMenuClick = ({ key }) => {
        if (key === 'logout') {
            handleLogout();
        } else {
            navigate(key);
            setTimeout(() => {
                toggleSidebar();
            }, 200);
        }
    };

    // Chuyển đổi từ SubMenu sang items theo chuẩn mới của Ant Design
    const menuItems = [
        {
            key: 'user',
            label: 'Tài khoản',
            children: user
                ? [
                      userDetail?.user?.isAdmin
                          ? { key: path.Admin, label: 'Quản lý hệ thống' }
                          : { key: path.Account.Profile, label: 'Thông tin người dùng' },
                      !userDetail?.user?.isAdmin && { key: path.Account.MyOrder, label: 'Đơn hàng' },
                      { key: 'logout', label: 'Đăng xuất' },
                  ].filter(Boolean)
                : [],
        },
        !user && {
            key: 'login',
            label: 'Đăng nhập & Đăng ký',
            onClick: toggleModal,
        },
    ].filter(Boolean);

    return (
        <Drawer
            open={openSidebar}
            placement="left"
            closable={false}
            onClose={toggleSidebar}
            styles={{
                header: { display: 'none' },
                body: { padding: 0 },
            }}
        >
            <div className="p-7 h-[70px] flex items-center justify-between bg-[#1A94FF]">
                <Typography style={{ color: '#fff', fontSize: '20px', fontFamily: 'sans-serif' }}>My Shop</Typography>
                <CloseOutlined className="text-white text-[20px] cursor-pointer" onClick={toggleSidebar} />
            </div>

            <div className="m-5 border-b-[0.5px] border-solid border-b-[#eae9e9]">
                <SearchBar placeholder="Search" size="large" text="Tìm kiếm" />
            </div>

            <div className="p-5 flex items-center">
                {userDetail?.user?.avatar ? (
                    <Avatar src={userDetail?.user?.avatar} size={70} className="mr-3" />
                ) : (
                    <UserOutlined style={{ fontSize: '30px', color: '#fff' }} />
                )}
                {userDetail?.user?.name && <span className="text-[16px] text-[#333]">{userDetail?.user?.name}</span>}
            </div>

            {/* Menu mới sử dụng `items` thay vì `children` */}
            <Menu mode="inline" className="text-[16px]" onClick={handleMenuClick} items={menuItems} />

            {!user?.isAdmin && (
                <div
                    className="p-10 flex items-center cursor-pointer text-xl mt-5"
                    onClick={() => {
                        navigate(path.Cart);
                        toggleSidebar();
                    }}
                >
                    <Badge
                        count={
                            user
                                ? dataCart?.totalProduct > 0
                                    ? dataCart?.totalProduct
                                    : 0
                                : cartLocal?.totalProduct > 0
                                ? cartLocal?.totalProduct
                                : 0
                        }
                    >
                        <ShoppingCartOutlined style={{ fontSize: '30px', color: '#fff' }} />
                    </Badge>
                    <span className="text-[16px] text-[#333]">Giỏ hàng</span>
                </div>
            )}
        </Drawer>
    );
};

export default Sidebar;
