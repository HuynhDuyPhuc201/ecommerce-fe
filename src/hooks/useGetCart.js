import { useQuery } from '@tanstack/react-query';
import { getUser } from '~/core/token';
import { cartService } from '~/services/cart.service';

const useGetCart = () => {
    const user = getUser();
    const { data, isFetching, refetch } = useQuery({
        queryKey: ['cart'],
        queryFn: async () => cartService.getCart(),
        enabled: !!user, // Chỉ chạy khi user tồn tại
        retry: 0, // Không retry nếu lỗi
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
