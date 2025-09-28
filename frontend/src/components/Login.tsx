import React, { useState } from 'react';
import { User, GraduationCap, BookOpen, LogIn } from 'lucide-react';

interface LoginProps {
  onLogin: (user: { name: string; email: string; type: 'teacher' | 'student'; studentNumber?: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [userType, setUserType] = useState<'teacher' | 'student'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentNumber, setStudentNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    if (userType === 'student' && !studentNumber.trim()) return;

    onLogin({
      name: name.trim(),
      email: email.trim(),
      type: userType,
      studentNumber: userType === 'student' ? studentNumber.trim() : undefined
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">PDF Quiz Platform</h1>
          <p className="text-gray-600">Sign in to continue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-90">
          {/* User Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('teacher')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  userType === 'teacher'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300 text-gray-600'
                }`}
              >
                <User className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Teacher</div>
              </button>
              <button
                type="button"
                onClick={() => setUserType('student')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  userType === 'student'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300 text-gray-600'
                }`}
              >
                <BookOpen className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Student</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            {userType === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Number
                </label>
                <input
                  type="text"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your student number"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Sign In as {userType === 'teacher' ? 'Teacher' : 'Student'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;