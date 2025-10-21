import React, { useState, useEffect } from "react";
import products from "../../assets/product";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlist(saved);
  }, []);

  const removeItem = (id) => {
    const updated = wishlist.filter((item) => item !== id);
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  const wishlistProducts = products.filter((item) =>
    wishlist.includes(item.id)
  );

  if (wishlistProducts.length === 0)
    return (<><Navbar/>
      <div className="w-[90%] mx-auto my-10 animate__animated animate__fadeIn">
         
        <div className="flex flex-col gap-3.5 justify-center items-center mt-[160px]"><i className="fa-solid fa-bag-shopping  text-[250px]" style={{color: "#ced4de"}}></i><p>Your wishlist is empty.</p></div>
         
      </div><Footer/></>
    );

  return (
    <>
    <Navbar/>
    <div className="w-[90%] mx-auto my-25 animate__animated animate__fadeIn">
      <h2 className="font-bold mb-6 text-center text-[#112444] text-3xl">MY WISHLIST</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 ">
        {wishlistProducts.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-60 object-cover rounded-md mb-4 "
            />
            <div className="flex justify-between items-start gap-[40px] md:gap-[20px]">
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-500">${item.price}</p>
              </div>
              <button className="bg-[#112444] text-white p-1 px-1.5 rounded-sm text-[12px] cursor-pointer"  onClick={()=>removeItem(item.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
    <Footer/>
</>
  );
};

export default Wishlist;
