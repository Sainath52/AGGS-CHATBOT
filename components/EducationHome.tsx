import React from 'react';

const EducationHome: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-6 text-blue-800">Welcome to EduPortal</h1>
      <p className="text-lg text-center mb-8 text-gray-700">
        Your trusted source for information, resources, and updates in the education sector.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-2 text-blue-700">Latest News</h2>
          <ul className="list-disc pl-5 text-gray-600">
            <li>National Education Policy updates</li>
            <li>Upcoming board exam schedules</li>
            <li>Scholarship opportunities</li>
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-2 text-blue-700">Resources</h2>
          <ul className="list-disc pl-5 text-gray-600">
            <li>Study materials for all grades</li>
            <li>Online learning platforms</li>
            <li>Career guidance articles</li>
          </ul>
        </div>
      </div>
      <div className="mt-10 text-center">
        <a href="/chat" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Ask a Question (Chat)</a>
      </div>
    </div>
  );
};

export default EducationHome;
