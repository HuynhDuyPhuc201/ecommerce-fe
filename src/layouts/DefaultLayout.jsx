import React, { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '~/components/Layout/Footer';
import Header from '~/components/Layout/Header';
import Overlay from '~/components/Overlay';
import { useAppStore } from '~/store/useAppStore';

const DefaultLayout = () => {
    const { isOverlayVisible, setOverlayVisible } = useAppStore();
    const inputRef = useRef();
    const hanldeClickOutside = (e) => {
        if (inputRef.current && !inputRef.current.contains(e.target)) {
            setOverlayVisible(false);
        }
    };

    const handleScroll = () => {
        if (window.scrollY > 0) setOverlayVisible(false);
    };
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    return (
        <>
            <div className="flex flex-col min-h-screen">
                <Header ref={inputRef} />
                <main className="flex-grow" onClick={hanldeClickOutside}>
                    {isOverlayVisible && <Overlay />}
                    <Outlet />
                </main>
                <Footer />
            </div>
        </>
    );
};

export default DefaultLayout;
