// frontend/src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  UserCircle,
  LayoutGrid,
  BarChart2,
  User,
  LogOut,
  ShieldCheck,
  Menu, // ✅ ADDED HAMBURGER ICON
} from "lucide-react";

const DROPDOWN_WIDTH = 260;

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const displayName = user?.full_name?.trim() || user?.username || "User";

  const updatePosition = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const left = Math.max(8, rect.right - DROPDOWN_WIDTH);
    const top = rect.bottom + 10;
    setPos({ top, left });
  };

  useEffect(() => {
    if (open) updatePosition();
  }, [open]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);

    window.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onEsc);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onEsc);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, []);

  return (
    <header
      className="
        h-16 backdrop-blur-xl bg-white/5 border-b border-cyan-700/30 
        shadow-[0_0_20px_rgba(0,255,255,0.1)] 
        flex items-center justify-between px-8 z-20
      "
    >
      {/* ✅ MOBILE HAMBURGER (ONLY CHANGE ADDED) */}
      <button
        className="md:hidden p-2 bg-[#0f172a]/60 border border-cyan-600/30 rounded-lg hover:bg-[#122036]/70 transition"
        onClick={onToggleSidebar}
      >
        <Menu className="w-6 h-6 text-cyan-300" />
      </button>

     <div className="flex flex-col leading-tight">
  <span className="text-lg font-bold text-cyan-400 tracking-wide">
        AI-Based Threat Detection

  </span>
  
</div>


      {/* USER BUTTON */}
      <button
        ref={btnRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((s) => !s);
          updatePosition();
        }}
        className="
          group flex items-center gap-2 px-3 py-2 bg-[#0f172a]/60 
          border border-cyan-600/30 rounded-xl shadow-sm 
          hover:bg-[#122036]/70 hover:border-cyan-500/60 transition-all duration-300
          hover:-translate-y-[1px] hover:shadow-[0_0_16px_rgba(34,211,238,0.25)]
          active:scale-[0.98] active:shadow-[0_0_22px_rgba(34,211,238,0.35)]
          data-[open=true]:border-cyan-400/80 data-[open=true]:shadow-[0_0_22px_rgba(34,211,238,0.35)]
        "
        data-open={open}
      >
        <div className="w-7 h-7 rounded-full overflow-hidden border border-cyan-500/40 bg-[#0b1528] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircle className="w-5 h-5 text-cyan-300" />
          )}
        </div>
        <span className="font-semibold text-gray-200 max-w-[180px] truncate">{displayName}</span>
      </button>

      {open &&
        createPortal(
          <FloatingDropdown
            top={pos.top}
            left={pos.left}
            width={DROPDOWN_WIDTH}
            onClose={() => setOpen(false)}
            logout={logout}
            user={user}
          />,
          document.body
        )}
    </header>
  );
};

export default Navbar;

/* ---------------------------
   Floating dropdown (portal)
---------------------------- */
const FloatingDropdown = ({ top, left, width, onClose, logout, user }) => {
  useEffect(() => {
    const stop = (e) => e.stopPropagation();
    document.addEventListener("mousedown", stop, { capture: true });
    return () =>
      document.removeEventListener("mousedown", stop, { capture: true });
  }, []);

  return (
    <div
      role="menu"
      aria-label="User menu"
      style={{
        position: "fixed",
        top,
        left,
        width,
        zIndex: 99999,
      }}
      className="rounded-xl shadow-2xl shadow-cyan-700/30"
    >
      <div className="bg-[#071122]/95 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-800 flex items-center justify-center shadow border border-cyan-400/40">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="User avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShieldCheck className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <p className="text-white font-semibold">{user?.full_name?.trim() || user?.username || "User"}</p>
              <p className="text-xs text-gray-400">Standard User</p>
            </div>
          </div>
        </div>

        <ul className="py-2 text-gray-200">
          <DropdownItem to="/dashboard" label="Dashboard" icon={<LayoutGrid />} onClick={onClose} />
          <DropdownItem to="/reports" label="Reports" icon={<BarChart2 />} onClick={onClose} />
          <DropdownItem to="/profile" label="Profile" icon={<User />} onClick={onClose} />

          <li>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 mt-2 text-left text-red-400 hover:bg-red-600/10 hover:text-red-300 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

const DropdownItem = ({ to, icon, label, onClick }) => (
  <li>
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 hover:bg-cyan-500/20 hover:text-cyan-300 transition rounded-lg mx-2"
    >
      {icon}
      <span>{label}</span>
    </Link>
  </li>
);
