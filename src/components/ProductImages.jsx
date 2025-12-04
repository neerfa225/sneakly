import React, { useState, useEffect } from "react";
import ZoomImage from "./ZoomImage";
const ProductImageGallery = ({ data }) => {
  const product = data?.product_detail;

  const BASE_URL = "http://192.168.1.94:8002";

  const mainImg = product?.mainimage;

  const galleryImages = (data?.additional_images || []).map(
    (img) => `${BASE_URL}/media/${img.image}`
  );

  const images = [mainImg, ...galleryImages];

  const [activeImg, setActiveImg] = useState(null);

  useEffect(() => {
    if (mainImg) setActiveImg(mainImg);
  }, [mainImg]);

  if (!activeImg) return <p>Loading image...</p>;

  return (
    <div className="w-1/2 flex flex-col items-center gap-4">
      <ZoomImage src={activeImg} />

      <div className="flex md:gap-4 gap-2 mt-3 px-2 ">
        {images.map((img, idx) => (
          <div
            key={idx}
            onClick={() => setActiveImg(img)}
            className={`w-16 h-16  md:w-20 md:h-20 rounded-lg overflow-hidden border cursor-pointer transition p-2
              ${activeImg === img ? "border-blue-950" : "border-gray-300"}
            `}
          >
            <img
              src={img}
              alt="thumbnail"
              className="w-full h-full object-contain hover:opacity-80"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
