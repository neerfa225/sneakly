import React, { useState, useEffect } from "react";
import axios from "axios";
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
useEffect(() => {
  const handleFocus = () => {
    const storedUser = JSON.parse(localStorage.getItem("userData") || "{}");
    const email = storedUser?.email;
    const token = storedUser?.access_token;

    if (email && token) {
     
      fetchBackendCart();
    } else {
    
      const guestCart = JSON.parse(localStorage.getItem("cart_guest") || "[]");
      setCart(guestCart);
    }
  };

  
  handleFocus();

  
  window.addEventListener("focus", handleFocus);

  return () => window.removeEventListener("focus", handleFocus);
}, []);

 useEffect(() => {
  const storedUser = localStorage.getItem("userData");

  if (storedUser) {
    const parsed = JSON.parse(storedUser);

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

    const wKey = email ? `wishlist_${email}` : "wishlist_guest";
    const cKey = email ? `cart_${email}` : "cart_guest";
    setUserKey(wKey);
    setCartKey(cKey);

    const savedWishlist = JSON.parse(localStorage.getItem(wKey) || "[]");
    const savedCart = JSON.parse(localStorage.getItem(cKey) || "[]");
    setWishlist(savedWishlist);
    setCart(savedCart);

    // 🧠 Merge guest cart immediately after login
    if (parsed.access_token && localStorage.getItem("cart_guest")) {
      mergeGuestCart(parsed.access_token, email);
    }

  } else {
    setUserKey("wishlist_guest");
    setCartKey("cart_guest");
    const savedWishlist = JSON.parse(
      localStorage.getItem("wishlist_guest") || "[]"
    );
    const savedCart = JSON.parse(localStorage.getItem("cart_guest") || "[]");
    setWishlist(savedWishlist);
    setCart(savedCart);
  }
}, []);

useEffect(() => {
  const updateCartFromLocal = () => {
    const storedUser = JSON.parse(localStorage.getItem("userData") || "{}");
    const email = storedUser?.email || "guest";
    const key = `cart_${email}`;
    const savedCart = JSON.parse(localStorage.getItem(key) || "[]");
    setCart(savedCart);
  };

  // Run once when Shop loads
  updateCartFromLocal();

  // 🔔 Listen for any changes in cart from other tabs/pages
  window.addEventListener("cartUpdated", updateCartFromLocal);
  window.addEventListener("storage", updateCartFromLocal);

  return () => {
    window.removeEventListener("cartUpdated", updateCartFromLocal);
    window.removeEventListener("storage", updateCartFromLocal);
  };
}, []);

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
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error(error.response?.data?.message || "Something went wrong!");
    }
  };
  const toggleCart = async (productId, skuId, qty = 1, product = null) => {
  const storedUser = localStorage.getItem("userData");

  // 🧭 Guest user
  if (!storedUser) {
    const guestCart = JSON.parse(localStorage.getItem("cart_guest") || "[]");

    const existingIndex = guestCart.findIndex(
      (item) => item.productId === productId && item.skuId === skuId
    );

    if (existingIndex !== -1) {
      guestCart.splice(existingIndex, 1);
      toast.info("Removed from cart");
    } else {
      guestCart.push({
        productId,
        skuId,
        qty,
        title: product?.title || "Untitled Product",
        mainimage: product?.mainimage || "",
        price: product?.sku?.price || 0,
      });
      toast.success("Added to cart");
    }

    localStorage.setItem("cart_guest", JSON.stringify(guestCart));
    setCart([...guestCart]);

    // 🔔 Notify all pages (Shop/Product/Cart)
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

  const cartKey = `cart_${email}`;
  const localCart = JSON.parse(localStorage.getItem(cartKey)) || [];

  const existingIndex = localCart.findIndex(
    (item) => item.productId === productId && item.skuId === skuId
  );

  try {
    if (existingIndex !== -1) {
      // 🗑 Remove from backend cart
      const response = await axios.post(
        "http://192.168.1.94:8002/api/RomoveFromcart/",
        { product_id: productId, skuid: skuId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        localCart.splice(existingIndex, 1);
        localStorage.setItem(cartKey, JSON.stringify(localCart));
        setCart([...localCart]);
        toast.info("Removed from cart!");
      } else {
        toast.error("Failed to remove from cart!");
      }
    } else {
      // ➕ Add to backend cart
      const formData = new FormData();
      formData.append("product_id", productId);
      formData.append("skuid", skuId);
      formData.append("quantity", qty);

      const response = await axios.post(
        "http://192.168.1.94:8002/api/addtocart/",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        localCart.push({
          productId,
          skuId,
          qty,
          title: product?.title || "Untitled Product",
          mainimage: product?.mainimage || "",
          price: product?.sku?.price || 0,
        });
        localStorage.setItem(cartKey, JSON.stringify(localCart));
        setCart([...localCart]);
        toast.success("Added to cart!");
      } else {
        toast.error("Failed to add to cart!");
      }
    }

    // 🔔 Notify all pages after change
    window.dispatchEvent(new Event("cartUpdated"));
  } catch (error) {
    console.error("Cart error:", error);
    toast.error("Something went wrong!");
  }
};
const mergeGuestCart = async (tokenValue, email) => {
  const guestCart = JSON.parse(localStorage.getItem("cart_guest") || "[]");
  if (!guestCart.length) return;

  try {
    // Get backend cart first
    const response = await axios.get("http://192.168.1.94:8002/api/cartList/", {
      headers: { Authorization: `Bearer ${tokenValue}` },
    });

    const backendCart = response.data?.cart || [];

    // Add only guest items not in backend
    for (const item of guestCart) {
      const exists = backendCart.some(
        (b) =>
          Number(b.product.id) === Number(item.productId) &&
          Number(b.sku) === Number(item.skuId)
      );

      if (!exists) {
        const formData = new FormData();
        formData.append("product_id", item.productId);
        formData.append("skuid", item.skuId);
        formData.append("quantity", item.qty || 1);

        await axios.post("http://192.168.1.94:8002/api/addtocart/", formData, {
          headers: { Authorization: `Bearer ${tokenValue}` },
        });
      }
    }

    // Clear guest cart
    localStorage.removeItem("cart_guest");

    // Fetch latest backend cart
    await fetchBackendCart();

    // Notify Shop to refresh
    window.dispatchEvent(new Event("cartUpdated"));
    
  } catch (error) {
    console.error("Error merging guest cart:", error);
  }
};

const fetchBackendCart = async () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("userData") || "{}");
    const token = storedUser?.access_token;
    const email = storedUser?.email;

    if (!token || !email) return;

    const response = await axios.get("http://192.168.1.94:8002/api/cartList/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const backendCart = response.data?.cart || [];

    const formattedCart = backendCart.map((item) => ({
      productId: item.product?.id,
      skuId: item.sku,
      qty: item.quantity,
      title: item.product?.title,
      mainimage: item.product?.mainimage,
      price: item.product?.sku?.price,
    }));

    localStorage.setItem(`cart_${email}`, JSON.stringify(formattedCart));
    setCart(formattedCart);
  } catch (error) {
    console.error("Error fetching backend cart:", error);
  }
};

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-[70vh]">
          <p className="text-lg font-semibold">Loading products...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="w-[90%] mx-auto my-10 animate__animated animate__fadeIn">
        <h2 className="text-2xl font-bold mb-6">Shop</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 m-1 rounded-xl shadow-lg flex flex-col justify-between h-full"
            >
              <div className="overflow-hidden">
                <Link to={`/product/${item.id}/${item.sku?.id || ""}`}>
                  <img
                    src={item.mainimage}
                    alt={item.name}
                    className="w-40 h-40 mx-auto object-contain rounded-md transform transition-transform duration-500 ease-in-out hover:scale-110"
                  />
                </Link>
              </div>

              <div className="flex justify-between items-start mt-4">
                <Link to={`/product/${item.id}/${item.sku?.id || ""}`}>
                  <h2 className="text-xl font-semibold">{item.title}</h2>
                </Link>

                <i
                  className={`cursor-pointer text-2xl ${
                    wishlist.some(
                      (wishItem) =>
                        (wishItem.product_id === item.id ||
                          wishItem.product === item.id) &&
                        (wishItem.sku_id === item.sku?.id ||
                          wishItem.sku?.id === item.sku?.id)
                    )
                      ? "fa-solid fa-heart text-red-500"
                      : "fa-regular fa-heart text-gray-400"
                  }`}
                  onClick={() => toggleWishlist(item.id, item.sku?.id)}
                ></i>
              </div>

              <p className="text-gray-500 text-sm mt-2 flex-grow min-h-[70px]">
                {item.description?.slice(0, 60)}...
              </p>

              <div className="flex justify-between items-center gap-1 pt-1">
                <p className="text-lg font-bold">₹{item.sku?.price}</p>

                <button
                  onClick={() => toggleCart(item.id, item.sku?.id, 1, item)}
                  className={`px-1.5 py-1.5 rounded-md font-semibold text-sm transition cursor-pointer ${
                    cart.find(
                      (cartItem) =>
                        cartItem.productId === item.id &&
                        cartItem.skuId === item.sku?.id
                    )
                      ? "bg-[#112444] text-white"
                      : "border border-[#112444] text-[#112444] hover:bg-[#112444] hover:text-white"
                  }`}
                >
                  {cart.find(
                    (cartItem) =>
                      cartItem.productId === item.id &&
                      cartItem.skuId === item.sku?.id
                  )
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
