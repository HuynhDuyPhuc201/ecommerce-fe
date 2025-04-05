import { Checkbox, Col, Rate } from 'antd';
import { memo } from 'react';

export const RatingItem = memo(({ value, checked, onChange }) => {
    return (
        <Col span={24}>
            <div className="flex items-start flex-col mt-4">
                <span className="">Từ {value} sao:</span>
                <Checkbox value={value} onChange={onChange} checked={checked}>
                    <Rate defaultValue={value} disabled style={{ fontSize: '12px' }} />
                </Checkbox>
            </div>
        </Col>
    );
});
