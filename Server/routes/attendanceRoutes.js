const express = require('express');
const { submitAttendance, getStudentNotifications } = require('../controllers/attendanceController');

const router = express.Router();

router.post('/submit', submitAttendance);
router.get('/notifications/:rollNo', getStudentNotifications);

module.exports = router;