import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Normalize wishlist data into consistent format
  const normalizeWishlist = (items) =>
    items.map((item) => ({
      id: item.id,
      product_id: item.product_id || item.product,
      sku_id: item.sku_id || item.sku?.id,
      product_name: item.product_name || item.name,
      mainimage: item.mainimage?.startsWith("http")
        ? item.mainimage
        : `http://192.168.1.94:8002${item.mainimage}`,
      price: item.sku?.price || item.price || 0,
    }));

  // ✅ Fetch and sync wishlist
 useEffect(() => {
  const storedUser = localStorage.getItem("userData");
  if (!storedUser) {
    setLoading(false);
    return;
  }

  const user = JSON.parse(storedUser);
  const token = user?.access_token;
  const email = user?.email;
  const wishlistKey = `wishlist_${email}`;

  const loadWishlist = () => {
    const savedWishlist = JSON.parse(localStorage.getItem(wishlistKey) || "[]");
    setWishlist(normalizeWishlist(savedWishlist));
  };

  // ✅ Load once initially
  loadWishlist();

  // ✅ Fetch latest from backend (once)
  axios
    .get("http://192.168.1.94:8002/api/list-wishlist/", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      const fetchedWishlist = normalizeWishlist(res.data?.data || []);
      setWishlist(fetchedWishlist);
      localStorage.setItem(wishlistKey, JSON.stringify(fetchedWishlist));
    })
    .catch((err) => {
      console.error("Error fetching wishlist:", err);
    })
    .finally(() => setLoading(false));

  // ✅ Listen for both storage events and custom triggers from same tab
  const handleStorageUpdate = (e) => {
    if (e.key === wishlistKey || e.type === "wishlistUpdated") {
      loadWishlist();
    }
  };

  window.addEventListener("storage", handleStorageUpdate);
  window.addEventListener("wishlistUpdated", handleStorageUpdate);

  return () => {
    window.removeEventListener("storage", handleStorageUpdate);
    window.removeEventListener("wishlistUpdated", handleStorageUpdate);
  };
}, []);


  // ✅ Remove wishlist item (sync backend + localStorage)
  const removeItem = async (wishlistId) => {
    const storedUser = localStorage.getItem("userData");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);
    const token = user?.access_token;
    const email = user?.email;
    const wishlistKey = `wishlist_${email}`;

    try {
      await axios.post(
        "http://192.168.1.94:8002/api/remove-wishlist/",
        { wishlist_ids: [wishlistId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Update local state
      const updatedWishlist = wishlist.filter((item) => item.id !== wishlistId);
      setWishlist(updatedWishlist);

      // ✅ Update localStorage
      localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));
    } catch (err) {
      console.error("Error removing wishlist item:", err);
      alert("Failed to remove item from wishlist.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-500">Loading wishlist...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!wishlist.length) {
    return (
      <>
        <Navbar />
        <div className="w-[90%] mx-auto my-10 animate__animated animate__fadeIn">
          <div className="flex flex-col gap-3.5 justify-center items-center mt-[160px]">
            <i
              className="fa-solid fa-heart text-[250px]"
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
  }

  return (
    <>
      <Navbar />
      <div className="w-[90%] mx-auto my-24 animate__animated animate__fadeIn">
        <h2 className="font-bold mb-6 text-center text-[#112444] text-3xl">
          MY WISHLIST
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-[90%] mx-auto">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white  p-4 rounded-xl shadow-md flex flex-col items-center"
            >
              <img
                src={item.mainimage}
                alt={item.product_name}
                className="w-40 h-40 rounded-md mb-4"
              />
              <div className="flex justify-between items-start w-full">
                <div>
                  <h3 className="text-lg font-semibold">{item.product_name.slice(0,10)}</h3>
                  <p className="text-gray-500">₹{item.price}</p>
                </div>
                <button
                  className="bg-[#112444] text-white px-3 py-1 rounded-md text-sm hover:bg-[#0e1f3a] transition duration-200  cursor-pointer"
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
