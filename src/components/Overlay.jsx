import { useAppStore } from '~/store/useAppStore';

const Overlay = () => {
    const { setOverlayVisible } = useAppStore();

    return (
        <div
            onClick={() => setOverlayVisible(false)} // Click để tắt overlay
            className="fixed  left-0 w-screen h-screen bg-black/30 z-10 top-0"
        />
    );
};

export default Overlay;
