import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button, Modal } from 'antd';
import { formatNumber } from '~/core';
import { formattedDate } from '~/core/utils/formatDate';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '~/services/order.service';

const OrderSummary = ({
    checkoutInfo,
    path,
    shippingFee,
    totalPrice,
    loading,
    onSubmitOrder,
    addressForm,
    handleOpen,
    handleCancle,
    isModalOpen,
    selectedDiscount,
    discountPriced,
    handleSearchDiscount,
    handleDiscount,
    dataDiscount,
    searchDiscount,
}) => {
    const subTotal = checkoutInfo?.subTotal || checkoutInfo?.price * checkoutInfo?.quantity || 0;
    const itemCount = checkoutInfo?.orderItems?.length || (checkoutInfo?.name && 1) || 0;

    const { data } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => orderService.getOrder(),
        refetchOnWindowFocus: false, // Tắt refetch khi tab focus lại
        refetchOnReconnect: false, // Tắt refetch khi mạng có lại
    });
    // Memoize findCode
    const findCode = useMemo(() => {
        return dataDiscount?.data
            .filter((itemDiscount) => data?.some((itemData) => itemData?.discount === itemDiscount?.code))
            .map((item) => item?.code);
    }, [dataDiscount, data]);

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex justify-between">
                <p className="text-[#333] mb-5">Đơn hàng</p>
                <Link className="text-[#5351c7] mb-5" to={path.Cart}>
                    Đổi
                </Link>
            </div>

            <div className="flex justify-between text-gray-700">
                <span>Tạm tính</span>
                <span>{formatNumber(subTotal) || 0}đ</span>
            </div>

            <div className="flex justify-between text-gray-700 mt-2">
                <span>Phí vận chuyển</span>
                <span>{formatNumber(shippingFee || 0)}đ</span>
            </div>

            <div className="flex justify-between text-gray-700 mt-2">
                <span>Giảm giá</span>
                <Button onClick={handleOpen}>Mã giảm giá</Button>
            </div>

            {selectedDiscount && (
                <div className="flex justify-between text-gray-700 mt-2">
                    <p>{selectedDiscount.code}</p>
                    <p className="text-[#f11010]">-{formatNumber(discountPriced)}đ</p>
                </div>
            )}

            <div className="flex justify-between font-bold mt-4">
                <span>Tổng tiền thanh toán</span>
                <span>{formatNumber(totalPrice || 0)}đ</span>
            </div>

            <p className="text-sm text-gray-500">(Đã bao gồm VAT nếu có)</p>

            <button
                className={`mt-4 w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 ${
                    loading ? 'opacity-50' : 'opacity-100'
                }`}
                onClick={addressForm.handleSubmit(onSubmitOrder)}
                disabled={loading}
            >
                Đặt hàng ({itemCount})
            </button>

            <Modal
                width={500}
                title="Mã giảm giá"
                open={isModalOpen}
                footer={null}
                onCancel={handleCancle}
                className="text-center"
            >
                <>
                    <div className="flex gap-3 flex-col items-start">
                        <label htmlFor="">Nhập mã giảm giá</label>
                        <input
                            type="text"
                            onChange={handleSearchDiscount}
                            value={searchDiscount}
                            placeholder="Vd: G10, G20,..."
                            className="text-[13px] w-full outline-none border-r-none border-l-none border-t-none border-b-[2px]"
                        />
                    </div>

                    <div className="mt-10 text-left">
                        {dataDiscount?.data &&
                            dataDiscount?.data.map((discount, i) => {
                                return (
                                    discount.isActive &&
                                    discount.usageLimit > 0 && (
                                        <div
                                            className={`p-2 flex items-center justify-between gap-5 ${
                                                findCode.includes(discount.code) && 'opacity-40'
                                            }`}
                                            key={i}
                                        >
                                            <div className="border bg-[#fff] shadow-md p-10 relative">
                                                <div className="">
                                                    <p className="text-2xl text-[#ff1616]">
                                                        {discount.description || ''}
                                                    </p>
                                                    <p className="text-lg">{`Đơn hàng tối thiểu ${formatNumber(
                                                        discount.minOrderValue || 0,
                                                    )}đ`}</p>
                                                    <p className="text-lg">
                                                        Có hiệu lực từ: {''}
                                                        {formattedDate(discount?.startDate)} -{' '}
                                                        {formattedDate(discount?.endDate)}
                                                    </p>
                                                </div>
                                            </div>

                                            <Button className="" onClick={() => handleDiscount(discount._id)}>
                                                {selectedDiscount && selectedDiscount?._id === discount?._id
                                                    ? 'Hủy chọn'
                                                    : ' Chọn mã'}
                                            </Button>
                                        </div>
                                    )
                                );
                            })}
                    </div>
                </>
            </Modal>
        </div>
    );
};

export default OrderSummary;
