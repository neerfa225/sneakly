import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SERVER_URL } from "../../Services/serverURL";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import ProductCard from "../../components/Productcard";
const Shop = () => {
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [openBrand, setOpenBrand] = useState(false);
  const [backendMin, setBackendMin] = useState(0);
  const [backendMax, setBackendMax] = useState(100000);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [brands, setBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([null, null]);
  const [userKey, setUserKey] = useState("wishlist_guest");
  const [cartKey, setCartKey] = useState("cart_guest");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState(null);
  const location = useLocation();
  useEffect(() => {
    const fetchPriceRange = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/api/PriceList/`);

        const min = Number(res.data?.min_price) || 0;
        const max = Number(res.data?.max_price) || 100000;

        setBackendMin(min);
        setBackendMax(max);

        setPriceRange([min, max]);
      } catch (err) {
        console.log("PriceList API error:", err);
      }
    };

    fetchPriceRange();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${SERVER_URL}/api/product-list/`
        );
        const full = response.data.results || response.data || [];
        setAllProducts(full);

        if (!location.search.includes("category=")) {
          setProducts(full);
        }

        const catMap = {};

        (response.data.results || response.data || []).forEach((p) => {
          if (!catMap[p.category]) {
            catMap[p.category] = {
              category_id: p.category,
              category_name: p.category_name,
              subcategories: {},
            };
          }

          if (!catMap[p.category].subcategories[p.subcategory]) {
            catMap[p.category].subcategories[p.subcategory] = {
              subcategory_id: p.subcategory,
              subcategory_name: p.subcategory_name,
            };
          }
        });

        setCategoryTree(Object.values(catMap));
        const brandMap = {};

        (response.data.results || response.data || []).forEach((p) => {
          if (p.Brand) {
            brandMap[p.Brand] = {
              id: p.Brand,
              name: p.brand_name,
            };
          }
        });

        setBrands(Object.values(brandMap));
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

    updateCartFromLocal();

    window.addEventListener("cartUpdated", updateCartFromLocal);
    window.addEventListener("storage", updateCartFromLocal);

    return () => {
      window.removeEventListener("cartUpdated", updateCartFromLocal);
      window.removeEventListener("storage", updateCartFromLocal);
    };
  }, []);

  const handleCategoryClick = (catId, index) => {
    setSelectedCategory(catId);
    setOpenCategory(openCategory === index ? null : index);
    setSelectedBrand(null);
  };

  const resetFilters = () => {
    setPriceRange([backendMin, backendMax]);
    setSelectedBrand(null);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setProducts(allProducts);
  };

  const applyFilterssByURL = async (catId) => {
    let url = `${SERVER_URL}/api/product-list/?category=${catId}`;

    try {
      const res = await axios.get(url);
      setProducts(res.data.results || res.data || []);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Filter error (URL Category):", err);
    }
  };
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catId = params.get("category");

    if (!catId) return;

    const cid = Number(catId);

    setSelectedCategory(cid);

    if (categoryTree.length > 0) {
      const index = categoryTree.findIndex(
        (c) => Number(c.category_id) === cid
      );
      if (index !== -1) {
        setOpenCategory(index);
      }
    }

    setSelectedSubCategory(null);

    applyFilterssByURL(cid);
  }, [location.search, categoryTree]);

  const applyFilterss = async () => {
    let url = `${SERVER_URL}/api/product-list/?`;

    if (selectedCategory) url += `category=${selectedCategory}&`;
    if (selectedSubCategory) url += `subcategory=${selectedSubCategory}&`;
    if (selectedBrand) url += `brand=${selectedBrand}&`;

    const finalMin = priceRange[0] ?? backendMin;
    const finalMax = priceRange[1] ?? backendMax;

    url += `price=${finalMin},${finalMax}`;

    try {
      const res = await axios.get(url);
      setProducts(res.data.results || res.data || []);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Filter error:", err);
    }
  };

  const handleSubCategoryClick = (catId, subId) => {
    setSelectedCategory(catId);
    setSelectedSubCategory(subId);
    setSelectedBrand(null);
  };

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
        `${SERVER_URL}/api/add-wishlist/`,
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
          window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error(error.response?.data?.message || "Something went wrong!");
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
      console.error("Cart add error:", err);
      toast.error("Something went wrong!");
    }
  };

  const mergeGuestCart = async (tokenValue, email) => {
    const guestCart = JSON.parse(localStorage.getItem("cart_guest") || "[]");
    if (!guestCart.length) return;

    try {
      const response = await axios.get(
        `${SERVER_URL}/api/cartList/`,
        {
          headers: { Authorization: `Bearer ${tokenValue}` },
        }
      );

      const backendCart = response.data?.cart || [];

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

          await axios.post(
            `${SERVER_URL}/api/addtocart/`,
            formData,
            {
              headers: { Authorization: `Bearer ${tokenValue}` },
            }
          );
        }
      }

      localStorage.removeItem("cart_guest");

      await fetchBackendCart();

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
      <div className="w-[90%] mx-auto   my-10 animate__animated animate__fadeIn mt-25">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-[22%] p-5 rounded-lg shadow-xl min-h-fit">
            <h2 className="text-xl font-bold mb-6">Filters</h2>

            {/* CATEGORY */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">All Categories</h2>

              {categoryTree.map((cat, index) => (
                <div key={cat.category_id} className="border-b py-2">
                  {/* CATEGORY TITLE */}
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => handleCategoryClick(cat.category_id, index)}
                  >
                    <span
                      className={`font-semibold cursor-pointer ${
                        openCategory === index ? "text-[#112444]" : ""
                      }`}
                    >
                      {cat.category_name}
                    </span>

                    <span className="text-[#112444]">
                      {openCategory === index ? "▴" : "▾"}
                    </span>
                  </div>

                  {/* SUBCATEGORIES ON CLICK */}
                  {openCategory === index && (
                    <div className="ml-4 mt-2 space-y-2">
                      {Object.values(cat.subcategories).map((sub) => (
                        <div
                          key={sub.subcategory_id}
                          className={`cursor-pointer p-1 rounded 
                ${
                  selectedSubCategory === sub.subcategory_id
                    ? "text-[#404a5b] font-semibold"
                    : ""
                }`}
                          onClick={() =>
                            handleSubCategoryClick(
                              cat.category_id,
                              sub.subcategory_id
                            )
                          }
                        >
                          {sub.subcategory_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mb-6">
              <h3
                className="text-lg font-semibold mb-2 cursor-pointer flex justify-between items-center border-b py-2"
                onClick={() => setOpenBrand(!openBrand)}
              >
                Brands
                <span className="text-[#112444]">{openBrand ? "▴" : "▾"}</span>
              </h3>

              {openBrand && (
                <div className="ml-2">
                  {brands.map((brand) => (
                    <div
                      key={brand.id}
                      className={`cursor-pointer py-2 px-2 rounded ${
                        selectedBrand === brand.id
                          ? "text-[#112444] font-bold"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedBrand(
                          selectedBrand === brand.id ? null : brand.id
                        )
                      }
                    >
                      {brand.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* PRICE SECTION */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Price</h3>

              <div className="mt-4">
                {/* RANGE BAR */}

                <div className="relative h-2 bg-gray-200 rounded-full">
                  <div className="absolute inset-0 overflow-hidden rounded-full">
                    <div
                      className="absolute h-2 bg-[#112444]"
                      style={{
                        left: `${
                          ((priceRange[0] - backendMin) /
                            (backendMax - backendMin)) *
                          100
                        }%`,
                        width: `${
                          ((priceRange[1] - priceRange[0]) /
                            (backendMax - backendMin)) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  {/* MIN THUMB */}
                  <input
                    type="range"
                    min={backendMin}
                    max={backendMax}
                    value={priceRange[0]}
                    onChange={(e) => {
                      let v = Number(e.target.value);
                      if (v > priceRange[1]) v = priceRange[1];
                      setPriceRange([v, priceRange[1]]);
                    }}
                    className="absolute w-full pointer-events-none appearance-none bg-transparent
      [&::-webkit-slider-thumb]:pointer-events-auto
      [&::-webkit-slider-thumb]:appearance-none
      [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#112444]"
                    style={{ top: "-5px" }}
                  />

                  {/* MAX THUMB */}
                  <input
                    type="range"
                    min={backendMin}
                    max={backendMax}
                    value={priceRange[1]}
                    onChange={(e) => {
                      let v = Number(e.target.value);
                      if (v < priceRange[0]) v = priceRange[0];
                      setPriceRange([priceRange[0], v]);
                    }}
                    className="absolute w-full pointer-events-none appearance-none bg-transparent
      [&::-webkit-slider-thumb]:pointer-events-auto
      [&::-webkit-slider-thumb]:appearance-none
      [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#112444]"
                    style={{ top: "-5px" }}
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <div className="w-1/2">
                    <label className="block font-semibold">Min Price</label>
                    <select
                      className="border p-2 w-full rounded"
                      value={priceRange[0]}
                      onChange={(e) => {
                        let v = Number(e.target.value);
                        if (v > priceRange[1]) v = priceRange[1];
                        setPriceRange([v, priceRange[1]]);
                      }}
                    >
                      <option value={priceRange[0]} hidden>
                        ₹{priceRange[0]}
                      </option>

                      <option value={backendMin}>₹{backendMin}</option>
                      <option value={Math.floor(backendMax * 0.25)}>
                        ₹{Math.floor(backendMax * 0.25)}
                      </option>
                      <option value={Math.floor(backendMax * 0.5)}>
                        ₹{Math.floor(backendMax * 0.5)}
                      </option>
                    </select>
                  </div>

                  {/* MAX DROPDOWN */}
                  <div className="w-1/2">
                    <label className="block font-semibold">Max Price</label>
                    <select
                      className="border p-2 w-full rounded"
                      value={priceRange[1]}
                      onChange={(e) => {
                        let v = Number(e.target.value);
                        if (v < priceRange[0]) v = priceRange[0];
                        setPriceRange([priceRange[0], v]);
                      }}
                    >
                      <option value={priceRange[1]} hidden>
                        ₹{priceRange[1]}
                      </option>

                      <option value={backendMax}>₹{backendMax}</option>
                      <option value={Math.floor(backendMax * 0.75)}>
                        ₹{Math.floor(backendMax * 0.75)}
                      </option>
                      <option value={Math.floor(backendMax * 0.5)}>
                        ₹{Math.floor(backendMax * 0.5)}
                      </option>
                    </select>
                  </div>
                </div>

                {/* BUTTONS */}
                <button
                  onClick={applyFilterss}
                  className="mt-4 w-full bg-[#112444] text-white py-2 rounded"
                >
                  Apply
                </button>

                <button
                  onClick={resetFilters}
                  className="mt-3 w-full bg-gray-300 py-2 rounded"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[78%] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 text-xl font-semibold py-10 lg:mt-55">
                No Products Found
              </div>
            ) : (
              products.map((item) => (
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
              ))
            )}
          </div>
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
