import { useQuery } from '@tanstack/react-query';
import { cartService } from '~/services/cart.service';

const useGetCart = (user) => {
    const { data, isFetching, refetch } = useQuery({
        queryKey: ['cart'],
        queryFn: async () => cartService.getCart(),
        refetchOnWindowFocus: false, // Tắt refetch khi tab focus lại
        refetchOnReconnect: false, // Tắt refetch khi mạng có lại
    });
    return {
        refetch,
        isFetching,
        data,
    };
};

export default useGetCart;
