import { useQuery } from '@tanstack/react-query';
import { productService } from '~/services/product.service';

const useGetProductDetail = (id) => {
    const { data, refetch, isFetching } = useQuery({
        queryKey: ['productDetail', id],
        queryFn: async () => await productService.getDetail(id),
        enabled: !!id,
        refetchOnWindowFocus: false, 
        refetchOnReconnect: false, 
    });
    return { data, refetch, isFetching };
};

export default useGetProductDetail;
