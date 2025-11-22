import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, FileText, Brain, BookOpen, Settings, User, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { username, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { path: "/notes", label: "Notes", icon: <BookOpen size={18} /> },
    { path: "/AIInterview", label: "AI Interview", icon: <Brain size={18} /> },
    { path: "/quize", label: "Resume Quiz", icon: <FileText size={18} /> },
  ];

  return (
    <aside
      className={`flex flex-col justify-between h-screen bg-linear-to-r from-blue-700 to-gray-900/50 text-white transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* Top Section */}
      <div>
        <div className="flex items-center justify-between text-2xl font-bold py-6 px-4 border-b border-gray-700">
          {!collapsed && <span>InterviewAI</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="p-4 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition ${location.pathname === item.path ? "bg-gray-800" : ""}`}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-700 space-y-4">
        <button className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition w-full text-left text-gray-300">
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </button>

        <button className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition w-full text-left text-gray-300">
          <User size={18} />
          {!collapsed && <span>{username}</span>}
        </button>

        <button
          onClick={logout}
          className="flex items-center space-x-3 p-3 rounded-lg bg-red-500 hover:bg-red-600 text-black hover:text-white transition w-full text-left font-medium"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;