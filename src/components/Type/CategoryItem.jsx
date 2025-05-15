const CategoryItem = ({ category, slug, openId, setOpenId, level = 0 }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isOpen = openId === category._id;

    const toggle = () => {
        if (hasChildren) {
            setOpenId((prev) => (prev === category._id ? null : category._id));
        }
    };

    return (
        <li className="mb-1">
            <div
                className={`cursor-pointer pl-${level * 4} ${slug === category.slug ? 'text-[#005fcc]' : 'text-[#222]'}`}
                onClick={toggle}
            >
                <Link to={`/${category.slug}`}>
                    {category.title}
                </Link>
                {hasChildren && (
                    <CaretDownOutlined
                        style={{
                            fontSize: '12px',
                            marginLeft: 6,
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                            transition: 'transform 0.2s',
                        }}
                    />
                )}
            </div>

            {isOpen && hasChildren && (
                <ul>
                    {category.children.map((child) => (
                        <CategoryItem
                            key={child._id}
                            category={child}
                            slug={slug}
                            openId={openId}
                            setOpenId={setOpenId}
                            level={level + 1}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};
