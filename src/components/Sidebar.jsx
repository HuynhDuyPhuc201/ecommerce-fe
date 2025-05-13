import React, { useEffect, useState } from 'react';
import { Drawer, Badge, Menu, List, message } from 'antd';
import { CloseOutlined, HeartOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { useAppStore } from '~/store/useAppStore';
import { getUser, removeToken, removeUser } from '~/config/token';
import { generatePath, Link, useLocation, useNavigate } from 'react-router-dom';
import { path } from '~/config/path';
import useGetCart from '~/hooks/useGetCart';
import SearchBar from './SearchBar';
import useGetUserDetail from '~/hooks/useGetUserDetail';
import { useLocalStore } from '~/store/useLocalStore';
import { formatNumber } from '~/utils/formatNumber';
import { userService } from '~/services/user.service';
import { useQuery } from '@tanstack/react-query';
import { wishlistService } from '~/services/wishlist.service';

const Sidebar = () => {
    const { cartLocal } = useLocalStore();
    const { pathname } = useLocation();
    const user = getUser();
    const { toggleSidebar, openSidebar, toggleModal, searchResults, setOverlayVisible, setSearchResults } =
        useAppStore();
    const { data: userDetail } = useGetUserDetail();
    const navigate = useNavigate();
    const { data: dataCart } = useGetCart();

    const { data: dataWishlist } = useQuery({
        queryKey: ['wishlist'],
        queryFn: async () => await wishlistService.getWishlist(),
        enabled: !!user,
    });

    const handleLogout = async () => {
        if (!import.meta.env.VITE_COOKIE_MODE) {
            removeToken();
        } else {
            const result = await userService.logout();
            if (result.success) {
                message.success(result.message);
            }
        }
        removeUser();
        toggleSidebar(false);
        navigate('/', { replace: true });
        window.location.replace('/');
    };

    const hanldeShowSearch = () => {
        setOverlayVisible(false);
        setSearchResults([]);
        toggleSidebar(false);
    };

    const handleMenuClick = ({ key }) => {
        if (key === 'logout') {
            handleLogout();
        } else {
            toggleSidebar(false);
            setTimeout(() => {
                navigate(key);
            }, 200);
        }
    };
    const [openKeys, setOpenKeys] = useState(['user']); // Luôn mở "Tài khoản"

    // Chuyển đổi từ SubMenu sang items theo chuẩn mới của Ant Design
    const menuItems = [
        {
            key: 'user',
            label: user ? user.name : <span className="text-[18px]">Tài khoản</span>,
            icon: user?.avatar ? (
                <img
                    width={40}
                    height={40}
                    src={user?.avatar}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-[40px] h-[40px] rounded-full object-cover"
                />
            ) : (
                <UserOutlined style={{ fontSize: '18px' }} />
            ),
            children: user
                ? [
                      userDetail?.isAdmin
                          ? { key: path.Admin, label: 'Quản lý hệ thống' }
                          : { key: path.Account.Profile, label: 'Thông tin người dùng' },
                      !userDetail?.isAdmin && { key: path.Account.MyOrder, label: 'Đơn hàng' },
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

    const handleCloseSibar = () => toggleSidebar(false);
    useEffect(() => {
        toggleSidebar(false);
    }, [pathname]);

    return (
        <Drawer
            open={openSidebar}
            placement="left"
            closable={false}
            onClose={handleCloseSibar}
            styles={{
                header: { display: 'none' },
                body: { padding: 0 },
            }}
        >
            <div className="p-7 h-[70px] flex items-center justify-between bg-[#15395b]">
                <Link
                    to={path.Home}
                    style={{ color: '#fff', fontSize: '20px', fontFamily: 'sans-serif' }}
                    onClick={handleCloseSibar}
                >
                    SHOP
                </Link>
                <CloseOutlined className="text-white text-[20px] cursor-pointer" onClick={handleCloseSibar} />
            </div>

            <div className="m-5 border-b-[0.5px] border-solid border-b-[#eae9e9]">
                <SearchBar placeholder="Tìm kiếm..." size="large" text="Tìm kiếm" />
                {searchResults && searchResults?.length > 0 && (
                    <List
                        bordered
                        dataSource={searchResults || []}
                        renderItem={(item) => (
                            <Link
                                to={generatePath(path.ProductDetail, {
                                    slug: item?.categories,
                                    id: item?._id,
                                })}
                                onClick={hanldeShowSearch}
                            >
                                <List.Item
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <img
                                        src={item.image[0]}
                                        alt={item.name}
                                        width={50}
                                        height={50}
                                        style={{
                                            width: 30,
                                            height: 30,
                                            objectFit: 'cover',
                                            borderRadius: 8,
                                            marginRight: 15,
                                        }}
                                    />

                                    <div style={{ flex: 1, cursor: 'pointer' }}>
                                        <h4
                                            style={{ margin: 0, fontSize: '14px', color: '#333' }}
                                            className="line-clamp-2 "
                                        >
                                            {item.name}
                                        </h4>
                                    </div>

                                    <div>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                color: '#ff4d4f',
                                                paddingLeft: '20px',
                                            }}
                                        >
                                            {formatNumber(item.price || 0)}₫
                                        </p>
                                    </div>
                                </List.Item>
                            </Link>
                        )}
                        style={{
                            // position: 'absolute',
                            width: '100%',
                            background: 'white',
                            zIndex: 1000,
                            maxHeight: '250px',
                            overflowY: 'auto',
                            borderRadius: '5px',
                        }}
                    />
                )}
            </div>

            {/* Menu mới sử dụng `items` thay vì `children` */}
            <Menu
                mode="inline"
                openKeys={openKeys}
                onOpenChange={(keys) => setOpenKeys(keys)}
                className="text-[16px] mt-10"
                onClick={handleMenuClick}
                items={menuItems}
            />

            {!user?.isAdmin && (
                <div
                    className="p-10 flex items-center cursor-pointer text-xl mt-5"
                    onClick={() => {
                        navigate(path.Cart);
                        toggleSidebar(false);
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
                        <ShoppingCartOutlined style={{ fontSize: '20px', color: '#000' }} />
                    </Badge>

                    <span className="text-[16px] text-[#333] pl-5">Giỏ hàng</span>
                </div>
            )}

            {user && (
                <div
                    className="px-10 flex items-center cursor-pointer text-xl"
                    onClick={() => {
                        navigate(path.Account.Wishlist);
                        toggleSidebar(false);
                    }}
                >
                    <Badge count={dataWishlist?.wishlist?.products.length || 0}>
                        <HeartOutlined style={{ fontSize: '20px', color: '#000' }} />
                    </Badge>

                    <span className="text-[16px] text-[#333] pl-5">Yêu thích</span>
                </div>
            )}
        </Drawer>
    );
};

export default Sidebar;
