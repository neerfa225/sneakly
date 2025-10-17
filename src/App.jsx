import { useState } from "react";
import Wishlist from './pages/Wishlist/Wishlist'
import "./App.css";
import Shop from "./pages/ProductList/Shop";
import Home from "./pages/Home/Home";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import products from "./assets/product";
import Productpage from "./pages/ProductPage/Productpage";
import Footer from "./components/Footer";
import Cart from './pages/Cart/Cart'
import ScrollToTop from "./components/Scrolltop";
function App() {
  return (
    <>
    <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/wish" element={<Wishlist  />} />
        <Route path="/product/:id" element={<Productpage  />} />
        <Route path="/cart" element={<Cart/>} />
      </Routes>
      <Footer/>
    </>
  );
}

export default App;
