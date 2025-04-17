import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom'; // For redirecting to the home page or a specific page
import HelmetComponent from '~/components/Helmet';

function Page404() {
    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <HelmetComponent title="Lỗi" />
            <Result
                status="404"
                title="404"
                subTitle="Rất tiếc, trang không tồn tại"
                extra={
                    <div>
                        <img
                            src="https://via.placeholder.com/300x200.png?text=404+Not+Found"
                            style={{ marginBottom: '20px' }}
                        />
                        <Button type="primary">
                            <Link to="/">Về trang chủ</Link>
                        </Button>
                    </div>
                }
            />
        </div>
    );
}

export default Page404;
