import { Link } from "react-router-dom";

const ProductCard = ({
  item,
  inWishlist,
  inCart,
  toggleWishlist,
  toggleCart
}) => {
  return (
    <div className="bg-white p-4 m-1 rounded-xl shadow-lg flex flex-col h-90">
      <div className="overflow-hidden">
        <Link to={`/product/${item.id}/${item.sku?.id}`}>
          <img
            src={item.mainimage}
            alt={item.title}
            className="w-40 h-30 mx-auto object-contain hover:scale-110 transition"
          />
        </Link>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Link to={`/product/${item.id}/${item.sku?.id}`}>
          <h2 className="text-xl font-semibold ">{item.title.slice(0, 10)}..</h2>
        </Link>

        <i
          className={`cursor-pointer text-2xl ${
            inWishlist
              ? "fa-solid fa-heart text-red-500"
              : "fa-regular fa-heart text-gray-400"
          }`}
          onClick={() => toggleWishlist(item.id, item.sku?.id)}
        ></i>
      </div>
        <div>₹{item.sku?.price}</div>
      <p className="text-gray-500 text-sm mt-2 h-20">
        {item.description?.slice(0, 80)}...
      </p>

      <button
        onClick={() => toggleCart(item.id, item.sku?.id, 1, item)}
        className="px-2 py-1 rounded-md mt-3 border border-[#112444] text-[#112444] cursor-pointer"
      >
        {inCart ? "Add to Cart" : "Add to Cart"}
      </button>
    </div>
  );
};

export default ProductCard;
