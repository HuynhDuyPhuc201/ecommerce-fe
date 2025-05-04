import { useQuery } from '@tanstack/react-query';
import { Button, Table, Modal, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { formatNumber } from '~/utils/formatNumber';
import { formattedDate } from '~/utils/formatDate';
import { orderService } from '~/services/order.service';
import HelmetComponent from '~/components/Helmet';
import { ProductReview } from '~/components/ProductReview';
import { productService } from '~/services/product.service';
import { getUser } from '~/config/token';
import { useForm } from 'react-hook-form';
import { validImageTypes } from '~/utils/typeFile';
const MyOrder = () => {
    const user = getUser();
    const [state, setState] = useState({
        listImage: [],
        removedImages: [],
    });
    const reviewForm = useForm({ mode: 'onChange' });

    const { data: dataOrder } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => orderService.getOrder(),
    });

    const { data: dataReview, refetch: refetchReview } = useQuery({
        queryKey: ['reviews'],
        queryFn: async () => await productService.getReviews(),
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalReview, setModalReview] = useState(false);
    const [loading, setIsLoading] = useState(false);
    const [product, setProduct] = useState(null);

    const showModal = (record) => {
        setSelectedOrder(record);
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleOkReivew = () => {
        setModalReview(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleCancelReview = () => {
        setModalReview(false);
        reviewForm?.reset({
            productId: '',
            userId: '',
            rating: 0,
            comment: '',
            images: [],
        });
        setState((prevState) => ({
            ...prevState,
            listImage: [],
        }));
    };

    const handleModalReview = (itemProduct) => {
        const findReview = dataReview
            .find((item) => item?.productId === itemProduct?.productId)
            ?.reviews.find((item) => item.productId === itemProduct?.productId && item.orderId === selectedOrder._id);
        setModalReview(true);
        setProduct(itemProduct);

        const imageList =
            findReview?.images?.map((url, index) => {
                return {
                    uid: `existing-${index}`,
                    name: `${url?.split('/').pop().split('-').slice(-1).join('-')}`, // hoặc parse từ url
                    status: 'done',
                    url: url,
                    thumbUrl: url,
                    originFileObj: null, // không có File object
                    type: 'image/jpeg', // hoặc bạn lấy từ phần mở rộng
                    existing: true, // Đánh dấu là ảnh cũ đã tồn tại
                };
            }) || [];
        setState({
            ...state,
            listImage: imageList || [], // dùng để truyền vào Upload
        });
        reviewForm.reset(findReview || {});
    };
    const handleUpload = (info) => {
        const newFiles = info?.fileList || [];

        // Kiểm tra loại ảnh hợp lệ
        const isValid = newFiles.every((file) => validImageTypes.includes(file.type));
        if (!isValid) {
            return message.error('Chỉ được upload file ảnh hợp lệ!');
        }

        // Map lại file mới
        const updatedFiles = newFiles.map((file, index) => {
            const origin = file.originFileObj || file;
            if (file.existing) {
                // Nếu là ảnh cũ, giữ nguyên
                return file;
            }
            return {
                ...file,
                originFileObj: origin,
                key: file.uid || index.toString(),
                thumbUrl: file.thumbUrl || URL.createObjectURL(origin),
            };
        });

        // So sánh với ảnh cũ để tìm ảnh bị xoá
        const removed = state.listImage?.filter((oldFile) => !newFiles.some((newFile) => newFile.uid === oldFile.uid));

        // Lưu lại ảnh bị xóa để gửi qua backend (cloudinary)
        const removedImages = removed
            .map((file) => file?.url || file?.thumbUrl) // Cloudinary URL
            .filter((url) => !!url);

        // Cập nhật state
        setState((prevState) => ({
            ...prevState,
            listImage: updatedFiles,
            removedImages: removedImages, // 👈 Lưu vào đây để khi submit thì gửi sang BE
        }));
    };

    const onSubmit = async (form) => {
        setIsLoading(true);
        const updateForm = {
            ...form,
            productId: product?.productId,
            userId: user?._id,
            orderId: selectedOrder?._id,
        };
        try {
            let formData = new FormData();

            // Append các field không phải image
            for (const key in updateForm) {
                if (key !== 'images') {
                    formData.append(key, updateForm[key]);
                }
            }

            // Xử lý ảnh bị xoá
            if (state.removedImages?.length > 0) formData.append('removedImages', JSON.stringify(state.removedImages));

            // Ảnh mới
            state.listImage.forEach((file) => {
                if (file.originFileObj) {
                    formData.append('images', file.originFileObj);
                }
            });

            // Ảnh giữ nguyên (không thay đổi)
            const unchangedImages = state.listImage
                .filter((file) => !file.originFileObj && file.url)
                .map((file) => file.url);

            formData.append('unchangedImages', JSON.stringify(unchangedImages));

            const result = await productService.addReview(formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (result.success) {
                message.success(result.message);
                refetchReview();
                reviewForm?.reset({
                    productId: '',
                    userId: '',
                    rating: 0,
                    comment: '',
                    image: [],
                });
                setState({
                    ...state,
                    listImage: [],
                });
                setModalReview(false);
            } else {
                // Nếu backend return success: false (như "trùng tên", sai định dạng v.v.)
                message.error(result.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi không xác định');
        } finally {
            setIsLoading(false);
        }
    };

    const dataSort = dataOrder?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
                                width={50}
                                height={50}
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
            dataIndex: 'totalPrice',
            render: (item) => <p>{formatNumber(item || 0)}₫</p>,
        },
        {
            title: 'Ngày đặt',
            width: 70,
            responsive: ['xs', 'sm', 'md', 'lg'],
            sorter: (a, b) => a.createdAt - b.createdAt,
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
            <HelmetComponent title="Thông tin tài khoản" />
            <Modal title="Chi tiết đơn hàng" open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                {selectedOrder && (
                    <div>
                        <p>
                            <strong>Ngày đặt:</strong> {formattedDate(selectedOrder?.createdAt)}
                        </p>
                        <p>
                            <strong>Phương thức giao hàng:</strong> {selectedOrder?.deliveryMethod} -{' '}
                            {formatNumber(selectedOrder.shippingFee || 0)}₫
                        </p>
                        <p>
                            <strong>Phương thức thanh toán:</strong> {selectedOrder?.paymentMethod}
                        </p>

                        <p>
                            <strong>Số lượng sản phẩm:</strong> {selectedOrder?.totalProduct}
                        </p>
                        {selectedOrder?.discountPrice !== 0 && (
                            <div className="flex gap-2">
                                <strong>Giảm giá:</strong>{' '}
                                <p className="text-[#f00]"> -{formatNumber(selectedOrder.discountPrice || 0)}₫</p>
                            </div>
                        )}

                        <p className="mt-3">
                            <strong>Sản phẩm:</strong>
                        </p>
                        <ul>
                            {selectedOrder?.orderItems?.map((item, index) => (
                                <li
                                    key={item?._id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: '10px',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <img
                                        width={70}
                                        height={70}
                                        src={item?.image}
                                        alt="Product"
                                        style={{ width: '70px', height: '70px', marginRight: '10px' }}
                                    />
                                    <div>
                                        <p className="max-w-[90%]">{item?.name}</p>
                                        <p>
                                            {formatNumber(item?.price || 0)} x {item?.quantity || 0}₫
                                        </p>
                                    </div>
                                    <Button onClick={() => handleModalReview(item)}>Xem Đánh giá</Button>
                                </li>
                            ))}
                        </ul>
                        <p className=" pt-10 border-t-[1px] border-solid border-[#000]">
                            <strong>Tổng tiền:</strong> {formatNumber(selectedOrder?.totalPrice || 0)}₫
                        </p>
                    </div>
                )}
            </Modal>
            <Modal
                title="Đánh giá sản phẩm"
                open={modalReview}
                onOk={handleOkReivew}
                onCancel={handleCancelReview}
                footer={null}
            >
                <ProductReview
                    product={product}
                    handleUpload={handleUpload}
                    onSubmit={onSubmit}
                    reviewForm={reviewForm}
                    state={state}
                    loading={loading}
                    selectedOrder={selectedOrder}
                />
            </Modal>
        </>
    );
};

export default MyOrder;
