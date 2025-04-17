import React from 'react';
import { useFormContext } from 'react-hook-form';

const InputForm = ({ label, placeholder, name, type, error, required, ...props }) => {
    const { register } = useFormContext(); // Lấy errors từ form context
    return (
        <>
            {label && <label className="block text-gray-700">{label}</label>}
            <input
                {...register?.(name, {
                    required: required === true && `Trường này là bắt buộc`,
                    validate: (value) => value.trim() !== '' || 'Không được để trống khoảng trắng',
                })}
                placeholder={placeholder}
                type={type}
                style={{
                    border: 'none',
                    borderBottom: '1px solid #888',
                    borderRadius: '0px',
                    width: '100%',
                    padding: '10px',
                    outline: 'none',
                }}
                {...props}
            />
            {/* Hiển thị lỗi nếu có */}
            {error && <p style={{ color: 'red' }}>{error.message}</p>}
        </>
    );
};

export default InputForm;
