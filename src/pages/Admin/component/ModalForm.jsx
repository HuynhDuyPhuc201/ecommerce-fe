import { Button, Col, Modal, Rate, Row, Switch, Input, Alert } from 'antd';
import { Controller, FormProvider } from 'react-hook-form';
import InputForm from '~/components/InputForm';
import { FIELD_REQUIRED_MESSAGE } from '~/utils/validator';
const { TextArea } = Input;
export const ModalForm = ({ title, isOpen, onCancel, methods, onSubmit, fields, isLoading, action }) => {
    return (
        <FormProvider {...methods}>
            <Modal title={title} open={isOpen} onCancel={onCancel} footer={null}>
                <form onSubmit={methods?.handleSubmit(onSubmit)}>
                    <Row gutter={[18, 18]}>
                        {fields.map((field, i) => (
                            <Col sm={24} xs={24} md={12} key={i}>
                                <label className="block text-gray-700 mb-1">{field.label}</label>
                                <div className="relative">
                                    {['date', 'text', 'password', 'number', undefined].includes(field.type) && (
                                        <InputForm
                                            error={methods?.formState.errors[field.name]}
                                            placeholder={field.placeholder}
                                            name={field.name}
                                            required={field.required}
                                            type={field.type}
                                            disabled={field.name === 'id'}
                                            pattern={field.pattern}
                                        />
                                    )}
                                    {field.type === 'textarea' && (
                                        <Controller
                                            name={field.name}
                                            control={methods?.control}
                                            rules={{ required: field.required && FIELD_REQUIRED_MESSAGE }}
                                            render={({ field: ctrl, fieldState }) => (
                                                <>
                                                    <TextArea
                                                        {...ctrl}
                                                        placeholder={field.placeholder}
                                                        disabled={field.name === 'id'}
                                                        rows={6}
                                                        className="resize-none"
                                                    />
                                                    {fieldState.error && (
                                                        <Alert showIcon  style={{ margin: '5px 0'}} message={fieldState.error.message} type="error" />
                                                    )}
                                                    
                                                </>
                                            )}
                                        />
                                    )}
                                    {field.type === 'select' && (
                                        <>
                                            <select
                                                {...methods?.register(field.name, {
                                                    required: field.required && FIELD_REQUIRED_MESSAGE,
                                                })}
                                                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                                defaultValue=""
                                                disabled={field.name === 'id'}
                                            >
                                                <option value="" disabled>
                                                    Chọn một giá trị
                                                </option>
                                                {field.options?.map((item, i) => (
                                                    <option key={i} value={item.id || item.value}>
                                                        {item.title || item.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {methods?.formState.errors[field.name]?.message && (
                                                <Alert showIcon  style={{ margin: '5px 0'}} message={methods?.formState.errors[field.name]?.message} type="error" />
                                            )}
                                        </>
                                    )}

                                    {field.type === 'rating' && (
                                        <Controller
                                            name={field.name}
                                            control={methods?.control}
                                            rules={{ required: field.required && FIELD_REQUIRED_MESSAGE }}
                                            render={({ field: ctrl, fieldState }) => (
                                                <>
                                                    <Rate {...ctrl} />
                                                    {fieldState.error && (
                                                        <p className="text-red-500 text-sm mt-1">
                                                            {fieldState.error.message}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        />
                                    )}

                                    {field.type === 'switch' && (
                                        <Controller
                                            name={field.name}
                                            control={methods?.control}
                                            defaultValue={true}
                                            render={({ field }) => <Switch {...field} checked={field.value} />}
                                        />
                                    )}

                                    {['avatar', 'photo'].includes(field.type) && field.render}

                                    {field.button && <div className="pt-2">{field.button}</div>}
                                </div>
                            </Col>
                        ))}

                        <Col span={24} className="text-center mt-4">
                            <div className="flex items-center justify-center gap-5">
                                <button
                                    className={`w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                                        isLoading ? 'opacity-50' : 'opacity-100'
                                    }`}
                                    disabled={isLoading}
                                >
                                    {title}
                                </button>
                                {action && <div className="">{action()}</div>}
                            </div>
                        </Col>
                    </Row>
                </form>
            </Modal>
        </FormProvider>
    );
};
