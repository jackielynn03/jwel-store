import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import axiosClient from '../api/axiosClient';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems } = useShop();
  
  // You will generate this URL in Step 5
  const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const cartTotal = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

  // Autofill data if the user is logged in
  useEffect(() => {
    if (cartItems.length === 0) navigate('/');
    
    const fetchProfile = async () => {
      try {
        const res = await axiosClient.get('/auth/profile');
        setFormData(prev => ({
          ...prev,
          fullName: res.data.full_name || '',
          email: res.data.email || '',
          address: res.data.address || ''
        }));
      } catch (err) {
        // User not logged in, ignore
      }
    };
    
    if (localStorage.getItem('accessToken')) fetchProfile();
  }, [cartItems, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    // NEW: Fail-safe to check if the .env variable loaded
    if (!GOOGLE_SCRIPT_URL) {
      alert("Error: Google Script URL is missing! Please restart your terminal.");
      return;
    }

    setLoading(true);

    const orderData = {
      fullName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      email: formData.email,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        size: item.size || 'N/A',
        type: item.type || 'N/A',
        color: item.color || 'N/A'
      }))
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(orderData)
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/'; 
      }, 3000);

    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Failed to submit order. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-8">
        <CheckCircle className="w-16 h-16 text-green-500 mb-6" />
        <h1 className="text-3xl font-serif text-black mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 text-sm">Thank you for your purchase. We have received your order.</p>
        <p className="text-gray-400 text-xs mt-4 animate-pulse">Redirecting to home...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
      <div className="max-w-6xl mx-auto px-8 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 hover:text-black transition-colors uppercase mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
        <h1 className="text-3xl font-serif text-black uppercase tracking-widest mb-10">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Form Section */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xs font-bold tracking-widest uppercase text-black mb-6 border-b border-gray-100 pb-4">Shipping Information</h2>
              <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">Full Name *</label>
                  <input required name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">Email Address *</label>
                    <input required name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">Phone Number *</label>
                    <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">Full Address *</label>
                  <textarea required name="address" value={formData.address} onChange={handleInputChange} rows="3" className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black resize-none" />
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 border border-gray-100 shadow-sm sticky top-8">
              <h2 className="text-xs font-bold tracking-widest uppercase text-black mb-6 border-b border-gray-100 pb-4">Order Summary</h2>
              
              <div className="flex flex-col gap-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover bg-gray-50 mix-blend-multiply" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-black line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{item.category}</p>
                    </div>
                    <span className="text-sm font-bold text-[#a68a56]">{Number(item.price).toLocaleString('en-US')}₫</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-3 mb-8">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{cartTotal.toLocaleString('en-US')}₫</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3">
                  <span className="text-sm font-bold tracking-widest uppercase text-black">Total</span>
                  <span className="text-xl font-serif text-black">{cartTotal.toLocaleString('en-US')}₫</span>
                </div>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={loading}
                className="w-full bg-[#1a1a1a] text-white text-xs font-bold tracking-[0.15em] uppercase py-4 hover:bg-black transition-colors flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Order'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}