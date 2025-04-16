import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { slider_1, slider_2 } from '~/constants/images';

const HomeSlider = () => {
    const images = [slider_1, slider_2];
    const [index, setIndex] = useState(0);

    // Auto chuyển ảnh mỗi 5 giây
    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [images.length]);

    return (
        <div className="relative w-full h-[500px] overflow-hidden rounded-2xl shadow-lg">
            <AnimatePresence initial={false}>
                <motion.div
                    key={index}
                    className="w-full h-full absolute top-0 left-0"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.8 }}
                >
                    <img
                        src={images[index]}
                        alt={`slider-${index}`}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        fetchpriority={index === 0 ? 'high' : 'auto'}
                        className="w-full h-full object-cover"
                    />
                </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            i === index ? 'bg-white' : 'bg-white/50'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default memo(HomeSlider);
