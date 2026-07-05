import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white pt-16 pb-8 relative z-10 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col items-center px-4">
        <h4 className="text-xs tracking-widest uppercase mb-6 text-center">Subscribe for Exclusive Updates & Offers</h4>
        
        <form className="w-full max-w-md flex mb-12" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="Email address" 
            className="flex-1 bg-white text-black px-4 py-3 text-sm focus:outline-none"
          />
          <button type="submit" className="bg-gray-200 text-black px-6 py-3 text-sm font-bold tracking-widest hover:bg-gray-300 transition">
            SIGN UP
          </button>
        </form>

        <div className="flex flex-wrap justify-center gap-8 text-[11px] tracking-widest text-gray-400 mb-8 uppercase">
          <a href="#" className="hover:text-white transition">Customer Care</a>
          <a href="#" className="hover:text-white transition">Policies</a>
          <a href="#" className="hover:text-white transition">Social</a>
          <a href="#" className="hover:text-white transition">Contact</a>
        </div>

        <p className="text-[10px] text-gray-500 tracking-wider">
          © 2024 AURORA JEWELRY & PIERCINGS ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}