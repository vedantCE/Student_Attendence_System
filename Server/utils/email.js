const transporter = require('../config/mailer');

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

const sendAbsentStudentEmails = async (absentStudents, subject, date, time, division) => {
  const User = require('../models/User');
  
  for (const student of absentStudents) {
    try {
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

module.exports = {
  sendAbsenteeEmail,
  sendAbsentStudentEmails
};