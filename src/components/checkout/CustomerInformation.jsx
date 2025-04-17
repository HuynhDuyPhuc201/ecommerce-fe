import React from 'react';
import { Card, Row, Col } from 'antd';
import { FormProvider } from 'react-hook-form';

const CustomerInformation = ({ addressForm, onSubmitOrder, user, addressLocal, checkoutInfo }) => {
    if (user) return null;

    return (
        <Card title="Thông tin khách hàng" className="mb-6">
            <FormProvider {...addressForm}>
                <form onSubmit={addressForm.handleSubmit(onSubmitOrder)}>
                    <Row gutter={[24, 24]} align="top">
                        <Col span={12}>
                            <label className="block text-gray-700">Họ tên</label>
                            <input
                                {...addressForm.register('name', {
                                    required: 'Trường này là bắt buộc',
                                    validate: (value) => value.trim() !== '' || 'Không được để trống khoảng trắng',
                                })}
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                placeholder=""
                            />
                            {addressForm?.formState?.errors?.name && (
                                <p style={{ color: 'red' }}>{addressForm?.formState?.errors?.name.message}</p>
                            )}
                        </Col>
                        <Col span={12}>
                            <label className="block text-gray-700">Email</label>
                            <input
                                {...addressForm.register('email', {
                                    required: 'Trường này là bắt buộc',
                                    validate: (value) => value.trim() !== '' || 'Không được để trống khoảng trắng',
                                })}
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                placeholder=""
                            />
                            {addressForm?.formState?.errors?.email && (
                                <p style={{ color: 'red' }}>{addressForm?.formState?.errors?.email.message}</p>
                            )}
                        </Col>
                        <Col span={!checkoutInfo?.shippingAddress ? 12 : 24}>
                            <label className="block text-gray-700">Số điện thoại</label>
                            <input
                                {...addressForm.register('phone', {
                                    required: 'Trường này là bắt buộc',
                                    validate: (value) => value.trim() !== '' || 'Không được để trống khoảng trắng',
                                })}
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                placeholder=""
                            />
                            {addressForm?.formState?.errors?.phone && (
                                <p style={{ color: 'red' }}>{addressForm?.formState?.errors?.phone.message}</p>
                            )}
                        </Col>
                        {!addressLocal && (
                            <>
                                <Col span={12}>
                                    <label className="block text-gray-700">Số nhà</label>
                                    <input
                                        {...addressForm.register('houseNumber', {
                                            required: 'Trường này là bắt buộc',
                                            validate: (value) =>
                                                value.trim() !== '' || 'Không được để trống khoảng trắng',
                                        })}
                                        type="text"
                                        className="w-full p-2 border rounded-lg"
                                        placeholder=""
                                    />
                                    {addressForm?.formState?.errors?.houseNumber && (
                                        <p style={{ color: 'red' }}>
                                            {addressForm?.formState?.errors?.houseNumber.message}
                                        </p>
                                    )}
                                </Col>
                                <Col span={12}>
                                    <label className="block text-gray-700">Quận / huyện</label>
                                    <input
                                        {...addressForm.register('district', {
                                            required: 'Trường này là bắt buộc',
                                            validate: (value) =>
                                                value.trim() !== '' || 'Không được để trống khoảng trắng',
                                        })}
                                        type="text"
                                        className="w-full p-2 border rounded-lg"
                                        placeholder=""
                                    />
                                    {addressForm?.formState?.errors?.district && (
                                        <p style={{ color: 'red' }}>
                                            {addressForm?.formState?.errors?.district.message}
                                        </p>
                                    )}
                                </Col>
                                <Col span={24}>
                                    <label className="block text-gray-700">Thành phố</label>
                                    <input
                                        {...addressForm.register('city', {
                                            required: 'Trường này là bắt buộc',
                                            validate: (value) =>
                                                value.trim() !== '' || 'Không được để trống khoảng trắng',
                                        })}
                                        type="text"
                                        className="w-full p-2 border rounded-lg"
                                        placeholder=""
                                    />
                                    {addressForm?.formState?.errors?.city && (
                                        <p style={{ color: 'red' }}>{addressForm?.formState?.errors?.city.message}</p>
                                    )}
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
