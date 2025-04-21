import { Row } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatNumber } from '~/core';
import './type.css';
const Price = ({ priceObj }) => {
    const { price, updatePrice } = priceObj;

    const [priceValue, setPriceValue] = useState(price || 0);

    const [searchParams] = useSearchParams();
    const priceParams = useMemo(() => searchParams.get('price'), [searchParams]);

    const handleSliderChange = (e) => {
        const value = e.target.value;
        setPriceValue(value);
        updatePrice(value);
    };

    // bị tương tự như rating
    useEffect(() => {
        if (priceParams === null && priceValue !== 0) {
            setPriceValue(0);
            updatePrice('');
        }
    }, [priceParams, priceValue]);

    return (
        <div className="category bg-[#fff] rounded-[8px] p-10 w-full my-2">
            <p className="text-[20px] text-[#333] font-bold mb-5">Giá</p>
            <Row>
                <div className="flex justify-between mb-10 items-center w-full">
                    <span className="p-2 bg-slate-200 rounded-[10px] mr-2">0</span>
                    <div className="w-full">
                        {/* Label ẩn để mô tả cho screen reader */}
                        <label htmlFor="price-slider" className="sr-only">
                            Chọn mức giá từ 0 đến 5 triệu
                        </label>
                        <input
                            id="price-slider"
                            type="range"
                            min="0"
                            max="5000000"
                            value={priceValue}
                            onChange={handleSliderChange}
                            className="w-[100%] h-2 bg-gray-200 rounded-lg cursor-pointer"
                            aria-valuemin={0}
                            aria-valuemax={5000000}
                            aria-valuenow={priceValue}
                            aria-label="Chọn mức giá từ 0 đến 5 triệu"
                        />
                    </div>
                    <span className="p-2 bg-slate-200 rounded-[10px] ml-2">5.000.000</span>
                </div>

                <div className="text-center text-2xl text-gray-800">
                    <span className="text-[14px]">Giá từ:</span>{' '}
                    <span className="p-2 text-[14px]">{`0 - ${formatNumber(Number(priceValue))}`}₫</span>
                </div>
            </Row>
        </div>
    );
};

export default Price;
