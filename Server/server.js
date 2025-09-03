const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    // Vite preview defaults
    'http://localhost:4173',
    'http://localhost:4174',
    'http://127.0.0.1:4173',
    'http://127.0.0.1:4174',
    // Production domains
    'https://student-attendence-system-alpha.vercel.app',
    'https://student-attendence-system-2-gyb9.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty'], required: true },
  rollNo: { type: Number },
  division: { type: String, enum: ['div1', 'div2'] },
  facultyId: { type: String }
});

const User = mongoose.model('User', userSchema);

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, rollNo, division, facultyId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if roll number already exists
    if (role === 'student') {
      const existingRoll = await User.findOne({ rollNo: parseInt(rollNo) });
      if (existingRoll) {
        return res.status(400).json({ message: 'Roll number already exists' });
      }
    }

    const userData = { name, email, password, role };
    if (role === 'student') {
      userData.rollNo = parseInt(rollNo);
      userData.division = division;
    }
    if (role === 'faculty') userData.facultyId = facultyId;

    const user = await User.create(userData);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNo: user.rollNo,
        division: user.division,
        facultyId: user.facultyId
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check test credentials first
    if (email === 'at@gmail.com' && password === 'at123') {
      return res.json({
        user: {
          id: 'test123',
          name: 'Test User',
          email: 'at@gmail.com',
          role: 'student'
        }
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNo: user.rollNo,
        division: user.division,
        facultyId: user.facultyId
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  rollNo: { type: Number, required: true },
  subject: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true },
  division: { type: String, enum: ['div1', 'div2'], required: true }
}, { collection: 'attendances' });

const Attendance = mongoose.model('Attendance', attendanceSchema);

// Email configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email to faculty
const sendAbsenteeEmail = async (facultyEmail, subject, date, time, absentStudents, division) => {
  const absentList = absentStudents.map(student => `Roll No: ${student.rollNo}`).join('\n');
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: facultyEmail,
    subject: `Attendance Report - ${subject} (${date})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Attendance Report</h2>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #374151;">Class Details:</h3>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Division:</strong> ${division === 'div1' ? 'Division 1' : 'Division 2'}</p>
        </div>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
          <h3 style="margin: 0 0 10px 0; color: #dc2626;">Absent Students (${absentStudents.length}):</h3>
          <pre style="font-family: monospace; background: white; padding: 10px; border-radius: 4px;">${absentList || 'No students absent'}</pre>
        </div>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          This is an automated email from Student Attendance System.
        </p>
      </div>
    `
  };
  
  try {
    console.log('Sending faculty email to:', facultyEmail);
    await transporter.sendMail(mailOptions);
    console.log('✅ Faculty email sent successfully');
  } catch (error) {
    console.error('❌ Faculty email failed:', error.message);
  }
};

// Send email to absent students
const sendAbsentStudentEmails = async (absentStudents, subject, date, time, division) => {
  for (const student of absentStudents) {
    try {
      // Find student email from database
      const studentData = await User.findOne({ rollNo: student.rollNo });
      if (!studentData || !studentData.email) {
        console.log(`No email found for Roll No: ${student.rollNo}`);
        continue;
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: studentData.email,
        subject: `Attendance Alert - You are absent in ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">⚠️ Attendance Alert</h2>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #dc2626;">You are absent today!</h3>
              <p style="color: #374151; margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
              <p style="color: #374151; margin: 5px 0;"><strong>Date:</strong> ${date}</p>
              <p style="color: #374151; margin: 5px 0;"><strong>Time:</strong> ${time}</p>
              <p style="color: #374151; margin: 5px 0;"><strong>Division:</strong> ${division === 'div1' ? 'Division 1' : 'Division 2'}</p>
              <p style="color: #374151; margin: 5px 0;"><strong>Roll No:</strong> ${student.rollNo}</p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                📚 <strong>Important:</strong> Regular attendance is mandatory. Please ensure you attend future classes to maintain the required 75% attendance.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
              This is an automated notification from Student Attendance System.
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Absent notification sent to Roll No: ${student.rollNo} (${studentData.email})`);
    } catch (error) {
      console.error(`❌ Failed to send email to Roll No: ${student.rollNo}:`, error.message);
    }
  }
};

// Submit attendance endpoint
app.post('/api/attendance/submit', async (req, res) => {
  try {
    console.log('Received data:', req.body);
    const { students, subject, division, facultyEmail } = req.body;
    
    if (!students || !subject || !division) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const date = new Date().toLocaleDateString('en-GB');
    const time = new Date().toLocaleTimeString();

    // Clear existing attendance for today
    await Attendance.deleteMany({ date, subject, division });

    // Save new attendance records
    const attendanceRecords = students.map(student => ({
      rollNo: parseInt(student.rollNo),
      subject,
      date,
      time,
      status: student.status,
      division
    }));

    console.log('Saving records:', attendanceRecords);
    await Attendance.insertMany(attendanceRecords);

    // Send emails
    const absentStudents = students.filter(student => student.status === 'Absent');
    console.log('Faculty Email:', facultyEmail);
    console.log('Absent Students:', absentStudents.length);
    
    // Send email to faculty
    if (facultyEmail && absentStudents.length > 0) {
      await sendAbsenteeEmail(facultyEmail, subject, date, time, absentStudents, division);
    }
    
    // Send emails to absent students
    if (absentStudents.length > 0) {
      console.log('Sending absence notifications to students...');
      await sendAbsentStudentEmails(absentStudents, subject, date, time, division);
    }

    res.json({ 
      message: 'Attendance submitted successfully',
      facultyEmailSent: facultyEmail && absentStudents.length > 0,
      studentEmailsSent: absentStudents.length
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student attendance notifications
app.get('/api/attendance/notifications/:rollNo', async (req, res) => {
  try {
    const { rollNo } = req.params;
    const notifications = await Attendance.find({ rollNo: parseInt(rollNo) }).sort({ date: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Faculty dashboard data
app.get('/api/faculty/dashboard', async (req, res) => {
  try {
    console.log('Faculty dashboard API called');
    // Get all attendance records
    const allRecords = await Attendance.find({});
    const allStudents = await User.find({ role: 'student' });
    console.log('Found records:', allRecords.length);
    console.log('Found students:', allStudents.length);
    
    // Calculate stats
    const totalStudents = allStudents.length;
    const uniqueClasses = [...new Set(allRecords.map(r => `${r.subject}-${r.date}-${r.division}`))].length;
    
    // Calculate attendance percentages per student
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
    
    // Calculate average attendance
    const attendancePercentages = Object.values(studentStats).map(stat => 
      stat.total > 0 ? (stat.present / stat.total) * 100 : 0
    );
    const avgAttendance = attendancePercentages.length > 0 
      ? Math.round(attendancePercentages.reduce((a, b) => a + b, 0) / attendancePercentages.length)
      : 0;
    
    // Poor performers (< 75%)
    const poorPerformers = Object.entries(studentStats)
      .map(([rollNo, stats]) => ({
        rollNo: parseInt(rollNo),
        present: stats.present,
        total: stats.total,
        percentage: Math.round((stats.present / stats.total) * 100)
      }))
      .filter(student => student.percentage < 75)
      .sort((a, b) => a.percentage - b.percentage);
    
    // Recent classes
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
      
      // Calculate streaks
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
      
      // Check if current streak is still active
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
    
    // Calculate attendance stats from existing records
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
        studentStats[record.rollNo].points += 10; // 10 points per attendance
      }
    });
    
    // Convert to array and calculate percentage
    const leaderboard = Object.values(studentStats)
      .filter(student => student.total > 0) // Only students with attendance records
      .map(student => ({
        ...student,
        percentage: Math.round((student.present / student.total) * 100)
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 20); // Top 20
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});