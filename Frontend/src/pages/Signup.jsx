import { useState } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNo: '',
    division: 'div1'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate roll number based on division
    const rollNum = parseInt(formData.rollNo);
    if (formData.division === 'div1' && (rollNum < 1 || rollNum > 91)) {
      toast.error('Division 1: Roll number must be between 1-91');
      setLoading(false);
      return;
    }
    if (formData.division === 'div2' && (rollNum < 92 || rollNum > 167)) {
      toast.error('Division 2: Roll number must be between 92-167');
      setLoading(false);
      return;
    }

    try {
      await authAPI.register({
        ...formData,
        role: 'student'
      });
      toast.success('Account created successfully! Please login.');
      setFormData({
        name: '',
        email: '',
        password: '',
        rollNo: '',
        division: 'div1'
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Student Registration</h2>
        <p className="text-gray-600">Create your student account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
            required
          />
        </div>

        <div>
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
            required
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
            required
          />
        </div>

        <div>
          <select
            value={formData.division}
            onChange={(e) => setFormData({...formData, division: e.target.value, rollNo: ''})}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
          >
            <option value="div1">Division 1 (Roll No: 1-91)</option>
            <option value="div2">Division 2 (Roll No: 92-167)</option>
          </select>
        </div>

        <div>
          <input
            type="number"
            placeholder={formData.division === 'div1' ? 'Roll Number (1-91)' : 'Roll Number (92-167)'}
            value={formData.rollNo}
            onChange={(e) => setFormData({...formData, rollNo: e.target.value})}
            min={formData.division === 'div1' ? 1 : 92}
            max={formData.division === 'div1' ? 91 : 167}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-800 font-medium mb-2">Division Information:</p>
        <p className="text-xs text-blue-600">• Division 1: Roll Numbers 1-91 (71 students)</p>
        <p className="text-xs text-blue-600">• Division 2: Roll Numbers 92-167 (76 students)</p>
      </div>
    </div>
  );
};