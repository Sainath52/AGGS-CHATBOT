
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EducationHome from './components/EducationHome';
import ChatPage from './components/ChatPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <nav className="bg-white dark:bg-slate-800 shadow mb-8">
          <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
            <span className="text-2xl font-bold text-blue-900 dark:text-blue-200 tracking-wide">AGGS</span>
            <div className="space-x-6">
              <Link to="/" className="text-lg font-medium text-slate-700 dark:text-slate-100 hover:text-blue-700 dark:hover:text-blue-300 transition">Home</Link>
              <Link to="/chat" className="text-lg font-medium text-slate-700 dark:text-slate-100 hover:text-blue-700 dark:hover:text-blue-300 transition">Formal Q&amp;A</Link>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<EducationHome />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;