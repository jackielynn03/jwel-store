import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Pencil, Save, X, ArrowLeft, Loader2, Package, HeartCrack, Trash2 } from 'lucide-react';
import axiosClient, { BASE_URL } from '../api/axiosClient';

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); 
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('details'); 
  
  // Data States
  const [userData, setUserData] = useState({ username: '', full_name: '', email: '', address: '', role: '' });
  const [formData, setFormData] = useState({ ...userData });
  
  // New States for fetched data
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  
  // Track which item is currently being removed to prevent double-clicks
  const [removingItemId, setRemovingItemId] = useState(null);

  // Initial Profile Fetch
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosClient.get('/auth/profile');
        setUserData(response.data);
        setFormData(response.data); 
        if (response.data.role === 'admin') setIsAdmin(true);
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // Fetch Orders or Wishlist when tab changes
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        if (activeTab === 'orders') {
          const res = await axiosClient.get('/items/my-orders');
          setOrders(res.data);
        } else if (activeTab === 'wishlist') {
          const res = await axiosClient.get('/wishlist');
          setWishlist(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setDataLoading(false);
      }
    };

    if (activeTab === 'orders' || activeTab === 'wishlist') {
      fetchData();
    }
  }, [activeTab]);

  const handleSignOut = async () => {
    try { await axiosClient.post('/auth/logout'); } catch (err) {} 
    finally { navigate('/login'); }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setError('');
      const response = await axiosClient.put('/auth/profile', formData);
      setUserData(response.data); 
      if (response.data.role === 'admin') setIsAdmin(true);
      setIsEditing(false); 
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleCancel = () => {
    setFormData({ ...userData }); 
    setIsEditing(false);
    setError('');
  };

  // NEW: Function to handle removing an item directly from the wishlist tab
  const handleRemoveFromWishlist = async (e, itemId) => {
    e.preventDefault(); // Prevents the Link wrapping the card from navigating to the product page
    e.stopPropagation();

    if (removingItemId) return; // Prevent spam clicking
    setRemovingItemId(itemId);

    try {
      // The toggle endpoint will automatically delete it because it already exists
      await axiosClient.post('/wishlist/toggle', { item_id: itemId });
      
      // Update UI instantly without needing to refetch
      setWishlist(prevWishlist => prevWishlist.filter(item => item.id !== itemId));
    } catch (err) {
      console.error("Failed to remove item from wishlist", err);
      alert("Could not remove item. Please try again.");
    } finally {
      setRemovingItemId(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans pb-20">
      <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col">
        
        <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 hover:text-black transition-colors uppercase mb-10">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>

        <div className="flex flex-col md:flex-row gap-16 md:gap-24">
          <aside className="w-full md:w-64 shrink-0 flex flex-col h-full min-h-[500px]">
            <h2 className="text-3xl font-serif text-black mb-12">My Account</h2>
            
            <nav className="flex flex-col gap-6 flex-grow">
              <button onClick={() => setActiveTab('details')} className={`text-left text-xs font-bold tracking-widest uppercase pl-4 py-1 transition-colors border-l-2 ${activeTab === 'details' ? 'text-[#a68a56] border-[#a68a56]' : 'text-gray-500 border-transparent hover:text-gray-900'}`}>Account Details</button>
              <button onClick={() => setActiveTab('orders')} className={`text-left text-xs font-bold tracking-widest uppercase pl-4 py-1 transition-colors border-l-2 ${activeTab === 'orders' ? 'text-[#a68a56] border-[#a68a56]' : 'text-gray-500 border-transparent hover:text-gray-900'}`}>Order History</button>
              <button onClick={() => setActiveTab('wishlist')} className={`text-left text-xs font-bold tracking-widest uppercase pl-4 py-1 transition-colors border-l-2 ${activeTab === 'wishlist' ? 'text-[#a68a56] border-[#a68a56]' : 'text-gray-500 border-transparent hover:text-gray-900'}`}>My Wishlist</button>
              {isAdmin && (
                <>
                  <Link to="/admin/listings" className="text-xs font-bold tracking-widest uppercase text-[#1a1a1a] hover:text-black border-l-2 border-transparent hover:border-black pl-4 py-1 transition-colors mt-4">
                    Listing Management
                  </Link>
                  <Link to="/admin/orders" className="text-xs font-bold tracking-widest uppercase text-[#1a1a1a] hover:text-black border-l-2 border-transparent hover:border-black pl-4 py-1 transition-colors mt-2">
                    Order Management
                  </Link>
                </>
              )}
            </nav>

            <div className="mt-auto pt-20">
              <button onClick={handleSignOut} className="text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-black transition-colors text-left">Sign Out</button>
            </div>
          </aside>

          <main className="flex-1 max-w-3xl">
            {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>}

            {activeTab === 'details' && (
              <>
                <section className="mb-20">
                  <div className="border-b border-gray-200 pb-4 mb-8 flex justify-between items-end">
                    <div>
                      <h3 className="text-4xl font-serif text-black mb-2">Personal Information</h3>
                      <p className="text-sm text-gray-500">Manage your details and shipping preferences.</p>
                    </div>
                    {!isEditing ? (
                      <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-[#a68a56] hover:text-[#8a7245] transition-colors pb-1"><Pencil className="w-3 h-3" /> Edit</button>
                    ) : (
                      <div className="flex gap-4 pb-1">
                        <button onClick={handleCancel} className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-gray-500 hover:text-gray-800 transition-colors"><X className="w-3 h-3" /> Cancel</button>
                        <button onClick={handleSave} className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-[#a68a56] hover:text-[#8a7245] transition-colors"><Save className="w-3 h-3" /> Save</button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-8 max-w-md">
                    <div><label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-3">Username</label><p className="text-sm text-gray-400">{userData.username}</p></div>
                    <div><label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-3">Full Name</label>{!isEditing ? <p className="text-sm text-black">{userData.full_name || 'Not provided'}</p> : <input type="text" name="full_name" value={formData.full_name || ''} onChange={handleInputChange} className="w-full border-b border-gray-300 py-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent" placeholder="Enter your full name" />}</div>
                    <div><label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-3">Email Address</label>{!isEditing ? <p className="text-sm text-black">{userData.email}</p> : <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="w-full border-b border-gray-300 py-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent" />}</div>
                  </div>
                </section>

                <section>
                  <div className="border-b border-gray-100 pb-4 mb-8"><h3 className="text-2xl font-serif text-black">Default Shipping</h3></div>
                  <div className="grid grid-cols-1 gap-8 max-w-md">
                    <div><label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-3">Address</label>{!isEditing ? <p className="text-sm text-black">{userData.address || 'No shipping address provided.'}</p> : <textarea name="address" value={formData.address || ''} onChange={handleInputChange} rows="3" className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-black transition-colors bg-transparent resize-none" placeholder="E.g. 1248 Hill House Lane, Apt 4B, Boston, MA"></textarea>}</div>
                  </div>
                </section>
              </>
            )}

            {activeTab === 'orders' && (
              <section className="mb-20">
                <h3 className="text-4xl font-serif text-black mb-2">Order History</h3>
                <p className="text-sm text-gray-500 mb-8 border-b border-gray-200 pb-4">View your recent purchases and their status.</p>
                
                {dataLoading ? (
                  <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
                ) : orders.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center border border-dashed border-gray-200 bg-gray-50/50">
                    <Package className="w-8 h-8 text-gray-300 mb-4" />
                    <p className="text-xs text-gray-500 tracking-widest uppercase">No orders found.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                          <div>
                            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Order #{order.id}</p>
                            <p className="text-sm text-black mt-1">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                          <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${order.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex flex-col gap-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-600 flex-1">{item.name} <span className="text-gray-400 text-xs ml-2">({item.category})</span></span>
                              <span className="font-semibold text-black">{Number(item.price).toLocaleString('en-US')}₫</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'wishlist' && (
              <section className="mb-20">
                <h3 className="text-4xl font-serif text-black mb-2">My Wishlist</h3>
                <p className="text-sm text-gray-500 mb-8 border-b border-gray-200 pb-4">Curated pieces you have saved for later.</p>
                
                {dataLoading ? (
                  <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
                ) : wishlist.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center border border-dashed border-gray-200 bg-gray-50/50">
                    <HeartCrack className="w-8 h-8 text-gray-300 mb-4" />
                    <p className="text-xs text-gray-500 tracking-widest uppercase">Your wishlist is currently empty.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {wishlist.map((item) => (
                      <Link to={`/product/${item.id}`} key={item.id} className="group cursor-pointer block border border-gray-100 p-3 bg-white shadow-sm hover:shadow-md transition-all relative">
                        
                        {/* NEW: Remove Button */}
                        <button 
                          onClick={(e) => handleRemoveFromWishlist(e, item.id)}
                          disabled={removingItemId === item.id}
                          className="absolute top-4 right-4 z-10 p-2 bg-white/90 shadow-sm border border-gray-100 rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition-all disabled:opacity-50"
                          title="Remove from wishlist"
                        >
                          {removingItemId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <div className="bg-gray-50 aspect-square mb-4 overflow-hidden flex items-center justify-center p-4 relative">
                          <img src={`${BASE_URL}${item.main_image}`} alt={item.title} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-500" />
                        </div>
                        <div className="text-center">
                          <h4 className="text-sm font-semibold mb-1 group-hover:text-gray-600 transition-colors truncate">{item.title}</h4>
                          <p className="text-sm text-[#a68a56] font-bold">{Number(item.price).toLocaleString('en-US')}₫</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}