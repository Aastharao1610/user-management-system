"use client";

import React, { useState } from "react";
import { Header } from "../../components/Header/Header";
import Sidebar from "../../components/SideBar/SiderBar";

export default function UserLayout({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const themeClasses = {
    bg: isDarkMode ? "bg-gray-900" : "bg-white",
    text: isDarkMode ? "text-white" : "text-gray-900",
    border: isDarkMode ? "border-gray-700" : "border-gray-200",
    hover: isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100",
    inactiveText: isDarkMode ? "text-gray-400" : "text-gray-500",
    accentColor: isDarkMode ? "text-indigo-400" : "text-indigo-600",
  };

  return (
    <div
      className={`min-h-screen flex font-sans antialiased transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <Sidebar
        themeClasses={themeClasses}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex flex-col flex-1">
        <Header
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          themeClasses={themeClasses}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <main
          className={`flex-grow p-6 overflow-y-auto transition-colors duration-300 ${themeClasses.bg}`}
          onClick={() => isSidebarOpen && setIsSidebarOpen(false)}
        >
          {children}
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
