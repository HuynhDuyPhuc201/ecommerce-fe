import { getUser } from '../config/token';
import { userService } from '../services/user.service';
import { useQuery } from '@tanstack/react-query';

const useGetUserDetail = () => {
    const user = getUser();
    const { data, refetch, isFetching } = useQuery({
        queryKey: ['cart', user?._id],
        queryFn: async () => await userService?.getDetail(user?._id),
        enabled: !!user, // Chỉ chạy khi user tồn tại
        retry: 0, // Không retry nếu lỗi
        refetchOnWindowFocus: false, // Tắt refetch khi tab focus lại
        refetchOnReconnect: false, // Tắt refetch khi mạng có lại
        staleTime: 5 * 60 * 1000,
        cacheTime: 1000 * 60 * 30,
    });

    return { data, refetch, isFetching };
};

export default useGetUserDetail;
