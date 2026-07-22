import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, ArrowLeft } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function AdminOrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosClient.get('/items/admin/orders');
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching admin orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await axiosClient.put(`/items/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const search = searchTerm.toLowerCase();
    return (
      order.customer_name?.toLowerCase().includes(search) || 
      order.email?.toLowerCase().includes(search) || 
      String(order.id).includes(search)
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
            <h1 className="text-3xl font-serif text-black uppercase tracking-widest">Order Management</h1>
            <p className="text-sm text-gray-500 mt-2">Manage customer transactions and tracking statuses.</p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by ID, Name, or Email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 text-sm focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 text-sm font-medium tracking-widest uppercase">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4" />
            Loading Orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-12 border border-gray-100 flex flex-col items-center justify-center text-center text-gray-500 text-sm shadow-sm">
            <p>No orders found matching your search.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredOrders.map((order) => {
              const orderTotal = order.items.reduce((sum, item) => sum + Number(item.price), 0);
              
              return (
                <div key={order.id} className="bg-white border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row gap-8 relative">
                  
                  {/* Left Column: Order Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xs font-bold tracking-widest text-black uppercase">Order #{order.id}</h3>
                        <p className="text-sm text-gray-500 mt-1">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      
                      {/* Status Dropdown */}
                      <div className="flex items-center gap-2">
                        {updatingId === order.id && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className={`text-xs font-bold tracking-widest uppercase px-3 py-2 border rounded-sm outline-none cursor-pointer transition-colors
                            ${order.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                              order.status === 'Successed' ? 'bg-green-50 text-green-700 border-green-200' : 
                              'bg-red-50 text-red-700 border-red-200'
                            }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Successed">Successed</option>
                          <option value="Canceled">Canceled</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4 mb-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                        <p className="text-sm text-black">{order.customer_name}</p>
                        <p className="text-sm text-gray-500">{order.email}</p>
                        <p className="text-sm text-gray-500">{order.phone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Shipping Address</p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{order.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Order Items */}
                  <div className="md:w-1/3 bg-gray-50 p-4 border border-gray-100 flex flex-col">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-200 pb-2">Items Purchased</p>
                    <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-48 pr-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div className="flex flex-col">
                            <span className="font-semibold text-black line-clamp-1">{item.name}</span>
                            <span className="text-[10px] text-gray-500 tracking-widest uppercase">{item.category} {item.color !== 'N/A' && `- ${item.color}`}</span>
                          </div>
                          <span className="font-bold text-[#a68a56] whitespace-nowrap ml-4">
                            {Number(item.price).toLocaleString('en-US')}₫
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 mt-4 pt-3 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Value</span>
                      <span className="text-lg font-serif text-black">{orderTotal.toLocaleString('en-US')}₫</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}