import { create } from 'zustand';
import { getAddress, getCart, setCart } from '~/core/token';

export const useLocalStore = create((set) => ({
    cartLocal: getCart() || { listProduct: [], totalProduct: 0, subTotal: 0 },
    addressLocal: getAddress(),
    setCartLocal: (cartLocal) => {
        set(() => ({
            cartLocal: cartLocal,
        }));
    },
    setAddressLocal: (addressLocal) => {
        set(() => ({
            addressLocal: addressLocal,
        }));
    },
}));
