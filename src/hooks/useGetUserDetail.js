import { getUser } from '../core/token';
import { userService } from '../services/user.service';
import { useQuery } from '@tanstack/react-query';

const useGetUserDetail = () => {
    const user = getUser();
    const { data, refetch, isFetching } = useQuery({
        queryKey: ['cart', user?._id],
        queryFn: async () => await userService?.getDetail(user?._id),
        enabled: !!user, // Chỉ chạy khi user tồn tại
        retry: 0, // Không retry nếu lỗi
    });

    return { data, refetch, isFetching };
};

export default useGetUserDetail;
