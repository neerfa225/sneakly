import React, { useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URL } from "../Services/serverURL";

const Header = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/footerBanners/`);
      setBanners(response.data.footer_banners);
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };


  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [banners]);

  return (
    <>
      <div
        className="mt-[120px] mx-auto rounded-md overflow-hidden shadow-lg h-[200px] w-[90%] opacity-0 sm:h-[300px] md:h-[450px]"
        style={{ animation: "slideIn 1s ease-out forwards" }}
      >
        {banners.length > 0 && (
          <img
            src={`${SERVER_URL}${banners[currentIndex].image}`}
            alt="Banner"
            className="h-full w-full object-cover"
          />
        )}
      </div>
    </>
  );
};

export default Header;
