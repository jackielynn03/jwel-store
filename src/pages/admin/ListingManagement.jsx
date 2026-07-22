import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import axiosClient, { BASE_URL } from '../../api/axiosClient';

export default function ListingManagement() {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axiosClient.get('/items?limit=1000');
        const safeData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setListings(safeData);
      } catch (error) {
        console.error("Error fetching listings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const handleDelete = async (e, id, title) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (window.confirm(`Are you sure you want to delete "${title}"?\nThis action cannot be undone.`)) {
      try {
        await axiosClient.delete(`/items/${id}`);
        setListings(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error("Delete failed", error);
        alert("Failed to delete the listing.");
      }
    }
  };

  const filteredListings = listings.filter(item => {
    const search = searchTerm.toLowerCase();
    return (
      item.title?.toLowerCase().includes(search) || 
      item.attributes?.type?.toLowerCase().includes(search) || 
      item.category?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
      <div className="max-w-7xl mx-auto px-8 py-16">
        
        {/* NEW: Return to Profile Button */}
        <Link to="/profile" className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 hover:text-black transition-colors uppercase mb-8">
          <ArrowLeft className="w-4 h-4" /> Return to Profile
        </Link>

        <div className="flex flex-col md:flex-row justify-between md:items-end mb-10 border-b border-gray-200 pb-6 gap-6">
          <div>
            <h1 className="text-3xl font-serif text-black uppercase tracking-widest">Listing Management</h1>
            <p className="text-sm text-gray-500 mt-2">Manage your current store inventory.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search inventory..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
            
            <Link to="/admin/list-item" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1a1a1a] text-white text-[10px] font-bold tracking-widest uppercase px-6 py-3.5 hover:bg-black transition-colors whitespace-nowrap">
              <Plus className="w-4 h-4" /> List an Item
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 text-sm font-medium tracking-widest uppercase">Loading Inventory...</div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white p-12 border border-gray-100 flex flex-col items-center justify-center text-center text-gray-500 text-sm shadow-sm">
            <p>No items found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {filteredListings.map((item) => (
              <div key={item.id} className="group bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all relative block">
                
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                  <Link 
                    to={`/admin/edit-item/${item.id}`} 
                    className="bg-white/90 p-2 shadow-sm border border-gray-100 hover:bg-black hover:text-white transition-colors text-gray-600 rounded-full"
                    title="Edit Listing"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>

                  <button 
                    onClick={(e) => handleDelete(e, item.id, item.title)}
                    className="bg-white/90 p-2 shadow-sm border border-gray-100 hover:bg-red-600 hover:text-white transition-colors text-red-500 rounded-full"
                    title="Delete Listing"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <Link to={`/admin/listings/${item.id}`} className="cursor-pointer block">
                  <div className="aspect-square bg-gray-50 mb-4 overflow-hidden flex items-center justify-center relative">
                    <img 
                      src={`${BASE_URL}${item.main_image}`} 
                      alt={item.title} 
                      className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
                    />
                    <span className="absolute top-2 left-2 bg-white/90 text-[9px] font-bold px-2 py-1 tracking-widest uppercase text-black">
                      {item.category}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-black truncate mb-1 group-hover:text-gray-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#a68a56] font-bold">
                      {Number(item.price).toLocaleString('en-US')}₫
                    </p>
                  </div>
                </Link>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}