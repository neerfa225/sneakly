import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductCard from "./Productcard";
import { SERVER_URL } from "../Services/serverURL";
const Productdisplay = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistKey, setWishlistKey] = useState("wishlist_guest");
  const [cart, setCart] = useState([]);
  const [cartKey, setCartKey] = useState("cart_guest");

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const email = parsed.email || "guest";

      const wKey = `wishlist_${email}`;
      const cKey = `cart_${email}`;
      setWishlistKey(wKey);
      setCartKey(cKey);

      const savedWishlist = JSON.parse(localStorage.getItem(wKey) || "[]");
      const normalizedWishlist = savedWishlist.map((i) => ({
        product_id: i.product_id || i.product,
        sku_id: i.sku_id || i.sku?.id,
      }));
      setWishlist(normalizedWishlist);

      const savedCart = JSON.parse(localStorage.getItem(cKey) || "[]");
      setCart(savedCart);
    } else {
      setWishlistKey("wishlist_guest");
      setCartKey("cart_guest");

      const savedWishlist = JSON.parse(
        localStorage.getItem("wishlist_guest") || "[]"
      );
      const savedCart = JSON.parse(localStorage.getItem("cart_guest") || "[]");

      const normalizedWishlist = savedWishlist.map((i) => ({
        product_id: i.product_id || i.product,
        sku_id: i.sku_id || i.sku?.id,
      }));

      setWishlist(normalizedWishlist);
      setCart(savedCart);
    }
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      const storedUser = JSON.parse(localStorage.getItem("userData") || "{}");
      const email = storedUser?.email;
      const token = storedUser?.access_token;

      if (email && token) {
        fetchBackendCart();
      } else {
        const guestCart = JSON.parse(
          localStorage.getItem("cart_guest") || "[]"
        );
        setCart(guestCart);
      }
    };

    handleFocus();

    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, []);
  useEffect(() => {
    const syncCart = () => {
      const updated = JSON.parse(localStorage.getItem(cartKey) || "[]");
      setCart(updated);
    };

    window.addEventListener("cartUpdated", syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener("cartUpdated", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, [cartKey]);

  useEffect(() => {
    const syncWishlist = () => {
      const saved = JSON.parse(localStorage.getItem(wishlistKey) || "[]");
      const normalized = saved.map((i) => ({
        product_id: i.product_id || i.product,
        sku_id: i.sku_id || i.sku?.id,
      }));
      setWishlist(normalized);
    };

    window.addEventListener("wishlistUpdated", syncWishlist);
    window.addEventListener("storage", syncWishlist);

    return () => {
      window.removeEventListener("wishlistUpdated", syncWishlist);
      window.removeEventListener("storage", syncWishlist);
    };
  }, [wishlistKey]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${SERVER_URL}/api/product-list/`
        );
        setProducts(response.data.results || response.data || []);
      } catch (err) {
        console.error("Product load error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const fetchBackendCart = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("userData") || "{}");
      const token = storedUser?.access_token;
      const email = storedUser?.email;

      if (!token || !email) return;

      const response = await axios.get(
        `${SERVER_URL}/api/cartList/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
  const toggleWishlist = async (productId, skuId) => {
    const storedUser = localStorage.getItem("userData");
    if (!storedUser) return toast.warn("Please login first!");

    const user = JSON.parse(storedUser);
    const token = user.access_token;
    const email = user.email;
    const wKey = `wishlist_${email}`;

    const list = JSON.parse(localStorage.getItem(wKey) || "[]");
    const normalized = list.map((i) =>
      typeof i === "number" ? { product_id: i, sku_id: null } : i
    );

    const exists = normalized.some(
      (i) =>
        Number(i.product_id) === Number(productId) &&
        Number(i.sku_id) === Number(skuId)
    );

    try {
      await axios.post(
        `${SERVER_URL}/api/add-wishlist/`,
        { product_id: productId, sku_id: skuId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let updated = [];

      if (exists) {
        updated = normalized.filter(
          (i) =>
            Number(i.product_id) !== Number(productId) ||
            Number(i.sku_id) !== Number(skuId)
        );
        toast.info("Removed from wishlist!");
      } else {
        updated = [...normalized, { product_id: productId, sku_id: skuId }];
        toast.success("Added to wishlist!");
      }

      localStorage.setItem(wKey, JSON.stringify(updated));
      setWishlist(updated);
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  };

  const toggleCart = async (productId, skuId, qty = 1, product = null) => {
    const storedUser = localStorage.getItem("userData");

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
          title: product?.title,
          mainimage: product?.mainimage,
          price: product?.sku?.price,
          sales_rate: product?.sku?.sales_rate,
          discount: product?.sku?.discount,
        });

        toast.success("Added to cart!");
      }

      localStorage.setItem("cart_guest", JSON.stringify(guestCart));
      setCart(guestCart);
      window.dispatchEvent(new Event("cartUpdated"));
      return;
    }

    const user = JSON.parse(storedUser);
    const token = user?.access_token;
    const email = user?.email;
    const cartKey = `cart_${email}`;

    let localCart = JSON.parse(localStorage.getItem(cartKey) || "[]");

    const existingItem = localCart.find(
      (item) =>
        Number(item.productId) === Number(productId) &&
        Number(item.skuId) === Number(skuId)
    );

    const currentQty = existingItem?.qty || existingItem?.quantity || 0;
    const newQty = currentQty + qty;

    const formData = new FormData();
    formData.append("product_id", productId);
    formData.append("skuid", skuId);
    formData.append("quantity", newQty);

    try {
      const response = await axios.post(
        `${SERVER_URL}/api/addtocart/`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        if (existingItem) {
          existingItem.qty = newQty;
          toast.info("Added to cart");
        } else {
          localCart.push({
            productId,
            skuId,
            qty: newQty,
            title: product?.title,
            mainimage: product?.mainimage,
            price: product?.sku?.price,
          });
          toast.success("Added to cart");
        }

        localStorage.setItem(cartKey, JSON.stringify(localCart));
        setCart(localCart);
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (err) {
      console.error("cart error", err);
      toast.error("Something went wrong!");
    }
  };

  if (loading)
    return (
      <div className="text-center py-10 text-xl text-gray-500">Loading...</div>
    );

  return (
    <div className="w-[90%] mx-auto">
      <h2 className="text-center font-semibold text-[#112444] text-3xl my-[40px]">
        TRENDING COLLECTION
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-[90%] mx-auto">
        {products.slice(0, 4).map((item) => {
          return (
            <ProductCard
              key={item.id}
              item={item}
              inWishlist={wishlist.some(
                (w) => w.product_id === item.id && w.sku_id === item.sku?.id
              )}
              inCart={cart.some(
                (c) => c.productId === item.id && c.skuId === item.sku?.id
              )}
              toggleWishlist={toggleWishlist}
              toggleCart={toggleCart}
            />
          );
        })}
      </div>

      <ToastContainer
        position="top-right"
        style={{ marginTop: "70px" }}
        autoClose={1500}
      />
    </div>
  );
};

export default Productdisplay;
