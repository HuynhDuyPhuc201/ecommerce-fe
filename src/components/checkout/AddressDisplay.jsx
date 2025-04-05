import React from 'react';
import { Link } from 'react-router-dom';


const AddressDisplay = ({ addressString, user, path }) => {
  return (
    <div className="category bg-[#fff] rounded-[8px] p-4 w-full my-2">
      <div className="flex justify-between">
        <p className="text-[#333] mb-5">Giao tới</p>
      </div>
      <div className="flex justify-between">
        <span>{addressString || 'Chưa cập nhật địa chỉ'}</span>{' '}
        {!addressString && user && (
          <Link
            to={path.Account.Address}
            style={{ textDecoration: 'underline', color: '#1A94FF' }}
          >
            Cập nhật
          </Link>
        )}
      </div>
    </div>
  );
};

export default AddressDisplay;