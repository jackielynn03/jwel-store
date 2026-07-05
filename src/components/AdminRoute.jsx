import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    // Decode the JWT payload to check the role without a library
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    if (payload.role !== 'admin') {
      return <Navigate to="/" replace />; // Redirect customers to home
    }
    
    return children;
  } catch (error) {
    return <Navigate to="/login" replace />;
  }
}