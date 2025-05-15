import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useState } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { categoryService } from '~/services/category.service';
import { path } from '~/config/path';

const Category = () => {
    const { slug } = useParams();
    const { pathname } = useLocation();
    const [openCategories, setOpenCategories] = useState([]); // list các ID đang mở

    const { data: categories = [] } = useQuery({
        queryKey: ['category'],
        queryFn: categoryService.getCategory,
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    // Hàm toggle mở/đóng danh mục
    const toggleCategory = (id) => {
        setOpenCategories((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // Hàm đệ quy để render cây danh mục
    const renderCategoryTree = (parentId = null) => {
        const currentLevel = categories?.filter((cat) => cat.parent === parentId);
        if (!currentLevel.length) return null;

        return (
            <ul className="ml-4">
                {currentLevel.map((cat) => {
                    const hasChildren = categories?.some((c) => c.parent === cat._id);
                    const isOpen = openCategories.includes(cat._id);

                    return (
                        <li key={cat._id} className="mb-1">
                            <div className="flex items-center gap-1">
                                <Link
                                    to={`/${cat.slug}`}
                                    className={`text-[15px] ${slug === cat.slug ? 'text-[#005fcc]' : 'text-[#222]'}`}
                                    onClick={() => toggleCategory(cat._id)}
                                >
                                    {cat.title}
                                    
                                </Link>

                                {hasChildren && (
                                    <CaretDownOutlined
                                        className={`transition-transform text-lg cursor-pointer ${isOpen ? 'rotate-180' : ''}`}
                                       
                                    />
                                )}
                            </div>

                            {isOpen && renderCategoryTree(cat._id)}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <div className="category bg-white rounded-[8px] p-10 w-full my-2">
            <p className="text-[20px] text-[#333] font-bold mb-5">Danh mục</p>
            <ul>
                <li className="mb-2">
                    <Link
                        className={`text-[16px] cursor-pointer ${pathname === '/' ? 'text-[#005fcc]' : 'text-[#222]'}`}
                        to={path.Home}
                    >
                        Tất cả
                    </Link>
                </li>
                {renderCategoryTree()}
            </ul>
        </div>
    );
};

export default Category;
