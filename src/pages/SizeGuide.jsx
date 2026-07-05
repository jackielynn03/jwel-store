import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function SizeGuide() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] py-16 px-6 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-10 md:p-16 border border-gray-100 shadow-sm relative">
        <Link to={-1} className="absolute top-8 left-8 text-gray-400 hover:text-black transition-colors p-2 bg-gray-50 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        <div className="text-center mb-16 mt-8">
          <h1 className="text-4xl font-serif text-black mb-4">Size Guide</h1>
          <p className="text-sm text-gray-500">Find the perfect fit for your rings and bracelets.</p>
        </div>

        {/* Ring Sizes */}
        <div className="mb-16">
          <h2 className="text-xl font-serif text-black mb-6 uppercase tracking-widest border-b border-gray-100 pb-4">Ring Sizing</h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Wrap a piece of string or paper around the base of your finger. Mark the point where the ends meet with a pen. Measure the string or paper with a ruler in millimeters (mm) to find your circumference.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-black uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-widest">US Size</th>
                  <th className="px-6 py-4 font-bold tracking-widest">Circumference (mm)</th>
                  <th className="px-6 py-4 font-bold tracking-widest">Diameter (mm)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100"><td className="px-6 py-4">5</td><td className="px-6 py-4">49.3</td><td className="px-6 py-4">15.7</td></tr>
                <tr className="border-b border-gray-100"><td className="px-6 py-4">6</td><td className="px-6 py-4">51.9</td><td className="px-6 py-4">16.5</td></tr>
                <tr className="border-b border-gray-100"><td className="px-6 py-4">7</td><td className="px-6 py-4">54.4</td><td className="px-6 py-4">17.3</td></tr>
                <tr className="border-b border-gray-100"><td className="px-6 py-4">8</td><td className="px-6 py-4">57.0</td><td className="px-6 py-4">18.1</td></tr>
                <tr className="border-b border-gray-100"><td className="px-6 py-4">9</td><td className="px-6 py-4">59.5</td><td className="px-6 py-4">18.9</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bracelet Sizes */}
        <div>
          <h2 className="text-xl font-serif text-black mb-6 uppercase tracking-widest border-b border-gray-100 pb-4">Bracelet Sizing (Vòng Tay)</h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Measure your wrist just below the wrist bone, where you would normally wear your bracelet, with a flexible measuring tape or a strip of paper.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-black uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-widest">Size (cm)</th>
                  <th className="px-6 py-4 font-bold tracking-widest">Fit Type</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100"><td className="px-6 py-4">16 - 17 cm</td><td className="px-6 py-4">Small / Snug Fit</td></tr>
                <tr className="border-b border-gray-100"><td className="px-6 py-4">18 - 19 cm</td><td className="px-6 py-4">Medium / Regular Fit (Standard)</td></tr>
                <tr className="border-b border-gray-100"><td className="px-6 py-4">20 - 21 cm</td><td className="px-6 py-4">Large / Loose Fit</td></tr>
                <tr className="border-b border-gray-100"><td className="px-6 py-4">22 cm</td><td className="px-6 py-4">Extra Large</td></tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}