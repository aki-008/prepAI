import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, FileText, Brain, BookOpen,
  Settings, User, LogOut
} from "lucide-react";

interface SidebarProps {
  onLogout?: () => void; // Function to handle logging out 
  username: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, username }) => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { path: "/notes", label: "Notes", icon: <BookOpen size={18} /> },
    { path: "/AIInterview", label: "AI Interview", icon: <Brain size={18} /> },
    { path: "/quize", label: "Resume Quiz", icon: <FileText size={18} /> },
  ];

  return (
    <aside className="w-64 bg-linear-to-r from-blue-700 to-gray-900/50 text-white flex flex-col justify-between">

      {/* Top Section */}
      <div>
        <div className="text-2xl font-bold text-center py-6 border-b border-gray-700">
          InterviewAI
        </div>

        <nav className="p-4 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition ${location.pathname === item.path ? "bg-gray-800" : ""
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Section (User Actions) */}
      <div className="p-4 border-t border-gray-700 space-y-4">
        {/* Settings Button */}
        <button className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition w-full text-left text-gray-300">
          <Settings size={18} />
          <span>Settings</span>
        </button>

        {/* User Profile Button - Now displays the actual username */}
        <button className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition w-full text-left text-gray-300">
          <User size={18} />
          <span>{username || "Guest User"}</span>
        </button>

        {/* Logout Button (Click handler added here) */}
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 p-3 rounded-lg bg-red-500 hover:bg-red-600 text-black hover:text-white transition w-full text-left font-medium"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;