import React, { useState, useEffect } from "react";
import Logo from "../images/Logo.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const [menu, setMenu] = useState("home");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);

  const [openCategoryMenu, setOpenCategoryMenu] = useState(false);

  const navigate = useNavigate();

  // 🔄 Fetch Product Categories for Navbar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://192.168.1.94:8002/api/product-list/");

        const full = res.data.results || res.data || [];
        const map = {};

        full.forEach((p) => {
          if (!map[p.category]) {
            map[p.category] = {
              category_id: p.category,
              category_name: p.category_name,
            };
          }
        });

        setCategories(Object.values(map));
      } catch (err) {
        console.log("Navbar categories error:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("cart_merged");

    setUser(null);
    navigate("/login");
  };

  const gotoCategory = (id) => {
    navigate(`/shop?category=${id}`);
    setOpenCategoryMenu(false);
  };

  return (
    <div className="bg-white shadow-md fixed top-0 left-0 w-full h-[70px] flex flex-col items-center z-50">
      <div className="w-[90%] flex justify-between items-center text-[#112444] font-medium">

        {/* LOGO */}
        <Link to="/">
          <img
            src={Logo}
            alt="Logo"
            className="w-[160px] h-[70px] cursor-pointer"
          />
        </Link>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex gap-[30px] md:mt-2 md:items-center text-[17px] font-semibold relative">

          {/* HOME */}
          <Link
            to="/"
            className={`pb-1 border-b-2 ${
              menu === "home" ? "border-[#112444] text-[#112444]" : "border-transparent text-gray-500"
            }`}
            onMouseEnter={() => setMenu("home")}
            onMouseLeave={() => setMenu("")}
          >
            Home
          </Link>

          {/* SHOP */}
          {/* <Link
            to="/shop"
            className={`pb-1 border-b-2 ${
              menu === "shop" ? "border-[#112444] text-[#112444]" : "border-transparent text-gray-500"
            }`}
            onMouseEnter={() => setMenu("shop")}
            onMouseLeave={() => setMenu("")}
          >
            Shop
          </Link> */}

          {/* CATEGORY DROPDOWN */}
          <div
  className="relative group"
  onMouseEnter={() => setOpenCategoryMenu(true)}
  onMouseLeave={() => setOpenCategoryMenu(false)}
>
  <span className="
      cursor-pointer pb-1 
      border-b-2 border-transparent 
      flex items-center gap-1 font-semibold 
      text-gray-500
      group-hover:text-[#112444]
      
    "
  >
    Categories
  </span>

  {openCategoryMenu && (
    <div className="absolute left-0 top-7 bg-white shadow-lg rounded-md p-3 w-[200px] z-50">
      {categories.length === 0 ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        categories.map((cat) => (
          <Link
            key={cat.category_id}
            to={`/shop?category=${cat.category_id}`}
            className="block p-2 hover:bg-gray-100"
          >
            {cat.category_name}
          </Link>
        ))
      )}
    </div>
  )}
</div>


          {/* CONTACT */}
          <a
            href="#contact"
            className={`pb-1 border-b-2 ${
              menu === "contact" ? "border-[#112444] text-[#112444]" : "border-transparent text-gray-500"
            }`}
            onMouseEnter={() => setMenu("contact")}
            onMouseLeave={() => setMenu("")}
          >
            Contact
          </a>
        </ul>

        {/* USER + CART + WISHLIST */}
        <div className="hidden md:flex gap-[25px] items-center text-[18px]">
          <Link to="/cart">
            <i className="fa-solid fa-bag-shopping text-2xl cursor-pointer"></i>
          </Link>

          <Link to="/wish">
            <i className="fa-solid fa-heart cursor-pointer"></i>
          </Link>

          {user ? (
            <button
              onClick={handleLogout}
              className="border border-[#112444] py-[6px] px-[18px] rounded-full hover:bg-[#112444] hover:text-white transition"
            >
              {user.email?.split("@")[0]}
            </button>
          ) : (
            <Link to="/login">
              <button className="border border-[#112444] py-[6px] px-[22px] rounded-full hover:bg-[#112444] hover:text-white transition">
                Sign In
              </button>
            </Link>
          )}
        </div>

        {/* MOBILE MENU ICON */}
        <div
          className="md:hidden text-2xl cursor-pointer"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          <i className={mobileMenu ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileMenu && (
        <div className="flex flex-col items-center gap-3 p-5 bg-white w-full md:hidden">

          <Link to="/" onClick={() => setMobileMenu(false)}>Home</Link>
          <Link to="/shop" onClick={() => setMobileMenu(false)}>Shop</Link>

          {/* MOBILE CATEGORIES */}
          <div className="w-full text-center">
            <p className="font-semibold text-lg mb-2">Categories</p>

            {categories.map((cat) => (
              <p
                key={cat.category_id}
                onClick={() => {
                  gotoCategory(cat.category_id);
                  setMobileMenu(false);
                }}
                className="py-2 hover:text-[#112444] cursor-pointer"
              >
                {cat.category_name}
              </p>
            ))}
          </div>

          <Link to="/cart" onClick={() => setMobileMenu(false)}>Cart</Link>
          <Link to="/wish" onClick={() => setMobileMenu(false)}>Wishlist</Link>

          {user ? (
            <button
              onClick={() => {
                handleLogout();
                setMobileMenu(false);
              }}
              className="border border-[#112444] py-2 px-6 rounded-full hover:bg-[#112444] hover:text-white"
            >
              {user.email?.split("@")[0]}
            </button>
          ) : (
            <Link to="/login" onClick={() => setMobileMenu(false)}>
              <button className="border border-[#112444] py-2 px-6 rounded-full hover:bg-[#112444] hover:text-white">
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
