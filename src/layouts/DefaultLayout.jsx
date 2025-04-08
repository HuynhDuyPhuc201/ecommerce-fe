import React, { useRef } from 'react';
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
    return (
        <>
            <div className="flex flex-col min-h-screen">
                <Header />
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
