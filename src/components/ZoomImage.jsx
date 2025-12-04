import React, { useState, useRef } from "react";

const ZoomImage = ({ src }) => {
 const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);

  const lensSize = 150;
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - lensSize / 2;
    const y = e.clientY - rect.top - lensSize / 2;

    const clampedX = Math.max(0, Math.min(x, rect.width - lensSize));
    const clampedY = Math.max(0, Math.min(y, rect.height - lensSize));

    setLensPos({ x: clampedX, y: clampedY });
  };

  return (
    <div className="relative">

      
      <div
        ref={containerRef}
        className="relative w-[200px] md:w-[500px] h-[330px] sm:h-[430px] bg-white  overflow-hidden rounded-xl"
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={src}
          className="w-full h-full object-contain select-none"
          alt="product"
        />

        {showZoom && (
          <div
            className="absolute bg-white/40 "
            style={{
              width: lensSize,
              height: lensSize,
              left: lensPos.x,
              top: lensPos.y,
            }}
          ></div>
        )}
      </div>

    
      {showZoom && (
        <div
          className="absolute top-0 right-[-520px] z-50 
          w-[500px] h-[500px] bg-white  shadow-2xl rounded-xl 
          hidden lg:block"
          style={{
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "250%",
            backgroundPosition: `
              ${-(lensPos.x * 2)}px 
              ${-(lensPos.y * 2)}px
            `,
          }}
        ></div>
      )}
    </div>
  );
};


export default ZoomImage;
