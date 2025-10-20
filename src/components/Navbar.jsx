import React, { useState } from 'react';
import Logo from '../images/logo.png';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [menu, setMenu] = useState('home');
 const [mobileMenu, setMobileMenu] = useState(false);
 

  return (
    <div className="bg-white shadow-md fixed top-0 left-0 w-full h-[70px] flex flex-col items-center z-50">
      <div className="w-[90%] flex justify-between items-center text-[#112444] font-medium">

        {/* Logo */}
        <Link to="/">
          <img
            src={Logo}
            alt="Sneakly Logo"
            className="w-[160px] h-[70px] cursor-pointer"
          />
        </Link>

        {/* Menu */}
        <ul className="  hidden md:flex gap-[45px] text-[17px] font-semibold">
          <Link
            to="/"
            onMouseEnter={() => setMenu('home')}
            onMouseLeave={() => setMenu('')}
            className={`pb-1 border-b-2 transition-all duration-300 ${
              menu === 'home'
                ? 'border-[#112444] text-[#112444]'
                : 'border-transparent text-gray-500 '
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
                : 'border-transparent text-gray-500 '
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
                : 'border-transparent text-gray-500 '
            }`}
          >
            Contact Us
          </a>
        </ul>

        {/* Icons */}
        <div className='flex item-center'>
        <div className="hidden md:flex gap-[25px] items-center text-[18px]">
         <Link to="/cart" className="relative">
      <i className="fa-solid fa-bag-shopping text-2xl cursor-pointer"></i>
    
        
  
    </Link>
          <Link to="/wish">
            <i className="fa-solid fa-heart cursor-pointer  "></i>
          </Link>
        <Link to='/reg'><button className="border border-[#112444] py-[6px] px-[22px] rounded-full cursor-pointer hover:bg-[#112444] hover:text-white transition duration-300 font-semibold">
            Sign In
          </button> </Link> 
        </div>
        <div className='md:hidden 'onClick={()=>setMobileMenu(!mobileMenu)}>
          <i className={mobileMenu ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
          </div>
          </div>
      </div>
       {mobileMenu&&(
        <div className='drop-down flex flex-col items-center justify-center gap-2.5 p-5 bg-white w-full  '>  <Link
            to="/"
            onClick={() => setMobileMenu(false)}
            className="hover:text-[#112444]"
          >
            Home
          </Link>
          <Link
            to="/shop"
            onClick={() => setMobileMenu(false)}
            className="hover:text-[#112444]"
          >
            Shop
          </Link>
          <a
            href="#contact"
            onClick={() => setMobileMenu(false)}
            className="hover:text-[#112444]"
          >
            Contact Us
          </a>
          <Link
            to="/cart"
            onClick={() => setMobileMenu(false)}
            className="hover:text-[#112444]"
          >
            Cart
          </Link>
          <Link
            to="/wish"
            onClick={() => setMobileMenu(false)}
            className="hover:text-[#112444]"
          >
            Wishlist
          </Link>
          <button
            onClick={() => setMobileMenu(false)}
            className="border border-[#112444] py-2 px-6 rounded-full hover:bg-[#112444] hover:text-white transition duration-300 font-semibold"
          >
            Sign In
          </button>
        </div>
       )}
    </div>
  );
};

export default Navbar;
