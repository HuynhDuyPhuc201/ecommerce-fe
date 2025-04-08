import React, { useMemo, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Table, Divider, Upload, Modal } from 'antd';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { productService } from '~/services/product.service';
import { ModalButton } from './component/ModalButton';
import { ModalForm } from './component/ModalForm';
import { validImageTypes } from '~/core';
import { adminService } from '~/services/admin.service';
import { checkImg } from '~/utils/checkImg';
const AdminProduct = () => {
    const [state, setState] = useState({
        type: 'product',
        modalConfig: { open: false, type: '', action: '' },
        idCheckbox: [],
        currentPage: 1,
        listImage: [],
        removedImages: [],
    });
    const resetData = {
        name: '',
        image: '',
        categories: '',
        rating: '',
        price_old: '',
        price: '',
        countInstock: '',
        description: '',
    };
    const [isLoading, setIsLoading] = useState(false);
    const productForm = useForm({ mode: 'onChange' });
    const categoryForm = useForm({ mode: 'onChange' });

    const { data: dataCategory, refetch: refetchCategory } = useQuery({
        queryKey: ['category'],
        queryFn: async () => await productService.getCategory(),
        staleTime: 5 * 60 * 1000, // Cache trong 5 phút
        refetchOnWindowFocus: false, // Tắt refetch khi tab focus lại
        refetchOnReconnect: false, // Tắt refetch khi mạng có lại
    });

    const { data: dataProduct, refetch: refetchProduct } = useQuery({
        queryKey: ['products', state.currentPage],
        queryFn: async () => await productService.getAll(`?limit=8&page=${state.currentPage}`),
        refetchOnWindowFocus: false, // Tắt refetch khi tab focus lại
        refetchOnReconnect: false, // Tắt refetch khi mạng có lại
    });

    // set lại dataSource và chỉnh lại categories từ dạng id thành title
    const dataSource = useMemo(
        () =>
            dataProduct?.data?.map((item) => ({
                ...item,
                categories: dataCategory?.find((cate) => cate.id === item.categories)?.title || 'Không xác định',
            })),
        [dataProduct, dataCategory],
    );

    // set id sản phẩm dưới dạng query id=1&id=2
    const query = useMemo(() => state.idCheckbox.map((id) => `id=${id}`).join('&'), [state.idCheckbox]);

    const showDeleteConfirm = (onOk) => {
        Modal.confirm({
            title: 'Xác nhận xóa sản phẩm',
            content: 'Bạn có chắc chắn muốn xóa sản phẩm này không?',
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

    const handleDelete = async () => {
        try {
            const service = state.type === 'product' ? adminService.deleteProduct : adminService.deleteCategory;
            const result = await service(query);
            if (result.success) {
                message.success(result.message);
                setState({ ...state, idCheckbox: [] });
                state.type === 'product' ? refetchProduct() : refetchCategory();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi');
        }
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
        const removed = state.listImage.filter((oldFile) => !newFiles.some((newFile) => newFile.uid === oldFile.uid));

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

    const handleSubmit = async (form) => {
        setIsLoading(true);
      
        try {
          const formData = new FormData();
      
          // Append các field không phải image
          for (const key in form) {
            if (key !== 'image') {
              formData.append(key, form[key]);
            }
          }
      
          // Xử lý ảnh bị xoá
          if (state.removedImages?.length > 0) {
            formData.append('removedImages', JSON.stringify(state.removedImages));
          }
      
          // Ảnh mới
          state.listImage.forEach((file) => {
            if (file.originFileObj) {
              formData.append('image', file.originFileObj);
            }
          });
      
          // Ảnh giữ nguyên
          const unchangedImages = state.listImage
            .filter((file) => !file.originFileObj && file.url)
            .map((file) => file.url);
      
          formData.append('unchangedImages', JSON.stringify(unchangedImages));
      
          const service =
            state.modalConfig.action === 'update'
              ? adminService.updateProduct
              : adminService.createProduct;
      
          const result = await service(formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
      
          if (result.success) {
            message.success(result.message);
            state.modalConfig.type === 'product'
              ? refetchProduct()
              : refetchCategory();
      
            productForm.reset(resetData);
            setState({
              ...state,
              modalConfig: { open: false, type: '', action: '' },
              listImage: [],
            });
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

    const handleShowTable = (type) => setState({ ...state, type, idCheckbox: [] });

    const handleCancel = () => {
        setState({ ...state, modalConfig: { open: false, type: '' }, listImage: [] });
        state.modalConfig.type === 'product' ? productForm.reset(resetData) : categoryForm.reset();
    };

    const handleClickUpdate = (id) => {
        const item = dataProduct?.data?.find((item) => item._id === id);
        // Chuyển mảng URL thành định dạng fileList như của Upload
        const imageList =
            item?.image?.map((url, index) => {
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
            idCheckbox: [item?._id],
            modalConfig: { open: true, type: 'product', action: 'update' },
            listImage: imageList || [], // dùng để truyền vào Upload
        });

        productForm.reset(item);
    };

    const renderUpload = () => {
        return (
            <>
                <div className="mr-5 inline-block">
                    <Upload
                        listType="picture-product"
                        showUploadList={true}
                        beforeUpload={() => false}
                        multiple={true}
                        onChange={handleUpload}
                        fileList={state?.listImage.map((file, index) => ({
                            ...file,
                        }))}
                    >
                        <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                    </Upload>
                </div>
            </>
        );
    };
    const renderAction = (id) => <Button onClick={() => handleClickUpdate(id)}>Update</Button>;

    const renderImage = (images) => {
        return (
            <>
                <div className="flex item-center">
                    {images?.slice(0, 2).map((imgUrl, index) => (
                        <img
                            width={50}
                            height={50}
                            key={index}
                            src={checkImg(imgUrl)}
                            alt="Product"
                            style={{ width: '50px', height: '50px' }}
                        />
                    ))}
                    {images?.length > 2 && <span className="pl-2">+{images?.length - 2}</span>}
                </div>
            </>
        );
    };

    const columns = {
        product: [
            { title: 'Tên', dataIndex: 'name', width: 150 },
            { title: 'Hình', dataIndex: 'image', ellipsis: true, width: 200, render: renderImage },
            { title: 'Danh mục', dataIndex: 'categories', width: 100 },
            { title: 'Giá', dataIndex: 'price', width: 100, render: (price) => formatNumber(Number(price || 0)) },
            { title: 'Tồn kho', dataIndex: 'countInstock', width: 100 },
            { title: 'Đánh giá', dataIndex: 'rating', width: 100 },
            {
                title: 'Mô tả',
                dataIndex: 'description',
                width: 200,
                render: (text) => <TextArea defaultValue={text} rows={4} />,
            },
            {
                title: 'Action',
                dataIndex: '_id',
                width: 200,
                render: renderAction,
            },
        ],
        category: [
            { title: 'Tên danh mục', dataIndex: 'title' },
            { title: 'ID', dataIndex: 'id' },
        ],
    };

    return (
        <div className="wrap ml-10 mt-10 w-[95%] ">
            <div className="flex">
                <ModalButton
                    title="Quản lí sản phẩm"
                    onClick={() =>
                        setState({ ...state, modalConfig: { open: true, type: 'product', action: 'create' } })
                    }
                />
                <ModalButton
                    title="Danh mục sản phẩm"
                    onClick={() => setState({ ...state, modalConfig: { open: true, type: 'category' } })}
                />
            </div>

            <Divider />
            <Button
                disabled={!state.idCheckbox?.length}
                onClick={() => showDeleteConfirm(() => handleDelete())}
                style={{ marginBottom: '10px' }}
            >
                Xóa
            </Button>
            <div className="  mb-5 md:flex md:flex-row sm:flex-col gap-5 ">
                <div className="mt-3">
                    <Button onClick={() => handleShowTable('product')}>Xem danh sách sản phẩm</Button>
                </div>
                <div className="mt-3">
                    <Button onClick={() => handleShowTable('category')}>Xem danh mục sản phẩm</Button>
                </div>
            </div>
            <Table
                rowKey="_id" // Đảm bảo mỗi hàng có ID duy nhất
                rowClassName={() => 'align-top'}
                rowSelection={{
                    selectedRowKeys: state.idCheckbox,
                    onChange: (keys) => setState({ ...state, idCheckbox: keys }),
                }}
                columns={columns[state.type]}
                dataSource={state.type === 'product' ? dataSource : dataCategory}
                scroll={{ x: 800 }}
            />

            <ModalForm
                key={state.modalConfig.open ? 'open' : 'closed'}
                title={
                    state.modalConfig.type === 'product'
                        ? state.modalConfig.action === 'update'
                            ? 'Cập nhật sản phẩm'
                            : 'Tạo sản phẩm'
                        : 'Tạo danh mục'
                }
                isOpen={state.modalConfig.open}
                onCancel={handleCancel}
                methods={state.modalConfig.type === 'product' ? productForm : categoryForm}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                fields={
                    state.modalConfig.type === 'product'
                        ? [
                              { name: 'name', label: 'Tên sản phẩm' },
                              {
                                  name: 'image',
                                  label: 'Hình',
                                  placeholder: 'Nhập URL hình ảnh...',
                                  render: renderUpload(),
                                  type: 'photo',
                              },
                              { name: 'categories', label: 'Danh mục', type: 'select', data: dataCategory },
                              { name: 'rating', label: 'Đánh giá', type: 'rating' },
                              { name: 'price_old', label: 'Giá cũ', placeholder: 'Vd: 30000' },
                              { name: 'price', label: 'Giá mới', placeholder: 'Vd: 20000' },
                              { name: 'countInstock', label: 'Tồn kho' },
                              { name: 'description', label: 'Mô tả' },
                          ]
                        : [
                              { name: 'title', label: 'Tên danh mục' },
                              {
                                  name: 'id',
                                  label: 'ID',
                                  placeholder: 'Random ID danh mục...',
                                  button: (
                                      <Button
                                          onClick={() => categoryForm.setValue('id', Math.floor(Math.random() * 1000))}
                                      >
                                          Random
                                      </Button>
                                  ),
                              },
                          ]
                }
            />
        </div>
    );
};
export default AdminProduct;
