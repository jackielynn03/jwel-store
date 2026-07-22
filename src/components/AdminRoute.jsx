import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Loader2 } from 'lucide-react';

export default function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        // Because of withCredentials: true, this will securely send the cookie
        const res = await axiosClient.get('/auth/profile');
        if (res.data && res.data.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      }
    };
    verifyAdmin();
  }, []);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return isAdmin ? children : <Navigate to="/" replace />;
}