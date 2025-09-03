const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
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

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  rollNo: { type: Number, required: true },
  subject: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true },
  division: { type: String, enum: ['div1', 'div2'], required: true }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

async function seedData() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});

    // Create 10 demo students for Division 1 (Roll No 1-10)
    const students = [];
    for (let i = 1; i <= 10; i++) {
      students.push({
        name: `Student ${i}`,
        email: `student${i}@demo.com`,
        password: `pass${i}`,
        role: 'student',
        rollNo: i,
        division: 'div1'
      });
    }

    await User.insertMany(students);
    console.log('✅ Created 10 demo students (Roll No 1-10, Division 1)');

    // Create test credentials
    await User.create({
      name: 'Test User',
      email: 'at@gmail.com',
      password: 'at123',
      role: 'student',
      rollNo: 99,
      division: 'div1'
    });

    console.log('✅ Created test account: at@gmail.com / at123');

    console.log('\n📋 Demo Student Accounts:');
    for (let i = 1; i <= 10; i++) {
      console.log(`   Roll ${i}: student${i}@demo.com / pass${i}`);
    }

    console.log('\n🎯 Test Flow:');
    console.log('1. Use FACULTY123 to access attendance portal');
    console.log('2. Select Division 1 and generate attendance');
    console.log('3. Mark some students as absent');
    console.log('4. Login as those students to see absence notifications');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
