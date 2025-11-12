import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Productdisplay = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistKey, setWishlistKey] = useState("wishlist_guest");

  // ✅ Load wishlist when component mounts
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");

    if (storedUser) {
      const user = JSON.parse(storedUser);
      const email = user?.email || "guest";
      const key = `wishlist_${email}`;
      setWishlistKey(key);

      const savedWishlist = JSON.parse(localStorage.getItem(key) || "[]");
      const normalized = savedWishlist.map((item) => ({
        product_id: item.product_id || item.product,
        sku_id: item.sku_id || item.sku?.id,
      }));
      setWishlist(normalized);
    } else {
      // Guest user
      const savedWishlist = JSON.parse(
        localStorage.getItem("wishlist_guest") || "[]"
      );
      const normalized = savedWishlist.map((item) => ({
        product_id: item.product_id || item.product,
        sku_id: item.sku_id || item.sku?.id,
      }));
      setWishlist(normalized);
    }
  }, []);

  // ✅ Listen for external updates (wishlist changes in other tabs/pages)
  useEffect(() => {
    const syncWishlist = () => {
      const saved = JSON.parse(localStorage.getItem(wishlistKey) || "[]");
      const normalized = saved.map((item) => ({
        product_id: item.product_id || item.product,
        sku_id: item.sku_id || item.sku?.id,
      }));
      setWishlist(normalized);
    };

    window.addEventListener("storage", syncWishlist);
    window.addEventListener("wishlistUpdated", syncWishlist);

    return () => {
      window.removeEventListener("storage", syncWishlist);
      window.removeEventListener("wishlistUpdated", syncWishlist);
    };
  }, [wishlistKey]);

  // ✅ Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "http://192.168.1.94:8002/api/product-list/?page=1&brand=4&price=100,4000"
        );
        setProducts(response.data.results || response.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Toggle wishlist (single API for add/remove)
  const toggleWishlist = async (productId, skuId) => {
    const storedUser = localStorage.getItem("userData");
    if (!storedUser) {
      toast.warning("Please log in first!");
      return;
    }

    const user = JSON.parse(storedUser);
    const token = user?.access_token;
    const email = user?.email || "guest";
    const wishlistKey = `wishlist_${email}`;

    const localWishlist = JSON.parse(localStorage.getItem(wishlistKey) || "[]");
    const normalizedWishlist = localWishlist.map((item) =>
      typeof item === "number" ? { product_id: item, sku_id: null } : item
    );

    const alreadyExists = normalizedWishlist.some(
      (item) =>
        Number(item.product_id) === Number(productId) &&
        Number(item.sku_id) === Number(skuId)
    );

    try {
      const res = await axios.post(
        "http://192.168.1.94:8002/api/add-wishlist/",
        { product_id: productId, sku_id: skuId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200 || res.status === 201) {
        let updatedWishlist;
        if (alreadyExists) {
          updatedWishlist = normalizedWishlist.filter(
            (item) =>
              Number(item.product_id) !== Number(productId) ||
              Number(item.sku_id) !== Number(skuId)
          );
          toast.info("Removed from wishlist!");
        } else {
          updatedWishlist = [
            ...normalizedWishlist,
            { product_id: productId, sku_id: skuId },
          ];
          toast.success("Added to wishlist!");
        }

        localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));
        setWishlist(updatedWishlist);

        // ✅ Notify other components/tabs
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error(error.response?.data?.message || "Something went wrong!");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500 text-xl">Loading...</div>
    );
  }

  return (
    <div className="w-[90%] mx-auto">
      <h2
        data-aos="fade-right"
        className="text-center font-semibold text-[#112444] text-3xl my-[40px]"
      >
        TRENDING COLLECTION
      </h2>

      {products.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No products found</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 w-[90%] mx-auto sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 m-1 rounded-xl shadow-md flex flex-col overflow-hidden"
            >
              <div className="overflow-hidden">
                <Link to={`/product/${item.id}/${item.sku.id}`}>
                  <img
                    src={item.mainimage}
                    alt={item.name}
                    className="w-50 mx-auto h-50 object-fit rounded-md transform transition-transform duration-500 ease-in-out hover:scale-110"
                  />
                </Link>
              </div>

              <div className="flex items-center justify-between">
                <Link to={`/product/${item.id}/${item.sku.id}`}>
                  <h2 className="text-xl font-semibold mt-4 h-13">
                    {item.title}
                  </h2>
                </Link>

                <i
                  className={`cursor-pointer text-2xl ${
                    wishlist.some(
                      (wishItem) =>
                        Number(wishItem.product_id) === Number(item.id) &&
                        Number(wishItem.sku_id) === Number(item.sku?.id)
                    )
                      ? "fa-solid fa-heart text-red-500"
                      : "fa-regular fa-heart text-gray-400"
                  }`}
                  onClick={() => toggleWishlist(item.id, item.sku?.id)}
                ></i>
              </div>

              <p className="text-gray-500 text-sm mt-2">
                {item.description?.slice(0, 60)}...
              </p>
            </div>
          ))}
        </div>
      )}

      <ToastContainer position="top-right" autoClose={1500} className="mt-15" />
    </div>
  );
};

export default Productdisplay;
