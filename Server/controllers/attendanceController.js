const Attendance = require('../models/Attendance');
const { sendAbsenteeEmail, sendAbsentStudentEmails } = require('../utils/email');

const submitAttendance = async (req, res) => {
  try {
    console.log('Received data:', req.body);
    const { students, subject, division, facultyEmail } = req.body;
    
    if (!students || !subject || !division) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const date = new Date().toLocaleDateString('en-GB');
    const time = new Date().toLocaleTimeString();

    await Attendance.deleteMany({ date, subject, division });

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

    const absentStudents = students.filter(student => student.status === 'Absent');
    console.log('Faculty Email:', facultyEmail);
    console.log('Absent Students:', absentStudents.length);
    console.log('Total Students:', students.length);
    
    if (facultyEmail) {
      await sendAbsenteeEmail(facultyEmail, subject, date, time, absentStudents, division, students.length);
    }
    
    if (absentStudents.length > 0) {
      console.log('Sending absence notifications to students...');
      await sendAbsentStudentEmails(absentStudents, subject, date, time, division);
    }

    res.json({ 
      message: 'Attendance submitted successfully',
      facultyEmailSent: !!facultyEmail,
      studentEmailsSent: absentStudents.length
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getStudentNotifications = async (req, res) => {
  try {
    const { rollNo } = req.params;
    const notifications = await Attendance.find({ rollNo: parseInt(rollNo) }).sort({ date: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  submitAttendance,
  getStudentNotifications
};