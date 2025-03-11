import { Row } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatNumber } from '~/core';
import { useDebounce } from '~/hooks/useDebounce';

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

    useEffect(() => {
        if (priceParams === null) {
            setPriceValue(0);
            updatePrice('');
        }
    }, [priceParams]);

    return (
        <div className="category bg-[#fff] rounded-[8px] p-10 w-full my-2">
            <p className="text-[20px] text-[#333] font-bold mb-5">Giá</p>
            <Row>
                <div className="flex justify-between mb-10 item-center sm:grid-cols w-full">
                    <span className="p-2 bg-slate-200 rounded-[10px] mr-2">0</span>
                    <div className="w-full">
                        <input
                            type="range"
                            min="0"
                            max="5000000"
                            value={priceValue}
                            onChange={handleSliderChange}
                            className="w-[100%] h-2 bg-gray-200 rounded-lg cursor-pointer"
                        />
                    </div>
                    <span className="p-2 bg-slate-200 rounded-[10px]  ml-2">5.000.000</span>
                </div>

                <div
                    className=" text-center text-xl font-semibold text-gray-800 cursor-pointer "
                    // onClick={handlePrice(priceValue)}
                >
                    <span className="text-[16px]">Giá từ:</span>{' '}
                    <span className="p-2 bg-slate-200 rounded-[10px] text-[16px]">
                        {`0 - ${formatNumber(Number(priceValue))}`} VND
                    </span>
                </div>
            </Row>
        </div>
    );
};

export default Price;
