import { Image } from 'antd';
import React, { memo } from 'react';
import Slider from 'react-slick';
const HomeSlider = ({ arrImg }) => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 1000,
        arrows: false, // Ẩn nút prev/next
    };
    return (
        <>
            <div className="wrap">
                <Slider {...settings} style={{ marginBottom: '20px' }}>
                    {arrImg?.map((item, i) => {
                        return (
                            <Image
                                key={i}
                                src={item}
                                alt="slider"
                                preview={false}
                                className="w-full max-h-full object-cover xs:h-[500px] sm:h-[500px] h-auto"
                            />
                        );
                    })}
                </Slider>
            </div>
        </>
    );
};

export default memo(HomeSlider);
