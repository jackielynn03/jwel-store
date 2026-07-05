import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axiosClient, { BASE_URL } from '../api/axiosClient';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Send POST request to backend
      await axiosClient.post('/auth/register', {
        username,
        email,
        password
      });

      // Redirect to login page upon success
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans p-6 md:p-12 relative">
      <Link to="/" className="absolute top-8 left-8 md:top-12 md:left-12 text-gray-400 hover:text-black transition-colors p-2 bg-white rounded-full shadow-sm border border-gray-100">
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <div className="flex flex-col items-center pt-8 md:pt-16 max-w-lg mx-auto w-full">
        <Link to="/" className="text-2xl tracking-[0.25em] font-serif text-black uppercase mb-12 cursor-pointer">
          Aurora
        </Link>
        
        <h2 className="text-4xl font-serif text-black mb-10 text-center">Create an Account</h2>
        
        {error && <div className="w-full bg-red-50 text-red-600 text-xs p-3 mb-6 rounded-sm border border-red-100 text-center">{error}</div>}

        <form className="w-full flex flex-col gap-6" onSubmit={handleRegister}>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username" 
              required
              className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:outline-none focus:border-gray-400 bg-white transition-colors placeholder:text-gray-300" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com" 
              required
              className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:outline-none focus:border-gray-400 bg-white transition-colors placeholder:text-gray-300" 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              required
              className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:outline-none focus:border-gray-400 bg-white transition-colors placeholder:text-gray-300 tracking-widest" 
            />
          </div>

          <label className="flex items-start gap-4 cursor-pointer group mt-4 mb-2">
            <input type="checkbox" className="w-4 h-4 mt-0.5 border-gray-300 rounded-none accent-black cursor-pointer shrink-0" />
            <span className="text-sm text-gray-600 leading-relaxed group-hover:text-black transition-colors">
              Subscribe to the Aurora newsletter for exclusive previews and high jewelry insights.
            </span>
          </label>

          <button type="submit" className="w-full bg-[#1a1a1a] text-white text-xs font-bold tracking-[0.15em] uppercase py-4 mt-4 hover:bg-black transition-colors">
            JOIN AURORA
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-10">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-black hover:text-gray-600 border-b border-black hover:border-gray-600 pb-0.5 ml-1 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}