import React, { useState, useEffect } from "react";
import products from "../../assets/product";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [userKey, setUserKey] = useState("wishlist_guest");

  // ✅ Load user-specific wishlist from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");

    if (storedUser) {
      const parsed = JSON.parse(storedUser);

      // decode email from access token if needed
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

      // unique wishlist key per user
      const key = email ? `wishlist_${email}` : "wishlist_guest";
      setUserKey(key);

      // load user-specific wishlist
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      setWishlist(saved);
    } else {
      setUserKey("wishlist_guest");
      const saved = JSON.parse(localStorage.getItem("wishlist_guest") || "[]");
      setWishlist(saved);
    }
  }, []);

  // ✅ Remove item from wishlist
  const removeItem = (id) => {
    const updated = wishlist.filter((item) => item !== id);
    setWishlist(updated);
    localStorage.setItem(userKey, JSON.stringify(updated)); // correct key
  };

  // ✅ Get wishlist products
  const wishlistProducts = products.filter((item) =>
    wishlist.includes(item.id)
  );

  // ✅ Empty Wishlist Page
  if (wishlistProducts.length === 0)
    return (
      <>
        <Navbar />
        <div className="w-[90%] mx-auto my-10 animate__animated animate__fadeIn">
          <div className="flex flex-col gap-3.5 justify-center items-center mt-[160px]">
            <i
              className="fa-solid fa-bag-shopping text-[250px]"
              style={{ color: "#ced4de" }}
            ></i>
            <p className="text-gray-500 text-lg font-medium mt-2">
              Your wishlist is empty.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );

  // ✅ Wishlist with Items
  return (
    <>
      <Navbar />
      <div className="w-[90%] mx-auto my-24 animate__animated animate__fadeIn">
        <h2 className="font-bold mb-6 text-center text-[#112444] text-3xl">
          MY WISHLIST
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {wishlistProducts.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-60 object-cover rounded-md mb-4"
              />
              <div className="flex justify-between items-start w-full">
                <div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-500">${item.price}</p>
                </div>
                <button
                  className="bg-[#112444] text-white px-3 py-1 rounded-md text-sm hover:bg-[#0e1f3a] transition duration-200"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Wishlist;
