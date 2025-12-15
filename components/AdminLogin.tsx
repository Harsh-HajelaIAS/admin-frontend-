import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ServerCrash } from 'lucide-react';
import { API_BASE_URL } from '../constants';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // Robust response handling
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // Fallback if server sends HTML error (500/404)
        const text = await response.text();
        throw new Error(response.statusText || 'Server error occurred');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('adminToken', data.token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Invalid credentials';
      
      // Friendly message for "Failed to fetch" (Network Error)
      if (msg === 'Failed to fetch') {
        msg = 'Cannot connect to server. Please ensure the backend is running.';
      }
      
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-800 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">Admin Login</h2>
          <p className="text-blue-100 mt-1">Hajela's IAS Academy</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className={`p-3 rounded-lg text-sm flex items-start gap-2 border ${error.includes('backend') ? 'bg-orange-50 text-orange-800 border-orange-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {error.includes('backend') ? <ServerCrash size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-70"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
          
          <div className="text-center text-xs text-gray-400 bg-gray-50 py-2 rounded border border-gray-100">
            Credentials: <strong>admin@hajelaias.com</strong> / <strong>admin123</strong>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;