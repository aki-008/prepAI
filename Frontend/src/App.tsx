import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import Notes from "./pages/note";
import AIInterview from "./pages/AiInterview";
import Quize from "./pages/quize";
import Sidebar from "./components/dashboard/Sidebar";

import { AuthProvider, useAuth } from "./components/context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

const DashboardLayout = () => {
  // 1. Retrieve both logout and username from the AuthContext
  const { logout, username } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 2. Pass the retrieved username prop to the Sidebar */}
      <Sidebar onLogout={logout} username={username} />

      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/AIInterview" element={<AIInterview />} />
          <Route path="/quize" element={<Quize />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Home */}
          <Route path="/" element={<HomeWrapper />} />

          {/* Protected all dashboard routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
};

const HomeWrapper = () => {
  const { isAuthenticated, login } = useAuth();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <Home onLogin={login} />;
};

export default App;