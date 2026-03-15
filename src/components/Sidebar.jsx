// frontend/src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Link as LinkIcon,
  Shield,
  FileSearch,
  BookOpen,
  House,
} from "lucide-react";

const navItems = [
  { name: "Home", path: "/", icon: House },
  { name: "URL Scanner", path: "/scanner", icon: LinkIcon },
  { name: "File Scanner", path: "/filescan", icon: FileSearch },
  { name: "IDS Analyzer", path: "/ids", icon: Shield },
  { name: "Threat RAG", path: "/rag", icon: BookOpen },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside
      className="
        w-64 
        bg-[#0b0f19] 
        border-r border-cyan-700/30
        shadow-[0_0_25px_rgba(0,255,255,0.15)]
        backdrop-blur-md
        flex flex-col
        min-h-full
        py-6 px-4
      "
    >
      {/* SIDEBAR LOGO */}
    <Link to="/" className="flex flex-col items-center mb-10">

      {/* Logo */}
  <img
    src="/logo.png"
    alt="SentinelAI Logo"
  className="w-20 h-20 mb-2"
  />
  {/* Project Name */}
  <span className="text-2xl font-extrabold text-cyan-400 tracking-wide mb-2">
    SentinelAI </span>
  
</Link>



      {/* NAVIGATION */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${active
                      ? "bg-cyan-400 text-[#0b0f19] font-semibold shadow-lg shadow-cyan-500/40"
                      : "text-gray-300 hover:bg-cyan-400/10 hover:text-white"
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* FOOTER */}
      <div className="text-gray-500 text-xs text-center opacity-70">
        © 2025 Cyber Defense System
      </div>
    </aside>
  );
};

export default Sidebar;
