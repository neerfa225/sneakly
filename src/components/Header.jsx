import React from 'react';
import Navbar from './Navbar';
import Homeimg from '../images/home.jpg';

const Header = () => {
  return (
    <>
     

      <div
        className="bg-no-repeat bg-cover mt-[120px] mx-auto  rounded-md overflow-hidden shadow-lg h-[200px] w-[90%] opacity-0 sm:h-[300px] sm:w-[90%]  md:w-[90%] md:h-[450px] md:mx-auto   "
        style={{
          backgroundImage: `url(${Homeimg})`,
          animation: 'slideIn 1s ease-out forwards',
        }}
      ></div>
    </>
  );
};

export default Header;
