import { useQuery } from '@tanstack/react-query';
import { Button, Table, Modal } from 'antd';
import React, { useState } from 'react';
import { formatNumber } from '~/core/utils/formatNumber';
import { formattedDate } from '~/core/utils/formatDate';
import { orderService } from '~/services/order.service';

const MyOrder = () => {
    const { data } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => orderService.getOrder(),
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const showModal = (record) => {
        setSelectedOrder(record);
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const dataSort = data?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'orderItems',
            responsive: ['xs', 'sm', 'md', 'lg'], // Hiện trên mọi màn hình
            width: 100,
            render: (list) => (
                <>
                    <div className="flex item-center">
                        {list.slice(0, 2).map((item) => (
                            <img
                                key={item._id}
                                src={item.image}
                                alt="Product"
                                style={{ width: '50px', height: '50px' }}
                            />
                        ))}
                        {list.length > 2 && <span className="pl-2">+{list.length - 2}</span>}
                    </div>
                </>
            ),
        },

        {
            title: 'Tổng tiền',
            width: 70,
            responsive: ['xs', 'sm', 'md', 'lg'],
            dataIndex: 'subTotal',
            render: (item) => <p>{formatNumber(item) || 0}</p>,
        },
        {
            title: 'Ngày đặt',
            width: 70,
            responsive: ['xs', 'sm', 'md', 'lg'],
            dataIndex: 'createdAt',
            render: (item) => formattedDate(item),
        },
        {
            title: 'Chi tiết',
            responsive: ['xs', 'sm', 'md', 'lg'],
            dataIndex: '_id',
            width: 70,
            render: (id, record) => (
                <Button key={id} type="link" onClick={() => showModal(record)}>
                    Xem chi tiết
                </Button>
            ),
        },
    ];
    return (
        <>
            {dataSort?.length > 0 ? (
                <Table columns={columns} dataSource={dataSort} scroll={{ x: 500 }} />
            ) : (
                <div className="w-full mx-auto bg-white p-6 rounded-lg shadow-md">
                    <p className="text-[20px] text-center py-10">Đơn hàng trống</p>
                </div>
            )}
            <Modal title="Chi tiết đơn hàng" open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                {selectedOrder && (
                    <div>
                        <p>
                            <strong>Ngày đặt:</strong> {formattedDate(selectedOrder?.createdAt)}
                        </p>
                        <p>
                            <strong>Phương thức giao hàng:</strong> {selectedOrder?.deliveryMethod}
                        </p>
                        <p>
                            <strong>Phương thức thanh toán:</strong> {selectedOrder?.paymentMethod}
                        </p>

                        <p>
                            <strong>Số lượng sản phẩm:</strong> {selectedOrder?.totalProduct}
                        </p>
                        <p>
                            <strong>Tổng tiền:</strong> {formatNumber(selectedOrder?.subTotal) || 0}
                        </p>
                        <p className="mt-3">
                            <strong>Sản phẩm:</strong>
                        </p>
                        <ul>
                            {selectedOrder?.orderItems?.map((item, index) => (
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
                                            {formatNumber(item?.price)} x {item?.quantity || 0}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default MyOrder;
