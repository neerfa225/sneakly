import React, { useEffect } from 'react';
import Menbanner from '../images/men-banner.jpg';
import Womenbanner from '../images/wommen-banner.jpg';
import './banner.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Banner = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <>
      <h2 className='w-[90%] mx-auto text-center h-[45px] font-semibold text-[#112444] text-2xl sm:text-3xl md:text-4xl my-10'>
        Categories
      </h2>

      <div className='w-[90%] mx-auto flex flex-wrap gap-6 justify-center sm:justify-around'>
        {/* Men Banner */}
        <div className='relative w-full sm:w-[45%] mb-6'>
          <img
            src={Menbanner}
            alt="Men Banner"
            className='rounded-xl w-full h-[200px] sm:h-[300px] md:h-[350px] object-cover'
          />
          <div className='absolute inset-0 flex mr-3  flex-col justify-center items-center sm:items-end text-center sm:text-right text-white px-4'>
            <p className=' overflow-y-hidden text-4xl sm:text-5xl md:text-6xl font-extrabold'>MEN</p>
            <p className=' overflow-y-hidden text-xl sm:text-2xl md:text-3xl'>collections</p>
            <i className=" overflow-y-hidden fa-solid fa-arrow-right mt-2 sm:mt-4 text-lg sm:text-xl md:text-2xl"></i>
          </div>
        </div>

        {/* Women Banner */}
        <div  className='relative w-full sm:w-[45%] mb-6 ' >
          <img
            src={Womenbanner}
            alt="Women Banner"
            className='rounded-xl w-full h-[200px] sm:h-[300px] md:h-[350px] object-cover'
          />
          <div className='absolute inset-0 flex mr-3 flex-col justify-center items-center sm:items-end text-center sm:text-right text-white px-4'>
            <p className='text-4xl overflow-y-hidden sm:text-5xl md:text-6xl font-extrabold'>WOMEN</p>
            <p className='text-xl overflow-y-hidden  sm:text-2xl md:text-3xl'>collections</p>
            <i className="fa-solid overflow-y-hidden fa-arrow-right mt-2 sm:mt-4 text-lg sm:text-xl md:text-2xl"></i>
          </div>
        </div>
      </div>
    </>
  );
};

export default Banner;
