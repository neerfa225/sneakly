import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import products from "../../assets/product";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Productpage = () => {
  const { id } = useParams();
  const product = products.find((item) => String(item.id) === String(id));
  const [wishlist, setWishlist] = useState([]);

  if (!product) {
    return <p className="text-center text-gray-500 mt-10">Product not found.</p>;
  }

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlist(saved);
  }, []);

  const toggleWishlist = (id) => {
    const updated = wishlist.includes(id) ? [...wishlist] : [...wishlist, id];
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    wishlist.includes(id)
      ? toast.info("Item already Exist!")
      : toast.success("Added to wishlist!");
  };

  const addToCart = () => {
  const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
  const itemExists = savedCart.some((item) => item.id === product.id);

  if (itemExists) {
    toast.info("Already in Cart!");
    return;
  }

  savedCart.push({ id: product.id, qty: 1 });
  localStorage.setItem("cart", JSON.stringify(savedCart));
  toast.success("Added to Cart!");
  
};


  // Tab data
  const [activeTab, setActiveTab] = useState("Details");
  const tabs = {
    Details: "",
    Size: "Sizes available in UK, US, EU",
    "Return Policy":
      "You can return the product within 15 days of delivery for a refund or exchange.",
    "Delivery info": "Delivered within 7-10 Working days",
  };

  const renderTabContent = () => {
    if (activeTab === "Details") {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {product.details.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    } else {
      return <p>{tabs[activeTab]}</p>;
    }
  };

  return (
    <>
    <Navbar/>
   <div className="w-[90%]  mx-auto my-10  mt-[120px] flex flex-col gap-12 sm:flex-row animate__animated animate__fadeIn">
        <div className="w-full sm:w-1/2 bg-gray-50 p-6 rounded-2xl shadow-lg overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-[500px] object-cover transform transition-transform duration-500 ease-in-out hover:scale-110"
        />
      </div>

       <div className="flex flex-col justify-center w-full sm:w-1/2 mt-5 sm:mt-0">
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-sm text-gray-500 mb-4">PRODUCT CODE: {product.code || "N/A"}</p>

        <div className="flex items-center gap-3 mb-4">
          <p className="text-2xl font-bold text-[#112444]">${product.price}</p>
          <span className="bg-[#112444] text-white px-3 py-1 text-sm font-semibold rounded-full">
            30% OFF
          </span>
        </div>

        <p className="text-gray-600 mb-6">{product.description}</p>

        <div className="flex gap-4 mb-8">
          {/* Lik instead of navigate */}
          
            <button
              onClick={addToCart}
              className="bg-[#112444] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#112444] transition"
            >
              Add to Cart
            </button>
         

          <button
            onClick={() => toggleWishlist(product.id)}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Add to Wishlist
          </button>
        </div>

        <div className="flex gap-8 border-b border-gray-200 mb-4">
          {Object.keys(tabs).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`pb-2 font-semibold ${
                activeTab === tabKey
                  ? "text-[#112444] border-b-2 border-[#112444]"
                  : "text-gray-600 hover:text-[#112444]"
              } transition`}
            >
              {tabKey}
            </button>
          ))}
        </div>
        <div className="text-gray-700 text-sm">{renderTabContent()}</div>
        <p className="text-xs text-gray-500 mt-4">Delivery Estimate: Read our Terms and Conditions</p>

        <ToastContainer position="top-right" autoClose={2000} theme="colored" style={{ marginTop: "70px" }} />
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default Productpage;
