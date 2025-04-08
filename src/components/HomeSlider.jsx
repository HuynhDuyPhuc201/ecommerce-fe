import React, { memo, useMemo } from 'react';
import Slider from 'react-slick';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { slider_1, slider_2 } from '~/constants/images';

const HomeSlider = () => {
    // Mảng ảnh slider: em có thể import hoặc lấy từ API
    const arrImg = [slider_1, slider_2];

    // Cache cài đặt slider
    const settings = useMemo(
        () => ({
            dots: true,
            infinite: true,
            speed: 500, // điều chỉnh tốc độ chuyển nếu cần
            slidesToShow: 1,
            slidesToScroll: 1,
            // autoplay: true,
            // autoplaySpeed: 3000,
            arrows: false,
            // Nếu có thể, thử tắt lazyLoad của react-slick để tránh trùng với LazyLoadImage
            lazyLoad: false,
        }),
        [],
    );

    return (
        <div className="wrap">
            <Slider {...settings} style={{ marginBottom: '20px' }}>
                {arrImg.map((item, i) => (
                    // Sử dụng LazyLoadImage thay vì <img>
                    <div className="h-[500px] object-cover ">
                        <img
                            key={i}
                            src={item}
                            alt={`slider-${i}`}
                            // Nếu slide đầu tiên là LCP, bạn có thể đặt loading="eager"
                            loading={i === 0 ? 'eager' : 'lazy'}
                            width={1000}
                            height={300}
                            wrapperClassName="w-full !h-[300px] object-cover"
                            // Bạn có thể bỏ qua threshold, delayMethod, delayTime nếu không cần thiết
                        />
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default memo(HomeSlider);
