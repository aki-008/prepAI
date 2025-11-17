import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Notes from "./pages/note";
import AIInterview from "./pages/AiInterview";
import Quize from "./pages/quize";
import Home from "./pages/home";
import Sidebar from "./components/dashboard/Sidebar";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>

        {/* Public Route */}
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

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="flex h-screen bg-gray-100">

                {/* Sidebar (only once) */}
                <Sidebar onLogout={handleLogout} />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/notes" element={<Notes />} />
                    <Route path="/AIInterview" element={<AIInterview />} />
                    <Route path="/quize" element={<Quize />} />
                  </Routes>
                </main>

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