import React from 'react';
import { Drawer, Avatar, Badge, Menu } from 'antd';
import { CloseOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { useAppStore } from '~/store/useAppStore';
import { getUser, removeUser } from '~/core/token';
import { useNavigate } from 'react-router-dom';
import { path } from '~/config/path';
import useGetCart from '~/hooks/useGetCart';
import SearchBar from './SearchBar';
import { Typography } from 'antd';
import useGetUserDetail from '~/hooks/useGetUserDetail';
import { useLocalStore } from '~/store/useLocalStore';

const { SubMenu } = Menu;

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
        navigate('/', { replace: true }); // Điều hướng mà không tạo history mới
        toggleSidebar();
        window.location.replace('/'); // Chỉ dùng nếu cần reset toàn bộ app state
    };

    const handleMenuClick = ({ key }) => {
        if (key === 'logout') {
            handleLogout();
        } else {
            navigate(key);
            setTimeout(() => {
                toggleSidebar(); // Đảm bảo Drawer đóng sau khi chuyển trang
            }, 200); // Delay nhỏ để tránh bị xung đột UI
        }
        toggleSidebar(); // Đóng Drawer sau khi chọn menu
    };

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

            {/* User Menu */}
            <Menu mode="inline" className="text-[20px]" onClick={handleMenuClick}>
                <SubMenu key="user" title="Tài khoản" className="text-[16px] text-[#333] cursor-pointer">
                    {userDetail?.user && (
                        <>
                            <Menu.Item
                                className="text-[16px]"
                                key={userDetail?.user?.isAdmin ? path.Admin : path.Account.Profile}
                            >
                                {userDetail?.user?.isAdmin ? 'Quản lý hệ thống' : 'Thông tin người dùng'}
                            </Menu.Item>
                            {!userDetail?.user?.isAdmin && (
                                <Menu.Item key={path.Account.MyOrder} className="text-[16px] text-[#333]">
                                    Đơn hàng
                                </Menu.Item>
                            )}
                            <Menu.Item key="logout" className="text-[16px] text-[#333]">
                                Đăng xuất
                            </Menu.Item>
                        </>
                    )}

                    {!userDetail?.user?.isAdmin && (
                        <>
                            <Menu.Item className="text-[16px] text-[#333]" onClick={() => toggleModal()}>
                                Đăng nhập & Đăng ký
                            </Menu.Item>
                        </>
                    )}
                </SubMenu>
            </Menu>

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
        </Drawer>
    );
};

export default Sidebar;
