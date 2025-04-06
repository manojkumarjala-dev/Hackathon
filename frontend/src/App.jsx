// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatbotPage from './pages/ChatbotPage';
import DashboardPage from './pages/DashboardPage';
import RecruiterDashboardPage from './pages/RecruiterDashboardPage';

import './index.css';
function App() {
  const [role, setRole] = useState(null); // "recruiter" or "interviewee" or ""admin

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage setRole={setRole} />} />

        <Route
          path="/chatbot"
          element={role === 'interviewee' ? <ChatbotPage /> : <Navigate to="/" replace />}
        />

        <Route
          path="/dashboard"
          element={role === 'recruiter' ? <DashboardPage /> : <Navigate to="/" replace />}
        />

        <Route
          path="/admin"
          element={role === 'admin' ? <RecruiterDashboardPage /> : <Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
