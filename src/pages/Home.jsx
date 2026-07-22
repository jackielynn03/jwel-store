import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient, { BASE_URL } from '../api/axiosClient';

export default function Home() {
  const [trendingProducts, setTrendingProducts] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await axiosClient.get('/items');
        setTrendingProducts(response.data.data.slice(0, 4));
      } catch (error) {
        console.error("Failed to load trending products", error);
      }
    };
    fetchTrending();
  }, []);

  return (
    <>
      <section className="relative w-full h-[600px] bg-gray-100 -mt-[1px]">
        <img 
          src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1600&q=80" 
          alt="Woman wearing elegant jewelry" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-white">
          <h2 className="text-3xl md:text-4xl font-serif tracking-wide mb-2 text-center drop-shadow-md">CURATED ELEGANCE.</h2>
          <h2 className="text-3xl md:text-4xl font-serif tracking-wide mb-8 text-center drop-shadow-md">EXPLORE THE NEW SEASON.</h2>
          <Link to="/category/Vòng Tay" className="bg-white text-black text-sm font-bold tracking-widest py-3 px-8 hover:bg-gray-100 transition duration-300 shadow-lg">
            SHOP NOW
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto py-20 px-4 relative z-10">
        <h3 className="text-2xl font-serif text-center mb-12">TRENDING NOW</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {trendingProducts.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id} className="group cursor-pointer block">
              <div className="bg-gray-50 aspect-square mb-4 overflow-hidden flex items-center justify-center p-6 relative">
                <img 
                  src={`${BASE_URL}${product.main_image}`} 
                  alt={product.title} 
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-2 left-2 bg-white/90 text-gray-800 text-[9px] font-bold px-2 py-1 tracking-wider uppercase rounded-sm">
                  {product.category}
                </span>
              </div>
              <div className="text-center">
                <h4 className="text-sm font-semibold mb-1 group-hover:text-gray-600 transition-colors line-clamp-1">
                  {product.title}
                </h4>
                <p className="text-sm text-gray-900 font-bold">
                  {Number(product.price).toLocaleString('en-US')}₫
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}