import React, { useState } from 'react';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { Avatar, Button, message, Upload } from 'antd';
import { Divider, Table } from 'antd';
import { Modal } from 'antd';
import { ModalButton } from './component/ModalButton';
import { useForm } from 'react-hook-form';
import { ModalForm } from './component/ModalForm';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '~/core/token';
import { adminService } from '~/services/admin.service';
import { orderService } from '~/services/order.service';
import { formattedDate } from '~/core/utils/formatDate';
import { formatNumber } from '~/core';

const AdminUser = () => {
    const [type, setType] = useState('user');
    const [idCheckbox, setIdCheckbox] = useState([]);
    const [modalConfig, setModalConfig] = useState({ open: false, type: '', action: '' });
    const [isModalOpen, setIsModalOpen] = useState({ open: false, type: '' });
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
    });

    const handleOk = () => {
        setIsModalOpen({ open: false, type: 'ok' });
    };

    const handleCancel = () => {
        // dùng cho cancel modal admin vs cancel modal thường
        setIsModalOpen({ open: false, type: 'cancel' });
        setModalConfig({ open: false, type: '' });
        setImageUrl('');
        userForm.reset(dataReset);
    };

    const handleSubmit = async (form) => {
        const { confirmPassword, ...objForm } = form;
        const defaultValues = userForm?.formState.defaultValues; // Lấy giá trị ban đầu - không có confimpassword
        const currentValues = userForm?.getValues(); // Lấy giá trị hiện tại - có confimpassword

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
            message.error(error?.response?.data?.message || 'có lỗi');
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

    const onClickUpdate = (id) => {
        const item = dataUser?.find((item) => item._id === id);
        // lấy id ra để handleSubmit nhận được
        setIdCheckbox([item?._id]);
        setImageUrl(item.avatar);
        setModalConfig({ open: true, type: 'user', action: 'update' });
        userForm.reset(item);
    };

    const renderOrder = (id) => {
        const userAdmin = dataUser?.find((item) => item._id === id);
        if (!userAdmin.isAdmin) {
            return <Button onClick={() => fetchOrder(id)}>View Orders</Button>;
        }
        return null;
    };
    const [modalOrder, setModalOrder] = useState(false);

    const handleCancelModalOrder = () => {
        setModalOrder(false);
    };
    const [data, setData] = useState();
    const fetchOrder = async (id) => {
        try {
            const result = await orderService.getOrderAdmin(id);
            setData(result);
            setModalOrder(true);
        } catch (error) {
            console.log(error);
        }
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
                    <img className="w-[50px] h-[50px] object-cover border rounded-[50%]" src={avatar || ''} alt="" />
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
                responsive: ['md', 'lg'], // Hiện trên mọi màn hình
                dataIndex: 'avatar',
                render: (avatar) => renderAvatar(avatar),
                width: 100,
            },
            {
                title: 'Tên tài khoản',
                responsive: ['xs', 'sm', 'md', 'lg'], // Hiện trên mọi màn hình
                dataIndex: 'name',
                width: 100,
            },
            {
                title: 'Quyền admin',
                responsive: ['xs', 'sm', 'md', 'lg'], // Hiện trên mọi màn hình
                dataIndex: 'isAdmin',
                width: 100,
                render: (a) => (a ? 'true' : 'false'),
            },
            {
                title: 'Tên đăng nhập',
                responsive: ['xs', 'sm', 'md', 'lg'], // Hiện trên mọi màn hình
                dataIndex: 'email',
                ellipsis: true,
                width: 120,
            },
            {
                title: 'Đơn hàng',
                responsive: ['xs', 'sm', 'md', 'lg'], // Hiện trên mọi màn hình
                dataIndex: '_id',
                width: 120,
                render: (id) => renderOrder(id),
            },
            { title: 'Action', dataIndex: '_id', width: 100, render: (id) => renderAction(id) },
        ],
    };

    return (
        <>
            <div className="wrap ml-10 mt-10 w-[80%]">
                <ModalButton
                    title="Quản lí người dùng"
                    onClick={() => setModalConfig({ open: true, type: 'user', action: 'create' })}
                />

                <div>
                    <div className="mt-10"></div>
                    <Divider />
                    <Button disabled={!idCheckbox?.length} onClick={handleDelete} style={{ marginBottom: '10px' }}>
                        Xóa
                    </Button>
                    <Table
                        rowKey="_id" // Đảm bảo mỗi hàng có ID duy nhất
                        rowSelection={{
                            idCheckbox,
                            onChange: setIdCheckbox, // Viết gọn
                        }}
                        columns={columns[type]}
                        dataSource={type === 'user' ? dataUser : ''}
                        scroll={{ x: 800 }}
                    />
                    <ModalForm
                        title={modalConfig.action === 'create' ? 'Tạo tài khoản user' : 'Cập nhật tài khoản'}
                        isOpen={modalConfig.open}
                        onCancel={handleCancel}
                        methods={userForm}
                        onSubmit={handleSubmit}
                        fields={[
                            { name: 'name', label: 'Tên tài khoản', placeholder: 'vd: abc' },
                            { name: 'email', label: 'Tên đăng nhập', placeholder: 'vd: abc@example.com' },
                            { name: 'avatar', label: 'Ảnh đại diện', render: renderUpload(), type: 'avatar' },
                            {
                                name: 'phone',
                                required: `${modalConfig.action === 'create' ? true : false}`,
                                label: 'Điện thoại',
                                placeholder: 'vd: 0123456789',
                            },
                            {
                                name: 'password',
                                required: `${modalConfig.action === 'create' ? true : false}`,
                                label: `${modalConfig.action === 'create' ? 'Mật khẩu' : 'Mật khẩu cũ'}`,
                            },
                            {
                                name: `${modalConfig.action === 'create' ? 'confirmPassword' : 'newPassword'}`,
                                required: `${modalConfig.action === 'create' ? true : false}`,
                                label: `${modalConfig.action === 'create' ? 'Xác minh mật khẩu' : 'Mật khẩu mới'}`,
                            },
                        ]}
                    />

                    <Modal title="Chi tiết đơn hàng" open={modalOrder} footer={null} onCancel={handleCancelModalOrder}>
                        {data?.map((item) => {
                            return (
                                <div class="border border-solid p-2.5 my-2.5 border-[#c6c6c6] rounded-[10px]">
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
                                        <strong>Tổng tiền:</strong> {formatNumber(item?.subTotal)}
                                    </p>
                                    <p className="mt-3">
                                        <strong>Sản phẩm:</strong>
                                    </p>
                                    <ul>
                                        {item?.orderItems?.map((item, index) => (
                                            <li
                                                key={item?._id}
                                                style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}
                                            >
                                                <img
                                                    src={item?.image}
                                                    alt="Product"
                                                    style={{ width: '70px', height: '70px', marginRight: '10px' }}
                                                />
                                                <div>
                                                    <p>{item?.name}</p>
                                                    <p>
                                                        {formatNumber(item?.price)} x {item?.quantity}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                        {!data?.length && <span>Chưa có đơn hàng</span>}
                    </Modal>
                </div>
            </div>
        </>
    );
};

export default AdminUser;
