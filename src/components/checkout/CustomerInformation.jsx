import React from 'react';
import { Card, Row, Col } from 'antd';
import { FormProvider } from 'react-hook-form';
import InputForm from '../InputForm';
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, PHONE_RULE, PHONE_RULE_MESSAGE } from '~/utils/validator';

const CustomerInformation = ({ addressForm, onSubmitOrder, user, addressLocal, checkoutInfo }) => {
    if (user) return null;

    return (
        <Card title="Thông tin khách hàng" className="mb-6">
            <FormProvider {...addressForm}>
                <form onSubmit={addressForm.handleSubmit(onSubmitOrder)}>
                    <Row gutter={[24, 24]} align="top">
                        <Col span={12}>
                            <label className="block text-gray-700">Họ tên</label>
                            <InputForm
                                error={addressForm.formState.errors['name']}
                                name="name"
                                type="text"
                                required={true}
                            />
                        </Col>
                        <Col span={12}>
                            <label className="block text-gray-700">Email</label>
                            <InputForm
                                error={addressForm.formState.errors['email']}
                                name="email"
                                type="text"
                                required={true}
                                pattern={{
                                    value: EMAIL_RULE,
                                    message: EMAIL_RULE_MESSAGE,
                                }}
                            />
                        </Col>
                        <Col span={!checkoutInfo?.shippingAddress ? 12 : 24}>
                            <label className="block text-gray-700">Số điện thoại</label>
                            <InputForm
                                error={addressForm.formState.errors['phone']}
                                name="phone"
                                type="text"
                                required={true}
                                pattern={{
                                    value: PHONE_RULE,
                                    message: PHONE_RULE_MESSAGE,
                                }}
                            />
                        </Col>
                        {!addressLocal && (
                            <>
                                <Col span={12}>
                                    <label className="block text-gray-700">Số nhà</label>
                                    <InputForm
                                        error={addressForm.formState.errors['houseNumber']}
                                        name="houseNumber"
                                        type="text"
                                        required={true}
                                    />
                                </Col>
                                <Col span={12}>
                                    <label className="block text-gray-700">Quận / huyện</label>
                                    <InputForm
                                        error={addressForm.formState.errors['district']}
                                        name="district"
                                        type="text"
                                        required={true}
                                    />
                                </Col>
                                <Col span={24}>
                                    <label className="block text-gray-700">Thành phố</label>
                                    <InputForm
                                        error={addressForm.formState.errors['city']}
                                        name="city"
                                        type="text"
                                        required={true}
                                    />
                                </Col>
                            </>
                        )}
                    </Row>
                </form>
            </FormProvider>
        </Card>
    );
};

export default CustomerInformation;
