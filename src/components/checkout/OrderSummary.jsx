import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { formatNumber } from '~/core';



const OrderSummary = ({
  checkoutInfo,
  path,
  shippingFee,
  discountCode,
  newSubTotal,
  loading,
  setDiscountCode,
  handleCloseDiscount,
  handleDiscount,
  onSubmitOrder,
  addressForm
}) => {
  const subTotal = checkoutInfo?.subTotal || (checkoutInfo?.price * checkoutInfo?.quantity) || 0;
  const itemCount = checkoutInfo?.orderItems?.length || (checkoutInfo?.name && 1) || 0;

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

      {discountCode.discountAmount > 0 && (
        <div className="flex justify-between text-gray-700 mt-2">
          <span>Mã giảm giá</span>
          <span className="text-[red]">
            -{formatNumber(discountCode.discountAmount || 0)}đ
            <Button
              style={{ width: '10px', fontSize: '10px', marginLeft: '10px' }}
              onClick={handleCloseDiscount}
            >
              X
            </Button>
          </span>
        </div>
      )}
      
      <div className="flex justify-between text-gray-700 mt-2">
        <span>Giảm giá</span>
        <input
          type="text"
          onChange={(e) =>
            setDiscountCode({
              code: e.target.value,
              discountAmount: discountCode.discountAmount,
            })
          }
          value={discountCode.code}
          placeholder="GIAM30, GIAM10"
          className="text-[13px] w-[60%] outline-none border-r-none border-l-none border-t-none border-b-[2px]"
        />
      </div>
      
      <div className="flex justify-between font-bold mt-4">
        <span>Tổng tiền thanh toán</span>
        <span>{formatNumber(newSubTotal || 0)}đ</span>
      </div>
      
      <p className="text-sm text-gray-500">(Đã bao gồm VAT nếu có)</p>
      
      {discountCode.code ? (
        <button
          className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600"
          onClick={handleDiscount}
        >
          Áp dụng
        </button>
      ) : (
        <button
          className={`mt-4 w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 ${
            loading ? 'opacity-50' : 'opacity-100'
          }`}
          onClick={addressForm.handleSubmit(onSubmitOrder)}
          disabled={loading}
        >
          Đặt hàng ({itemCount})
        </button>
      )}
    </div>
  );
};

export default OrderSummary;
