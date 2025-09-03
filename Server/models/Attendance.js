const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  rollNo: { type: Number, required: true },
  subject: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true },
  division: { type: String, enum: ['div1', 'div2'], required: true }
}, { collection: 'attendances' });

module.exports = mongoose.model('Attendance', attendanceSchema);