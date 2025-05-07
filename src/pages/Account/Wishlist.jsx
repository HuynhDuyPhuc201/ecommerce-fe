import { useQuery } from '@tanstack/react-query';
import { Col, Row } from 'antd';
import React from 'react';
import HelmetComponent from '~/components/Helmet';
import ProductCard from '~/components/ProductCard';
import { productService } from '~/services/product.service';

const Wishlist = ({}) => {
    const { data: dataWishlist, refetch } = useQuery({
        queryKey: ['wishlist'],
        queryFn: async () => await productService.getWishlist(user._id),
    });

    return (
        <>
            <div className="w-full mx-auto bg-white p-6 rounded-lg shadow-md">
                <HelmetComponent title="Thông tin tài khoản" />
                {!dataWishlist?.wishlist?.products?.length && <p className="text-[20px] text-center py-10">Không có sản phẩm</p>}

                <Row gutter={[12, 12]} style={{ rowGap: '16px' }}>
                    {dataWishlist?.wishlist?.products?.map((item) => (
                        <Col lg={6} md={12} xs={12} key={item._id}>
                            <ProductCard item={item} closeIcon/>
                        </Col>
                    ))}
                </Row>
            </div>
        </>
    );
};

export default Wishlist;
