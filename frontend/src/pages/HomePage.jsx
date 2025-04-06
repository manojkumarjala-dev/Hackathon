import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = ({ setRole }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (role) => {
    setRole(role);
    if (role === 'recruiter') {
      navigate('/dashboard');
    } else if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/chatbot');
    }
  };

  const handleAuthClick = (type) => {
    alert(`${type} clicked!\n(email: ${email}, password: ${password})`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100 flex flex-col items-center justify-center text-center px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">AI Hiring Assistant</h1>
        <p className="text-gray-600 mb-6">Login or create an account</p>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-full focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-full focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-between space-x-4 mb-6">
          <button
            onClick={() => handleAuthClick('Sign In')}
            className="w-1/2 bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition"
          >
            Sign In
          </button>
          <button
            onClick={() => handleAuthClick('Sign Up')}
            className="w-1/2 bg-green-600 text-white py-2 rounded-full hover:bg-green-700 transition"
          >
            Sign Up
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-2">or skip to</p>

        <div className="space-y-3">
          <button
            onClick={() => handleLogin('admin')}
            className="w-full px-4 bg-blue-600 text-white py-2 rounded-full text-lg font-medium hover:bg-blue-700 transition"
          >
            Login as Recruiter
          </button>
          <button
            onClick={() => handleLogin('interviewee')}
            className="w-full px-4 bg-green-600 text-white py-2 rounded-full text-lg font-medium hover:bg-green-700 transition"
          >
            Login as Interviewee
          </button>
          <button
            onClick={() => handleLogin('recruiter')}
            className="w-full px-4 bg-gray-700 text-white py-2 rounded-full text-lg font-medium hover:bg-gray-800 transition"
          >
            Login as Admin
          </button>
        </div>
      </div>

      <footer className="mt-12 text-sm text-gray-400">
        &copy; {new Date().getFullYear()} AI Hiring Platform
      </footer>
    </div>
  );
};

export default HomePage;
