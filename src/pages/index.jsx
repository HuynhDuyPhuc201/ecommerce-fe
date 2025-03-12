import React, { useEffect, useState } from 'react';
import { slider_1, slider_3 } from '~/constants/images';
import ProductCard from '~/components/ProductCard';
import Navbar from '~/components/Navbar';
import { Col, Pagination, Row, Skeleton } from 'antd';
import { useParams, useSearchParams } from 'react-router-dom';
import { productService } from '~/services/product.service';
import { useQuery } from '@tanstack/react-query';
import HomeSlider from '~/components/HomeSlider';

const Index = () => {
    const arrImg = [slider_1, slider_3];
    const { id } = useParams();

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [searchParams, setSearchParams] = useSearchParams();
    const page = searchParams.get('page') || 1;
    const [currentPage, setCurrentPage] = useState(page);
    const [sort, setSort] = useState(searchParams.get('sort') || 'asc');
    const rating = searchParams.get('rating') || '';
    const price = searchParams.get('price') || 0;
    const name = searchParams.get('q') || '';

    const updateRating = (newRating) => {
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            newRating ? params.set('rating', newRating) : params.delete('rating');
            return params;
        });
    };

    const updatePrice = (newPrice) => {
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            newPrice ? params.set('price', newPrice) : params.delete('price');
            return params;
        });
    };

    useEffect(() => {
        const queryObject = {};
        if (rating) queryObject.rating = rating;
        if (price) queryObject.price = price;
        if (name) queryObject.q = name;

        setSearchParams(queryObject);
    }, [sort, rating, price, id, name]);

    const query = `${`?page=${currentPage}`}${sort && `&sort=${sort}`}${id ? `&categories=${id}` : ''}${
        searchParams ? `&${searchParams.toString()}` : ''
    }`;

    const { data, isFetching } = useQuery({
        queryKey: ['products', sort, rating, price, id, searchParams, currentPage, name],
        queryFn: async () => await productService.getAll(query),
    });

    const handleSelectChange = (e) => {
        setSort(e.target.value);
    };
    const dataProduct = data?.data;

    const onShowSizeChange = (page) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [window.innerWidth]);

    return (
        <>
            <div className="py-0 container my-20">
                <HomeSlider arrImg={arrImg} />
                {windowWidth > 500 && (
                    <div className="p-4 flex items-center justify-end font-[sans-serif]">
                        <label className="text-[16px] text-[#333] block pr-3" htmlFor="sort-select">
                            Sắp xếp giá theo:
                        </label>
                        <select
                            id="sort-select"
                            value={sort || ''}
                            onChange={handleSelectChange}
                            className="w-[50%]  md:w-[20%] p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="asc">Thấp đến cao</option>
                            <option value="desc">Cao đến thấp</option>
                        </select>
                    </div>
                )}

                <Row gutter={[12, 12]} style={{ rowGap: '16px' }}>
                    <Col md={6}>
                        <Navbar ratingObj={{ updateRating, rating }} priceObj={{ price, updatePrice }} />
                    </Col>
                    {windowWidth < 500 && (
                        <Col sm={24} xs={24} md={24}>
                            <div className="p-4 flex items-center justify-end font-[sans-serif]">
                                <label className="text-[16px] text-[#333] block pr-3" htmlFor="sort-select">
                                    Sắp xếp giá theo:
                                </label>
                                <select
                                    id="sort-select"
                                    value={sort || ''}
                                    onChange={handleSelectChange}
                                    className="w-[50%]  md:w-[20%] p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="asc">Thấp đến cao</option>
                                    <option value="desc">Cao đến thấp</option>
                                </select>
                            </div>
                        </Col>
                    )}

                    <Col xs={24} sm={18} md={18}>
                        <Row gutter={[12, 12]} style={{ rowGap: '16px', marginTop: '20px' }}>
                            {dataProduct?.map((item, i) => (
                                <Col lg={6} md={8} sm={12} xs={12} key={i}>
                                    {isFetching ? <Skeleton /> : <ProductCard item={item} />}
                                </Col>
                            ))}
                        </Row>
                        {dataProduct?.length === 0 && (
                            <div className="items-center justify-center text-center">
                                <p className="text-[17px] font-bold">Không có sản phẩm nào</p>
                            </div>
                        )}
                    </Col>
                </Row>

                <div className="flex justify-end">
                    <Pagination
                        style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}
                        onChange={onShowSizeChange}
                        total={data?.total || 0} // tổng 11 sản phẩm
                        pageSize={8}
                        current={currentPage}
                    />
                </div>
            </div>
        </>
    );
};

export default Index;
