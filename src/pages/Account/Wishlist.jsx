import { useQuery } from '@tanstack/react-query';
import { Col, Row } from 'antd';
import React from 'react';
import HelmetComponent from '~/components/Helmet';
import ProductCard from '~/components/ProductCard';
import { wishlistService } from '~/services/wishlist.service';

const Wishlist = ({}) => {
    const { data: dataWishlist, refetch } = useQuery({
        queryKey: ['wishlist'],
        queryFn: async () => await wishlistService.getWishlist(),
    });

    return (
        <>
            <div className="w-full mx-auto bg-white p-6 rounded-lg shadow-md pb-10">
                <HelmetComponent title="Thông tin tài khoản" />
                <div className="flex items-center my-6 relative pb-10">
                <div className="absolute top-0 left-0">
                </div>
                <h2 className="text-2xl font-semibold text-center flex-1">Danh mục yêu thích</h2>
            </div>
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
