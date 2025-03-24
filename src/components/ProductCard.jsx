import { Card, Carousel } from 'antd';
import React, { useCallback, useMemo } from 'react';
import { StarFilled } from '@ant-design/icons';
import { generatePath, Link } from 'react-router-dom';
import { path } from '~/config/path';
import { formatNumber } from '~/core';

const ProductCard = ({ item }) => {
    const discount = useMemo(
        () => (item?.price_old ? ((item.price_old - item.price) / item.price_old) * 100 : 0),
        [item.price, item.price_old],
    );

    const pathURL = useMemo(
        () => generatePath(path.ProductDetail, { idCate: item?.categories, id: item?._id }),
        [item.categories, item._id],
    );

    const handleScrollTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <Link to={pathURL} onClick={handleScrollTop}>
            <Card
                hoverable
                cover={
                    item.image?.length > 1 ? (
                        <Carousel>
                            {item.image?.map((img, index) => (
                                <div
                                    key={index}
                                    className={`relative ${item.countInstock === 0 ? 'bg-[#5e5b5b]' : ''}`}
                                >
                                    <img
                                        key={img.uid}
                                        alt=""
                                        src={img.thumbUrl}
                                        className={`h-[200px] object-cover ${
                                            item.countInstock === 0 ? 'opacity-50' : ''
                                        }`}
                                    />
                                    {item.countInstock === 0 && (
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70px] h-[70px] rounded-full bg-[#000000] ">
                                            <span className="text-white h-full text-[12px] text-center flex items-center justify-center">
                                                Đã bán hết
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </Carousel>
                    ) : (
                        <img alt="example" src={item.image[0].thumbUrl} className="h-[200px] object-cover" />
                    )
                }
            >
                <div className="block max-w-full break-words">
                    <p className="line-clamp-2 overflow-hidden" title={item?.name}>
                        {item?.name}
                    </p>
                    <div className="">
                        <span className="pr-2">{item?.rating}</span>
                        <StarFilled style={{ color: '#ffff19' }} />
                    </div>
                    <p className="text-[20px] text-[#fc3434] font-bold mt-3">{formatNumber(item?.price || 0)}</p>
                    <div className="sale mt-2">
                        <span className="p-2 bg-slate-200 rounded-[10px] text-[10px]">-{discount.toFixed() || 0}%</span>
                        <span className="price-sale line-through pl-5 text-[gray] text-[10px]">
                            {formatNumber(item?.price_old || 0)}
                        </span>
                    </div>
                </div>
            </Card>
        </Link>
    );
};

export default ProductCard;
