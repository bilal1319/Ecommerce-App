import React from 'react';
import { Navbar } from '../components/Navbar';
import Slider from '../components/Slider';
import { Link } from 'react-router-dom';
import iphone from "../assets/iphone.webp";
import beauty from "../assets/beauty.webp";
import cloth from "../assets/cloth.webp";

export const Home = () => {
  const products = [
    { id: 1, name: 'Clothing', price: 'Rs 2000/-', image: cloth },
    { id: 2, name: 'Beauty', price: 'Rs 1550/-', image: beauty },
    { id: 3, name: 'Phones', price: 'Rs 250000/-', image: iphone },
  ];

  return (
    <div className=" min-h-screen">
      <Navbar />
      <Slider />

      {/* Products Section */}
      <div className='w-full flex flex-col items-center mt-16 mb-5 px-4'>
        <h2 className="text-2xl font-semibold text-center text-purple-400 mb-8">
          Featured Products
        </h2>
        
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl'>
          {products.map((product) => (
            <div key={product.id} className='bg-gray-800 border border-gray-700 shadow-xl rounded-lg p-4 text-center transition-transform hover:scale-105'>
              <img src={product.image} alt={product.name} className='w-full h-48 object-cover rounded-md' />
              <h3 className='text-lg font-semibold mt-3 text-white'>{product.name}</h3>
              <p className='text-purple-400'>{product.price}</p>
            </div>
          ))}
        </div>

        {/* View All Products Button */}
        <Link to={'/products'}>
          <button className='mt-8 bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-700 transition'>
            View All Products
          </button>
        </Link>
      </div>
    </div>
  );
};