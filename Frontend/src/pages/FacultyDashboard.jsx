import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { AttendancePieChart } from '../components/ui/AttendancePieChart.jsx';
import { Leaderboard } from '../components/ui/Leaderboard.jsx';
import { FileText, Mail, RefreshCw, BookOpen, PartyPopper, Calendar, Clock } from 'lucide-react';
import { formatDateToDDMMYYYY } from '../utils/dateUtils.js';

export const FacultyDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    avgAttendance: 0,
    poorAttendance: 0
  });
  const [recentClasses, setRecentClasses] = useState([]);
  const [poorPerformers, setPoorPerformers] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [filters, setFilters] = useState({
    subject: '',
    date: '',
    division: ''
  });
  const [allClasses, setAllClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [subjectAttendance, setSubjectAttendance] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('div1');
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      const [dashboardResponse, subjectResponse, leaderboardResponse] = await Promise.all([
        fetch('http://localhost:3001/api/faculty/dashboard'),
        fetch(`http://localhost:3001/api/faculty/subject-attendance?division=${selectedDivision}`),
        fetch('http://localhost:3001/api/leaderboard')
      ]);
      
      if (dashboardResponse.ok) {
        const data = await dashboardResponse.json();
        console.log('Dashboard data:', data);
        setStats(data.stats);
        setRecentClasses(data.recentClasses);
        setAllClasses(data.recentClasses);
        setFilteredClasses(data.recentClasses);
        setPoorPerformers(data.poorPerformers);
      }
      
      if (subjectResponse.ok) {
        const subjectData = await subjectResponse.json();
        setSubjectAttendance(subjectData);
      }
      
      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json();
        setLeaderboard(leaderboardData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const goToAttendance = () => {
    window.location.href = '/';
  };

  const generateReport = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/faculty/report');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-report-${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      alert('Failed to generate report');
    }
  };

  const sendBulkNotifications = async () => {
    if (!confirm('Send notifications to all students with poor attendance?')) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/faculty/bulk-notify', {
        method: 'POST'
      });
      if (response.ok) {
        const result = await response.json();
        alert(`Notifications sent to ${result.count} students`);
      } else {
        alert('Failed to send notifications');
      }
    } catch (error) {
      alert('Error sending notifications');
    }
  };

  const sendWarningEmail = async (rollNo) => {
    try {
      const response = await fetch('http://localhost:3001/api/faculty/warning-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNo })
      });
      if (response.ok) {
        alert(`Warning email sent to Roll No: ${rollNo}`);
      } else {
        alert('Failed to send warning email');
      }
    } catch (error) {
      alert('Error sending warning email');
    }
  };

  const applyFilters = () => {
    let filtered = allClasses;
    
    if (filters.subject) {
      filtered = filtered.filter(cls => 
        cls.subject.toLowerCase().includes(filters.subject.toLowerCase())
      );
    }
    
    if (filters.date) {
      filtered = filtered.filter(cls => cls.date === filters.date);
    }
    
    if (filters.division) {
      filtered = filtered.filter(cls => cls.division === filters.division);
    }
    
    setFilteredClasses(filtered);
  };

  const clearFilters = () => {
    setFilters({ subject: '', date: '', division: '' });
    setFilteredClasses(allClasses);
  };

  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/faculty/subject-attendance?division=${selectedDivision}`);
        if (response.ok) {
          const data = await response.json();
          setSubjectAttendance(data);
        }
      } catch (error) {
        console.error('Error fetching subject data:', error);
      }
    };
    
    fetchSubjectData();
  }, [selectedDivision]);

  const TabButton = ({ id, label, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        active 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Faculty Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {user?.name || 'Faculty'}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={goToAttendance}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium"
            >
              Take Attendance
            </button>
            <button
              onClick={logout}
              className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalStudents}</div>
          <div className="text-gray-600 font-medium">Total Students</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalClasses}</div>
          <div className="text-gray-600 font-medium">Classes Taken</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{stats.avgAttendance}%</div>
          <div className="text-gray-600 font-medium">Avg Attendance</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">{stats.poorAttendance}</div>
          <div className="text-gray-600 font-medium">Poor Attendance</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex gap-4 mb-6">
          <TabButton 
            id="overview" 
            label="Overview" 
            active={selectedTab === 'overview'} 
            onClick={setSelectedTab} 
          />
          <TabButton 
            id="classes" 
            label="Recent Classes" 
            active={selectedTab === 'classes'} 
            onClick={setSelectedTab} 
          />
          <TabButton 
            id="students" 
            label="Poor Performers" 
            active={selectedTab === 'students'} 
            onClick={setSelectedTab} 
          />
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Charts and Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Subject-wise Attendance Pie Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Subject Attendance</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedDivision('div1')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        selectedDivision === 'div1'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      Div 1
                    </button>
                    <button
                      onClick={() => setSelectedDivision('div2')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        selectedDivision === 'div2'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      Div 2
                    </button>
                  </div>
                </div>
                <AttendancePieChart 
                  data={subjectAttendance} 
                  title="" 
                />
              </div>
              
              {/* Leaderboard */}
              <Leaderboard data={leaderboard} />
              
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={generateReport}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-left"
                  >
                    <FileText className="w-4 h-4 inline mr-2" />Generate Report
                  </button>
                  <button 
                    onClick={sendBulkNotifications}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-left"
                  >
                    <Mail className="w-4 h-4 inline mr-2" />Send Notifications
                  </button>
                  <button 
                    onClick={fetchDashboardData}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-left"
                  >
                    <RefreshCw className="w-4 h-4 inline mr-2" />Refresh Data
                  </button>
                </div>
              </div>
            </div>
            
            {/* Division Performance */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Division Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Division 1 (Roll 1-91)</span>
                    <span className="font-semibold text-blue-600">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Division 2 (Roll 92-167)</span>
                    <span className="font-semibold text-green-600">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'classes' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Class Attendance Records</h3>
              <span className="text-sm text-gray-500">{filteredClasses.length} of {allClasses.length} classes</span>
            </div>
            
            {/* Filters */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 className="font-medium text-gray-700 mb-3">Filters</h4>
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
                  value={filters.division}
                  onChange={(e) => setFilters({...filters, division: e.target.value})}
                  className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="">All Divisions</option>
                  <option value="div1">Division 1</option>
                  <option value="div2">Division 2</option>
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
            
            {filteredClasses.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <BookOpen className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-gray-500">No classes found matching filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredClasses.map((classItem, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all duration-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-800 text-lg">{classItem.subject}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            classItem.division === 'div1' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {classItem.division === 'div1' ? 'Division 1' : 'Division 2'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            {formatDateToDDMMYYYY(classItem.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-blue-500" />
                            {classItem.time}
                          </span>
                          <span className="text-green-600 font-medium">
                            {Math.round((classItem.presentCount / classItem.totalCount) * 100)}% attendance
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800 mb-1">
                          <span className="text-green-600">{classItem.presentCount}</span>
                          <span className="text-gray-400 text-lg"> / </span>
                          <span className="text-gray-700">{classItem.totalCount}</span>
                        </div>
                        <p className="text-xs text-gray-500">Present / Total</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'students' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Students with Poor Attendance (&lt;75%)</h3>
            {poorPerformers.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <PartyPopper className="w-16 h-16 text-green-400" />
                </div>
                <p className="text-gray-500">All students have good attendance!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {poorPerformers.map((student, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-800">Roll {student.rollNo}</span>
                      <span className="text-red-600 font-bold">{student.percentage}%</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Present: {student.present} / {student.total}</p>
                      <p>Division: {student.rollNo <= 91 ? '1' : '2'}</p>
                    </div>
                    <div className="mt-3">
                      <button 
                        onClick={() => sendWarningEmail(student.rollNo)}
                        className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm"
                      >
                        Send Warning Email
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};