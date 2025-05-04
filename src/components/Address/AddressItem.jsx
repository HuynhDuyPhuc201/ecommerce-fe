import React, { useState } from 'react';
import { Card, Button, message, Row, Col, Modal, Alert } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { userService } from '~/services/user.service';
import { useForm } from 'react-hook-form';
import useGetUserDetail from '~/hooks/useGetUserDetail';
import UpdateAddressForm from '../Form/UpdateAddressForm';

const AddressItem = () => {
    const [modalConfig, setModalConfig] = useState(false);
    const addressForm = useForm({ mode: 'onChange' });
    const [addressId, setAddressId] = useState();
    const { data, refetch } = useGetUserDetail();

    const handleRemove = async (id) => {
        try {
            const result = await userService.removeAddress(`?id=${id}`);
            if (result.success) {
                message.success(result.message);
                refetch();
            }
        } catch (error) {
            message.error(error);
        }
    };

    const handleUpdate = (id) => {
        setModalConfig(true);
        const itemAddress = data?.address.find((item) => item?._id === id) || {};
        setAddressId(id);
        addressForm.reset(itemAddress);
    };

    const onSubmit = async (form) => {
        const updateForm = { ...form, addressId };
        try {
            const result = await userService.updateAddress(updateForm);
            if (result.success) {
                message.success(result.message);
                refetch();
                addressForm.reset({});
                setModalConfig(false);
            }
        } catch (error) {
            message.error(error);
        }
    };

    const handleCancel = () => {
        setModalConfig(false);
    };

    return (
        <>
            {!data?.address?.length && <p className="text-[20px] text-center py-10">Chưa cập nhật địa chỉ</p>}
            <Row gutter={[24, 24]} justify="center">
                {data?.address?.map((item) => (
                    <Col xs={24} sm={12} md={24} lg={12} key={item?._id}>
                        <Card style={{ position: 'relative', padding: '10px' }}>
                            <p>Số nhà: {item?.houseNumber}</p>
                            <p>Đường: {item?.district}</p>
                            <p>Thành phố: {item?.city}</p>
                            <div className="flex justify-between">
                                <Button
                                    type="primary"
                                    style={{ marginRight: 10, marginTop: '10px' }}
                                    onClick={() => handleUpdate(item?._id)}
                                >
                                    Cập nhật
                                </Button>
                                {item?.defaultAddress && (
                                    <Alert  style={{ margin: '10px 10px 0 0', color: 'red'}}  message='Mặc định' type="error" />
                                )}
                            </div>
                            <div
                                className="absolute top-3 right-5 cursor-pointer"
                                onClick={() => handleRemove(item?._id)}
                            >
                                <CloseOutlined />
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal title="Cập nhật địa chỉ" open={modalConfig} onCancel={handleCancel} footer={null}>
                <UpdateAddressForm onSubmit={onSubmit} useForm={addressForm} />
            </Modal>
        </>
    );
};

export default AddressItem;
