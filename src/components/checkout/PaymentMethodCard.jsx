import React from 'react';
import { Card, Radio } from 'antd';

const PaymentMethodCard = ({ paymentMethods, selectedPayment, setSelectedPayment }) => {
    return (
        <Card title="Phương thức thanh toán" className="mb-6">
            <Radio.Group onChange={(e) => setSelectedPayment(e.target.value)} value={selectedPayment}>
                {paymentMethods?.map((method) => (
                    <div key={method.id} style={{ marginBottom: 10, display: 'flex' }}>
                        <Radio value={method.label}>
                            <div className="flex items-center gap-3">{method?.label}</div>
                        </Radio>
                    </div>
                ))}
            </Radio.Group>
        </Card>
    );
};

export default PaymentMethodCard;
