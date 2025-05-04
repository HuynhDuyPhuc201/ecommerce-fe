import React from 'react';
import { formatNumber } from '~/utils/formatNumber';

const CheckoutProductItem = ({ image, name, price = 0, quantity = 0 }) => {
    return (
        <li className="flex items-center mb-2.5">
            <img width={70} height={70} src={image} alt={name || 'Product'} className="w-[70px] h-[70px] mr-2.5" />
            <div>
                <p>{name}</p>
                <p>
                    {formatNumber(price)}₫ x {quantity}
                </p>
            </div>
        </li>
    );
};

export default CheckoutProductItem;
