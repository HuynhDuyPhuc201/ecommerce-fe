import React, { useEffect, useState, useCallback, useMemo } from 'react';
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

    // 🛠 Cập nhật rating
    const updateRating = useCallback(
        (newRating) => {
            setSearchParams((prev) => {
                const params = new URLSearchParams(prev);
                newRating ? params.set('rating', newRating) : params.delete('rating');
                return params;
            });
        },
        [setSearchParams],
    );

    // 🛠 Cập nhật price
    const updatePrice = useCallback(
        (newPrice) => {
            setSearchParams((prev) => {
                const params = new URLSearchParams(prev);
                newPrice ? params.set('price', newPrice) : params.delete('price');
                return params;
            });
        },
        [setSearchParams],
    );

    // 🛠 useEffect tối ưu hóa searchParams
    useEffect(() => {
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            if (rating) params.set('rating', rating);
            if (price) params.set('price', price);
            if (name) params.set('q', name);
            return params;
        });
    }, [rating, price, name]);

    // 🛠 useMemo tối ưu query
    const query = useMemo(() => {
        return `?page=${currentPage}${sort ? `&sort=${sort}` : ''}${
            id && !isNaN(Number(id)) && Number(id) > 0 ? `&categories=${id}` : ''
        }${searchParams ? `&${searchParams.toString()}` : ''}`;
    }, [currentPage, sort, id, searchParams]);

    // 🛠 Fetch sản phẩm với react-query
    const { data, isLoading } = useQuery({
        queryKey: ['products', sort, rating, price, id, searchParams, currentPage, name],
        queryFn: async () => await productService.getAll(query),
        refetchOnWindowFocus: false, // Tắt refetch khi tab focus lại
        refetchOnReconnect: false, // Tắt refetch khi mạng có lại
        staleTime: 5 * 60 * 1000,
        cacheTime: 1000 * 60 * 30,
    });

    // 🛠 Thay đổi cách sắp xếp
    const handleSelectChange = useCallback((e) => {
        setSort(e.target.value);
    }, []);

    const dataProduct = data?.data;

    // 🛠 Thay đổi trang Pagination
    const onShowSizeChange = (page) => {
        setCurrentPage(page);
    };

    // 🛠 Cập nhật kích thước cửa sổ (windowWidth)
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
        
        <div className="max-w-[1240px] w-full m-auto">
            <HomeSlider arrImg={arrImg} />
        </div>
        <div className="py-0 container my-20">

            {windowWidth > 500 && (
                <div className="p-4 flex items-center justify-end font-[sans-serif]">
                    <label className="text-[16px] text-[#333] block pr-3" htmlFor="sort-select">
                        Sắp xếp giá theo:
                    </label>
                    <select
                        id="sort-select"
                        value={sort || ''}
                        onChange={handleSelectChange}
                        className="w-[50%] md:w-[20%] p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="asc">Thấp đến cao</option>
                        <option value="desc">Cao đến thấp</option>
                    </select>
                </div>
            )}

            <Row gutter={[12, 12]} style={{ rowGap: '16px' }}>
                <Col md={5}>
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
                                className="w-[50%] md:w-[20%] p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="asc">Thấp đến cao</option>
                                <option value="desc">Cao đến thấp</option>
                            </select>
                        </div>
                    </Col>
                )}

                <Col xs={24} sm={19} md={19}>
                    <Row gutter={[12, 12]} style={{ rowGap: '16px', marginTop: '20px' }}>
                        {isLoading
                            ? // Hiển thị danh sách Skeleton khi đang tải dữ liệu
                              Array.from({ length: 8 }).map((_, i) => (
                                  <Col lg={6} md={8} sm={12} xs={12} key={i}>
                                      <Skeleton active style={{ height: "200px"}} />
                                  </Col>
                              ))
                            : // Hiển thị sản phẩm sau khi có dữ liệu
                              dataProduct?.map((item, i) => (
                                  <Col lg={6} md={8} sm={12} xs={12} key={i}>
                                      <ProductCard item={item} />
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
                    total={data?.total || 0}
                    pageSize={8}
                    current={currentPage}
                />
            </div>
        </div>
        </>
        

    );
};

export default Index;
