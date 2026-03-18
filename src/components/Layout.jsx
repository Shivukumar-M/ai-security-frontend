// frontend/src/components/Layout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-[#05070c] text-white h-screen overflow-hidden">

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar isMobile={false} />
      </div>

      {/* Mobile Sidebar (Slide In) */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <Sidebar isMobile={true} onClose={() => setSidebarOpen(false)} />

          {/* Dark overlay */}
          <div
            className="flex-1 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden">

        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Layout;
