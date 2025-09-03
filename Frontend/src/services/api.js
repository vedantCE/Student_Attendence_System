import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://student-attendence-system-2-gyb9.onrender.com';
console.log('API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.email ? { 'user-email': user.email } : {};
};

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const classAPI = {
  getTodayClasses: () => api.post('/classes/today', {}, { headers: getAuthHeaders() }),
  createClass: (classData) => api.post('/classes', classData, { headers: getAuthHeaders() }),
  getFacultyClasses: () => api.post('/classes/faculty', {}, { headers: getAuthHeaders() }),
};

export const attendanceAPI = {
  markAttendance: (data) => api.post('/attendance/mark', data, { headers: getAuthHeaders() }),
  getClassAttendance: (classId) => api.post(`/attendance/${classId}`, {}, { headers: getAuthHeaders() }),
  getStudentHistory: () => api.post('/attendance/student/history', {}, { headers: getAuthHeaders() }),
  getFacultyNotifications: () => api.post('/attendance/faculty/notifications', {}, { headers: getAuthHeaders() }),
};

export default api;
