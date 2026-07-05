import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CategoryView from './pages/CategoryView';
import ProductDetail from './pages/ProductDetail';
import SizeGuide from './pages/SizeGuide';
import Profile from './pages/Profile';
import AdminRoute from './components/AdminRoute';
import ListingManagement from './pages/admin/ListingManagement';
import ListAnItem from './pages/admin/ListAnItem';
import EditItem from './pages/admin/EditItem';
import AdminListingDetail from './pages/admin/AdminListingDetail';
import { ShopProvider } from './context/ShopContext';

function Layout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-white">
      {!isAuthPage && <Header />}
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/category/:categoryName" element={<CategoryView />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/size-guide" element={<SizeGuide />} />
          <Route path="/profile" element={<Profile />} />
          
          <Route path="/admin/listings" element={<AdminRoute><ListingManagement /></AdminRoute>} />
          <Route path="/admin/list-item" element={<AdminRoute><ListAnItem /></AdminRoute>} />
          <Route path="/admin/edit-item/:id" element={<AdminRoute><EditItem /></AdminRoute>} />
          <Route path="/admin/listings/:id" element={<AdminRoute><AdminListingDetail /></AdminRoute>} />
        </Routes>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </ShopProvider>
  );
}