import { Checkbox, Col, Rate } from 'antd';
import { memo } from 'react';

export const RatingItem = memo(({ value, checked, onChange }) => {
    return (
        <Col span={24}>
            <div className="flex items-start flex-col mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                        value={value}
                        onChange={onChange}
                        checked={checked}
                        aria-label={`Lọc đánh giá từ ${value} sao`}
                    />
                    <Rate value={value} disabled style={{ fontSize: '12px' }} />
                    <span className="ml-2 text-2xl">Từ {value} sao</span>
                </label>
            </div>
        </Col>
    );
});
