import React, { useState } from 'react';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { Avatar, Button, message, Pagination, Upload, Table, Modal, Divider } from 'antd';
import { ModalButton } from './component/ModalButton';
import { useForm } from 'react-hook-form';
import { ModalForm } from './component/ModalForm';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '~/config/token';
import { adminService } from '~/services/admin.service';
import { orderService } from '~/services/order.service';
import { formattedDate } from '~/utils/formatDate';
import { formatNumber } from '~/utils/formatNumber';

const fetchOrder = async (id, page = 1) => {
    const result = await orderService.getOrderAdmin(`?limit=4&page=${page}&id=${id}`);
    return result; // Trả về kết quả để `useQuery` sử dụng
};

const AdminUser = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [idCheckbox, setIdCheckbox] = useState([]);
    const [currentPageOrder, setCurrentPageOrder] = useState(1);
    const [modalOrder, setModalOrder] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null); // Lưu ID đơn hàng hiện tại
    const [modalConfig, setModalConfig] = useState({ open: false, type: '', action: '' });
    const [imageUrl, setImageUrl] = useState();
    const user = getUser();
    const userForm = useForm({ mode: 'onChange' });
    const dataReset = {
        address: '',
        avatar: '',
        email: '',
        name: '',
        password: '',
        phone: '',
    };

    // lấy danh sách người dùng
    const { data: dataUser, refetch } = useQuery({
        queryKey: ['user'],
        queryFn: async () => await adminService.getAll(),
        refetchOnWindowFocus: false, // Tắt refetch khi tab focus lại
        refetchOnReconnect: false, // Tắt refetch khi mạng có lại
        staleTime: 5 * 60 * 1000, // Dữ liệu sẽ không bị stale trong 5 phút
        cacheTime: 30 * 60 * 1000, // Dữ liệu sẽ bị xóa khỏi cache sau 30 phút
    });

    const handleCancel = () => {
        setModalConfig({ open: false, type: '' });
        setImageUrl('');
        userForm.reset(dataReset);
    };
    const showDeleteConfirm = (onOk) => {
        Modal.confirm({
            title: 'Xác nhận xóa user',
            content: 'Bạn có chắc chắn muốn xóa user này không?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                onOk(); // hàm xử lý khi đồng ý
            },
            onCancel() {
                console.log('Hủy xóa');
            },
        });
    };

    const handleSubmit = async (form) => {
        const defaultValues = userForm?.formState.defaultValues;
        const currentValues = userForm?.getValues();

        const result = JSON.stringify(defaultValues) === JSON.stringify(currentValues);

        if (modalConfig.action === 'update' && result) {
            return message.error('Không có gì thay đổi');
        }
        try {
            const service = modalConfig.action === 'create' ? adminService.create : adminService.update;
            const result = await service(form);
            if (result.success) {
                message.success(result?.message);
                userForm.reset(dataReset);
                setImageUrl('');
                refetch();
                setModalConfig({ open: false, type: '' });
            }
        } catch (error) {
            message.error(error?.response?.data?.message || 'Có lỗi');
        }
    };

    const query = idCheckbox?.map((item) => `id=${item}`).join('&');
    const handleDelete = async () => {
        try {
            const userAdmin = idCheckbox?.find((item) => item === user._id);
            if (userAdmin) {
                message.error('Không thể xóa tài khoản admin');
                return;
            }
            const result = await adminService.delete(query);
            if (result.success) {
                message.success(result?.message);
                setIdCheckbox([]);
                refetch();
            }
        } catch (error) {
            message.error(error?.response?.data?.message);
        }
    };

    const handleUpload = (info) => {
        const file = info.file;
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageUrl(e.target?.result); // Lưu đường dẫn ảnh
                userForm.setValue('avatar', e.target?.result);
            };
            reader.readAsDataURL(file); // Đọc file dưới dạng URL base64
        }
    };

    const [blockActive, setBlockActive] = useState({});
    const onClickUpdate = (id) => {
        const item = dataUser?.find((item) => item._id === id);
        if (!item) return;
        setIdCheckbox([item._id]);
        setImageUrl(item.avatar);
        setBlockActive(item); // Cập nhật trạng thái block đúng với user hiện tại
        userForm.reset(item);
        setModalConfig({ open: true, type: 'user', action: 'update' });
    };

    const handleActionBlock = async () => {
        try {
            const result = await adminService.update({
                isActive: !blockActive.isActive,
                isAdmin: user?.isAdmin,
                userId: blockActive?._id,
            });

            if (result.success) {
                message.success(result.message);
                setModalConfig({ open: false, type: '' });
                refetch();
                setBlockActive(result.user);
            }
        } catch (error) {
            message.error('Không thể thay đổi trạng thái tài khoản');
        }
    };

    const renderButton = () => (
        <Button onClick={handleActionBlock}>{blockActive?.isActive ? 'Khóa' : 'Mở khóa'}</Button>
    );

    const handleCancelModalOrder = () => {
        setModalOrder(false);
    };

    // Fetch dữ liệu đơn hàng với useQuery
    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders', currentOrderId, currentPageOrder], // Cache key phụ thuộc vào ID và page
        queryFn: () => fetchOrder(currentOrderId, currentPageOrder), // Hàm fetch
        enabled: !!currentOrderId, // Chỉ fetch khi có `currentOrderId`
        staleTime: 5 * 60 * 1000, // Dữ liệu sẽ không bị stale trong 5 phút
        cacheTime: 30 * 60 * 1000, // Dữ liệu sẽ giữ trong cache 30 phút
        onSuccess: () => {
            setModalOrder(true); // Mở modal khi dữ liệu đã được load thành công
        },
        onError: (err) => {
            message.error(err?.message || 'Có lỗi khi tải dữ liệu đơn hàng'); // Hiển thị thông báo lỗi nếu có
        },
    });

    // Handle chuyển trang
    const onShowSizeChange = (page) => {
        setCurrentPageOrder(page); // Chuyển trang
    };

    // Handle xem đơn hàng
    const handleViewOrders = (id) => {
        setCurrentOrderId(id); // Lưu ID đơn hàng hiện tại
        setModalOrder(true);
    };

    // Render nút "View Orders"
    const renderOrder = (id) => {
        const userAdmin = dataUser?.find((item) => item._id === id);
        if (!userAdmin?.isAdmin) {
            return <Button onClick={() => handleViewOrders(id)}>View Orders</Button>;
        }
        return null;
    };

    const renderUpload = () => {
        return (
            <>
                <div className="mr-5 inline-block">
                    <Upload
                        showUploadList={false}
                        beforeUpload={() => false} // Ngăn không gửi file lên server
                        onChange={handleUpload}
                    >
                        <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                    </Upload>
                </div>
                <Avatar size={50} icon={!imageUrl ? <UserOutlined /> : undefined} src={imageUrl || ''} />
            </>
        );
    };

    const renderAvatar = (avatar) => {
        return (
            <>
                {avatar ? (
                    <img
                        width={50}
                        height={50}
                        className="w-[50px] h-[50px] object-cover border rounded-[50%]"
                        src={avatar || ''}
                        alt="Avatar"
                    />
                ) : (
                    <Avatar size={50} icon={<UserOutlined />} />
                )}
            </>
        );
    };

    const renderAction = (id) => {
        const userAdmin = dataUser?.find((item) => item._id === id);
        if (!userAdmin.isAdmin) {
            return <Button onClick={() => onClickUpdate(id)}>Update</Button>;
        }
        return null;
    };

    const columns = {
        user: [
            {
                title: 'Ảnh đại diện',
                dataIndex: 'avatar',
                render: (avatar) => renderAvatar(avatar),
                width: 100,
            },
            {
                title: 'Tên tài khoản',
                dataIndex: 'name',
                width: 100,
            },
            {
                title: 'Quyền admin',
                dataIndex: 'isAdmin',
                width: 100,
                render: (a) => (a ? 'true' : 'false'),
            },
            {
                title: 'Hoạt động',
                dataIndex: 'isActive',
                width: 100,
                render: (a) =>
                    a ? <p className="text-[#20a32b]">{'true'}</p> : <p className="text-[#ff1e1e]">{'false'}</p>,
            },
            {
                title: 'Tên đăng nhập',
                dataIndex: 'email',
                ellipsis: true,
                width: 120,
            },
            {
                title: 'Xác thực',
                dataIndex: 'isLogin',
                ellipsis: true,
                width: 120,
                render: (a) =>
                    a ? <p className="text-[#20a32b]">{'true'}</p> : <p className="text-[#ff1e1e]">{'false'}</p>,
            },
            {
                title: 'Đơn hàng',
                dataIndex: '_id',
                width: 120,
                render: (id) => renderOrder(id),
            },
            { title: 'Action', dataIndex: '_id', width: 100, render: (id) => renderAction(id) },
        ],
    };

    return (
        <div className="wrap ml-10 mt-10 w-[90%]">
            <ModalButton
                title="Quản lý người dùng"
                onClick={() => setModalConfig({ open: true, type: 'user', action: 'create' })}
            />
            <Divider />
            <Button
                disabled={!idCheckbox?.length}
                onClick={() => showDeleteConfirm(() => handleDelete())}
                style={{ marginBottom: '10px' }}
            >
                Xóa
            </Button>

            <Table
                rowKey="_id"
                rowSelection={{
                    idCheckbox,
                    onChange: setIdCheckbox,
                }}
                columns={columns['user']}
                dataSource={dataUser}
                scroll={{ x: 800 }}
                pagination={{
                    current: currentPage,
                    pageSize: 8,
                    total: dataUser?.length || 0,
                    onChange: (page) => setCurrentPage(page),
                }}
            />
            <ModalForm
                title={modalConfig.action === 'create' ? 'Tạo tài khoản user' : 'Cập nhật tài khoản'}
                action={modalConfig.action === 'update' && renderButton}
                isOpen={modalConfig.open}
                onCancel={handleCancel}
                methods={userForm}
                onSubmit={handleSubmit}
                fields={[
                    { name: 'name', type: 'text', label: 'Tên tài khoản', placeholder: 'vd: abc', required: true },
                    {
                        name: 'email',
                        type: 'text',
                        label: 'Tên đăng nhập',
                        placeholder: 'vd: abc@example.com',
                        required: true,
                    },
                    { name: 'avatar', type: 'avatar', label: 'Ảnh đại diện', render: renderUpload() },
                    { name: 'phone', type: 'number', label: 'Điện thoại', placeholder: 'vd: 0123456789' },
                    ...(modalConfig.action === 'create'
                        ? [
                              { name: 'password', type: 'password', required: true, label: 'Mật khẩu' },
                              { name: 'confirmPassword', type: 'password', required: true, label: 'Xác minh mật khẩu' },
                          ]
                        : []),
                ]}
            />
            <Modal
                width={800}
                height={500}
                title="Chi tiết đơn hàng"
                open={modalOrder}
                footer={null}
                onCancel={handleCancelModalOrder}
                className="text-center"
            >
                <div className={`${orders?.data?.length > 1 ? 'grid md:grid-cols-2 gap-5' : ''} text-left`}>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-[300px]">Loading...</div>
                    ) : (
                        orders?.data?.map((item, index) => (
                            <div key={index} className={`border border-solid p-2.5 border-[#c6c6c6] rounded-[10px]`}>
                                <p>
                                    <strong>Ngày đặt:</strong> {formattedDate(item?.createdAt)}
                                </p>
                                <p>
                                    <strong>Phương thức giao hàng:</strong> {item?.deliveryMethod}
                                </p>
                                <p>
                                    <strong>Phương thức thanh toán:</strong> {item?.paymentMethod}
                                </p>
                                <p>
                                    <strong>Số lượng:</strong> {item?.totalProduct}
                                </p>
                                <p>
                                    <strong>Tổng tiền:</strong> {formatNumber(item?.totalPrice || 0)}₫
                                </p>
                                <p className="mt-3">
                                    <strong>Sản phẩm:</strong>
                                </p>
                                <ul className="mt-2">
                                    {item?.orderItems?.map((item, index) => (
                                        <li key={index} className="flex items-start mb-[10px]">
                                            <img
                                                width={70}
                                                height={70}
                                                src={item?.image}
                                                alt="Product"
                                                style={{ width: '70px', height: '70px', marginRight: '10px' }}
                                            />
                                            <div>
                                                <p className="line-clamp-2">{item?.name}</p>
                                                <p>
                                                    {formatNumber(item?.price || 0)}₫ x {item?.quantity || 0}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}

                    {!orders?.data?.length && (
                        <div className="text-center">
                            <span className="">Chưa có đơn hàng</span>
                        </div>
                    )}
                </div>
                {orders?.data?.length > 0 && (
                    <Pagination
                        style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}
                        onChange={onShowSizeChange}
                        total={orders?.total}
                        pageSize={4}
                        current={currentPageOrder}
                    />
                )}
            </Modal>
        </div>
    );
};

export default AdminUser;
