import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Pencil, Save, X } from 'lucide-react';
import axiosClient, { BASE_URL } from '../api/axiosClient';

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // <-- Tracks if you are an admin
  
  const [userData, setUserData] = useState({
    username: '',
    full_name: '',
    email: '',
    address: ''
  });

  const [formData, setFormData] = useState({ ...userData });

  useEffect(() => {
    // 1. Check token and determine role
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    } else {
      try {
        // This reads your digital ID badge to check your role
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'admin') {
          setIsAdmin(true); // Turns on the admin features!
        }
      } catch (e) {
        console.error("Failed to parse token", e);
      }
    }

    // 2. Fetch Profile Data from Postgres
    const fetchProfile = async () => {
      try {
        const response = await axiosClient.get('/auth/profile');
        setUserData(response.data);
        setFormData(response.data); 
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSignOut = async () => {
  try {
    // 1. Tell backend to delete the HTTP-only refresh cookie
    await axiosClient.post('/auth/logout');
  } catch (err) {
    console.error('Logout failed', err);
  } finally {
    // 2. Remove access token from local storage
    localStorage.removeItem('accessToken');
    setUserMenuOpen(false); // If in Header
    navigate('/login');
  }
};

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setError('');
      const response = await axiosClient.put('/auth/profile', formData);
      setUserData(response.data); 
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans pb-20">
      <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col md:flex-row gap-16 md:gap-24">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col h-full min-h-[500px]">
          <h2 className="text-3xl font-serif text-black mb-12">My Account</h2>
          
          <nav className="flex flex-col gap-6 flex-grow">
            <a href="#" className="text-xs font-bold tracking-widest uppercase text-[#a68a56] border-l-2 border-[#a68a56] pl-4 py-1 transition-colors">
              Account Details
            </a>
            <a href="#" className="text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-gray-900 border-l-2 border-transparent pl-4 py-1 transition-colors">
              Order History
            </a>
            <a href="#" className="text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-gray-900 border-l-2 border-transparent pl-4 py-1 transition-colors">
              My Wishlist
            </a>
            
            {/* ADMIN ONLY LINK - This will now appear! */}
            {isAdmin && (
              <Link to="/admin/listings" className="text-xs font-bold tracking-widest uppercase text-[#1a1a1a] hover:text-black border-l-2 border-transparent hover:border-black pl-4 py-1 transition-colors mt-4">
                Listing Management
              </Link>
            )}
          </nav>

          <div className="mt-auto pt-20">
            <button 
              onClick={handleSignOut}
              className="text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-black transition-colors"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="flex-1 max-w-3xl">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>}

          {/* Section 1: Personal Information */}
          <section className="mb-20">
            <div className="border-b border-gray-200 pb-4 mb-8 flex justify-between items-end">
              <div>
                <h3 className="text-4xl font-serif text-black mb-2">Personal Information</h3>
                <p className="text-sm text-gray-500">Manage your details and shipping preferences.</p>
              </div>
              
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-[#a68a56] hover:text-[#8a7245] transition-colors pb-1">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              ) : (
                <div className="flex gap-4 pb-1">
                  <button onClick={handleCancel} className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-gray-500 hover:text-gray-800 transition-colors">
                    <X className="w-3 h-3" /> Cancel
                  </button>
                  <button onClick={handleSave} className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-[#a68a56] hover:text-[#8a7245] transition-colors">
                    <Save className="w-3 h-3" /> Save
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-8 max-w-md">
              <div>
                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-3">Username</label>
                <p className="text-sm text-gray-400">{userData.username}</p> 
              </div>
              
              <div>
                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-3">Full Name</label>
                {!isEditing ? (
                  <p className="text-sm text-black">{userData.full_name || 'Not provided'}</p>
                ) : (
                  <input 
                    type="text" name="full_name" value={formData.full_name || ''} onChange={handleInputChange}
                    className="w-full border-b border-gray-300 py-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
                    placeholder="Enter your full name"
                  />
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-3">Email Address</label>
                {!isEditing ? (
                  <p className="text-sm text-black">{userData.email}</p>
                ) : (
                  <input 
                    type="email" name="email" value={formData.email || ''} onChange={handleInputChange}
                    className="w-full border-b border-gray-300 py-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
                  />
                )}
              </div>
            </div>
          </section>

          {/* Section 2: Default Shipping */}
          <section>
            <div className="border-b border-gray-100 pb-4 mb-8">
              <h3 className="text-2xl font-serif text-black">Default Shipping</h3>
            </div>

            <div className="grid grid-cols-1 gap-8 max-w-md">
              <div>
                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-3">Address</label>
                {!isEditing ? (
                  <p className="text-sm text-black">{userData.address || 'No shipping address provided.'}</p>
                ) : (
                  <textarea 
                    name="address" value={formData.address || ''} onChange={handleInputChange} rows="3"
                    className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-black transition-colors bg-transparent resize-none"
                    placeholder="E.g. 1248 Hill House Lane, Apt 4B, Boston, MA"
                  ></textarea>
                )}
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}