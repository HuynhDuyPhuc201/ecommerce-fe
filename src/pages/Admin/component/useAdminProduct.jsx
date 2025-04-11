import { useState, useCallback, useMemo } from 'react';
import { message, Modal } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { productService } from '~/services/product.service';
import { adminService } from '~/services/admin.service';
import { validImageTypes } from '~/core';

export const useAdminProduct = () => {
  const [state, setState] = useState({
    type: 'product',
    modalConfig: { open: false, type: '', action: '' },
    idCheckbox: [],
    currentPage: 1,
    listImage: [],
    removedImages: [],
  });

  // Memoize query parameters to prevent unnecessary refetches
  const productQueryKey = useMemo(() => ['products', state.currentPage], [state.currentPage]);
  const categoryQueryKey = useMemo(() => ['category'], []);
  const discountQueryKey = useMemo(() => ['discount'], []);

  // Product data query
  const { 
    data: dataProduct, 
    refetch: refetchProduct 
  } = useQuery({
    queryKey: productQueryKey,
    queryFn: async () => await productService.getAll(`?limit=5&page=${state.currentPage}`),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Category data query
  const { 
    data: dataCategory, 
    refetch: refetchCategory 
  } = useQuery({
    queryKey: categoryQueryKey,
    queryFn: async () => await productService.getCategory(),
    staleTime: 5 * 60 * 1000,
  });

  // Discount data query
  const { 
    data: dataDiscount, 
    refetch: refetchDiscount 
  } = useQuery({
    queryKey: discountQueryKey,
    queryFn: async () => await adminService.getAllDiscount(),
  });

  // Handle file upload
  const handleUpload = useCallback((info) => {
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

    setState(prevState => {
      // So sánh với ảnh cũ để tìm ảnh bị xoá
      const removed = prevState.listImage.filter((oldFile) => 
        !newFiles.some((newFile) => newFile.uid === oldFile.uid)
      );

      // Lưu lại ảnh bị xóa để gửi qua backend (cloudinary)
      const removedImages = [
        ...prevState.removedImages,
        ...removed
          .map((file) => file?.url || file?.thumbUrl) // Cloudinary URL
          .filter((url) => !!url)
      ];

      return {
        ...prevState,
        listImage: updatedFiles,
        removedImages,
      };
    });
  }, []);

  // Confirmation dialog for deletion
  const showDeleteConfirm = useCallback((onOk) => {
    Modal.confirm({
      title: 'Xác nhận xóa sản phẩm',
      content: 'Bạn có chắc chắn muốn xóa sản phẩm này không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        onOk();
      },
      onCancel() {
        console.log('Hủy xóa');
      },
    });
  }, []);

  // Update state functions
  const setModalConfig = useCallback((config) => {
    setState(prev => ({
      ...prev,
      modalConfig: config
    }));
  }, []);

  const setType = useCallback((type) => {
    setState(prev => ({
      ...prev,
      type,
      idCheckbox: []
    }));
  }, []);

  const setIdCheckbox = useCallback((ids) => {
    setState(prev => ({
      ...prev,
      idCheckbox: ids
    }));
  }, []);

  const setCurrentPage = useCallback((page) => {
    setState(prev => ({
      ...prev,
      currentPage: page
    }));
  }, []);

  const resetState = useCallback(() => {
    setState(prev => ({
      ...prev,
      modalConfig: { open: false, type: '', action: '' },
      listImage: []
    }));
  }, []);

  const handleUpdateItem = useCallback((id, type) => {
    if (type === 'product') {
      const item = dataProduct?.data?.find((item) => item._id === id);
      // Chuyển mảng URL thành định dạng fileList như của Upload
      const imageList =
        item?.image?.map((url, index) => {
          return {
            uid: `existing-${index}`,
            name: `${url?.split('/').pop().split('-').slice(-1).join('-')}`,
            status: 'done',
            url: url,
            thumbUrl: url,
            originFileObj: null,
            type: 'image/jpeg',
            existing: true,
          };
        }) || [];

      setState(prev => ({
        ...prev,
        idCheckbox: [item?._id],
        modalConfig: { open: true, type: 'product', action: 'update' },
        listImage: imageList,
      }));
    } else if (type === 'discount') {
      const item = dataDiscount?.data?.find((item) => item._id === id);
      setState(prev => ({
        ...prev,
        idCheckbox: [item?._id],
        modalConfig: { open: true, type: 'discount', action: 'update' },
      }));
    }
  }, [dataProduct, dataDiscount]);

  // Memoize constructed data table with optimized categories
  const dataTableProduct = useMemo(() => 
    dataProduct?.data?.map((item) => ({
      ...item,
      categories: dataCategory?.find((cate) => cate.id === item.categories)?.title || 'Không xác định',
    })),
    [dataProduct?.data, dataCategory]
  );

  // Memoize query string for bulk operations
  const queryString = useMemo(() => 
    state.idCheckbox.map((id) => `id=${id}`).join('&'), 
    [state.idCheckbox]
  );

  return {
    state,
    dataProduct,
    dataCategory,
    dataDiscount,
    dataTableProduct,
    queryString,
    refetchProduct,
    refetchCategory,
    refetchDiscount,
    handleUpload,
    showDeleteConfirm,
    setModalConfig,
    setType,
    setIdCheckbox,
    setCurrentPage,
    resetState,
    handleUpdateItem
  };
};