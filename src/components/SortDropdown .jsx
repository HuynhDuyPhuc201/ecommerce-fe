import { memo } from 'react';

const SortDropdown = ({ sort, onChange }) => {
    return (
        <div className="p-4 flex items-center justify-between md:justify-end font-[sans-serif]">
            <label className="text-[16px] text-[#333] block pr-3" htmlFor="sort-select">
                Sắp xếp giá theo:
            </label>
            <select
                id="sort-select"
                value={sort}
                onChange={onChange}
                className="w-[50%] md:w-[20%] p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <option value="asc">Thấp đến cao</option>
                <option value="desc">Cao đến thấp</option>
            </select>
        </div>
    );
};
export default memo(SortDropdown);
