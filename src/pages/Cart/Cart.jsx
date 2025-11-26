import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [userKey, setUserKey] = useState("cart_guest");
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    let key = "cart_guest";
    let tokenValue = null;

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      tokenValue = parsed.access_token;

      let email = parsed.email;
      if (!email && tokenValue) {
        try {
          const decoded = JSON.parse(atob(tokenValue.split(".")[1]));
          email = decoded.email;
        } catch (err) {
          console.error("Token decode failed", err);
        }
      }

      key = email ? `cart_${email}` : "cart_guest";
    }

    setUserKey(key);
    setToken(tokenValue);

    // 🧠 Merge only once after login
    const mergedFlag = localStorage.getItem("cart_merged");

    if (tokenValue && !mergedFlag) {
      mergeGuestCart(tokenValue, key);
      localStorage.setItem("cart_merged", "true");
    } else if (tokenValue) {
      fetchCartFromBackend(tokenValue);
    } else {
      const savedCart = JSON.parse(localStorage.getItem(key) || "[]");
      setCart(savedCart);
      setLoading(false);
    }
  }, []);

  // ✅ Merge guest cart with backend + logged-in cart
  const mergeGuestCart = async (tokenValue, userCartKey) => {
    const guestCart = JSON.parse(localStorage.getItem("cart_guest") || "[]");

    if (!guestCart.length) {
      // No guest cart found → just fetch from backend
      fetchCartFromBackend(tokenValue);
      return;
    }

    try {
      // Step 1: Fetch backend cart first
      const response = await axios.get(
        "http://192.168.1.94:8002/api/cartList/",
        {
          headers: { Authorization: `Bearer ${tokenValue}` },
        }
      );
      const backendCart = response.data?.cart || [];

      // Step 2: Loop guest items and merge intelligently
      for (const guestItem of guestCart) {
        const match = backendCart.find(
          (bItem) =>
            Number(bItem.product.id) === Number(guestItem.productId) &&
            Number(bItem.sku) === Number(guestItem.skuId)
        );

        // ✅ CASE 1: Already exists → update backend quantity = backend + guest
        if (match) {
          const combinedQty =
            (match.quantity || 0) + (guestItem.qty || guestItem.quantity || 1);

          const formData = new FormData();
          formData.append("product_id", guestItem.productId);
          formData.append("skuid", guestItem.skuId);
          formData.append("quantity", combinedQty);

          await axios.post(
            "http://192.168.1.94:8002/api/addtocart/",
            formData,
            {
              headers: { Authorization: `Bearer ${tokenValue}` },
            }
          );
        }

        // ✅ CASE 2: Doesn’t exist → add fresh
        else {
          const formData = new FormData();
          formData.append("product_id", guestItem.productId);
          formData.append("skuid", guestItem.skuId);
          formData.append("quantity", guestItem.qty || guestItem.quantity || 1);

          await axios.post(
            "http://192.168.1.94:8002/api/addtocart/",
            formData,
            {
              headers: { Authorization: `Bearer ${tokenValue}` },
            }
          );
        }
      }

      // Step 3: Clear guest cart safely
      localStorage.removeItem("cart_guest");

      // Step 4: Refresh backend cart
      await fetchCartFromBackend(tokenValue);

      // Step 5: Notify other pages
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Guest cart merge failed:", error);
      toast.error("Error merging guest cart!");
      // Still clear guest cart to avoid infinite duplication
      localStorage.removeItem("cart_guest");
      fetchCartFromBackend(tokenValue);
    }
  };

  const fetchCartFromBackend = async (tokenValue) => {
    try {
      const response = await axios.get(
        "http://192.168.1.94:8002/api/cartList/",
        { headers: { Authorization: `Bearer ${tokenValue}` } }
      );

      const backendCart = response.data?.cart || [];
      setCart(backendCart);

      // 🧠 OPTIONAL: also save locally for inspection
      const storedUser = JSON.parse(localStorage.getItem("userData"));
      const email = storedUser?.email;
      if (email) {
        localStorage.setItem(`cart_${email}`, JSON.stringify(backendCart));
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Error loading cart items!");
    } finally {
      setLoading(false);
    }
  };

  const updateCart = async (productId, newQty, skuId = null) => {
    if (newQty < 1) return; // prevent qty = 0

    const storedUser = JSON.parse(localStorage.getItem("userData"));
    const token = storedUser?.access_token;

    // 🧭 Guest user — only local update
    if (!token) {
      const updated = cart.map((item) => {
        if (item.productId === productId) {
          return { ...item, qty: newQty };
        }
        return item;
      });
      setCart(updated);
      localStorage.setItem("cart_guest", JSON.stringify(updated));

      return;
    }

    // 🧭 Logged-in user — sync with backend
    try {
      const formData = new FormData();
      formData.append("product_id", productId);
      formData.append("skuid", skuId);
      formData.append("quantity", newQty);

      const response = await axios.post(
        "http://192.168.1.94:8002/api/addtocart/",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        // Update local cart immediately for responsiveness
        const updated = cart.map((item) => {
          if (item.product?.id === productId) {
            return { ...item, quantity: newQty };
          }
          return item;
        });
        setCart(updated);

        // Also refresh from backend (optional)
        await fetchCartFromBackend(token);
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      toast.error("Failed to update quantity!");
    }
  };

  // ✅ Remove item (handles guest + logged-in)
  const removeItem = async (productId, skuId) => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const token = userData?.access_token;

    // Guest user
    if (!token) {
      const updated = cart.filter(
        (item) => !(item.productId === productId && item.skuId === skuId)
      );
      setCart(updated);
      localStorage.setItem(userKey, JSON.stringify(updated));
      toast.success("Item removed from cart!");
      return;
    }

    // Logged-in user
    try {
      const updated = cart.filter(
        (item) => !(item.product.id === productId && item.sku === skuId)
      );
      setCart(updated);
      localStorage.setItem(userKey, JSON.stringify(updated));

      const formData = new FormData();
      formData.append("product_id", productId);
      formData.append("skuid", skuId);

      const response = await axios.post(
        "http://192.168.1.94:8002/api/RomoveFromcart/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Item removed from cart!");
      } else {
        toast.error("Failed to remove item from backend.");
      }
    } catch (error) {
      console.error("Remove from cart error:", error);
      toast.error("Error removing item from cart.");
    }
  };

  // ✅ Loading & Empty States
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="text-center mt-[180px] text-gray-600 text-lg">
          Loading your cart...
        </div>
        <Footer />
      </>
    );
  }

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="w-[90%] mx-auto my-10  overflow-x-hidden">
          <div className="flex flex-col gap-3.5 justify-center items-center mt-[160px]">
            <i
              className="fa-solid fa-bag-shopping text-[250px]"
              style={{ color: "#ced4de" }}
            ></i>
            <p className="text-gray-600 text-lg font-medium mt-4">
              Your Cart is empty.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }


  const totalItems = cart.reduce(
    (sum, item) => sum + (item.qty || item.quantity || 1),
    0
  );
const totalPrice = cart.reduce((sum, item) => {
  const price =
    item.product?.sku?.price ||
    item.product?.price ||
    item.price;

  const qty = item.qty || item.quantity || 1;

  return sum + price * qty;
}, 0);


const Subtotal = cart.reduce((sum, item) => {
  const salesRate =
    item.product?.sku?.sales_rate ||
    item.product?.sales_rate ||
    item.sales_rate;

  const qty = item.qty || item.quantity || 1;

  return sum + salesRate * qty;
}, 0);

// DISCOUNT (sales_rate * discount% * qty)
const discount = cart.reduce((sum, item) => {
  const price =
    item.product?.sku?.price ||
    item.product?.price ||
    item.price;

  const salesRate =
    item.product?.sku?.sales_rate ||
    item.product?.sales_rate ||
    item.sales_rate;

  const qty = item.qty || item.quantity || 1;

  return sum + (price - salesRate) * qty;
}, 0);


// const discount = cart.map(item => item.product?.sku?.discount);



  return (
    <>
      <Navbar />
      <div className="w-[90%] mx-auto mt-[140px] flex flex-wrap justify-center gap-[60px] sm:flex sm:justify-between">
        <div className="w-[90%] sm:w-[50%]">
          {cart.map((item) => (
            <div
              key={item.id || item.productId}
              className="flex flex-wrap justify-start gap-3 items-center mb-4 p-4 shadow-lg rounded-lg sm:flex sm:justify-between"
            >
              <Link to={`/product/${item.product?.id}/${item.sku}`}>
                {" "}
                <div className="flex items-center gap-4">
                  <img
                    src={item.product?.mainimage || item.mainimage}
                    alt={item.product?.title || item.title}
                    className="w-[150px] h-[150px] object-contain rounded"
                  />
                  <div>
                    <h2 className="font-semibold  md:12.5 lg:w-55 ">
                      {item.product?.title || item.title}
                    </h2>
                    <div className="flex items-center gap-2">
  <p className="text-gray-700 text-[18px] font-semibold">
    ₹{ item.product?.sku?.price ||
    item.product?.price ||
    item.price}
  </p>

  {/* Discount Tag */}
{(item.product?.sku?.discount || item.discount) && (
  <span className="bg-blue-950 text-white text-[10px] px-1 py-1 rounded">
    {item.product?.sku?.discount || item.discount}% OFF
  </span>
)}

</div>

                  </div>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateCart(
                      item.product?.id || item.productId,
                      (item.qty || item.quantity) - 1,
                      item.sku || item.skuId
                    )
                  }
                  className="px-2 py-1 border rounded cursor-pointer"
                >
                  -
                </button>

                <span>{item.qty || item.quantity}</span>

                <button
                  onClick={() =>
                    updateCart(
                      item.product?.id || item.productId,
                      (item.qty || item.quantity) + 1,
                      item.sku || item.skuId
                    )
                  }
                  className="px-2 py-1 border rounded cursor-pointer"
                >
                  +
                </button>

                <button
                  onClick={() =>
                    removeItem(
                      item.product?.id || item.productId,
                      item.sku || item.skuId
                    )
                  }
                  className="bg-[#112444] text-white p-1.5 rounded-sm ml-6 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className=" w-[90%] bg-white shadow-xl rounded-2xl p-6 h-[330px] sm:w-[40%]">
          <h2 className="text-xl font-semibold text-[#112444] mb-4">
            Order Summary
          </h2>

          <div className="flex-col flex gap-2 text-gray-700">
            <div className="flex justify-between">
              <span>Total Items</span>
              <span className="font-medium">{totalItems}</span>
            </div>

            <div className="flex justify-between">
              <span>Total Price</span>
              <span className="font-medium">₹ {totalPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Discount</span>
              <span className="font-medium">₹ {discount}</span>
            </div>

            <hr className="my-2 border-gray-300" />

            <div className="flex justify-between text-lg font-semibold text-[#112444]">
              <span>Subtotal</span>
              <span>₹ {Subtotal}</span>
            </div>
          </div>

          <Link to="/checkout">
            {" "}
            <button className="mt-6 w-full bg-[#112444] text-white py-3 rounded-lg font-semibold cursor-pointer">
              Proceed to Checkout
            </button>
          </Link>

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

export default Cart;
