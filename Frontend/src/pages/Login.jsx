import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(credentials);
      login(response.data.user);
      toast.success('Login successful!');
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/favicon.svg" 
              alt="EduTrack Logo" 
              className="h-40 w-40 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Student Login</h2>
          <p className="text-gray-600">Access your student portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Enter Email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Enter Password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 text-center mb-2">Test Credentials:</p>
          <p className="text-xs text-gray-500">Email: at@gmail.com</p>
          <p className="text-xs text-gray-500">Password: at123</p>
        </div>
    </div>
  );
};