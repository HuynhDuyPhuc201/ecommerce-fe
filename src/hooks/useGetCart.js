import { useQuery } from '@tanstack/react-query';
import { getUser } from '~/config/token';
import { cartService } from '~/services/cart.service';

const useGetCart = () => {
    const user = getUser()
    const { data, isFetching, refetch } = useQuery({
        queryKey: ['cart', user?.id],
        queryFn: async () => cartService.getCart(),
        enabled: !!user,
        retry: !!user ? true : false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    return {
        refetch,
        isFetching,
        data,
    };
};

export default useGetCart;
