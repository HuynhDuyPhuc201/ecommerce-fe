import { useQuery } from '@tanstack/react-query';
import { productService } from '~/services/product.service';

const useGetProductDetail = (id) => {
    const { data, refetch, isFetching } = useQuery({
        queryKey: ['productDetail', id],
        queryFn: async () => await productService?.getDetail(id),
        enabled: !!id,
        refetchOnWindowFocus: false, // Tắt refetch khi tab focus lại
        refetchOnReconnect: false, // Tắt refetch khi mạng có lại
    });
    return { data, refetch, isFetching };
};

export default useGetProductDetail;
