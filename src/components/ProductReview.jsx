import { Button, Rate, Upload } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { CloseCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { Controller, FormProvider } from 'react-hook-form';
import { formattedDate } from '~/utils/formatDate';

export const ProductReview = (props) => {
    const { product, handleUpload, onSubmit, reviewForm, state, loading, selectedOrder } = props;
    const valueform = reviewForm.getValues().comment;
    return (
        <FormProvider {...reviewForm}>
            <form onSubmit={reviewForm?.handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-4">
                <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 mb-4">
                        <img src={product?.image} alt="Product" className="w-20 h-20" />
                        <p className="text-lg max-w-[70%] text-gray-700">{product?.name || ''}</p>
                    </div>

                    <div className="flex justify-center gap-2 mb-6 flex-col">
                        <Controller
                            name="rating"
                            control={reviewForm?.control}
                            defaultValue={0}
                            render={({ field }) => <Rate {...field} onChange={field.onChange} />}
                        />
                    </div>

                    <div className="mr-5 inline-block">
                        <Upload
                            listType="picture-card"
                            beforeUpload={() => false}
                            multiple={true}
                            onChange={handleUpload}
                            fileList={state?.listImage.map((file, index) => ({
                                ...file,
                                uid: file.uid || file._id || `generated-${index}`,
                                thumbUrl: file.thumbUrl || URL.createObjectURL(file.originFileObj),
                            }))}
                            showUploadList={{
                                showRemoveIcon: true,
                                showPreviewIcon: false,
                            }}
                            itemRender={(originNode, file, fileList, actions) => (
                                <div className="relative group w-full h-full border rounded-md overflow-hidden">
                                    <img src={file.thumbUrl} alt="uploaded" className="object-cover w-full h-full" />
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            actions.remove(); // ✅ Sử dụng remove mặc định của AntD
                                        }}
                                        className="absolute top-1 right-1 p-1 bg-white bg-opacity-80 rounded-full opacity-0 group-hover:opacity-100 transition"
                                        icon={<CloseCircleOutlined className="text-red-500 text-lg" />}
                                    />
                                </div>
                            )}
                        >
                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                        </Upload>
                    </div>
                    <div className="flex justify-center gap-2 mb-6 flex-col">
                        <Controller
                            name="comment"
                            control={reviewForm.control}
                            defaultValue=""
                            rules={{ required: 'Vui lòng nhập nội dung đánh giá' }}
                            render={({ field, fieldState }) => (
                                <TextArea
                                    {...field}
                                    placeholder="Viết đánh giá của bạn..."
                                    className="w-full mb-4 mt-4 h-30"
                                    status={fieldState.error ? 'error' : ''}
                                />
                            )}
                        />
                        <span className="text-[#858484] text-lg">
                            Lưu ý: có thể thay đổi đánh giá 3 ngày kể từ ngày {formattedDate(selectedOrder.createdAt)}
                        </span>
                    </div>
                </div>
                <div className="text-center">
                    <Button type="primary" htmlType="submit" disabled={loading}>
                        {valueform ? 'Sửa đánh giá' : 'Đánh giá'}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
};
