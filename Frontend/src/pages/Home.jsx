import { useState } from 'react';
import { Login } from './Login';
import { Signup } from './Signup';
import { AttendancePage } from './AttendancePage';

export const Home = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [specialAccess, setSpecialAccess] = useState(false);

  const handleSpecialAccess = (id) => {
    if (id === 'FACULTY123') {
      setSpecialAccess(true);
    } else if (id === 'DASHBOARD123') {
      window.location.href = '/faculty-dashboard';
    }
  };

  if (specialAccess) {
    return <AttendancePage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <div className="bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">College Portal</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentPage('login')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === 'login' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setCurrentPage('signup')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === 'signup' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Signup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Special Access */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Enter Special ID for Attendance Portal"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSpecialAccess(e.target.value);
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                handleSpecialAccess(input.value);
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
            >
              Access
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            <p>Faculty Attendance: FACULTY123</p>
            <p>Faculty Dashboard: DASHBOARD123</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4">
        {currentPage === 'login' && <Login />}
        {currentPage === 'signup' && <Signup />}
      </div>
    </div>
  );
};