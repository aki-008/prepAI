import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Notes from "./pages/note";
import AIInterview from "./pages/AiInterview";
import Quize from "./pages/quize";
import Home from "./pages/home";
import Sidebar from "./components/dashboard/Sidebar";
import Header from "./components/dashboard/Header";

const App: React.FC = () => {
  // Track authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Function to handle successful login
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Function to handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {/* Public Route - Home Page */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Home onLogin={handleLogin} />
            )
          } 
        />

        {/* Protected Routes - Dashboard Layout */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="flex h-screen bg-gray-100">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                  <Header onLogout={handleLogout} />
                  <main className="flex-1 overflow-y-auto p-6">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/notes" element={<Notes />} />
                      <Route path="/AIInterview" element={<AIInterview />} />
                      <Route path="/quize" element={<Quize />} />
                    </Routes>
                  </main>
                </div>
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;