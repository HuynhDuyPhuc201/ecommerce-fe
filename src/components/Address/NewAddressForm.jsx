import React from 'react';
import { Card, Row, Col } from 'antd';
import { FormProvider } from 'react-hook-form';
import InputForm from '../InputForm';

const NewAddressForm = ({ addressForm, onSubmitOrder, addressLocal, user, dataUserDetail }) => {
    if (!user || !dataUserDetail || dataUserDetail?.address?.length > 0) return null;

    return (
        <Card title="Thêm thông tin địa chỉ" className="mb-6">
            <FormProvider {...addressForm}>
                <form onSubmit={addressForm.handleSubmit(onSubmitOrder)}>
                    <Row gutter={[24, 24]} align="top">
                        <Col span={12}>
                            <InputForm
                                error={addressForm.formState.errors['houseNumber']}
                                placeholder=""
                                name="houseNumber"
                                required={true}
                                label='Số nhà'
                            />
                        </Col>
                        <Col span={12}>
                            <InputForm
                                error={addressForm.formState.errors['district']}
                                placeholder=""
                                name="district"
                                required={true}
                                label='Quận / huyện'
                            />
                        </Col>
                        <Col span={24}>
                            <InputForm
                                error={addressForm.formState.errors['city']}
                                placeholder="Nhập địa chỉ"
                                name="city"
                                required={true}
                                label='Thành phố'
                            />
                        </Col>
                    </Row>
                </form>
            </FormProvider>
        </Card>
    );
};

export default NewAddressForm;
