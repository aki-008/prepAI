import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, FileText, Brain, BookOpen } from "lucide-react";

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: <Home size={18} /> },
    { path: "/notes", label: "Notes", icon: <BookOpen size={18} /> },
    { path: "/ai-interview", label: "AI Interview", icon: <Brain size={18} /> },
    { path: "/quize/resume", label: "Resume Quiz", icon: <FileText size={18} /> },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="text-2xl font-bold text-center py-6 border-b border-gray-700">
        InterviewAI
      </div>
      <nav className="flex-1 p-4 space-y-3">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition ${
              location.pathname === item.path ? "bg-gray-800" : ""
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;