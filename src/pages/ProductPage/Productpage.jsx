import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Productpage = () => {
  const { id, sku } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
const [isInCart, setIsInCart] = useState(false);

  const [wishlistKey, setWishlistKey] = useState("wishlist_guest");
  const [activeTab, setActiveTab] = useState("Details");



  // ✅ 1. Initialize and sync wishlist key + data
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    let email = "guest";

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const tokenParts = parsed.access_token?.split(".");
        if (tokenParts?.length === 3) {
          const decoded = JSON.parse(atob(tokenParts[1]));
          email = decoded.email || parsed.email || "guest";
        } else {
          email = parsed.email || "guest";
        }
      } catch (e) {
        console.error("Token decode failed:", e);
      }
    }

    const wKey = `wishlist_${email}`;
    setWishlistKey(wKey);

    // ✅ Load normalized wishlist
    const savedWishlist = JSON.parse(localStorage.getItem(wKey) || "[]");
    const normalized = savedWishlist.map((item) => ({
      product_id: item.product_id || item.product,
      sku_id: item.sku_id || item.sku?.id,
    }));
    setWishlist(normalized);
  }, []);

  // ✅ 2. Sync with localStorage in real time
  useEffect(() => {
    const syncWishlist = () => {
      const storedUser = localStorage.getItem("userData");
      const email = storedUser ? JSON.parse(storedUser).email || "guest" : "guest";
      const wishlistKey = `wishlist_${email}`;
      const savedWishlist = JSON.parse(localStorage.getItem(wishlistKey) || "[]");
      const normalized = savedWishlist.map((item) => ({
        product_id: item.product_id || item.product,
        sku_id: item.sku_id || item.sku?.id,
      }));
      setWishlist(normalized);
    };

    syncWishlist();
    window.addEventListener("storage", syncWishlist);
    return () => window.removeEventListener("storage", syncWishlist);
  }, []);
useEffect(() => {
  if (!product) return; // wait until product is loaded

  const syncCart = () => {
    const storedUser = localStorage.getItem("userData");
    let email = "guest";
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      email = parsed.email || "guest";
    }
    const cartKey = `cart_${email}`;
    const savedCart = JSON.parse(localStorage.getItem(cartKey) || "[]");

    // Normalize IDs for both local and backend formats
    const inCart = savedCart.some((item) => {
      const pid = item.productId || item.product?.id;
      const sid = item.skuId || item.sku;
      return (
        Number(pid) === Number(product?.product_detail?.id) &&
        Number(sid) === Number(product?.sku_list?.[0]?.id)
      );
    });

    setIsInCart(inCart);
  };

  syncCart();
  window.addEventListener("cartUpdated", syncCart);
  return () => window.removeEventListener("cartUpdated", syncCart);
}, [product]);

  // ✅ 3. Fetch product detail
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const storedUser = JSON.parse(localStorage.getItem("userData"));
        const token = storedUser?.access_token;

        const response = await axios.get(
          `http://192.168.1.94:8002/api/product-detail/${id}/${sku}/`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        setProduct(response.data.data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details!");
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [id, sku]);

  // ✅ 4. Add / remove wishlist (normalized)
// update your toggleWishlist function with this
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

  // Load existing wishlist
  const localWishlist = JSON.parse(localStorage.getItem(wishlistKey) || "[]");
  const normalizedWishlist = localWishlist.map((item) => ({
    product_id: item.product_id || item.product,
    sku_id: item.sku_id || item.sku?.id,
  }));

  // Check if product already exists
  const alreadyExists = normalizedWishlist.some(
    (item) =>
      Number(item.product_id) === Number(productId) &&
      Number(item.sku_id) === Number(skuId)
  );

  try {
    // ✅ Use only ADD API (it toggles add/remove on backend)
    const res = await axios.post(
      "http://192.168.1.94:8002/api/add-wishlist/",
      { product_id: productId, sku_id: skuId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // ✅ Update local storage and state manually (toggle behavior)
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

    // ✅ Notify other pages (Shop / Wishlist)
    window.dispatchEvent(new Event("wishlistUpdated"));
  } catch (error) {
    console.error("Wishlist toggle error:", error);
    toast.error(error.response?.data?.message || "Something went wrong!");
  }
};

  // ✅ 5. Wishlist status checker (always works after normalization)
  const isInWishlist = wishlist.some(
    (item) =>
      Number(item.product_id) === Number(product?.product_detail?.id) &&
      Number(item.sku_id) === Number(product?.sku_list?.[0]?.id)
  );

const toggleCart = async (productId, skuId, qty = 1, product = null) => {
  const storedUser = localStorage.getItem("userData");

  // 🧭 Guest user
  if (!storedUser) {
    let guestCart = JSON.parse(localStorage.getItem("cart_guest") || "[]");

    const existingIndex = guestCart.findIndex(
      (item) => item.productId === productId && item.skuId === skuId
    );

    if (existingIndex !== -1) {
      guestCart[existingIndex].qty += qty;
      toast.info("Added to cart!");
    } else {
      guestCart.push({
        productId,
        skuId,
        qty,
        title: product?.title || "Untitled Product",
        mainimage: product?.mainimage || "",
        price: product?.sku?.price || 0,
      });
      toast.success("Added to cart!");
    }

    localStorage.setItem("cart_guest", JSON.stringify(guestCart));
    window.dispatchEvent(new Event("cartUpdated"));
    return;
  }

  // 🧭 Logged-in user
  const user = JSON.parse(storedUser);
  const token = user?.access_token;
  const email = user?.email;

  if (!token) {
    toast.error("Authentication token not found!");
    return;
  }

  const cartKey = email ? `cart_${email}` : "cart_guest";
  let localCart = JSON.parse(localStorage.getItem(cartKey) || "[]");

  // ✅ Step 1: Find local quantity (trust local first)
  const existingItem = localCart.find(
    (item) =>
      Number(item.productId || item.product?.id) === Number(productId) &&
      Number(item.skuId || item.sku) === Number(skuId)
  );

  const currentQty = existingItem?.qty || existingItem?.quantity || 0;
  const newQty = currentQty + qty; // ✅ increment locally

  // ✅ Step 2: Send updated quantity to backend
  const formData = new FormData();
  formData.append("product_id", productId);
  formData.append("skuid", skuId);
  formData.append("quantity", newQty);

  try {
    const response = await axios.post(
      "http://192.168.1.94:8002/api/addtocart/",
      formData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 200 || response.status === 201) {
      // ✅ Step 3: Update localStorage & UI
      if (existingItem) {
        existingItem.qty = newQty;
        existingItem.quantity = newQty;
        toast.info("Added to cart");
      } else {
        localCart.push({
          productId,
          skuId,
          qty: newQty,
          title: product?.title || "Untitled Product",
          mainimage: product?.mainimage || "",
          price: product?.sku?.price || 0,
        });
        toast.success("Added to cart!");
      }

      localStorage.setItem(cartKey, JSON.stringify(localCart));
      setCart(localCart);
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      toast.error("Failed to update cart!");
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    toast.error("Something went wrong!");
  }
};


  if (loading)
    return <p className="text-center mt-20 text-gray-500">Loading product...</p>;
  if (!product)
    return <p className="text-center mt-20 text-gray-500">Product not found.</p>;

  const tabs = {
    Details: product?.product_detail?.description || "No details available",
    Size: "Sizes available in UK, US, EU",
    "Return Policy":
      "You can return the product within 15 days of delivery for a refund or exchange.",
    "Delivery info": "Delivered within 7-10 Working days",
  };

  const renderTabContent = () => (
    <p className="text-gray-700">
      {activeTab === "Details"
        ? product?.product_detail?.description
        : tabs[activeTab]}
    </p>
  );

  return (
    <>
      <Navbar />
      <div className="w-[90%] mx-auto my-10 mt-[120px] flex flex-col gap-12 sm:flex-row">
        {/* Product Image */}
        <div className="w-full sm:w-1/2 bg-gray-50 p-6 rounded-2xl shadow-lg overflow-hidden">
          <img
            src={product.product_detail.mainimage}
            alt={product.product_detail.title}
            className="w-full h-[500px] object-contain transform transition-transform duration-500 ease-in-out hover:scale-105"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center w-full sm:w-1/2 mt-5 sm:mt-0">
          <h1 className="text-3xl font-bold mb-2">
            {product.product_detail.title}
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            PRODUCT CODE: {product.product_detail.pcode || "N/A"}
          </p>

          <div className="flex items-center gap-3 mb-4">
            <p className="text-2xl font-bold text-[#112444]">
              ₹{product.product_detail.sku.price}
            </p>
            {product.product_detail.sku.sales_rate && (
              <span className="bg-[#112444] text-white px-3 py-1 text-sm font-semibold rounded-full">
                {product.product_detail.sku.sales_rate}% OFF
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-6">
            {product.product_detail.description.slice(0, 120) + "..."}
          </p>

          {/* ✅ Buttons */}
          <div className="flex gap-4 mb-8">
    <button
  onClick={() =>
    toggleCart(
      product.product_detail.id,
      product.sku_list[0]?.id,
      1,
      product.product_detail
    )
  }
  className="px-3 py-2 rounded-md font-semibold transition bg-[#112444] text-white cursor-pointer"
>
  {isInCart ? " Add to Cart" : "Add to Cart"}
</button>




            <button className=" bg-[#112444] text-white cursor-pointer px-3 py-2 rounded-md font-semibold "
  onClick={() =>
    toggleWishlist(product.product_detail.id, product.sku_list[0]?.id)
  }
>
  {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
</button>

          </div>

          {/* Tabs */}
          <div className="flex gap-8 border-b border-gray-200 mb-4">
            {Object.keys(tabs).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`pb-2 font-semibold cursor-pointer ${
                  activeTab === tabKey
                    ? "text-[#112444] border-b-2 border-[#112444]"
                    : "text-gray-600 hover:text-[#112444]"
                } transition`}
              >
                {tabKey}
              </button>
            ))}
          </div>

          <div className="text-gray-700 text-sm min-h-[100px] transition-all duration-300">
            {renderTabContent()}
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Delivery Estimate: Read our Terms and Conditions
          </p>

          <ToastContainer
            position="top-right"
            autoClose={2000}
            theme="colored"
            style={{ marginTop: "70px" }}
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Productpage;
