import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export const AttendancePage = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [formData, setFormData] = useState({
    facultyEmail: '',
    subjectName: '',
    division: 'div1'
  });
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const generateStudentTable = () => {
    const division = formData.division;
    const startRoll = division === 'div1' ? 1 : 92;
    const endRoll = division === 'div1' ? 91 : 167;
    const count = endRoll - startRoll + 1;
    
    const newStudents = Array.from({ length: count }, (_, i) => ({
      rollNo: startRoll + i,
      status: 'Present'
    }));
    setStudents(newStudents);
  };

  const selectAll = () => {
    const updated = students.map(student => ({ ...student, status: 'Present' }));
    setStudents(updated);
  };

  const deselectAll = () => {
    const updated = students.map(student => ({ ...student, status: 'Absent' }));
    setStudents(updated);
  };

  const updateStudent = (index, field, value) => {
    const updated = [...students];
    updated[index][field] = value;
    setStudents(updated);
  };

  const getAbsentStudents = () => {
    return students.filter(student => student.status === 'Absent');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log('Submitting:', { students, subject: formData.subjectName, division: formData.division });
      
      const response = await fetch('http://localhost:3001/api/attendance/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          students,
          subject: formData.subjectName,
          division: formData.division,
          facultyEmail: formData.facultyEmail
        })
      });
      
      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        setIsSubmitting(false);
        setShowSuccess(true);
        
        // Hide success animation after 2 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setShowModal(false);
          
          const absentStudents = getAbsentStudents();
          const facultyMsg = result.facultyEmailSent ? ' Faculty notified.' : '';
          const studentMsg = result.studentEmailsSent > 0 ? ` ${result.studentEmailsSent} students notified.` : '';
          toast.success(`Attendance submitted! ${absentStudents.length} absent.${facultyMsg}${studentMsg}`);
          
          // Reset form
          setFormData({
            facultyEmail: '',
            subjectName: '',
            division: 'div1'
          });
          setStudents([]);
        }, 2000);
      } else {
        setIsSubmitting(false);
        const errorData = await response.text();
        console.log('Error response:', errorData);
        toast.error(`Failed to submit: ${response.status}`);
      }
    } catch (error) {
      setIsSubmitting(false);
      console.log('Fetch error:', error);
      toast.error(`Network error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Student Attendance Portal</h1>
          <div className="text-right">
            <p className="text-lg font-semibold text-blue-600">
              {currentDateTime.toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              {currentDateTime.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Attendance Form</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <select
            value={formData.division}
            onChange={(e) => setFormData({...formData, division: e.target.value})}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
          >
            <option value="div1">Division 1 (Roll No: 1-91) - 71 Students</option>
            <option value="div2">Division 2 (Roll No: 92-167) - 76 Students</option>
          </select>
          
          <input
            type="email"
            placeholder="Faculty Email"
            value={formData.facultyEmail}
            onChange={(e) => setFormData({...formData, facultyEmail: e.target.value})}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
          />
          
          <input
            type="text"
            placeholder="Subject Name"
            value={formData.subjectName}
            onChange={(e) => setFormData({...formData, subjectName: e.target.value})}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none col-span-2"
          />
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={`${currentDateTime.toLocaleDateString()} ${currentDateTime.toLocaleTimeString()}`}
            readOnly
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-600"
          />
        </div>

        <div className="text-center">
          <button
            onClick={generateStudentTable}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold"
          >
            Generate {formData.division === 'div1' ? 'Division 1' : 'Division 2'} Attendance
          </button>
        </div>
      </div>

      {/* Dynamic Attendance Table */}
      {students.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Attendance - {formData.division === 'div1' ? 'Division 1' : 'Division 2'}</h3>
            <div className="flex gap-3">
              <button
                onClick={selectAll}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-medium"
              >
                Deselect All
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {students.map((student, index) => (
              <div key={index} className={`rounded-xl p-3 border-2 transition-all duration-200 cursor-pointer ${
                student.status === 'Present' 
                  ? 'bg-green-50 border-green-300 hover:bg-green-100' 
                  : 'bg-red-50 border-red-300 hover:bg-red-100'
              }`}>
                <label className="flex flex-col items-center cursor-pointer">
                  <span className="font-bold text-gray-800 mb-2">Roll {student.rollNo}</span>
                  <input
                    type="checkbox"
                    checked={student.status === 'Present'}
                    onChange={(e) => updateStudent(index, 'status', e.target.checked ? 'Present' : 'Absent')}
                    className="w-6 h-6 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <span className={`mt-2 text-xs font-medium ${
                    student.status === 'Present' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {student.status === 'Present' ? '✓ Present' : '✗ Absent'}
                  </span>
                </label>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold"
            >
              Submit Attendance
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
            {isSubmitting ? (
              <div className="text-center py-8">
                <div className="w-24 h-24 mx-auto mb-4">
                  <DotLottieReact
                    src="/animations/loader.json"
                    loop
                    autoplay
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Submitting Attendance...</h3>
                <p className="text-gray-600">Please wait while we process your submission</p>
              </div>
            ) : showSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4 animate-bounce" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">Success!</h3>
                <p className="text-gray-600">Attendance submitted successfully</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm to Submit?</h3>
                
                <div className="mb-6">
                  <p className="text-gray-600 mb-2">Absent Students: <span className="font-semibold text-red-600">{getAbsentStudents().length}</span></p>
                  {getAbsentStudents().length > 0 && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-red-700 font-medium">Absent Students:</p>
                      {getAbsentStudents().map((student, index) => (
                        <p key={index} className="text-sm text-red-600">• {student.name || `Roll No. ${student.rollNo}`}</p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200"
                  >
                    Confirm Submit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};