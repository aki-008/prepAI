import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  FileText,
  Brain,
  BookOpen,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { username, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { path: "/notes", label: "Notes", icon: <BookOpen size={20} /> },
    { path: "/AIInterview", label: "AI Interview", icon: <Brain size={20} /> },
    { path: "/quize", label: "Resume Quiz", icon: <FileText size={20} /> },
  ];

  return (
    <aside
      className={`flex flex-col justify-between h-screen bg-maya-dark text-white transition-all duration-300 shadow-xl border-r border-indigo-400/30 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Section */}
      <div>
        <div className="flex items-center justify-between font-bold py-6 px-6 border-b border-indigo-400/30">
          {!collapsed && (
            <span className="text-xl tracking-wide font-handwriting">
              Maya AI
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-white/10 rounded-full transition"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 
                ${
                  location.pathname === item.path
                    ? "bg-white text-maya-dark shadow-md font-semibold translate-x-1"
                    : "hover:bg-white/10 text-indigo-50"
                }`}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-indigo-400/30 space-y-2">
        <button className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/10 transition w-full text-left text-indigo-100">
          <Settings size={20} />
          {!collapsed && <span>Settings</span>}
        </button>

        <button className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/10 transition w-full text-left text-indigo-100">
          <User size={20} />
          {!collapsed && <span>{username}</span>}
        </button>

        <button
          onClick={logout}
          className="flex items-center space-x-3 p-3 rounded-xl bg-red-400/20 hover:bg-red-400/40 text-red-100 hover:text-white transition w-full text-left"
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
