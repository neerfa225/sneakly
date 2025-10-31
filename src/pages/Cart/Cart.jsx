import React, { useEffect, useState } from "react";
import products from "../../assets/product";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [userKey, setUserKey] = useState("cart_guest");

 
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    let key = "cart_guest";

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

      key = email ? `cart_${email}` : "cart_guest";
    }

    setUserKey(key);

    const savedCart = JSON.parse(localStorage.getItem(key) || "[]");
    setCart(savedCart);
  }, []);


  const updateCart = (id, qty) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, qty: Math.max(1, qty) } : item
    );
    setCart(updated);
    localStorage.setItem(userKey, JSON.stringify(updated));
  };


  const removeItem = (id) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem(userKey, JSON.stringify(updated));
  };

  let totalItems = 0;
  let totalPrice = 0;

  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.id);
    if (product) {
      totalItems += item.qty;
      totalPrice += item.qty * product.price;
    }
  });

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="w-[90%] mx-auto my-10 ">
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

  return (
    <>
      <Navbar />
      <div className="w-[90%] mx-auto mt-[140px] h-auto flex flex-wrap justify-center gap-[60px]  sm:flex sm:justify-between">
    
        <div className="w-[90%] sm:w-[50%]">
          {cart.map((item) => {
            const product = products.find((p) => p.id === item.id);
            if (!product) return null;

            return (
              <div
                key={item.id}
                className="flex flex-wrap justify-start gap-3  items-center mb-4 p-4 shadow-lg rounded-lg sm:flex sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-[150px] h-[150px] object-cover rounded"
                  />
                  <div>
                    <h2 className="font-semibold">{product.name}</h2>
                    <p className="text-gray-500">${product.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCart(item.id, item.qty - 1)}
                    className="px-2 py-1 border rounded"
                  >
                    -
                  </button>
                  <span>{item.qty}</span>
                  <button
                    onClick={() => updateCart(item.id, item.qty + 1)}
                    className="px-2 py-1 border rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-4 px-3 py-1 bg-[#112444] text-white rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

   
        <div className="mt-8 w-[90%] bg-white shadow-xl rounded-2xl p-6 h-[330px] sm:w-[40%]">
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
              <span className="font-medium">$ {totalPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Platform Fee</span>
              <span className="font-medium">$ 100</span>
            </div>

            <hr className="my-2 border-gray-300" />

            <div className="flex justify-between text-lg font-semibold text-[#112444]">
              <span>Subtotal</span>
              <span>$ {(totalPrice + 100).toFixed(2)}</span>
            </div>
          </div>

          <button className="mt-6 w-full bg-[#112444] text-white py-3 rounded-lg font-semibold cursor-pointer">
            Proceed to Checkout
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;
