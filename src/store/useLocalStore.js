import { create } from 'zustand';
import { getAddress, getCart, setCart } from '~/core/token';

const address = getAddress();
export const useLocalStore = create((set) => ({
    cartLocal: getCart() || { listProduct: [], totalProduct: 0, subTotal: 0 },
    addressLocal: address,
    setCartLocal: (cartLocal) => {
        set(() => ({
            cartLocal: cartLocal,
        }));
    },
}));
