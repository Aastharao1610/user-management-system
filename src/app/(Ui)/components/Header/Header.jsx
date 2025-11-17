import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const IconMap = {
  Menu: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  ),
  // Used for the close button on the mobile sidebar
  Close: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Sun: (
    // ... (Sun icon SVG) ...
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  ),
  Moon: (
    // ... (Moon icon SVG) ...
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  ),
  LogOut: (
    // ... (LogOut icon SVG) ...
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  ),
  LayoutDashboard: (
    // ... (LayoutDashboard icon SVG) ...
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="3" y1="9" x2="21" y2="9" />
    </svg>
  ),
  Users: (
    // ... (Users icon SVG) ...
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  ShieldCheck: (
    // ... (ShieldCheck icon SVG) ...
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  PenTool: (
    // ... (PenTool icon SVG) ...
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19l7-7 3-3-2-2-3 3-7 7V19h2z" />
      <path d="M18.8 4.7a2.12 2.12 0 0 1 3 3L7 21H3v-4l11.7-11.7z" />
    </svg>
  ),
  BarChart: (
    // ... (BarChart icon SVG) ...
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-4" />
    </svg>
  ),
};

const Icon = ({ name, className }) => {
  return <span className={className}>{IconMap[name] || null}</span>;
};

export const Header = ({
  isDarkMode,
  setIsDarkMode,
  themeClasses,
  setIsSidebarOpen, // NEW PROP
}) => {
  const [user, setUser] = useState(null);
  const { bg, border, hover, inactiveText, accentColor } = themeClasses;

  //Api call to check which user is logged In
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/me", { withCredentials: true });
        setUser(res.data.user);
      } catch (error) {
        console.error("Issue in fetching current User", error);
      }
    };
    fetchUser();
  }, []);

  const logoutHandle = async () => {
    try {
      const res = await axios.post(
        "/api/auth/logout",
        {},
        { withCredentials: true }
      );
      if (res.status === 200) {
        window.location.href = "/Login";
      }
      toast.success("Logout Successfull");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout Failed");
    }
  };

  return (
    <header
      className={`w-full h-16 flex items-center justify-between px-4 sm:px-8 border-b ${bg} ${border} shadow-lg transition-colors duration-300 z-30`}
    >
      <div className="flex items-center space-x-3">
        {/* NEW: Mobile Menu Button - Visible below 768px (md:hidden) */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          title="Open Menu"
          className={`md:hidden p-2 rounded-full ${hover} transition cursor-pointer duration-150 focus:outline-none focus:ring-2 ${accentColor.replace(
            "text",
            "focus:ring"
          )} focus:ring-opacity-50 ${inactiveText}`}
        >
          <Icon name="Menu" className="w-6 h-6" />
        </button>

        <h1 className="sm:text-xl text-md  font-extrabold tracking-tight font-sans">
          <span className={accentColor}>User</span>{" "}
          <span className={isDarkMode ? "text-white" : "text-black"}>
            Management
          </span>
        </h1>
      </div>

      <div className="flex items-center space-x-0">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Toggle Dark/Light Mode"
          className={`p-2 rounded-full ${hover} transition cursor-pointer duration-150 focus:outline-none focus:ring-2 ${accentColor.replace(
            "text",
            "focus:ring"
          )} focus:ring-opacity-50`}
        >
          {isDarkMode ? (
            <Icon name="Sun" className="w-6 h-6 text-yellow-400" />
          ) : (
            <Icon name="Moon" className="w-6 h-6 text-gray-700" />
          )}
        </button>

        {/* User Profile and Logout */}
        <div className="flex items-center space-x-2 ml-4">
          <span
            className={`text-sm font-semibold hidden sm:block ${inactiveText}`}
          >
            {user && user.name}
          </span>

          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${accentColor.replace(
              "text",
              "bg"
            )} bg-opacity-70 text-white ring-2 ${accentColor.replace(
              "text",
              "ring"
            )}`}
          >
            {user?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </div>

          {/* Logout Button (Hidden on xs, visible on sm and up) */}
          <button
            onClick={logoutHandle}
            title="Log Out"
            className={`p-1 cursor-pointer rounded-full ${hover} transition duration-150 `}
          >
            <Icon name="LogOut" className={`w-5 h-5 ${inactiveText}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
