import { useQuery } from '@tanstack/react-query';
import { Link, NavLink, useLocation, useParams } from 'react-router-dom';
import { path } from '~/config/path';
import { productService } from '~/services/product.service';

const Category = () => {
    const { id } = useParams();
    const { pathname } = useLocation();

    const { data } = useQuery({
        queryKey: ['category'],
        queryFn: async () => await productService.getCategory(),
        refetchOnWindowFocus: false, // Tắt refetch khi tab focus lại
        refetchOnReconnect: false, // Tắt refetch khi mạng có lại
        staleTime: 5 * 60 * 1000,
        cacheTime: 1000 * 60 * 30,
    });

    return (
        <div className="category bg-[#fff] rounded-[8px] p-10 w-full my-2">
            <p className="text-[20px] text-[#333] font-bold mb-5">Danh mục</p>
            <ul>
                <li>
                    <Link
                        className={`text-[16px] cursor-pointer ${pathname === '/' ? 'text-[#005fcc]' : 'text-[#222]'}`}
                        to={path.Home}
                    >
                        Tất cả
                    </Link>
                </li>

                {data?.map((item, index) => (
                    <li key={index}>
                        <NavLink
                            to={`/${item.id}`}
                            className={`text-[16px] cursor-pointer ${item.id == id ? 'text-[#005fcc]' : 'text-[#222]'}`}
                        >
                            {item?.title}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Category;
