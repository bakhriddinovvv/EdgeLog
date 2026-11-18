import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout() {
  const [open, setOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );

  return (
    <div className="min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className={`transition-[padding] duration-200 ${open ? "lg:pl-72" : ""}`}>
        <Topbar onToggle={() => setOpen((v) => !v)} />
        <main className="px-4 py-6 sm:px-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
