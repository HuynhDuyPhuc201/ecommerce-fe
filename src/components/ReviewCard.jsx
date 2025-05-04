import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { path } from '~/config/path';
import { getUser } from '~/config/token';
import { formattedDate } from '~/utils/formatDate';
import { useScrollTop } from '~/hooks/useScrollTop';

export const ReviewCard = ({ itemReview }) => {
    const user = getUser();
    const handleClickItem = () => useScrollTop();
    return (
        <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <img src={itemReview?.userAvatar} alt="" className="w-12 h-12 rounded-full" />
                    <span className="text-md font-medium ml-2">{itemReview?.userName || ''}</span>
                </div>
                {itemReview?.userId === user?._id && (
                    <Link to={path.Account.MyOrder} onClick={handleClickItem}>
                        <Button variant="outline" size="sm" className="text-orange-500">
                            Sửa
                        </Button>
                    </Link>
                )}
            </div>

            <div className="flex mb-2">
                {[...Array(Number.isInteger(itemReview?.rating) ? itemReview.rating : 1)].map((_, i) => (
                    <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`h-6 w-6 text-[#ffff19] ${
                            i < Math.floor(itemReview?.rating) ? 'opacity-100' : 'opacity-30'
                        }`}
                    >
                        <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                        />
                    </svg>
                ))}
            </div>
            <p className="text-gray-700 mb-4">{itemReview?.comment}</p>
            <div className="w-28 h-2w-28 flex gap-3 pb-4">
                {itemReview?.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="w-28 h-28" />
                ))}
            </div>
            <p className="text-lg text-gray-500">{formattedDate(itemReview?.createdAt)}</p>
        </div>
    );
};
