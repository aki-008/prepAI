import React, { useState } from "react";
import { Send, Settings, CheckCircle } from "lucide-react";

// Define the structure for the interview state
type InterviewState = 'config' | 'chat' | 'results';

const AIInterview: React.FC = () => {
  const [interviewState, setInterviewState] = useState<InterviewState>('config');
  const [jobRole, setJobRole] = useState('');
  const [experience, setExperience] = useState('');
  const [level, setLevel] = useState('Medium');

  // Placeholder for the AI Chat bubble/ball
  const InterviewBall: React.FC = () => (
    <div className="flex items-center justify-center w-24 h-24 bg-purple-600 rounded-full shadow-2xl animate-pulse cursor-pointer">
      <span className="text-white font-bold text-xl">AI</span>
    </div>
  );

  // --- RENDER FUNCTIONS ---

  // 1. Configuration Phase
  const renderConfig = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-blue-700">
        <Settings size={24} /> Configure Your Interview
      </h3>
      
      <div className="space-y-6">
        {/* Job Role Input */}
        <label className="block">
          <span className="text-gray-700 font-medium">1. Job Role/Position (e.g., Senior Frontend Developer)</span>
          <input
            type="text"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            placeholder="Enter the job role for tailored questions"
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </label>

        {/* Experience Input */}
        <label className="block">
          <span className="text-gray-700 font-medium">2. Years of Professional Experience</span>
          <input
            type="number"
            min="0"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="e.g., 5"
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </label>

        {/* Level Select */}
        <label className="block">
          <span className="text-gray-700 font-medium">3. Difficulty Level</span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="Basic">Basic (Beginner)</option>
            <option value="Medium">Medium (Intermediate)</option>
            <option value="Hard">Hard (Senior/Expert)</option>
          </select>
        </label>
      </div>

      <button
        onClick={() => {
          if (jobRole && experience) {
            setInterviewState('chat');
          } else {
            alert('Please fill in the Job Role and Experience.');
          }
        }}
        className="mt-8 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-150 flex items-center gap-2"
        disabled={!jobRole || !experience}
      >
        <Send size={20} /> Start Interview
      </button>
    </div>
  );

  // 2. Chat/Interview Phase
  const renderChat = () => (
    <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-lg h-[600px] overflow-hidden relative">
      <h3 className="text-xl font-bold mb-4">Interview in Progress</h3>
      <p className="text-gray-600 mb-6">
        Role: {jobRole} | Experience: {experience} yrs | Level: {level}
      </p>

      {/* The AI Ball UI Element */}
      <InterviewBall />
      
      {/* Placeholder for Chat Messages */}
      <div className="flex-1 w-full mt-4 p-4 border border-dashed border-gray-300 rounded-lg overflow-y-auto bg-gray-50">
        <div className="bg-purple-100 p-3 rounded-lg text-purple-800 mb-2">
          **AI:** Welcome! Based on your configuration, let's start with your first question...
        </div>
        {/* User messages and AI responses would go here */}
      </div>

      {/* Input area */}
      <div className="w-full flex gap-2 mt-4">
        <input
          type="text"
          placeholder="Type your answer here..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
        />
        <button className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Send size={20} />
        </button>
      </div>
      
      <button 
        onClick={() => setInterviewState('results')} 
        className="mt-4 text-sm text-red-500 hover:text-red-700 underline"
      >
        End Interview
      </button>
    </div>
  );
  
  // 3. Results Phase (Simple Placeholder)
  const renderResults = () => (
    <div className="bg-green-50 p-8 rounded-xl shadow-xl text-center">
      <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
      <h3 className="text-3xl font-bold text-green-700 mb-2">Interview Ended</h3>
      <p className="text-gray-700 mb-6">Thank you for practicing! Your detailed feedback and results are being compiled now.</p>
      <button 
        onClick={() => setInterviewState('config')} 
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150"
      >
        Start New Interview
      </button>
    </div>
  );

  // --- MAIN RENDER ---

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6">AI Interview Practice 🤖</h1>
      
      {/* State rendering */}
      {interviewState === 'config' && renderConfig()}
      {interviewState === 'chat' && renderChat()}
      {interviewState === 'results' && renderResults()}
    </div>
  );
};

export default AIInterview;