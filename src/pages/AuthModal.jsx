import { Modal, Row, Col, Typography, Image, message, Spin } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined, LeftOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import InputForm from '~/components/InputForm';
import Button from '~/components/Button';
import { setToken, setUser } from '~/core/token';
import { useAppStore } from '~/store/useAppStore';
import { userService } from '~/services/user.service';
import { login } from '~/constants/images';
import { path } from '~/config/path';
import { useNavigate } from 'react-router-dom';

const AuthModal = () => {
    const { Title } = Typography;
    const { openModal, toggleModal } = useAppStore();
    const navigate = useNavigate();
    const [verifyEmail, setShowVerifyEmail] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showPassConFirm, setShowPassConFirm] = useState(false);
    const { showSignUp, setShowSignUp } = useAppStore();
    const [loading, setLoading] = useState(false);
    const [loadingSendCode, setLoadingSendCode] = useState(false);

    // tạo useForm sử dụng cho nhiều component
    const loginForm = useForm({ mode: 'onChange' });
    const regitserForm = useForm({ mode: 'onChange' });

    const handleLogin = async (form) => {
        try {
            const data = await userService?.login(form);
            const { token, ...userData } = data;
            if (data.success === true) {
                toggleModal();
                setUser(userData);
                setToken(token);
                message.success(data.message);
                if (data.isAdmin) {
                    navigate(path.Admin);
                }
            }

            setLoading(true);
        } catch (error) {
            setLoading(false);
            message.error(error.response.data?.message);
        }
    };

    const [dataDefault, setDataDefault] = useState({});

    const handleRegister = async (form) => {
        setLoading(true);
        try {
            const service = form.code ? userService.verifyEmail : userService.register;
            const result = await service(form);
            if (result.success) {
                message.success(result.message);
                setShowVerifyEmail(true);
                setDataDefault(form); // lấy giá trị ban đầu để so sánh vs mail sau, nếu thay đổi thì cho nhận lại email xác nhận
                setLoading(false);
            }
            if (result.verify) {
                regitserForm.reset({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                });
                setShowSignUp(false);
                message.success(result.message);
                setLoading(false);
            }
            setLoading(false);
        } catch (error) {
            message.error(error.response.data?.message);
        }
    };
    const handleOnChangeEmail = (e) => {
        if (dataDefault.email !== e.target.value) {
            setShowVerifyEmail(false);
        }
    };

    const handleResendCode = async () => {
        const form = regitserForm.getValues(); // lấy email hiện tại từ form
        try {
            setLoadingSendCode(true);
            const result = await userService.register(form); // giả sử BE có key 'resend' để gửi lại mã
            if (result.success) {
                setLoadingSendCode(false);
                message.success('Mã xác thực đã được gửi lại!');
            } else {
                message.error('Không thể gửi lại mã xác thực, vui lòng thử lại!');
            }
            setLoadingSendCode(false);
        } catch (error) {
            message.error(error.response.data?.message || 'Có lỗi xảy ra!');
        }
    };
    return (
        <>
            <Modal open={openModal} onCancel={toggleModal} footer={null} width={800}>
                <Row gutter={[12, 12]} justify="center" align="middle">
                    {!showSignUp && (
                        <Col xs={24} sm={24} md={14}>
                            <FormProvider {...loginForm}>
                                <form onSubmit={loginForm.handleSubmit(handleLogin)}>
                                    <Title style={{ fontSize: '16px', marginBottom: '30px', textAlign: 'center' }}>
                                        Đăng nhập bằng Email
                                    </Title>
                                    <InputForm
                                        error={loginForm.formState.errors.email}
                                        placeholder="admin@gmail.com hoặc test@gmail.com"
                                        name="email"
                                        type="text"
                                    />
                                    <div className="relative ">
                                        <InputForm
                                            error={loginForm.formState.errors.password}
                                            placeholder="123456789"
                                            name="password"
                                            type={showPass ? 'text' : 'password'}
                                        />
                                        <div
                                            className="absolute top-[50%] right-2 transform -translate-y-1/2 cursor-pointer w-[20px] h-[20px]"
                                            onClick={() => setShowPass(!showPass)}
                                        >
                                            {showPass ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                        </div>
                                    </div>

                                    <Button className="w-full mt-[30px]" disabled={loading}>
                                        {loading && <Spin />}Đăng nhập
                                    </Button>
                                    <Title style={{ fontSize: '14px', paddingTop: '20px' }}>
                                        Chưa tạo tài khoản?{' '}
                                        <button onClick={() => setShowSignUp(true)} className="text-[#2640d4]">
                                            Tạo tài khoản
                                        </button>
                                    </Title>
                                </form>
                            </FormProvider>
                        </Col>
                    )}
                    {showSignUp && (
                        <Col md={14}>
                            <FormProvider {...regitserForm}>
                                <form onSubmit={regitserForm.handleSubmit(handleRegister)}>
                                    <Title
                                        style={{
                                            fontSize: '16px',
                                            marginBottom: '30px',
                                            textAlign: 'center',
                                            position: 'relative',
                                        }}
                                    >
                                        <LeftOutlined
                                            onClick={() => setShowSignUp(false)}
                                            style={{ position: 'absolute', left: 0 }}
                                        />
                                        Đăng ký
                                    </Title>
                                    <Row gutter={[12, 12]}>
                                        <Col span={12}>
                                            <InputForm
                                                error={regitserForm.formState.errors.name}
                                                placeholder="Name..."
                                                name="name"
                                                type="text"
                                            />
                                            <div className="relative">
                                                <InputForm
                                                    error={regitserForm.formState.errors.password}
                                                    placeholder="Password..."
                                                    name="password"
                                                    type={showPass ? 'text' : 'password'}
                                                />

                                                <div
                                                    className="absolute top-[50%] right-2 transform -translate-y-1/2 cursor-pointer w-[20px] h-[20px]"
                                                    onClick={() => setShowPass(!showPass)}
                                                >
                                                    {showPass ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                                </div>
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <InputForm
                                                error={regitserForm.formState.errors.email}
                                                placeholder="Email..."
                                                name="email"
                                                type="text"
                                                onChange={handleOnChangeEmail}
                                            />
                                            <div className="relative">
                                                <InputForm
                                                    error={regitserForm.formState.errors.confirmPassword}
                                                    placeholder="confirmPassword..."
                                                    name="confirmPassword"
                                                    type={showPassConFirm ? 'text' : 'password'}
                                                />
                                                <div
                                                    className="absolute top-[50%] right-2 transform -translate-y-1/2 cursor-pointer w-[20px] h-[20px]"
                                                    onClick={() => setShowPassConFirm(!showPassConFirm)}
                                                >
                                                    {showPassConFirm ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                                </div>
                                            </div>
                                        </Col>
                                        {verifyEmail && (
                                            <Row gutter={[12, 12]}>
                                                <Col span={12}>
                                                    <InputForm
                                                        error={regitserForm.formState.errors.code}
                                                        placeholder="Verify Code..."
                                                        name="code"
                                                    />
                                                </Col>
                                                <Col span={12}>
                                                    <Button
                                                        onClick={handleResendCode}
                                                        disabled={loadingSendCode}
                                                        className="cursor-pointer w-1/2 mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                                    >
                                                        {loadingSendCode && <Spin />}Gửi lại
                                                    </Button>
                                                </Col>
                                                <span className="pl-5">
                                                    Lưu ý: Mã xác thực có thể ở trong thư mục spam
                                                </span>
                                            </Row>
                                        )}
                                    </Row>

                                    <Button className="w-full mt-[30px]" type="submit" disabled={loading}>
                                        {loading && <Spin />}Đăng ký
                                    </Button>
                                    <Title style={{ fontSize: '14px', paddingTop: '20px' }}>
                                        Đã có tài khoản?{' '}
                                        <button onClick={() => setShowSignUp(false)} className="text-[#2640d4]">
                                            Đăng nhập
                                        </button>
                                    </Title>
                                </form>
                            </FormProvider>
                        </Col>
                    )}

                    <Col md={10}>
                        <Image src={login} style={{ width: '300px' }} className="w-[100px]" />
                    </Col>
                </Row>
            </Modal>
        </>
    );
};

export default AuthModal;
