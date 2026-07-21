import React from 'react';

export default function Policies() {
  return (
    <div className="bg-white min-h-screen py-24 px-8 font-sans">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">Legal & Logistics</p>
        <h1 className="text-4xl md:text-5xl font-serif text-black uppercase tracking-widest">Our Policies</h1>
      </div>
      <div className="max-w-3xl mx-auto text-gray-600 leading-relaxed text-sm flex flex-col gap-6">
        <h3 className="text-xl font-serif text-black uppercase tracking-widest mt-8 border-b border-gray-100 pb-2">Shipping Policy</h3>
        <p>We offer complimentary standard shipping on all orders nationwide over 498,000₫. Expedited shipping is available at checkout. All packages are fully insured during transit.</p>
        <h3 className="text-xl font-serif text-black uppercase tracking-widest mt-8 border-b border-gray-100 pb-2">Returns & Exchanges</h3>
        <p>You may return or exchange your piece within 10 days of delivery. The item must be in pristine, unworn condition with all original packaging and tags attached. Custom or engraved items are non-refundable.</p>
        <h3 className="text-xl font-serif text-black uppercase tracking-widest mt-8 border-b border-gray-100 pb-2">Privacy & Data</h3>
        <p>Your privacy is our utmost priority. We employ industry-leading encryption to protect your personal and payment information. We do not sell or distribute your data to third-party marketing agencies.</p>
      </div>
    </div>
  );
}