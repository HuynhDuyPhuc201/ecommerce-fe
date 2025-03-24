import React, { forwardRef, useEffect } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { productService } from '~/services/product.service';
import { useDebounce } from '~/hooks/useDebounce';
import { useAppStore } from '~/store/useAppStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from 'antd';

const SearchBar = forwardRef(({ placeholder, size = 'small', text }, ref) => {
    const { setSearchResults, searchValue, setSearchValue, setOverlayVisible } = useAppStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const querySearch = searchParams.get('q') || '';

    useEffect(() => {
        if (!searchValue) setSearchResults([]);
    }, [searchValue]);
    // Debounce để tìm kiếm sau 0.3 giây
    const debouncedSearch = useDebounce(searchValue, 300);

    // Gọi API khi có debounce search
    const { data, refetch } = useQuery({
        queryKey: ['products', debouncedSearch],
        queryFn: async () => await productService.getAll(`?q=${debouncedSearch}`),
        enabled: !!debouncedSearch, // Chỉ fetch khi có dữ liệu
        refetchOnWindowFocus: false, // Tắt refetch khi tab focus lại
        refetchOnReconnect: false, // Tắt refetch khi mạng có lại
    });

    // Cập nhật kết quả tìm kiếm khi API trả về dữ liệu mới
    useEffect(() => {
        if (data) setSearchResults(data.data);
    }, [data]);

    // Cập nhật state khi URL có query ?q=
    useEffect(() => {
        if (querySearch) setSearchValue(querySearch);
    }, [querySearch]);

    // Xử lý khi thay đổi input
    const handleOnChange = (e) => {
        setSearchValue(e.target.value);
        setOverlayVisible(true);
    };

    // Xử lý khi click nút tìm kiếm
    const handleSearch = () => {
        if (!searchValue.trim()) return;

        // Cập nhật URL với query ?q=searchValue
        navigate(`/?q=${searchValue}`);
        setOverlayVisible(false);
        refetch();
    };

    return (
        <div className="flex items-center">
            <input
                style={{
                    borderTop: 'none',
                    borderRight: 'none',
                    borderLeft: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    borderRadius: '0',
                    height: '40px',
                }}
                placeholder={placeholder}
                className="w-full p-3"
                onChange={handleOnChange}
                value={searchValue} // Hiển thị giá trị trên input
                ref={ref}
                onFocus={() => setOverlayVisible(true)}
            />
            <Button
                size={size}
                icon={<SearchOutlined />}
                style={{ fontSize: '17px', borderRadius: '0', border: 'none' }}
                onClick={handleSearch}
            >
                {text}
            </Button>
        </div>
    );
});

export default SearchBar;
