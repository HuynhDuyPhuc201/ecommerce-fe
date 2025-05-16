import { Modal, Row, Col, Typography, Image, message, Spin } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined, LeftOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import InputForm from '~/components/InputForm';
import Button from '~/components/Button';
import { setToken, setUser } from '~/config/token';
import { useAppStore } from '~/store/useAppStore';
import { userService } from '~/services/user.service';
import { login } from '~/constants/images';
import { path } from '~/config/path';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validator';

const AuthModal = () => {
    const { Title } = Typography;
    const { openModal, toggleModal } = useAppStore();
    const navigate = useNavigate();
    const [verifyEmail, setShowVerifyEmail] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showCodePassword, setShowCodePassword] = useState(false);
    const [showPassConFirm, setShowPassConFirm] = useState(false);
    const [showForm, setShowForm] = useState({
        type: 'showSignIn',
    });
    const [loading, setLoading] = useState(false);
    const [loadingSendCode, setLoadingSendCode] = useState(false);

    // tạo useForm sử dụng cho nhiều component
    const loginForm = useForm({ mode: 'onChange' });
    const registerForm = useForm({ mode: 'onChange' });
    const changePasswordForm = useForm({ mode: 'onChange' });
    const newPasswordForm = useForm({ mode: 'onChange' });

    const handleLogin = async (form) => {
        if (form.email === 'admin@gmail.com' && form.password === '123123') {
            return message.error('Sai thông tin đăng nhập');
        }
        setLoading(true);
        try {
            const data = await userService?.login(form);
            if (data.success) {
                toggleModal();
                if (data.token) {
                    const { token, ...userData } = data;
                    setUser(userData);
                    setToken(token);
                } else {
                    setUser(data);
                }
                message.success(data.message);
                navigate(path.Home);
                if (data.isAdmin) {
                    navigate(path.Admin);
                }
            }
        } catch (error) {
            message.error(error.response.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginGoogle = async (credentialResponse) => {
        const token = credentialResponse.credential;

        try {
            const data = await userService?.loginGoogle({ token });
            if (data.success) {
                toggleModal();
                if (data.token) {
                    const { token, ...userData } = data;
                    setUser(userData);
                    setToken(token);
                } else {
                    setUser(data);
                }
                message.success(data.message);
                navigate(path.Home);
                if (data.isAdmin) {
                    navigate(path.Admin);
                }
            }
        } catch (error) {
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
                registerForm.reset({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                });
                setShowForm({ type: 'showSignIn' });
                message.success(result.message);
            }
        } catch (error) {
            message.error(error.response.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (form) => {
        try {
            const result = await userService.changePassword(form);
            if (result.success) {
                message.success(result.message);
                setShowCodePassword(true);
            }
            if (result.message === 'Xác thực thành công') {
                setShowForm({ type: 'showNewPassword' });
            }
        } catch (error) {
            message.error(error.response.data?.message);
        }
    };
    const handleUpdatePassword = async (form) => {
        const getEmail = changePasswordForm.getValues('email');
        const newForm = {...form, email: getEmail}
        try {
            const result = await userService.updateUserPassword(newForm);
            if (result.success) {
                message.success(result.message);
                setShowForm({ type: 'showSignIn' });
            }
        } catch (error) {
            message.error(error.response.data?.message);
        }
    }

    const handleOnChangeEmail = (e) => {
        if (dataDefault.email !== e.target.value) {
            setShowVerifyEmail(false);
        }
    };

    const handleResendCode = async () => {
        const form = registerForm.getValues(); // lấy email hiện tại từ form
        try {
            setLoadingSendCode(true);
            const result = await userService.register(form); // giả sử BE có key 'resend' để gửi lại mã
            if (result.success) {
                message.success('Mã xác thực đã được gửi lại!');
            } else {
                message.error('Không thể gửi lại mã xác thực, vui lòng thử lại!');
            }
        } catch (error) {
            message.error(error.response.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setLoadingSendCode(false);
        }
    };

    const handleCloseModal = () => {
        toggleModal();
        registerForm.clearErrors();
        loginForm.clearErrors();
        changePasswordForm.clearErrors();
        changePasswordForm.reset();
        setShowCodePassword(false);
        setShowForm({ type: 'showSignIn' });
    };
    return (
        <>
            <Modal open={openModal} onCancel={handleCloseModal} footer={null} width={800}>
                <Row gutter={[12, 12]} justify="center" align="middle">
                    {showForm.type === 'showSignIn' && (
                        <Col xs={24} sm={24} md={14}>
                            <FormProvider {...loginForm}>
                                <form onSubmit={loginForm.handleSubmit(handleLogin)}>
                                    <Title style={{ fontSize: '16px', marginBottom: '30px', textAlign: 'center' }}>
                                        Đăng nhập
                                    </Title>
                                    <InputForm
                                        error={loginForm.formState.errors['email']}
                                        placeholder="Email"
                                        name="email"
                                        type="text"
                                        required={true}
                                        pattern={{
                                            value: EMAIL_RULE,
                                            message: EMAIL_RULE_MESSAGE,
                                        }}
                                    />
                                    <div className="relative">
                                        <InputForm
                                            error={loginForm.formState.errors['password']}
                                            placeholder="Mật khẩu"
                                            name="password"
                                            type={showPass ? 'text' : 'password'}
                                            required={true}
                                            pattern={{
                                                value: PASSWORD_RULE,
                                                message: PASSWORD_RULE_MESSAGE,
                                            }}
                                        />
                                        <div
                                            className="absolute pt-8 mt-2 top-0 right-4 transform -translate-y-1/2 cursor-pointer w-[14px] h-[14px]"
                                            onClick={() => setShowPass(!showPass)}
                                        >
                                            {showPass ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                        </div>
                                    </div>

                                    <div className="mt-[30px] flex justify-between items-center gap-3">
                                        <Button className="w-full h-[40px]" disabled={loading}>
                                            {loading && <Spin />}Đăng nhập
                                        </Button>
                                        <GoogleOAuthProvider clientId="119448505566-72peltvkmj8bi0cfn1l5hqm0fmf85jci.apps.googleusercontent.com">
                                            <GoogleLogin
                                                onSuccess={handleLoginGoogle}
                                                onError={() => console.log('Login Failed')}
                                                theme="outline"
                                                size="large"
                                                cookiePolicy={'single_host_origin'}
                                            />
                                        </GoogleOAuthProvider>
                                    </div>
                                </form>
                            </FormProvider>
                            <p
                                style={{
                                    fontSize: '14px',
                                    paddingTop: '20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Link
                                    style={{ fontSize: '14px' }}
                                    onClick={() => setShowForm({ type: 'showChangePassword' })}
                                >
                                    Quên mật khẩu
                                </Link>
                                <p>
                                    Chưa có tài khoản?{' '}
                                    <button
                                        onClick={() => setShowForm({ type: 'showSignUp' })}
                                        className="text-[#2640d4]"
                                    >
                                        Đăng ký
                                    </button>
                                </p>
                            </p>
                        </Col>
                    )}
                    {showForm.type === 'showSignUp' && (
                        <Col md={14}>
                            <FormProvider {...registerForm}>
                                <form onSubmit={registerForm.handleSubmit(handleRegister)}>
                                    <Title
                                        style={{
                                            fontSize: '16px',
                                            marginBottom: '30px',
                                            textAlign: 'center',
                                            position: 'relative',
                                        }}
                                    >
                                        <LeftOutlined
                                            onClick={() => {
                                                setShowForm({ type: 'showSignIn' });
                                                registerForm.clearErrors();
                                                loginForm.clearErrors();
                                            }}
                                            style={{ position: 'absolute', left: 0 }}
                                        />
                                        Đăng ký
                                    </Title>
                                    <Row gutter={[12, 12]}>
                                        <Col span={12}>
                                            <InputForm
                                                error={registerForm.formState.errors['name']}
                                                placeholder="Tên"
                                                name="name"
                                                type="text"
                                                required={true}
                                            />
                                            <div className="relative">
                                                <InputForm
                                                    error={registerForm.formState.errors['password']}
                                                    placeholder="Mật khẩu"
                                                    name="password"
                                                    type={showPass ? 'text' : 'password'}
                                                    required={true}
                                                    pattern={{
                                                        value: PASSWORD_RULE,
                                                        message: PASSWORD_RULE_MESSAGE,
                                                    }}
                                                />
                                                <div
                                                    className="absolute pt-8 mt-2 top-0 right-4 transform -translate-y-1/2 cursor-pointer w-[14px] h-[14px]"
                                                    onClick={() => setShowPass(!showPass)}
                                                >
                                                    {showPass ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                                </div>
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <InputForm
                                                error={registerForm.formState.errors['email']}
                                                placeholder="Tài khoản"
                                                name="email"
                                                type="text"
                                                onChange={handleOnChangeEmail}
                                                required={true}
                                                pattern={{
                                                    value: EMAIL_RULE,
                                                    message: EMAIL_RULE_MESSAGE,
                                                }}
                                            />
                                            <div className="relative">
                                                <InputForm
                                                    error={registerForm.formState.errors['confirmPassword']}
                                                    placeholder="Nhập lại mật khẩu"
                                                    name="confirmPassword"
                                                    type={showPassConFirm ? 'text' : 'password'}
                                                    required={true}
                                                />
                                                <div
                                                    className="absolute pt-8 mt-2 top-0 right-4 transform -translate-y-1/2 cursor-pointer w-[14px] h-[14px]"
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
                                                        error={registerForm.formState.errors['code']}
                                                        placeholder="Mã xác thực..."
                                                        name="code"
                                                        required={true}
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

                                    <Button className="w-full mt-[30px] h-[40px]" type="submit" disabled={loading}>
                                        {loading && <Spin />}Đăng ký
                                    </Button>
                                    <p style={{ fontSize: '14px', paddingTop: '20px' }}>
                                        Đã có tài khoản?{' '}
                                        <button
                                            type="button"
                                            onClick={() => setShowForm({ type: 'showSignIn' })}
                                            className="text-[#2640d4]"
                                        >
                                            Đăng nhập
                                        </button>
                                    </p>
                                </form>
                            </FormProvider>
                        </Col>
                    )}
                    {showForm.type === 'showChangePassword' && (
                        <Col xs={24} sm={24} md={14}>
                            <FormProvider {...changePasswordForm}>
                                <form onSubmit={changePasswordForm.handleSubmit(handleChangePassword)}>
                                    <Title
                                        style={{
                                            fontSize: '16px',
                                            marginBottom: '30px',
                                            textAlign: 'center',
                                            position: 'relative',
                                        }}
                                    >
                                        <LeftOutlined
                                            onClick={() => {
                                                setShowForm({ type: 'showSignIn' });
                                                setShowCodePassword(false);
                                                registerForm.clearErrors();
                                                changePasswordForm.clearErrors();
                                            }}
                                            style={{ position: 'absolute', left: 0 }}
                                        />
                                        {showCodePassword ? 'Xác thực Email' : 'Đặt lại mật khẩu'}
                                    </Title>
                                    <InputForm
                                        error={changePasswordForm.formState.errors['email']}
                                        placeholder="Nhập email"
                                        name="email"
                                        type="text"
                                        required={true}
                                        pattern={{
                                            value: EMAIL_RULE,
                                            message: EMAIL_RULE_MESSAGE,
                                        }}
                                    />
                                    {showCodePassword && (
                                        <InputForm
                                            error={changePasswordForm.formState.errors['code']}
                                            placeholder="Nhập mã xác thực"
                                            name="code"
                                            type="text"
                                            required={true}
                                        />
                                    )}
                                    <div className="mt-[30px] flex justify-between items-center gap-3 pb-[30px]">
                                        <Button className="w-full h-[40px]" disabled={loading}>
                                            {loading && <Spin />} {showCodePassword ? 'Xác thực' : 'Tiếp theo'}
                                        </Button>
                                    </div>
                                </form>
                            </FormProvider>
                        </Col>
                    )}
                    {showForm.type === 'showNewPassword' && (
                        <Col xs={24} sm={24} md={14}>
                            <FormProvider {...newPasswordForm}>
                                <form onSubmit={newPasswordForm.handleSubmit(handleUpdatePassword)}>
                                    <Title
                                        style={{
                                            fontSize: '16px',
                                            marginBottom: '30px',
                                            textAlign: 'center',
                                            position: 'relative',
                                        }}
                                    >
                                        <LeftOutlined
                                            onClick={() => {
                                                setShowForm({ type: 'showSignIn' });
                                                registerForm.clearErrors();
                                                changePasswordForm.clearErrors();
                                                newPasswordForm.clearErrors();
                                                newPasswordForm.reset();
                                            }}
                                            style={{ position: 'absolute', left: 0 }}
                                        />
                                        Nhập mật khẩu mới
                                    </Title>
                                    <InputForm
                                        error={newPasswordForm.formState.errors['password']}
                                        placeholder="Nhập mật khẩu mới"
                                        name="password"
                                        type="password"
                                        required={true}
                                        pattern={{
                                            value: PASSWORD_RULE,
                                            message: PASSWORD_RULE_MESSAGE,
                                        }}
                                    />
                                    <div className="mt-[30px] flex justify-between items-center gap-3 pb-[30px]">
                                        <Button className="w-full h-[40px]" disabled={loading}>
                                            {loading && <Spin />} Xác nhận
                                        </Button>
                                    </div>
                                </form>
                            </FormProvider>
                        </Col>
                    )}
                    <Col md={10}>
                        <Image src={login} style={{ width: '280px' }} />
                    </Col>
                </Row>
            </Modal>
        </>
    );
};

export default AuthModal;
