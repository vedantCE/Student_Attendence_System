import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';

export const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    present: 0,
    absent: 0,
    percentage: 0
  });
  const [filters, setFilters] = useState({
    subject: '',
    date: '',
    status: ''
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/attendance/notifications/${user?.rollNo}`);
        if (response.ok) {
          const data = await response.json();
          const formattedNotifications = data.map(record => ({
            id: record._id,
            subject: record.subject,
            date: record.date,
            time: record.time,
            status: record.status,
            message: record.status === 'Absent' 
              ? `You are absent today in ${record.subject} lecture`
              : `You were present in ${record.subject} lecture`
          }));
          setNotifications(formattedNotifications);
          setAllNotifications(formattedNotifications);

          // Calculate stats
          const totalClasses = data.length;
          const present = data.filter(r => r.status === 'Present').length;
          const absent = data.filter(r => r.status === 'Absent').length;
          const percentage = totalClasses > 0 ? Math.round((present / totalClasses) * 100) : 0;

          setStats({ totalClasses, present, absent, percentage });
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (user?.rollNo) {
      fetchNotifications();
    }
  }, [user]);

  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const applyFilters = () => {
    let filtered = allNotifications;
    
    if (filters.subject) {
      filtered = filtered.filter(notif => 
        notif.subject.toLowerCase().includes(filters.subject.toLowerCase())
      );
    }
    
    if (filters.date) {
      filtered = filtered.filter(notif => notif.date === filters.date);
    }
    
    if (filters.status) {
      filtered = filtered.filter(notif => notif.status === filters.status);
    }
    
    setNotifications(filtered);
  };

  const clearFilters = () => {
    setFilters({ subject: '', date: '', status: '' });
    setNotifications(allNotifications);
  };

  const getStatusColor = (status) => {
    return status === 'Present' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}</h1>
            <div className="flex gap-4 mt-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Roll No: {user?.rollNo}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                Division: {user?.rollNo <= 91 ? '1' : '2'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-blue-600">
              {new Date().toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleTimeString()}
            </p>
            <button
              onClick={logout}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalClasses}</div>
          <div className="text-gray-600 font-medium">Total Classes</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.present}</div>
          <div className="text-gray-600 font-medium">Present</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">{stats.absent}</div>
          <div className="text-gray-600 font-medium">Absent</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className={`text-3xl font-bold mb-2 ${getPercentageColor(stats.percentage).split(' ')[0]}`}>
            {stats.percentage}%
          </div>
          <div className="text-gray-600 font-medium">Attendance</div>
          <div className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${getPercentageColor(stats.percentage)}`}>
            {stats.percentage >= 75 ? 'Good' : stats.percentage >= 60 ? 'Average' : 'Poor'}
          </div>
        </div>
      </div>

      {/* Attendance Progress Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Attendance Progress</h2>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div 
            className={`h-4 rounded-full transition-all duration-500 ${
              stats.percentage >= 75 ? 'bg-green-500' : 
              stats.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${stats.percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>0%</span>
          <span className="font-medium">Required: 75%</span>
          <span>100%</span>
        </div>
        {stats.percentage < 75 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              Your attendance is below 75%. You need to attend more classes to meet the minimum requirement.
            </p>
          </div>
        )}
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">My Attendance Records</h2>
          <span className="text-sm text-gray-500">{notifications.length} of {allNotifications.length} records</span>
        </div>
        
        {/* Filters */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Filter Records</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Search by subject"
              value={filters.subject}
              onChange={(e) => setFilters({...filters, subject: e.target.value})}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({...filters, date: e.target.value})}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="">All Status</option>
              <option value="Present">Present Only</option>
              <option value="Absent">Absent Only</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium"
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all duration-200 text-sm font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-500 text-lg">
              {allNotifications.length === 0 
                ? 'No attendance records found' 
                : 'No records match your filters'
              }
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {allNotifications.length === 0 
                ? 'Your attendance will appear here once marked by faculty'
                : 'Try adjusting your filter criteria'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${getStatusColor(notification.status)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800 text-lg">{notification.subject}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        notification.status === 'Present' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {notification.status}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{notification.message}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-medium text-gray-700">{notification.date}</p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};