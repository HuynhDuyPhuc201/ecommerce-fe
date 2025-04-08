import { Button, Col, Modal, Rate, Row } from 'antd';
import { useState } from 'react';
import { Controller, FormProvider } from 'react-hook-form';
import InputForm from '~/components/InputForm';

export const ModalForm = ({ title, isOpen, onCancel, methods, onSubmit, fields, isLoading }) => {
    return (
        <FormProvider {...methods}>
            <Modal title={title} open={isOpen} onCancel={onCancel} footer={null}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <Row gutter={[18, 18]}>
                        {fields.map((field, i) => (
                            <Col sm={24} xs={24} md={12} key={i}>
                                <label className="block text-gray-700">{field.label}</label>
                                {!field.type && (
                                    <>
                                        <div className="realative">
                                            <InputForm
                                                error={methods.formState.errors[field.name]}
                                                placeholder={field.placeholder}
                                                name={field.name}
                                                required={field.required}
                                                type={
                                                    ['password', 'confirmPassword'].includes(field.name)
                                                        ? 'password'
                                                        : 'text'
                                                }
                                                disabled={['id'].includes(field.name)}
                                            />
                                            <div className="pt-[10px] ">{field?.button}</div>
                                        </div>
                                    </>
                                )}

                                {field.type === 'select' && (
                                    <>
                                        <select
                                            id={field.name}
                                            name={field.name}
                                            defaultValue="" // Giữ nguyên giá trị mặc định
                                            {...methods.register(field.name)}
                                            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="" disabled>
                                                Chọn một giá trị
                                            </option>
                                            {field?.data?.map((item, i) => (
                                                <option key={i} value={item.id}>
                                                    {item.title}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                )}
                                {field.type === 'rating' && (
                                    <div className="pt-5">
                                        {/* {...methods.register(field.name)} không dùng này vs Rate của antd
                                        - nó sẽ gây lỗi Cannot read properties of undefined (reading 'target')
                                         */}
                                        {/* <Rate
                                            allowHalf
                                            defaultValue={0}
                                            {...methods.register(field.name)}
                                            onChange={(value) => methods.setValue(field.name, value)}
                                        /> */}
                                        <Controller
                                            name={field.name}
                                            control={methods.control}
                                            defaultValue={0}
                                            render={({ field }) => (
                                                <Rate
                                                    allowHalf
                                                    {...field}
                                                    onChange={(value) => field.onChange(value)}
                                                />
                                            )}
                                        />
                                    </div>
                                )}
                                {['avatar', 'photo'].includes(field.type) && <>{field?.render}</>}
                            </Col>
                        ))}
                        <div className="flex items-center justify-center w-full">
                            <button
                                className={`w-1/2 mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${isLoading ? "opacity-50" : "opacity-100"}`}
                                disabled={isLoading}
                            >
                                {title}
                            </button>
                        </div>
                    </Row>
                </form>
            </Modal>
        </FormProvider>
    );
};
