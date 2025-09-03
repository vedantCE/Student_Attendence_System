require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Database connection
connectDB();

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));

// Import remaining functionality from original server
const Attendance = require('./models/Attendance');
const User = require('./models/User');
const transporter = require('./config/mailer');

// Faculty dashboard data
app.get('/api/faculty/dashboard', async (req, res) => {
  try {
    console.log('Faculty dashboard API called');
    const allRecords = await Attendance.find({});
    const allStudents = await User.find({ role: 'student' });
    console.log('Found records:', allRecords.length);
    console.log('Found students:', allStudents.length);
    
    const totalStudents = allStudents.length;
    const uniqueClasses = [...new Set(allRecords.map(r => `${r.subject}-${r.date}-${r.division}`))].length;
    
    const studentStats = {};
    allRecords.forEach(record => {
      if (!studentStats[record.rollNo]) {
        studentStats[record.rollNo] = { present: 0, total: 0 };
      }
      studentStats[record.rollNo].total++;
      if (record.status === 'Present') {
        studentStats[record.rollNo].present++;
      }
    });
    
    const attendancePercentages = Object.values(studentStats).map(stat => 
      stat.total > 0 ? (stat.present / stat.total) * 100 : 0
    );
    const avgAttendance = attendancePercentages.length > 0 
      ? Math.round(attendancePercentages.reduce((a, b) => a + b, 0) / attendancePercentages.length)
      : 0;
    
    const poorPerformers = Object.entries(studentStats)
      .map(([rollNo, stats]) => ({
        rollNo: parseInt(rollNo),
        present: stats.present,
        total: stats.total,
        percentage: Math.round((stats.present / stats.total) * 100)
      }))
      .filter(student => student.percentage < 75)
      .sort((a, b) => a.percentage - b.percentage);
    
    const recentClasses = allRecords
      .reduce((acc, record) => {
        const key = `${record.subject}-${record.date}-${record.division}`;
        if (!acc[key]) {
          acc[key] = {
            subject: record.subject,
            date: record.date,
            time: record.time,
            division: record.division,
            presentCount: 0,
            totalCount: 0
          };
        }
        acc[key].totalCount++;
        if (record.status === 'Present') {
          acc[key].presentCount++;
        }
        return acc;
      }, {});
    
    const recentClassesArray = Object.values(recentClasses)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({
      stats: {
        totalStudents,
        totalClasses: uniqueClasses,
        avgAttendance,
        poorAttendance: poorPerformers.length
      },
      recentClasses: recentClassesArray,
      poorPerformers: poorPerformers.slice(0, 20)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate attendance report
app.get('/api/faculty/report', async (req, res) => {
  try {
    const allRecords = await Attendance.find({}).sort({ date: -1 });
    
    let csv = 'Date,Time,Subject,Division,Roll No,Status\n';
    allRecords.forEach(record => {
      csv += `${record.date},${record.time},${record.subject},${record.division === 'div1' ? 'Division 1' : 'Division 2'},${record.rollNo},${record.status}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send bulk notifications to poor performers
app.post('/api/faculty/bulk-notify', async (req, res) => {
  try {
    const allRecords = await Attendance.find({});
    const studentStats = {};
    
    allRecords.forEach(record => {
      if (!studentStats[record.rollNo]) {
        studentStats[record.rollNo] = { present: 0, total: 0 };
      }
      studentStats[record.rollNo].total++;
      if (record.status === 'Present') {
        studentStats[record.rollNo].present++;
      }
    });
    
    const poorPerformers = Object.entries(studentStats)
      .filter(([rollNo, stats]) => (stats.present / stats.total) * 100 < 75)
      .map(([rollNo]) => parseInt(rollNo));
    
    let emailsSent = 0;
    for (const rollNo of poorPerformers) {
      const student = await User.findOne({ rollNo });
      if (student && student.email) {
        const percentage = Math.round((studentStats[rollNo].present / studentStats[rollNo].total) * 100);
        
        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: student.email,
          subject: 'Attendance Warning - Action Required',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">⚠️ Attendance Warning</h2>
              
              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
                <p><strong>Dear ${student.name},</strong></p>
                <p>Your attendance is below the required 75% threshold.</p>
                <p><strong>Current Attendance:</strong> ${percentage}%</p>
                <p><strong>Roll No:</strong> ${rollNo}</p>
                <p><strong>Classes Attended:</strong> ${studentStats[rollNo].present} / ${studentStats[rollNo].total}</p>
              </div>
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #92400e; margin: 0;">
                  📚 <strong>Action Required:</strong> Please improve your attendance to meet the minimum 75% requirement.
                </p>
              </div>
            </div>
          `
        };
        
        await transporter.sendMail(mailOptions);
        emailsSent++;
      }
    }
    
    res.json({ count: emailsSent });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send individual warning email
app.post('/api/faculty/warning-email', async (req, res) => {
  try {
    const { rollNo } = req.body;
    const student = await User.findOne({ rollNo });
    
    if (!student || !student.email) {
      return res.status(404).json({ message: 'Student not found or no email' });
    }
    
    const records = await Attendance.find({ rollNo });
    const present = records.filter(r => r.status === 'Present').length;
    const total = records.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: student.email,
      subject: 'Individual Attendance Warning',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">📧 Individual Warning</h2>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px;">
            <p><strong>Dear ${student.name},</strong></p>
            <p>This is a personal warning regarding your attendance.</p>
            <p><strong>Current Status:</strong> ${percentage}%</p>
            <p><strong>Roll No:</strong> ${rollNo}</p>
            <p>Please contact faculty for guidance on improving attendance.</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Warning email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get subject-wise attendance data for faculty dashboard
app.get('/api/faculty/subject-attendance', async (req, res) => {
  try {
    const { division } = req.query;
    const filter = division ? { division } : {};
    const allRecords = await Attendance.find(filter);
    const subjectStats = {};
    
    allRecords.forEach(record => {
      if (!subjectStats[record.subject]) {
        subjectStats[record.subject] = { present: 0, total: 0 };
      }
      subjectStats[record.subject].total++;
      if (record.status === 'Present') {
        subjectStats[record.subject].present++;
      }
    });
    
    const chartData = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      present: stats.present,
      absent: stats.total - stats.present,
      percentage: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
    }));
    
    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get subject-wise attendance data for specific student
app.get('/api/student/subject-attendance/:rollNo', async (req, res) => {
  try {
    const { rollNo } = req.params;
    const records = await Attendance.find({ rollNo: parseInt(rollNo) });
    const subjectStats = {};
    
    records.forEach(record => {
      if (!subjectStats[record.subject]) {
        subjectStats[record.subject] = { present: 0, total: 0 };
      }
      subjectStats[record.subject].total++;
      if (record.status === 'Present') {
        subjectStats[record.subject].present++;
      }
    });
    
    const chartData = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      present: stats.present,
      absent: stats.total - stats.present,
      percentage: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
    }));
    
    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student streaks
app.get('/api/student/streaks/:rollNo', async (req, res) => {
  try {
    const { rollNo } = req.params;
    const records = await Attendance.find({ rollNo: parseInt(rollNo) }).sort({ date: 1, time: 1 });
    
    if (records.length === 0) {
      return res.json({});
    }
    
    const subjectStreaks = {};
    const subjectRecords = {};
    
    records.forEach(record => {
      if (!subjectRecords[record.subject]) {
        subjectRecords[record.subject] = [];
      }
      subjectRecords[record.subject].push(record);
    });
    
    Object.entries(subjectRecords).forEach(([subject, subjectData]) => {
      let currentStreak = 0;
      let maxStreak = 0;
      let tempStreak = 0;
      
      for (let i = subjectData.length - 1; i >= 0; i--) {
        if (subjectData[i].status === 'Present') {
          tempStreak++;
          maxStreak = Math.max(maxStreak, tempStreak);
          if (i === subjectData.length - 1) {
            currentStreak = tempStreak;
          }
        } else {
          if (i === subjectData.length - 1) {
            currentStreak = 0;
          }
          tempStreak = 0;
        }
      }
      
      const lastRecord = subjectData[subjectData.length - 1];
      const isActive = lastRecord && lastRecord.status === 'Present' && currentStreak >= 2;
      
      subjectStreaks[subject] = {
        current: isActive ? currentStreak : 0,
        max: maxStreak,
        isActive
      };
    });
    
    res.json(subjectStreaks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const allRecords = await Attendance.find({});
    const studentStats = {};
    
    allRecords.forEach(record => {
      if (!studentStats[record.rollNo]) {
        studentStats[record.rollNo] = {
          rollNo: record.rollNo,
          division: record.rollNo <= 91 ? 'Division 1' : 'Division 2',
          present: 0,
          total: 0,
          points: 0
        };
      }
      
      studentStats[record.rollNo].total++;
      if (record.status === 'Present') {
        studentStats[record.rollNo].present++;
        studentStats[record.rollNo].points += 10;
      }
    });
    
    const leaderboard = Object.values(studentStats)
      .filter(student => student.total > 0)
      .map(student => ({
        ...student,
        percentage: Math.round((student.present / student.total) * 100)
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 20);
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});