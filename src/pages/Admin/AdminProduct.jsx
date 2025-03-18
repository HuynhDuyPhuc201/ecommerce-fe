import React, { useEffect, useMemo, useState } from 'react';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import { Button, message, Table, Divider, Upload } from 'antd';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { productService } from '~/services/product.service';
import { ModalButton } from './component/ModalButton';
import { ModalForm } from './component/ModalForm';
import { formatNumber, validImageTypes } from '~/core';
import { adminService } from '~/services/admin.service';
import TextArea from 'antd/es/input/TextArea';
const AdminProduct = () => {
    const [state, setState] = useState({
        type: 'product',
        modalConfig: { open: false, type: '', action: '' },
        idCheckbox: [],
        currentPage: 1,
        listImage: [],
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
    });

    const { data: dataProduct, refetch: refetchProduct } = useQuery({
        queryKey: ['products', state.currentPage],
        queryFn: async () => await productService.getAll(`?limit=8&page=${state.currentPage}`),
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

    const handleSubmit = async (form) => {
        setIsLoading(true);
        const formUpdate = { ...form, image: state.listImage };
        const defaultValues = productForm.formState.defaultValues; // Lấy giá trị ban đầu
        const result = JSON.stringify(defaultValues) === JSON.stringify(formUpdate);

        if (state.modalConfig.action === 'update' && result) {
            return message.error('Không có gì thay đổi');
        }
        try {
            const service =
                state.modalConfig.type === 'product'
                    ? state.modalConfig.action === 'update'
                        ? adminService.updateProduct
                        : adminService.createProduct
                    : adminService.createCategory;
            const result = await service(formUpdate);
            if (result.success) {
                message.success(result.message);
                state.modalConfig.type === 'product' ? refetchProduct() : refetchCategory();
                setIsLoading(false);
            }
            state.modalConfig.type === 'product' ? productForm.reset(resetData) : categoryForm.reset();
            setState({ ...state, modalConfig: { open: false, type: '', action: '' }, listImage: [] });
        } catch (error) {
            setIsLoading(true);
            message.error(error.response?.data?.message || 'Lỗi');
        }
    };

    // set lại idCheckbox=[] để button xóa disable
    const handleShowTable = (type) => setState({ ...state, type, idCheckbox: [] });

    const handleClickUpdate = (id) => {
        const item = dataProduct?.data?.find((item) => item._id === id);
        // lấy id ra để handleSubmit nhận được
        setState({
            ...state,
            idCheckbox: [item?._id],
            modalConfig: { open: true, type: 'product', action: 'update' },
            listImage: item?.image,
        });
        productForm.reset(item);
    };

    const handleCancel = () => {
        setState({ ...state, modalConfig: { open: false, type: '' }, listImage: [] });
        state.modalConfig.type === 'product' ? productForm.reset(resetData) : categoryForm.reset();
    };

    const handleUpload = (info) => {
        const newFiles = info?.fileList; // Danh sách ảnh mới
        const isValid = newFiles.every((file) => validImageTypes.includes(file.type));
        if (!isValid) {
            return message.error('Chỉ được upload file ảnh hợp lệ!');
        }
        // Tạo một mảng các promises để đảm bảo tất cả FileReader đã hoàn thành
        const promises = newFiles.map((file) => {
            return new Promise((resolve, reject) => {
                if (!file.thumbUrl) {
                    const reader = new FileReader();
                    reader.readAsDataURL(file.originFileObj);
                    reader.onload = () => {
                        resolve({
                            ...file,
                            key: file.uid,
                            thumbUrl: reader.result, // Đảm bảo có thumbUrl
                        });
                    };
                    reader.onerror = reject; // Nếu có lỗi, reject promise
                } else {
                    resolve(file); // Nếu đã có thumbUrl, giữ nguyên file
                }
            });
        });

        Promise.all(promises)
            .then((updatedFiles) => {
                // Cập nhật lại listImage trong state sau khi tất cả các thumbUrl đã được tạo
                setState((prevState) => ({
                    ...prevState,
                    listImage: updatedFiles, // Cập nhật danh sách thumbUrl
                }));
            })
            .catch((error) => {
                console.error('Error reading file:', error);
                message.error('Đã có lỗi khi tải lên ảnh.');
            });
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
                            key: file.uid || file._id || index.toString(), // Đảm bảo có key duy nhất
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
                    {images?.slice(0, 2).map((item, index) => (
                        <img key={index} src={item.thumbUrl} alt="Product" style={{ width: '50px', height: '50px' }} />
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
            { title: 'Giá', dataIndex: 'price', width: 100, render: (price) => formatNumber(Number(price)) },
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
            <Button disabled={!state.idCheckbox?.length} onClick={handleDelete} style={{ marginBottom: '10px' }}>
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
