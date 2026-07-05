import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import axiosClient, { BASE_URL } from '../api/axiosClient';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      // Send POST request to backend
      const response = await axiosClient.post('/auth/login', {
        username,
        password
      });

      // Save the access token to localStorage
      localStorage.setItem('accessToken', response.data.accessToken);

      // Redirect to the home page
      navigate('/');
    } catch (err) {
      // Set error message if login fails
      setError(err.response?.data?.message || 'An error occurred during login.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="max-w-5xl w-full bg-white flex flex-col md:flex-row shadow-sm h-auto md:h-[650px]">
        <div 
          className="hidden md:block w-1/2 bg-cover bg-center bg-gray-100" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1599643478524-fb66f70a0066?auto=format&fit=crop&w=800&q=80')" }}
        ></div>
        
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col items-center justify-center relative">
          <Link to="/" className="absolute top-6 right-8 text-xs text-gray-400 hover:text-black tracking-widest uppercase transition-colors">
            Return to Store
          </Link>
          
          <div className="w-full max-w-sm flex flex-col items-center">
            <h1 className="text-3xl tracking-[0.2em] font-serif text-black uppercase mb-3">Aurora</h1>
            <p className="text-sm text-gray-500 mb-10">Sign in to your account</p>
            
            {/* Display error message if it exists */}
            {error && <div className="w-full bg-red-50 text-red-600 text-xs p-3 mb-4 rounded-sm border border-red-100 text-center">{error}</div>}
            
            <form className="w-full flex flex-col gap-6" onSubmit={handleLogin}>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username" 
                  required
                  className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300" 
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
                  className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300 tracking-widest" 
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 border-gray-300 rounded-none accent-black cursor-pointer" />
                  <span className="text-xs text-gray-500 group-hover:text-black transition-colors">Remember me</span>
                </label>
                <a href="#" className="text-xs font-semibold text-gray-700 hover:text-black border-b border-gray-700 hover:border-black uppercase tracking-wider transition-colors pb-0.5">Forgot Password?</a>
              </div>

              <button type="submit" className="w-full bg-[#1a1a1a] text-white text-xs font-bold tracking-widest uppercase py-4 mt-4 flex items-center justify-center gap-2 hover:bg-black transition-colors">
                Sign In <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-10">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-gray-800 hover:text-black border-b border-gray-800 hover:border-black tracking-wider uppercase ml-1 pb-0.5 transition-colors">
                Create an Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}