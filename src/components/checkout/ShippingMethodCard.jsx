import React from 'react';
import { Card, Radio } from 'antd';
import { formatNumber } from '~/utils/formatNumber';

const ShippingMethodCard = ({ shippingOptions, shippingMethod, handleShippingMethod }) => {
    return (
        <Card title="Phương thức giao hàng" className="mb-6">
            <Radio.Group
                onChange={handleShippingMethod}
                value={shippingMethod}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
                {shippingOptions?.map((option) => (
                    <Radio key={option.value} value={option.value}>
                        {option.label} - {formatNumber(option.price || 0)}₫
                    </Radio>
                ))}
            </Radio.Group>
        </Card>
    );
};

export default ShippingMethodCard;
