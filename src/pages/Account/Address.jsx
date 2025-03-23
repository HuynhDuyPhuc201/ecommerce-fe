import { Button, Col, message, Row } from 'antd';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { userService } from '~/services/user.service';
import { setUser } from '~/core/token';
import AddressItem from '~/components/Address/AddressItem';

const Address = () => {
    const addressForm = useForm({ mode: 'onChange' });
    const [createAddress, setCreateAddress] = useState(false);
    const [loading, setLoading] = useState(false);
    const onSubmit = async (form) => {
        try {
            setLoading(true);
            const result = await userService.createAddress(form);
            if (result.success) {
                message.success(result.message);
                addressForm.reset({
                    houseNumber: '',
                    district: '',
                    city: '',
                    defaultAddress: false,
                });
                setUser(result.userUpdate);
            }
            setLoading(false);
            return setCreateAddress(false);
        } catch (error) {
            setLoading(false);
            message.error(error.response.data?.message);
        }
    };

    const hanldeCreate = () => {
        setCreateAddress(true);
    };

    return (
        <div className="w-full mx-auto bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center my-6">
                {createAddress && (
                    <Button icon={<ArrowLeftOutlined />} onClick={() => setCreateAddress(false)}>
                        Quay lại
                    </Button>
                )}
                <h2 className="text-2xl font-semibold text-center flex-1">Thông tin tài khoản</h2>
            </div>

            {createAddress ? (
                <>
                    <FormProvider {...addressForm}>
                        <form onSubmit={addressForm.handleSubmit(onSubmit)}>
                            <Row gutter={[24, 24]} align="top">
                                <Col span={12}>
                                    <label className="block text-gray-700">Số nhà</label>
                                    <input
                                        {...addressForm.register('houseNumber')}
                                        type="text"
                                        className="w-full p-2 border rounded-lg"
                                        placeholder=""
                                    />
                                </Col>

                                <Col span={12}>
                                    <label className="block text-gray-700">Quận / huyện</label>
                                    <input
                                        {...addressForm.register('district')}
                                        type="text"
                                        className="w-full p-2 border rounded-lg"
                                        placeholder=""
                                    />
                                </Col>

                                <Col xs={24} md={24}>
                                    <label className="block text-gray-700">Thành phố</label>
                                    <input
                                        {...addressForm.register('city')}
                                        type="text"
                                        className="w-full p-2 border rounded-lg"
                                        placeholder=""
                                    />
                                </Col>

                                <Col xs={24} md={8}>
                                    <Col xs={24} md={24}>
                                        <div className="flex items-center gap-3">
                                            <label className="block text-gray-700">Địa chỉ mặc định</label>
                                            <input
                                                {...addressForm.register('defaultAddress')}
                                                type="checkbox"
                                                className="p-2 border rounded-lg"
                                            />
                                        </div>
                                    </Col>
                                </Col>
                            </Row>

                            <div className="flex items-center justify-center mt-6" disabled={loading}>
                                <button className="w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </FormProvider>
                </>
            ) : (
                <AddressItem />
            )}

            {!createAddress && (
                <div className="flex item-center justify-center">
                    <Button
                        onClick={hanldeCreate}
                        className="w-[30%]  bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5"
                    >
                        Tạo mới
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Address;
