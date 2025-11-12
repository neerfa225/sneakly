import React, { useState, useEffect } from 'react';
import Logo from '../images/Logo.png';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [menu, setMenu] = useState('home');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);

      const tokenParts = parsed.access_token?.split(".");
      if (tokenParts && tokenParts.length === 3) {
        try {
          const decoded = JSON.parse(atob(tokenParts[1]));
          parsed.email = decoded.email;
        } catch (err) {
          console.error("Failed to decode token", err);
        }
      }

      setUser(parsed);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("cart_merged");

    setUser(null);
    navigate("/login");
  };

  return (
    <div className="bg-white shadow-md fixed top-0 left-0 w-full h-[70px] flex flex-col items-center z-50">
      <div className="w-[90%] flex justify-between items-center text-[#112444] font-medium">

     
        <Link to="/">
          <img
            src={Logo}
            alt="Sneakly Logo"
            className="w-[160px] h-[70px] cursor-pointer"
          />
        </Link>

   
        <ul className="hidden md:flex gap-[45px] text-[17px] font-semibold">
          <Link
            to="/"
            onMouseEnter={() => setMenu('home')}
            onMouseLeave={() => setMenu('')}
            className={`pb-1 border-b-2 transition-all duration-300 ${
              menu === 'home'
                ? 'border-[#112444] text-[#112444]'
                : 'border-transparent text-gray-500'
            }`}
          >
            Home
          </Link>

          <Link
            to="/shop"
            onMouseEnter={() => setMenu('shop')}
            onMouseLeave={() => setMenu('')}
            className={`pb-1 border-b-2 transition-all duration-300 ${
              menu === 'shop'
                ? 'border-[#112444] text-[#112444]'
                : 'border-transparent text-gray-500'
            }`}
          >
            Shop
          </Link>

          <a
            href="#contact"
            onMouseEnter={() => setMenu('contact')}
            onMouseLeave={() => setMenu('')}
            className={`pb-1 border-b-2 transition-all duration-300 ${
              menu === 'contact'
                ? 'border-[#112444] text-[#112444]'
                : 'border-transparent text-gray-500'
            }`}
          >
            Contact Us
          </a>
        </ul>

     
        <div className="hidden md:flex gap-[25px] items-center text-[18px]">
          <Link to="/cart" className="relative">
            <i className="fa-solid fa-bag-shopping text-2xl cursor-pointer"></i>
          </Link>

          <Link to="/wish">
            <i className="fa-solid fa-heart cursor-pointer"></i>
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              
              <button
                onClick={handleLogout}
                className="border border-[#112444] py-[6px] px-[16px] rounded-full cursor-pointer hover:bg-[#112444] hover:text-white transition duration-300 font-semibold"
              >
               {user.email ? user.email.split('@')[0] : "User"}
              </button>
            </div>
          ) : (
            <Link to="/reg">
              <button className="border border-[#112444] py-[6px] px-[22px] rounded-full cursor-pointer hover:bg-[#112444] hover:text-white transition duration-300 font-semibold">
                Sign In
              </button>
            </Link>
          )}
        </div>

        <div
          className="md:hidden text-2xl cursor-pointer"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          <i className={mobileMenu ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
        </div>
      </div>

   
      {mobileMenu && (
        <div className="drop-down flex flex-col items-center justify-center gap-2.5 p-5 bg-white w-full md:hidden">
          <Link to="/" onClick={() => setMobileMenu(false)} className="hover:text-[#112444]">
            Home
          </Link>
          <Link to="/shop" onClick={() => setMobileMenu(false)} className="hover:text-[#112444]">
            Shop
          </Link>
          <a href="#contact" onClick={() => setMobileMenu(false)} className="hover:text-[#112444]">
            Contact Us
          </a>
          <Link to="/cart" onClick={() => setMobileMenu(false)} className="hover:text-[#112444]">
            Cart
          </Link>
          <Link to="/wish" onClick={() => setMobileMenu(false)} className="hover:text-[#112444]">
            Wishlist
          </Link>

          {user ? (
            <>
             
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenu(false);
                }}
                className="border border-[#112444] py-2 px-6 rounded-full hover:bg-[#112444] hover:text-white transition duration-300 font-semibold"
              >
               {user.email ? user.email.split('@')[0] : "User"}
              </button>
            </>
          ) : (
            <Link to="/reg" onClick={() => setMobileMenu(false)}>
              <button className="border border-[#112444] py-2 px-6 rounded-full hover:bg-[#112444] hover:text-white transition duration-300 font-semibold">
                Sign In
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
