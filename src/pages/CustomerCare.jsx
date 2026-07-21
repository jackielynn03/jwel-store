import React from 'react';
import { Link } from 'react-router-dom';

export default function CustomerCare() {
  return (
    <div className="bg-white min-h-screen py-24 px-8 font-sans">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">Support & FAQ</p>
        <h1 className="text-4xl md:text-5xl font-serif text-black uppercase tracking-widest">Customer Care</h1>
      </div>
      <div className="max-w-3xl mx-auto text-gray-600 leading-relaxed text-sm flex flex-col gap-6">
        <p>At Aurora, we are dedicated to providing you with an exceptional experience from the moment you explore our collections to the day you receive your piece.</p>
        <h3 className="text-xl font-serif text-black uppercase tracking-widest mt-8 border-b border-gray-100 pb-2">Jewelry Maintenance</h3>
        <p>To preserve the luminosity and structural integrity of your pieces, we recommend avoiding direct contact with harsh chemicals, perfumes, and prolonged exposure to water. Store your jewelry in its original suede pouch or a dedicated jewelry box.</p>
        <h3 className="text-xl font-serif text-black uppercase tracking-widest mt-8 border-b border-gray-100 pb-2">Complimentary Cleaning</h3>
        <p>We offer complimentary ultrasonic cleaning and inspection for all Aurora pieces at our flagship locations. For remote clients, please refer to our <Link to="/contact" className="underline hover:text-black">Contact</Link> page to arrange a mail-in service.</p>
      </div>
    </div>
  );
}