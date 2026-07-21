import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, ChevronDown, X, Trash2, Loader2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import axiosClient, { BASE_URL } from '../api/axiosClient';

export default function Header() {
  const navigate = useNavigate();
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart } = useShop();
  
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchData, setSearchData] = useState([]);
  
  // NEW: Checkout loading state
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  const isLoggedIn = !!localStorage.getItem('accessToken');
  const cartTotal = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

  const handleUserClick = () => {
    if (!isLoggedIn) navigate('/login');
    else setUserMenuOpen(!userMenuOpen);
  };

  const handleSignOut = async () => {
    try { await axiosClient.post('/auth/logout'); } catch (err) { console.error(err); }
    finally {
      localStorage.removeItem('accessToken');
      setUserMenuOpen(false);
      navigate('/login');
    }
  };

  // NEW: Handle Checkout click with effect
  const handleProceedToCheckout = () => {
    setCheckoutLoading(true);
    setTimeout(() => {
      setCheckoutLoading(false);
      setIsCartOpen(false);
      navigate('/checkout');
    }, 800); // 800ms loading effect
  };

  useEffect(() => {
    if (searchOpen && searchData.length === 0) {
      axiosClient.get('/items').then(res => setSearchData(res.data.data)).catch(console.error);
    }
  }, [searchOpen]);

  const filteredSearch = searchData.filter(item => 
    searchQuery && (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || item.attributes?.type?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <header className="w-full pt-8 pb-6 px-8 border-b border-gray-200 z-40 relative bg-white">
        <div className="max-w-7xl mx-auto flex flex-col items-center relative z-40">
          
          <div className="w-full flex justify-between items-center mb-8">
            <div className="w-24 hidden md:block"></div> 
            
            <Link to="/" className="flex flex-col items-center cursor-pointer">
              <h1 className="text-3xl md:text-4xl tracking-widest font-serif text-black uppercase">Aurora</h1>
              <p className="text-[9px] md:text-[10px] tracking-widest text-gray-500 mt-1 uppercase">Jewelry & Piercings</p>
            </Link>

            <div className="flex gap-5 justify-end text-gray-700 w-24 relative">
              <Search onClick={() => setSearchOpen(true)} className="w-5 h-5 cursor-pointer hover:text-black transition-colors" />
              
              <div className="relative">
                <User onClick={handleUserClick} className="w-5 h-5 cursor-pointer hover:text-black transition-colors" />
                {userMenuOpen && isLoggedIn && (
                  <div className="absolute top-full right-0 mt-4 w-48 bg-white border border-gray-100 shadow-xl flex flex-col text-[10px] font-bold tracking-widest uppercase z-50">
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50">My Account</Link>
                    <button onClick={handleSignOut} className="px-6 py-4 text-left text-red-600 hover:bg-red-50 transition-colors">Sign Out</button>
                  </div>
                )}
              </div>

              <div className="relative" onClick={() => setIsCartOpen(true)}>
                <ShoppingBag className="w-5 h-5 cursor-pointer hover:text-black transition-colors" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                    {cartItems.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm font-semibold tracking-wider text-black items-center w-full">
            <div className="relative group py-2 z-50">
              <Link to="/category/Vòng Tay" className="hover:text-gray-500 flex items-center gap-1 cursor-pointer">
                Vòng Tay <ChevronDown className="w-4 h-4 opacity-50 group-hover:rotate-180 transition-transform duration-300" />
              </Link>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-52 bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col text-sm font-medium z-50">
                <div className="py-2">
                  <Link to="/category/Vòng Tay" className="block px-6 py-2.5 hover:bg-gray-50 hover:text-gray-600 transition-colors">All Vòng Tay</Link>
                </div>
              </div>
            </div>
            <Link to="/category/Nhẫn" className="hover:text-gray-500 transition-colors py-2">Nhẫn</Link>
            <Link to="/category/Set" className="hover:text-gray-500 transition-colors py-2">Set</Link>
            <Link to="/category/Collection" className="hover:text-gray-500 transition-colors py-2">Collections</Link>
            <Link to="/category/Bộ trà & Rượu" className="hover:text-gray-500 transition-colors py-2 whitespace-nowrap">Bộ trà & Rượu</Link>
          </nav>
        </div>
      </header>

      {/* SEARCH OVERLAY (Removed for brevity, keep your existing code here) */}
      
      {/* CART DRAWER */}
      {isCartOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[90]" onClick={() => setIsCartOpen(false)} />}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[100] shadow-2xl transform transition-transform duration-500 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-serif text-black tracking-wide">Your Cart ({cartItems.length})</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-black transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {cartItems.length === 0 ? (
            <div className="m-auto text-center text-gray-400 text-sm tracking-widest uppercase">Your cart is empty.</div>
          ) : (
            cartItems.map((item, index) => (
              <div key={index} className="flex gap-4 items-center">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover bg-gray-50 mix-blend-multiply" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-black line-clamp-1">{item.name}</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 mb-2">{item.category} {item.size && `| Size: ${item.size}`}</p>
                  <p className="text-sm text-[#a68a56] font-bold">{Number(item.price).toLocaleString('en-US')}₫</p>
                </div>
                <button onClick={() => removeFromCart(index)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total</span>
              <span className="text-xl font-serif text-black">{cartTotal.toLocaleString('en-US')}₫</span>
            </div>
            <button 
              onClick={handleProceedToCheckout}
              disabled={checkoutLoading}
              className="w-full bg-[#1a1a1a] text-white text-xs font-bold tracking-[0.15em] uppercase py-4 hover:bg-black transition-colors flex justify-center items-center gap-2"
            >
              {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Proceed to Checkout'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}