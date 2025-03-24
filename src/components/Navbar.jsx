import Rating from './Type/Rating';
import Price from './Type/Price';
import Category from './Type/Catergory';
const Navbar = ({ ratingObj, priceObj }) => {
    return (
        <>
            <div className="flex items-center flex-col mt-5 w-full">
                <Category />
                <Rating ratingObj={ratingObj} />
                <Price priceObj={priceObj} />
            </div>
        </>
    );
};

export default Navbar;
