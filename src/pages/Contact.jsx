import React from 'react';

export default function Contact() {
  return (
    <div className="bg-[#fafafa] min-h-screen py-24 px-8 font-sans">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">Get In Touch</p>
        <h1 className="text-4xl md:text-5xl font-serif text-black uppercase tracking-widest">Contact Us</h1>
      </div>
      
      <div className="max-w-xl mx-auto bg-white p-10 border border-gray-100 shadow-sm">
        <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">Your Name</label>
            <input type="text" className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:outline-none focus:border-gray-400" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">Email Address</label>
            <input type="email" className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:outline-none focus:border-gray-400" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">Message</label>
            <textarea rows="5" className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:outline-none focus:border-gray-400 resize-none"></textarea>
          </div>
          <button className="w-full bg-[#1a1a1a] text-white text-xs font-bold tracking-[0.15em] uppercase py-4 mt-4 hover:bg-black transition-colors">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}