import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { path } from '~/config/path';
import { categoryService } from '~/services/category.service';
import { CaretDownOutlined } from '@ant-design/icons';

const Category = () => {
    const { slug } = useParams();
    const { pathname } = useLocation();
    const [openParentId, setOpenParentId] = useState(null);

    const { data } = useQuery({
        queryKey: ['category'],
        queryFn: async () => await categoryService.getCategory(),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 5 * 60 * 1000,
        cacheTime: 1000 * 60 * 30,
    });

    // Phân loại parent và child
    const parents = data?.filter((item) => item.parent === null) || [];
    const children = data?.filter((item) => item.parent !== null) || [];

    // Lấy danh sách con của 1 parent
    const getChildrenByParent = (parentId) => {
        return children.filter((child) => child.parent === parentId);
    };

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

                {parents.map((parent) => (
                    <li key={parent._id}>
                        <Link
                            to={`/${parent.slug}`}
                            className={`text-[16px] cursor-pointer mb-1 ${parent.slug === slug ? 'text-[#005fcc]' : 'text-[#222]'}`}
                            onClick={() => setOpenParentId((prev) => (prev === parent._id ? null : parent._id))}
                        >
                            {parent.title}
                            {getChildrenByParent(parent._id).length > 0 && (
                                    <CaretDownOutlined
                                        style={{ fontSize: '12px', cursor: 'pointer', padding: '2px 0 0 5px' }}
                                    />
                                )}
                        </Link>

                        {openParentId === parent._id &&
                            getChildrenByParent(parent._id).map((child) => (
                                <div key={child._id} className="pl-4 mb-1">
                                    <Link
                                        to={`/${child.slug}`}
                                        state={{ categories: child._id }}
                                        className={`text-[15px] cursor-pointer ${child.slug === slug ? 'text-[#005fcc]' : 'text-[#444]'}`}
                                    >
                                        {child.title}
                                    </Link>
                                </div>
                            ))}
                    </li>
                ))}

                {/* Nếu có item nào không có parent lạ (bị sót) */}
                {children.filter((child) => !parents.find((p) => p._id === child.parent)).map((orphan) => (
                    <li key={orphan._id}>
                        <Link
                            to={`/${orphan.slug}`}
                            state={{ categories: orphan._id }}
                            className={`text-[15px] cursor-pointer ${orphan.slug === slug ? 'text-[#005fcc]' : 'text-[#444]'}`}
                        >
                            {orphan.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Category;
