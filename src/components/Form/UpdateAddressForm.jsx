import React from 'react';
import { FormProvider } from 'react-hook-form';
import InputForm from '../InputForm';
import { Col, Row } from 'antd';

function UpdateAddressForm({ useForm, onSubmit, defaultAddress = false }) {
    return (
        <FormProvider {...useForm}>
            <form onSubmit={useForm.handleSubmit(onSubmit)}>
                <Row gutter={[24, 24]} align="top">
                    <Col span={12}>
                        <InputForm
                            error={useForm.formState.errors['houseNumber']}
                            name="houseNumber"
                            required={true}
                            label="Số nhà"
                        />
                    </Col>
                    <Col span={12}>
                        <InputForm
                            error={useForm.formState.errors['district']}
                            name="district"
                            required={true}
                            label="Quận / huyện"
                        />
                    </Col>
                    <Col span={24}>
                        <InputForm
                            error={useForm.formState.errors['city']}
                            name="city"
                            required={true}
                            label="Thành phố"
                        />
                    </Col>
                    {defaultAddress && (
                        <Col span={24}>
                            <div className="flex items-center justify-start gap-3">
                                <label className="block text-gray-700">Địa chỉ mặc định</label>
                                <div className="w-30">
                                    <InputForm
                                        error={useForm.formState.errors['defaultAddress']}
                                        name="defaultAddress"
                                        type="checkbox"
                                        className="p-2 border rounded-lg"
                                    />
                                </div>
                            </div>
                        </Col>
                    )}
                </Row>

                <div className="flex items-center justify-center mt-6">
                    <button className="w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Cập nhật
                    </button>
                </div>
            </form>
        </FormProvider>
    );
}

export default UpdateAddressForm;
