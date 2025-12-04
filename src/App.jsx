import Wishlist from "./pages/Wishlist/Wishlist";
import "./App.css";
import Shop from "./pages/ProductList/Shop";
import Home from "./pages/Home/Home";
import { Route, Routes } from "react-router-dom";

import Productpage from "./pages/ProductPage/Productpage";

import Cart from "./pages/Cart/Cart";
import ScrollToTop from "./components/Scrolltop";
import Register from "./components/LoginRegisterPage";
import Login from "./components/Login";
import Otp from "./components/Otp";
import Checkout from "./pages/Checkout/Checkout";
import { GoogleOAuthProvider } from "@react-oauth/google";
function App() {
  return (
    <>
      <ScrollToTop />
<GoogleOAuthProvider clientId="464300107816-uj2vhm85d9qdjco70um8ibgvg5do9kgc.apps.googleusercontent.com">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/wish" element={<Wishlist />} />
        <Route path="/product/:id" element={<Productpage />} />
        <Route path="/product/:id/:sku" element={<Productpage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/reg" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<Otp />} />
        <Route path="/verify-otp" element={<Otp />} />
        <Route path="/Checkout" element={<Checkout />} />
      </Routes>
      </GoogleOAuthProvider>
    </>
  );
}

export default App;
