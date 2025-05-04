import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useOrderStore = create(
    persist(
        (set) => ({
            checkoutInfo: {},
            setCheckoutInfo: (product) => set((state) => ({ checkoutInfo: product })),
        }),
    ),
);
export default useOrderStore;
