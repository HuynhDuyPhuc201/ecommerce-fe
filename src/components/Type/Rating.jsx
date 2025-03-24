import { Row } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RatingItem } from './RatingItem';
import { startArr } from '~/constants/dummyData';
import { useSearchParams } from 'react-router-dom';

const Rating = ({ ratingObj }) => {
    const { updateRating } = ratingObj;
    const [selectRating, setSelectRating] = useState(null);

    const [searchParams] = useSearchParams();
    const ratingParams = useMemo(() => searchParams.get('rating'), [searchParams] || '');

    const handleRatingChange = useCallback(
        (e) => {
            const value = e.target?.value;
            setSelectRating((prev) => {
                const newRating = prev === value ? null : value;
                updateRating(newRating);
                return newRating;
            });
        },
        [updateRating, selectRating],
    );

    // Khi component mount, nếu ratingParams === null, updateRating('') sẽ chạy ngay.
    // Điều này thay đổi searchParams, làm component re-render vô tận.
    // Thêm điều kiện kiểm tra selectRating !== null để tránh re-render không cần thiết:
    useEffect(() => {
        if (ratingParams === null && selectRating !== null) {
            setSelectRating(null);
            updateRating('');
        }
    }, [ratingParams, selectRating]);

    return (
        <>
            <div className="category bg-[#fff] rounded-[8px] p-10 w-full my-2">
                <p className="text-[20px] text-[#333] font-bold mb-5">Đánh giá</p>
                <Row>
                    {startArr?.map((item) => (
                        <RatingItem
                            key={item.value}
                            value={item.value}
                            onChange={handleRatingChange}
                            checked={selectRating === item.value}
                        />
                    ))}
                </Row>
            </div>
        </>
    );
};

export default Rating;
