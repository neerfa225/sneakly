import React, { useState, useEffect } from "react";
import products from "../../assets/product";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Shop = () => {
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [userKey, setUserKey] = useState("wishlist_guest");
  const [cartKey, setCartKey] = useState("cart_guest");

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");

    if (storedUser) {
      const parsed = JSON.parse(storedUser);

      // Decode email from access token if needed
      const tokenParts = parsed.access_token?.split(".");
      let email = parsed.email;
      if (!email && tokenParts?.length === 3) {
        try {
          const decoded = JSON.parse(atob(tokenParts[1]));
          email = decoded.email;
        } catch (err) {
          console.error("Token decode failed", err);
        }
      }

      // unique keys per user
      const wKey = email ? `wishlist_${email}` : "wishlist_guest";
      const cKey = email ? `cart_${email}` : "cart_guest";
      setUserKey(wKey);
      setCartKey(cKey);

      // Load user-specific wishlist & cart
      const savedWishlist = JSON.parse(localStorage.getItem(wKey) || "[]");
      const savedCart = JSON.parse(localStorage.getItem(cKey) || "[]");
      setWishlist(savedWishlist);
      setCart(savedCart);
    } else {
      // Guest user
      setUserKey("wishlist_guest");
      setCartKey("cart_guest");

      const savedWishlist = JSON.parse(localStorage.getItem("wishlist_guest") || "[]");
      const savedCart = JSON.parse(localStorage.getItem("cart_guest") || "[]");

      setWishlist(savedWishlist);
      setCart(savedCart);
    }
  }, []);

  // ✅ Toggle wishlist item
  const toggleWishlist = (id) => {
    const user = localStorage.getItem("userData");

    if (!user) {
      toast.warning("Please register or log in first!");
      return;
    }

    const updated = wishlist.includes(id)
      ? wishlist.filter((item) => item !== id)
      : [...wishlist, id];

    setWishlist(updated);
    localStorage.setItem(userKey, JSON.stringify(updated));

    if (wishlist.includes(id)) {
      toast.info("Removed from wishlist!");
    } else {
      toast.success("Added to wishlist!");
    }
  };

  // ✅ Toggle cart item
  const toggleCart = (id) => {
    const user = localStorage.getItem("userData");

    if (!user) {
      toast.warning("Please register or log in first!");
      return;
    }

const existing = cart.find((item) => item.id === id);
let updated;

if (existing) {
  // Remove item from cart
  updated = cart.filter((item) => item.id !== id);
  toast.info("Removed from cart!");
} else {
  // Add new item with qty = 1
  updated = [...cart, { id, qty: 1 }];
  toast.success("Added to cart!");
}


    setCart(updated);
    localStorage.setItem(cartKey, JSON.stringify(updated));

   
  };

  return (
    <>
      <Navbar />
      <div className="w-[90%] mx-auto my-10 animate__animated animate__fadeIn">
        <h2 className="text-2xl font-bold mb-6">Shop</h2>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((item) => (
          <div
  key={item.id}
  className="bg-white p-4 m-1 rounded-xl shadow-lg flex flex-col justify-between h-full"
>
  <div className="overflow-hidden">
    <Link to={`/product/${item.id}`}>
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-60 object-cover rounded-md transform transition-transform duration-500 ease-in-out hover:scale-110"
      />
    </Link>
  </div>

  <div className="flex justify-between items-start mt-4">
    <Link to={`/product/${item.id}`}>
      <h2 className="text-xl font-semibold">{item.name}</h2>
    </Link>

    <i
      className={`cursor-pointer text-2xl ${
        wishlist.includes(item.id)
          ? "fa-solid fa-heart text-red-500"
          : "fa-regular fa-heart text-gray-400"
      }`}
      onClick={() => toggleWishlist(item.id)}
    ></i>
  </div>

  {/* Description with fixed min-height for alignment */}
  <p className="text-gray-500 text-sm mt-2 flex-grow min-h-[70px]">
    {item.description}
  </p>

  {/* Stick price & button to bottom */}
  <div className="flex justify-between items-center  pt-1">
    <p className="text-lg font-bold">${item.price}</p>
    <button
      onClick={() => toggleCart(item.id)}
      className={`py-2 px-4 rounded-md font-semibold text-sm transition ${
        cart.find((cartItem) => cartItem.id === item.id)
          ? "bg-[#112444] text-white"
          : "border border-[#112444] text-[#112444] hover:bg-[#112444] hover:text-white"
      }`}
    >
      {cart.find((cartItem) => cartItem.id === item.id)
        ? "Remove"
        : "Add to Cart"}
    </button>
  </div>
</div>

          ))}
        </div>

        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
          style={{ marginTop: "70px" }}
        />
      </div>
      <Footer />
    </>
  );
};

export default Shop;
