import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FIELD_REQUIRED_MESSAGE } from '~/utils/validator';

const InputForm = ({ label, placeholder, name, type, required, error, pattern, ...props }) => {
    const { register } = useFormContext();
    return (
        <>
            {label && <label className="block text-gray-700">{label}</label>}
            <input
                {...register?.(name, {
                    required: required === true && FIELD_REQUIRED_MESSAGE,
                    pattern: pattern && {
                        value: pattern?.value,
                        message: pattern?.message || 'Không đúng định dạng',
                    },
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
            {error && <p style={{ color: 'red' }}>{error?.message || ""}</p>}
        </>
    );
};

export default InputForm;
