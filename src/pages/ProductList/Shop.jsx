import React, { useState, useEffect } from "react";
import products from "../../assets/product";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
const Shop = () => {
  const [wishlist, setWishlist] = useState([]);
  
 
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlist(saved);
   
  }, []);

  const toggleWishlist = (id) => {
    const updated = wishlist.includes(id)
      ? wishlist.filter((item) => item !== id)
      : [...wishlist, id] ;
    
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    if (wishlist.includes(id)) {
    toast.info("Removed from wishlist!");
  } else {
    toast.success("Added to wishlist!");
  }
  
  };

  
  return (
    <>
    <Navbar/>
    <div className="w-[90%] mx-auto my-10 animate__animated animate__fadeIn">
      <h2 className="text-2xl font-bold mb-6">Shop</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 m-1  rounded-xl shadow-lg flex flex-col"
            
          > <div className="overflow-hidden"><Link to={`/product/${item.id}`}>
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-60 object-cover rounded-md transform transition-transform duration-500 ease-in-out hover:scale-110"
            /></Link></div>
            <div className="flex justify-between items-start mt-4">
              <Link to={`/product/${item.id}`}><h2 className="text-xl font-semibold">{item.name}</h2></Link>
              <i
                className={`cursor-pointer text-2xl ${
                  wishlist.includes(item.id)
                    ? "fa-solid fa-heart text-red-500"
                    : "fa-regular fa-heart text-gray-400"
                }`}
                onClick={() => toggleWishlist(item.id)}
              ></i>
            </div>
            <p className="text-gray-500 text-sm mt-2">{item.description}</p>
            <p className="text-lg font-bold mt-3 cursor-pointer" onClick={()=>addtoCart(item.id)}>${item.price}</p>
            
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
    <Footer/>
    </>
  );
};

export default Shop;
