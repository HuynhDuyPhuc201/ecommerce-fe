import React from 'react';
import { FormProvider } from 'react-hook-form';
import InputForm from '../InputForm';
import { Col, Row } from 'antd';

function UpdateAddressForm(useForm, onSubmit) {
    return (
        <FormProvider {...useForm}>
            <form onSubmit={useForm.handleSubmit(onSubmit)}>
                <Row gutter={[24, 24]} align="top">
                    <Col span={12}>
                        <InputForm
                            error={useForm.formState.errors['houseNumber']}
                            placeholder=""
                            name="houseNumber"
                            required={false}
                            label={'Số nhà'}
                        />
                    </Col>
                    <Col span={12}>
                        <InputForm
                            error={useForm.formState.errors['district']}
                            placeholder=""
                            name="district"
                            required={false}
                            label={'Quận / huyện'}
                        />
                    </Col>
                    <Col span={12}>
                        <InputForm
                            error={useForm.formState.errors['city']}
                            placeholder="Nhập địa chỉ"
                            name="city"
                            required={false}
                            label={'Thành phố'}
                        />
                    </Col>
                </Row>

                <div className="flex items-center justify-center mt-6">
                    <button className="w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Thêm địa chỉ
                    </button>
                </div>
            </form>
        </FormProvider>
    );
}

export default UpdateAddressForm;
