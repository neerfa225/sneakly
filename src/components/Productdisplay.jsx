import React from 'react'
import products from '../assets/product'
import { Link } from 'react-router-dom'
const Productdisplay = () => {
  return (
    <div className='w-[90%] mx-auto'>
       <h2 data-aos="fade-right"
  className="text-center font-semibold overflow-y-hidden text-[#112444] text-3xl my-[40px]"
  
>
  TRENDING COLLECTION
</h2>

         <div className="grid grid-cols-1 gap-8 w-[90%] mx-auto sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 4).map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 m-1 rounded-xl shadow-md flex flex-col  overflow-hidden"
          >
            <div className="overflow-hidden rounded-md">
             <Link to={`/product/${item.id}`}> <img
                src={item.image}
                alt={item.name}
                className="w-full h-60 object-cover rounded-md transform transition-transform duration-500 ease-in-out hover:scale-110"
              /></Link>
            </div>
             <Link to={`/product/${item.id}`}><h2 className="text-xl font-semibold mt-4">{item.name}</h2></Link>
            <p className="text-gray-500 text-sm mt-2">{item.description}</p>
            <p className="text-lg font-bold mt-3">${item.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Productdisplay